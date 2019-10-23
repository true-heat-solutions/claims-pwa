import HTMLSchemaElement from './schema.js';

customElements.define('schema-postal-address', class HTMLSchemaPostalAddressElement extends HTMLSchemaElement {
	constructor() {
		super();
		this.setAttribute('itemtype', 'https://schema.org/PostalAddress');
		this.setAttribute('itemscope', '');

		this.importTemplate('schema-postal-address.html');
	}

	get streetAddress() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="streetAddress"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="streetAddress"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set streetAddress(val) {
		this.clearNodes('streetAddress').then(() => this.append(this.makeEl('streetAddress', val)));
	}

	get postOfficeBoxNumber() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="postOfficeBoxNumber"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="postOfficeBoxNumber"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set postOfficeBoxNumber(val) {
		this.clearNodes('postOfficeBoxNumber').then(() => this.append(this.makeEl('postOfficeBoxNumber', val)));
	}

	get addressLocality() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="addressLocality"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="addressLocality"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set addressLocality(val) {
		this.clearNodes('addressLocality').then(() => this.append(this.makeEl('addressLocality', val)));
	}

	get addressRegion() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="addressRegion"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="addressRegion"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set addressRegion(val) {
		this.clearNodes('addressRegion').then(() => this.append(this.makeEl('addressRegion', val)));
	}

	get postalCode() {
		if (this.ready) {
			const slot = this.shadowRoot.querySelector('slot[name="postalCode"]');
			const nodes = slot.assignedNodes();
			return nodes.length === 1 ? nodes[0].textContent : null;
		} else {
			const el = this.querySelector('[slot="postalCode"]');
			return el instanceof HTMLElement ? el.textContent : null;
		}
	}

	set postalCode(val) {
		this.clearNodes('postalCode').then(() => this.append(this.makeEl('postalCode', val)));
	}
});
