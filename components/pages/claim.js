import Router from '/js/Router.js';
import {ENDPOINT, ALLOWED_UPLOAD_TYPES} from '/js/consts.js';
import {$} from '/js/std-js/functions.js';
import '../attachment-el.js';
import '../claim-note.js';
import '../schema-person.js';
import {getContractors, getLeads, getAssignees, userCan, loggedIn, getToken} from '/js/functions.js';

export async function upload({file, token, claim}) {
	const body = new FormData();
	body.set('upload', file);
	body.set('token', token);
	body.set('claim', claim);

	const resp = await fetch(new URL('upload/', ENDPOINT), {
		method: 'POST',
		mode: 'cors',
		body,
		headers: new Headers({
			Accept: 'application/json',
		}),
	});

	if (resp.ok) {
		return await resp.json();
	} else if(resp.headers.get('Content-Type').startsWith('application/json')) {
		const err = await resp.json();
		if ('error' in err) {
			throw new Error(`${err.error.message} [${err.error.status}]`);
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}
}

async function createAttachment(file) {
	await customElements.whenDefined('attachment-el');
	const HTMLAttachmentElement = customElements.get('attachment-el');
	const attached = new HTMLAttachmentElement();
	await attached.ready;
	attached.href = new URL(file.path, ENDPOINT);
	attached.slot = 'attachments';
	attached.mime = file.mime;
	attached.uuid = file.uuid;
	attached.name = file.filename;
	return attached;
}

let viewMode = 'new';

class ClaimPage extends HTMLElement {
	constructor(uuid = null, mode = 'view') {
		super();
		this.attachShadow({mode: 'open'});

		if (typeof uuid === 'string') {
			mode = uuid === 'new' ? 'new' : 'edit';
		} else {
			mode = 'new';
		}
		viewMode = mode;

		if (typeof uuid === 'string' && uuid !== 'new') {
			mode = 'edit';
			const url = new URL('Claim/', ENDPOINT);
			url.searchParams.set('uuid', uuid);
			url.searchParams.set('token',getToken());

			fetch(url, {
				mode: 'cors',
				headers: new Headers({Accept: 'application/json'}),
			}).then(async resp => {
				if (resp.ok) {
					const claim = await resp.json();
					if (claim) {
						await this.ready;
						const opened = new Date(claim.created);
						this.status = claim.status;
						this.set('uuid', claim.uuid);
						this.set('assigned', claim.assigned.uuid);
						$('#customer-info').attr({
							disabled: true,
							hidden: true,
						});
						const person = this.shadowRoot.querySelector('schema-person');
						await customElements.whenDefined('schema-person');
						await new Promise(resolve => {
							if (person.shadowRoot === null || person.shadowRoot.childElementCount === 0) {
								person.addEventListener('ready', () => resolve(), {once: true});
							} else {
								resolve();
							}
						});
						person.givenName = claim.customer.givenName;
						person.familyName = claim.customer.familyName;
						person.address = claim.customer.address;
						person.telephone = claim.customer.telephone;
						person.shadowRoot.getElementById('tel-container').hidden = false;
						person.hidden = false;

						this.set('opened', `${opened.getFullYear()}-${(opened.getMonth()+1).toString().padStart(2, '0')}-${opened.getDate().toString().padStart(2, '0')}`);
						this.set('contractor', claim.contractor);
						this.set('lead', claim.lead);
						this.set('price', claim.price || 0);
						this.set('hours', claim.hours || 0);
						if (Array.isArray(claim.attachments)) {
							const attachments = await Promise.all(claim.attachments.map(async file => {
								return await createAttachment(file);
							}));

							this.append(...attachments);
						}

						if (Array.isArray(claim.notes)) {
							await customElements.whenDefined('claim-note');
							const ClaimNoteElement = customElements.get('claim-note');
							const notes = await Promise.all(claim.notes.map(async note => {
								const {text, uuid, created, author, status} = note;
								const btn = document.createElement('button');
								const li = document.createElement('li');
								const el = new ClaimNoteElement();
								await el.ready;

								btn.type = 'button';
								btn.classList.add('btn', 'btn-wide', 'note-btn');
								btn.slot = 'notes';
								btn.textContent = `${new Date(note.created).toLocaleDateString()} ${note.status}`;

								li.slot = 'notes';
								li.append(el);

								el.text = text;
								el.uuid = uuid;
								el.create = created;
								el.author = author.name;
								el.status = status;

								btn.dataset.noteUuid = el.uuid;
								btn.addEventListener('click', () => el.showModal());
								return [li, btn];
							}));
							this.append(...notes.flat());
						}

						if (mode === 'edit') {
							this.edit = true;
							this.pageName = 'Edit Claim';
						} else if (mode === 'view') {
							this.edit = false;
							this.pageName = 'View Claim';
						}
					}
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
				}
			}).catch(console.error);
		} else if (uuid === 'new') {
			this.ready.then(() => {
				this.edit = true;
				$('#customer-info', this.shadowRoot).attr({
					disabled: false,
					hidden: false,
				});

				$('fieldset[form]', this.shadowRoot).attr({
					disabled: true,
					hidden: true,
				});
				this.pageName = 'Create Claim';
			});
		}

		fetch(new URL('claim.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');

			[...doc.querySelectorAll('[data-perms]')].forEach(el => {
				const perms = el.dataset.perms.split(' ').map(p => p.trim());
				el.hidden = ! userCan(...perms);
			});

			const frag = document.createDocumentFragment();

			$('[data-close]', doc).click(({target}) => {
				const el = target.closest('[data-close]');
				$(el.dataset.close, this.shadowRoot).close();
			});

			const [contractors, leads, assignees] = await Promise.all([
				getContractors(getToken()),
				getLeads(getToken()),
				getAssignees(getToken()),
			]);

			const suggest = leads.map(lead => {
				const opt = document.createElement('option');
				opt.value = lead.name;
				return opt;
			});

			const assign = assignees.map(person => {
				const opt = document.createElement('option');
				opt.value = person.uuid;
				opt.textContent = person.name;
				return opt;
			});

			doc.getElementById('assigned-user').append(...assign);

			doc.getElementById('leads-list').append(...suggest);

			const opts = contractors.map(item => {
				const opt = document.createElement('option');
				opt.value = item.uuid;
				opt.textContent = item.name;
				return opt;
			});

			doc.getElementById('claim-contractor').append(...opts);

			doc.forms.claim.addEventListener('submit', async event => {
				event.preventDefault();
				const resp = await fetch(new URL('Claim/', ENDPOINT), {
					mode: 'cors',
					method: 'Post',
					headers: new Headers({
						Accept: 'application/json',
						'Content-Type': 'application/json',
					}),
					body: JSON.stringify(this),
				});

				if (resp.ok) {
					location.hash = '#claims';
				} else {
					const json = await resp.json();
					if (json.hasOwnProperty('error')) {
						await customElements.whenDefined('toast-message');
						const Toast = customElements.get('toast-message');
						await Toast.toast(`${json.error.message} [${json.error.code}]`);
					}
				}
			});

			doc.forms.newNoteForm.addEventListener('submit', async event => {
				event.preventDefault();
				const {target} = event;
				const data = new FormData(target);
				const resp = await fetch(new URL('Note/', ENDPOINT), {
					method: 'POST',
					mode: 'cors',
					headers: new Headers({
						Accept: 'application/json',
						'Content-Type': 'application/json',
					}),
					body: JSON.stringify({
						token: getToken(),
						claim: this.get('uuid'),
						text: data.get('text'),
						status: this.status,
					}),
				});

				if (resp.ok) {
					target.reset();
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
				}
			});

			doc.forms.newNoteForm.addEventListener('reset', event => {
				const dialog = event.target.closest('dialog[open]');
				if (dialog instanceof HTMLElement) {
					dialog.close();
				}
			});

			doc.forms.attachmentForm.addEventListener('submit', async event => {
				event.preventDefault();
				const {target} = event;
				const input = this.shadowRoot.getElementById('uploads');
				if (input.files.length > 0) {
					const uploads = [...input.files];
					const dialog = this.shadowRoot.getElementById('upload-dialog');
					const errors = this.shadowRoot.getElementById('upload-errors-list');
					const errsDetails = this.shadowRoot.getElementById('upload-errors');
					const files = this.shadowRoot.getElementById('upload-files-list');
					const progress = this.shadowRoot.getElementById('upload-progress');
					const token = getToken();
					const claim = this.get('uuid');

					[...files.children].forEach(el => el.remove());
					[...errors.children].forEach(el => el.remove());

					progress.value = 0;
					progress.max = uploads.length;

					uploads.forEach(file => {
						const li = document.createElement('li');
						li.textContent = file.name;
						li.dataset.fileName = file.name;
						files.append(li);
					});

					dialog.showModal();

					await Promise.all(uploads.map(async file => {
						try {
							const body = new FormData();
							body.set('upload', file, file.name);
							body.set('token', token);
							body.set('claim', claim);
							const resp = await fetch(new URL('upload/', ENDPOINT), {
								method: 'POST',
								mode: 'cors',
								body,
								headers: new Headers({
									Accept: 'application/json',
								}),
							});

							if (resp.ok) {
								const uploaded = await resp.json();
								const el = await createAttachment(uploaded);
								this.append(el);
							} else {
								if (resp.headers.get('Content-Type').startsWith('application/json')) {
									const data = await resp.json();
									if (data.hasOwnProperty('error')) {
										throw new Error(`${file.name}: ${data.error.message} [${data.error.code}]`);
									} else {
										throw new Error(`Error uploading ${file.name} [${resp.status} ${resp.statusText}]`);
									}
								} else {
									throw new Error(`Error uploading ${file.name} [${resp.status} ${resp.statusText}]`);
								}
							}
						} catch (err) {
							console.error(err);
							const li = document.createElement('li');
							li.classList.add('inline-block', 'error');
							li.textContent = err.message;
							errors.append(li);
							errsDetails.open = true;
						} finally {
							progress.value++;
							files.querySelector(`[data-file-name="${CSS.escape(file.name)}"]`).remove();
						}
					}));

					await new Promise(resolve => dialog.addEventListener('close', () => resolve(), {once: true}));
					target.reset();
				}

			});

			frag.append(...doc.head.children, ...doc.body.children);

			frag.querySelector('.page-container').classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);

			$('[data-click]', frag).click(async event => {
				const target = event.target.closest('[data-click]');
				switch(target.dataset.click) {
				case 'new-note':
					$('#new-note-dialog', this.shadowRoot).showModal();
					break;
				default:
					throw new Error(`Unhandled click action: ${this.dataset.click}`);
				}
			});

			$('input[type="file"]', frag).attr({accept: ALLOWED_UPLOAD_TYPES.join(', ')});
			// $('input[type="file"]', frag).change(async event => {
			// 	if (event.target.files.length === 1) {
			// 		const file = event.target.files.item(0);
			// 		const url = new URL('upload/', ENDPOINT);
			// 		const body = new FormData();
			// 		body.set('token', getToken());
			// 		body.set('upload', file);
			// 		body.set('claim', this.get('uuid'));
			// 		const resp = await fetch(url, {
			// 			method: 'POST',
			// 			mode: 'cors',
			// 			body,
			// 		});

			// 		if (resp.ok) {
			// 			this.value = '';
			// 			const json = await resp.json();
			// 			console.log(json);
			// 			await customElements.whenDefined('attachment-el');
			// 			const HTMLAttachemntElement = customElements.get('attachment-el');
			// 			const attached  = new HTMLAttachemntElement();
			// 			await attached.ready;
			// 			attached.href = new URL(json.path, ENDPOINT);
			// 			attached.slot = 'attachments';
			// 			attached.mime = json.mime;
			// 			attached.uuid = json.uuid;
			// 			attached.name = json.path.split('/').pop();

			// 			console.log(json);
			// 			this.append(attached);
			// 		} else {
			// 			const json = await resp.json();
			// 			if (json.hasOwnProperty('error')) {
			// 				console.error(json.error);
			// 			}
			// 		}
			// 	}
			// });

			this.shadowRoot.append(frag);
			this.dispatchEvent(new Event('ready'));
		});
	}

	get ready() {
		return new Promise(resolve => {
			if (this.shadowRoot instanceof ShadowRoot && this.shadowRoot.childElementCount !== 0) {
				resolve();
			} else {
				this.addEventListener('ready', () => resolve(), {once: true});
			}
		});
	}

	toJSON() {
		const data = {
			token: getToken(),
			uuid: this.get('uuid'),
			assigned: this.get('assigned'),
			contractor: this.get('contractor'),
			lead: this.get('lead'),
			opened: this.get('opened'),
			hours: this.get('hours'),
			price: this.get('price'),
		};

		if (viewMode === 'new') {
			data.customer = {
				identifier: this.get('customer[identifier]'),
				givenName: this.get('customer[givenName]'),
				familyName: this.get('customer[familyName]'),
				telephone: this.get('customer[telephone]'),
				address: {
					identifier: this.get('customer[address][identifier]'),
					streetAddress: this.get('customer[address][streetAddress]'),
					addressLocality: this.get('customer[address][addressLocality]'),
					addressRegion: this.get('customer[address][addressRegion]'),
					postalCode: this.get('customer[address][postalCode]'),
					addressCountry: this.get('customer[address][addressCountry]'),
				}
			};
		}

		return data;
	}

	get(name) {
		const input = this.shadowRoot.querySelector(`[name="${name}"]`);
		return input instanceof HTMLElement ? input.value || null : null;
	}

	set(name, value) {
		const input = this.shadowRoot.querySelector(`[name="${name}"]`);
		if (input instanceof HTMLElement) {
			input.value = value;
		}
	}

	get edit() {
		return !this.shadowRoot.querySelector('fieldset').disabled;
	}

	set edit(edit) {
		this.ready.then(this.shadowRoot.querySelector('fieldset').disabled = ! edit);
	}

	get status() {
		return this.getAttribute('status');
	}

	set status(val) {
		this.setAttribute('status', val);
	}

	set pageName(text) {
		const el = document.createElement('h3');
		el.classList.add('center');
		el.textContent = text;
		el.slot = 'pageName';
		this.ready.then(() => {
			this.shadowRoot.querySelector('slot[name="pageName"]').assignedElements().forEach(el => el.remove());
			this.append(el);
		});
	}

	get hours() {
		const input = this.shadowRoot.querySelector('[name="hours"]');
		return input instanceof HTMLInputElement ? input.value : null;
	}

	set hours(val) {
		const input = this.shadowRoot.querySelector('input[name="hours"]');
		if (input instanceof HTMLElement) {
			input.value = val;
		}
	}

	get price() {
		const input = this.shadowRoot.querySelector('[name="price"]');
		return input instanceof HTMLInputElement ? input.value : null;
	}

	set price(val) {
		const input = this.shadowRoot.querySelector('input[name="price"]');
		if (input instanceof HTMLElement) {
			input.value = val;
		}
	}

	async attributeChangedCallback(name, oldVal, newVal) {
		await this.ready;
		console.info({name, newVal});
		switch(name) {
		case 'status':
			break;
		default:
			throw new Error(`Unhandled attribute change: ${name}`);
		}
	}

	static get observedAttribute() {
		return [
			'status',
		];
	}
}

customElements.define('claim-page', ClaimPage);

Router.setRoute('claim', async (...args) => {
	if (loggedIn()) {
		const el = new ClaimPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	} else {
		location.href = '#login';
	}
});
