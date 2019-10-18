import {confirm, alert} from '/js/std-js/asyncDialog.js';
import {ENDPOINT} from '/js/consts.js';
import {getToken} from '/js/functions.js';
class HTMLAttachmentElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('attachment-el.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);
			frag.querySelector('[data-click="delete"]').addEventListener('click', async () => {
				if (await confirm('Delete this attachment?')) {
					const url = new URL('upload/', ENDPOINT);
					url.searchParams.set('token', getToken());
					url.searchParams.set('uuid', this.uuid);
					const resp = await fetch(url, {
						method: 'DELETE',
						mode: 'cors',
					});

					if (resp.ok) {
						this.remove();
					} else {
						await alert('Error deleting attachment');
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

	get uuid() {
		return this.getAttribute('uuid');
	}

	set uuid(val) {
		this.setAttribute('uuid', val);
	}

	set href(val) {
		this.shadowRoot.querySelector('.attachment-link').href = val;
	}

	set name(val) {
		const el = document.createElement('span');
		el.slot = 'name';
		el.textContent = val;
		this.append(el);
	}

	get mime() {
		return this.getAttribute('mime');
	}

	set mime(val) {
		this.setAttribute('mime', val);
	}

	attributeChangedCallback(name, oldVal, newVal) {
		console.info({name, oldVal, newVal});
	}

	static get observedAttributes() {
		return [
			'mime',
		];
	}
}

customElements.define('attachment-el', HTMLAttachmentElement);
