customElements.define('claim-item', class ClaimItemElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('claim-item.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			doc.getElementById('edit-btn').addEventListener('click', () => location.hash = `#claim/${this.uuid}`);
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);
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

	set uuid(uuid) {
		this.setAttribute('uuid', uuid);
	}

	set customer(val) {
		const el = document.createElement('span');
		el.slot = 'customer';
		el.textContent = val;
		this.append(el);
	}

	set date(val) {
		if (! (val instanceof Date)) {
			val = new Date(val);
		}
		const el = document.createElement('time');
		el.slot = 'date';
		el.textContent = val.toLocaleDateString();
		el.dateTime = val.toISOString();
		this.append(el);
	}

	set status(val) {
		const el = document.createElement('span');
		el.slot = 'status';
		el.textContent = val;
		this.append(el);
	}

	get status() {
		const slot = this.shadowRoot.querySelector('slot[name="status"]');
		if (slot instanceof HTMLElement) {
			const nodes = slot.assignedElements();
			return nodes[0].textContent;
		} else {
			return null;
		}
	}

	edit() {
		location.hash = `#claims/${this.uuid}`;
	}
});
