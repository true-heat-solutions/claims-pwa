import './schema-postal-address.js';

import HTMLSchemaElement from './schema.js';

customElements.define('schema-person', class HTMLSchemaPersonElement extends HTMLSchemaElement
{
	constructor() {
		super();
		this.setAttribute('itemtype', 'https://schema.org/Person');
		this.setAttribute('itemscope', '');
		this.importTemplate('schema-person.html');
	}

	get givenName() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="givenName"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="givenName"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set givenName(val) {
		this.clearNodes('givenName').then(() => this.append(this.makeEl('givenName', val)));
	}

	get familyName() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="familyName"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="familyName"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set familyName(val) {
		this.clearNodes('familyName').then(() => this.append(this.makeEl('familyName', val)));
	}

	get telephone() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="telephone"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="telephone"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set telephone(val) {
		this.clearNodes('telephone').then(() => {
			this.shadowRoot.getElementById('tel-container').hidden = false;
			// this.shadowRoot.querySelector(`a[href]`)
			this.append(this.makeEl('telephone', val, {
				tag: 'a',
				attrs: {
					href: `tel:${val}`,
					content: val,
				}
			}));
		});
	}

	get email() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="email"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="email"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set email(val) {
		this.clearNodes('email').then(() => {
			this.shadowRoot.getElementById('email-container').hidden = false;
			// this.shadowRoot.querySelector(`a[href]`)
			this.append(this.makeEl('email', val, {
				tag: 'a',
				attrs: {
					href: `mailto:${val}`,
					content: val,
				}
			}));
		});
	}

	get address() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="address"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0] : null;
		} else {
			const el = this.querySelector('[slot="address"]');
			return el instanceof HTMLElement ? el : null;
		}
	}

	set address(val) {
		customElements.whenDefined('schema-postal-address').then(async () => {
			const HTMLSchemaPostalAddressElement = customElements.get('schema-postal-address');
			const addr = new HTMLSchemaPostalAddressElement();
			await addr.ready;
			addr.itemprop = 'address';
			addr.slot = 'address';

			if (typeof val === 'object') {
				Object.entries(val).forEach(([prop, val]) => addr[prop] = val);
			}
			await this.clearNodes('address');
			this.append(addr);
		});
	}
});
