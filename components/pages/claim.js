import Router from '/js/Router.js';
import {ENDPOINT, ALLOWED_UPLOAD_TYPES} from '/js/consts.js';
import {$} from '/js/std-js/functions.js';
import '../attachment-el.js';
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
						this.set('uuid', claim.uuid);
						this.set('customer[identifier]', claim.customer.identifier);
						this.set('customer[givenName]', claim.customer.givenName);
						this.set('customer[familyName]', claim.customer.familyName);
						this.set('customer[telephone]', claim.customer.telephone);
						this.set('contractor[givenName]', claim.contractor.givenName);
						this.set('contractor[familyName]', claim.contractor.familyName);
						this.set('contractor[identifier]', claim.contractor.identifier);
						this.set('lead[givenName]', claim.lead.givenName);
						this.set('lead[familyName]', claim.lead.familyName);
						this.set('lead[identifier]', claim.lead.identifier);
						this.set('opened', `${opened.getFullYear()}-${(opened.getMonth()+1).toString().padStart(2, '0')}-${opened.getDate().toString().padStart(2, '0')}`);
						this.set('customer[address][identifier]', claim.customer.address.identifier);
						this.set('customer[address][streetAddress]', claim.customer.address.streetAddress);
						this.set('customer[address][addressLocality]', claim.customer.address.addressLocality);
						this.set('customer[address][addressRegion]', claim.customer.address.addressRegion);
						this.set('customer[address][postalCode]', claim.customer.address.postalCode);
						this.set('customer[address][addressCountry]', claim.customer.address.addressCountry);
						if (Array.isArray(claim.attachments)) {
							console.table(claim.attachments);
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

			doc.forms.claim.addEventListener('submit', async event => {
				event.preventDefault();
				const resp = await fetch(new URL('/test', ENDPOINT), {
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
				const toast = new Toast();

				if (resp.ok) {
					const pre = document.createElement('pre');
					const code = document.createElement('code');
					const data = await resp.json();
					pre.slot = 'content';
					code.textContent = JSON.stringify(data, null, 2);
					pre.append(code);
					toast.append(pre);
					document.body.append(toast);
					await toast.show();
					await toast.closed;
					toast.remove();
				} else {
					const json = await resp.json();
					if (json.hasOwnProperty('error')) {
						await Toast.toast(`${json.error.message} [${json.error.code}]`);
					}
				}
			});

			frag.append(...doc.head.children, ...doc.body.children);

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
			contractor: {
				identifier: this.get('contractor[identifier]'),
				givenName: this.get('contractor[givenName]'),
				familyName: this.get('contractor[familyName]'),
			},
			lead: {
				identifier: this.get('lead[identifier]'),
				givenName: this.get('lead[givenName]'),
				familyName: this.get('lead[familyName]'),
			},
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
