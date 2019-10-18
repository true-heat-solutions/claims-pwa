import {$} from '../js/std-js/functions.js';

customElements.define('claim-note', class HTMLClaimNoteElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('claim-note.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);
			$('[data-click="close"]', frag).click(() => $('dialog', this.shadowRoot).close());
			frag.querySelector('.container').classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
			this.shadowRoot.append(frag);
			this.dispatchEvent(new Event('ready'));
		});
	}

	get ready() {
		return new Promise(resolve => {
			if (this.shadowRoot.childElementCount !== 0) {
				resolve();
			} else {
				this.addEventListener('ready', () => resolve(), {once: true});
			}
		});
	}

	get author() {
		const slot = this.shadowRoot.querySelector('slot[name="author"]');

		if (slot instanceof HTMLElement) {
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			return null;
		}
	}

	set author(val) {
		const el = document.createElement('cite');
		el.textContent = val;
		el.slot = 'author';
		this.append(el);
	}

	get status() {
		return this.getAttribute('status');
	}

	set status(val) {
		this.setAttribute('status', val);
	}

	get uuid() {
		return this.id;
	}

	set uuid(val) {
		this.id = val;
	}

	get created() {
		const slot = this.shadowRoot.querySelector('slot[name="created"]');

		if (slot instanceof HTMLElement) {
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? new Date(nodes[0].dateTime) : null;
		} else {
			return null;
		}
	}

	set created(val) {
		const el = document.createElement('time');
		if (typeof val === 'string') {
			val = new Date(val);
		}
		el.textContent = val.toLocaleString();
		el.slot = 'created';
		el.dateTime = val.toISOString();
		this.append(el);
	}

	get text() {
		const slot = this.shadowRoot.querySelector('slot[name="text"]');

		if (slot instanceof HTMLElement) {
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			return null;
		}
	}

	set text(val) {
		const el = document.createElement('p');
		el.textContent = val;
		el.slot = 'text';
		this.append(el);
	}

	async showModal() {
		await this.ready;
		this.shadowRoot.querySelector('dialog').showModal();
	}

	async close() {
		await this.ready;
		this.shadowRoot.querySelector('dialog').close();
	}
});
