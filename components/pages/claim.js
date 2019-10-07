import Router from '/js/Router.js';
import {ENDPOINT, ALLOWED_UPLOAD_TYPES} from '/js/consts.js';
import {$} from '/js/std-js/functions.js';
import '../attachment-el.js';
import '../claim-note.js';

async function listUsers(token) {
	const url = new URL('users/', ENDPOINT);
	url.searchParams.set('token', token);
	const resp = await fetch(url, {
		mode: 'cors',
		headers: new Headers({
			Accept: 'application/json',
		}),
	});

	if (resp.ok) {
		return await resp.json();
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}

class ClaimPage extends HTMLElement {
	constructor(uuid, mode = 'view') {
		super();
		this.attachShadow({mode: 'open'});

		if (typeof uuid === 'string' && uuid !== 'new') {
			const url = new URL('/Claim/', ENDPOINT);
			url.searchParams.set('uuid', uuid);
			url.searchParams.set('token', localStorage.getItem('token'));

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
						this.set('customer[identifier]', claim.customer.identifier);
						this.set('customer[givenName]', claim.customer.givenName);
						this.set('customer[familyName]', claim.customer.familyName);
						this.set('customer[telephone]', claim.customer.telephone);
						this.set('contractor', claim.contractor.identifier);
						// this.set('contractor[givenName]', claim.contractor.givenName);
						// this.set('contractor[familyName]', claim.contractor.familyName);
						// this.set('contractor[identifier]', claim.contractor.identifier);
						this.set('lead', claim.lead.identifier);
						this.set('opened', `${opened.getFullYear()}-${(opened.getMonth()+1).toString().padStart(2, '0')}-${opened.getDate().toString().padStart(2, '0')}`);
						this.set('customer[address][identifier]', claim.customer.address.identifier);
						this.set('customer[address][streetAddress]', claim.customer.address.streetAddress);
						this.set('customer[address][addressLocality]', claim.customer.address.addressLocality);
						this.set('customer[address][addressRegion]', claim.customer.address.addressRegion);
						this.set('customer[address][postalCode]', claim.customer.address.postalCode);
						this.set('customer[address][addressCountry]', claim.customer.address.addressCountry);
						if (Array.isArray(claim.attachments)) {
							await customElements.whenDefined('attachment-el');
							const HTMLAttachmentElement = customElements.get('attachment-el');
							const attachments = await Promise.all(claim.attachments.map(async file => {
								const attached = new HTMLAttachmentElement();
								await attached.ready;
								attached.href = new URL(file.path, ENDPOINT);
								attached.slot = 'attachments';
								attached.mime = file.mime;
								attached.uuid = file.uuid;
								attached.name = file.path.split('/').pop();
								console.info(attached);
								return attached;
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
				this.pageName = 'Create Claim';
			});
		}

		fetch(new URL('claim.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			const users = await listUsers(localStorage.getItem('token'));
			const opts = users.reduce((users, user) => {
				const opt = document.createElement('option');
				opt.value = user.person.identifier;
				opt.textContent = user.person.name;
				users.append(opt);
				return users;
			}, document.createDocumentFragment());

			doc.forms.claim.addEventListener('submit', async event => {
				event.preventDefault();
				const resp = await fetch(new URL('/Claim/', ENDPOINT), {
					mode: 'cors',
					method: 'Post',
					headers: new Headers({
						Accept: 'application/json',
						'Content-Type': 'application/json',
					}),
					body: JSON.stringify(this),
				});

				await customElements.whenDefined('toast-message');
				const Toast = customElements.get('toast-message');

				if (resp.ok) {
					const data = await resp.json();
					await Toast.toast(data.message);
				} else {
					const json = await resp.json();
					if (json.hasOwnProperty('error')) {
						await Toast.toast(`${json.error.message} [${json.error.code}]`);
					}
				}
			});

			doc.forms.newNote.addEventListener('submit', async event => {
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
						token: localStorage.getItem('token'),
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

			doc.forms.newNote.addEventListener('reset', event => {
				const dialog = event.target.closest('dialog[open]');
				if (dialog instanceof HTMLElement) {
					dialog.close();
				}
			});

			frag.append(...doc.head.children, ...doc.body.children);

			frag.querySelector('.container').classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);

			$('select.person', frag).each(sel => sel.append(opts.cloneNode(true)));

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
			$('input[type="file"]', frag).change(async event => {
				if (event.target.files.length === 1) {
					const file = event.target.files.item(0);
					const url = new URL('upload/', ENDPOINT);
					const body = new FormData();
					body.set('token', localStorage.getItem('token'));
					body.set('upload', file);
					body.set('claim', this.get('uuid'));
					const resp = await fetch(url, {
						method: 'POST',
						mode: 'cors',
						body,
					});

					if (resp.ok) {
						this.value = '';
						const json = await resp.json();
						console.log(json);
						await customElements.whenDefined('attachment-el');
						const HTMLAttachemntElement = customElements.get('attachment-el');
						const attached  = new HTMLAttachemntElement();
						await attached.ready;
						attached.href = new URL(json.path, ENDPOINT);
						attached.slot = 'attachments';
						attached.mime = json.mime;
						attached.uuid = json.uuid;
						attached.name = json.path.split('/').pop();

						console.log(json);
						this.append(attached);
					} else {
						const json = await resp.json();
						if (json.hasOwnProperty('error')) {
							console.error(json.error);
						}
					}
				}
			});

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
		return {
			token: localStorage.getItem('token'),
			uuid: this.get('uuid'),
			customer: {
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
			},
			contractor: this.get('contractor'),
			lead: this.get('lead'),
			opened: this.get('opened'),
		};
	}

	get(name) {
		const input = this.shadowRoot.querySelector(`[name="${name}"]`);
		return input instanceof HTMLElement ? input.value : null;
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
}

customElements.define('claim-page', ClaimPage);

Router.setRoute('claim', async (...args) => {
	if (localStorage.hasOwnProperty('token')) {
		const el = new ClaimPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	} else {
		location.href = '#login';
	}
});
