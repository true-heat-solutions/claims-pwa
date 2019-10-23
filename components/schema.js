export default class HTMLSchemaElement extends HTMLElement {
	async getTemplate(path, {
		root = import.meta.url,
		head = true,
	} = {}) {
		const resp = await fetch(new URL(path, root));

		if (resp.ok) {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();

			if (head) {
				frag.append(...doc.head.children, ...doc.body.children);
			} else {
				frag.append(...doc.body.children);
			}
			return frag;
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}

	get identifier() {
		return this.id;
	}

	set identifier(val) {
		this.id = val;
	}

	async importTemplate(path, {
		root = import.meta.url,
		head = true,
		shadow = true,
		mode = 'open'
	} = {}) {
		const tmp = await this.getTemplate(path, {root, head});
		if (shadow) {
			if (this.shadowRoot === null) {
				const shadowRoot = this.attachShadow({mode});
				shadowRoot.append(tmp);
				this.dispatchEvent(new Event('ready'));
				return shadowRoot;
			} else {
				const shadowRoot = this.shadowRoot;
				if (shadowRoot) {
					shadowRoot.append(tmp);
					this.dispatchEvent(new Event('ready'));
					return shadowRoot;
				} else {
					throw new Error('Cannot modify a closed ShadowRoot');
				}
			}
		} else {
			this.append(tmp);
			this.dispatchEvent(new Event('ready'));
			return tmp;
		}
	}

	get loaded() {
		if (this.shadowRoot !== null) {
			return this.shadowRoot.childElementCount !== 0;
		} else {
			return this.childElementCuont !== 0;
		}
	}

	get ready() {
		return new Promise(resolve => {
			if (! this.loaded) {
				this.addEventListener('ready', () => resolve(), {once: true});
			} else {
				resolve();
			}
		});
	}

	get itemprop() {
		return this.getAttribute('itemprop');
	}

	set itemprop(val) {
		this.setAttribute('itemprop', val);
	}

	async getSlot(name) {
		await this.ready;
		if (this.shadowRoot !== null) {
			return this.shadowRoot.querySelector(`slot[name="${name}"]`);
		} else {
			return null;
		}
	}

	async getSlottedNodes(name) {
		const slot = await this.getSlot(name);

		if (slot instanceof HTMLElement) {
			return slot.assignedNodes();
		} else {
			return [];
		}
	}

	async getSlottedNode(name) {
		const nodes = await this.getSlottedNode(name);
		if (Array.isArray(nodes) && nodes.length === 1) {
			return nodes[0];
		} else {
			return null;
		}
	}

	async clearNodes(name) {
		const nodes = await this.getSlottedNodes(name);
		nodes.forEach(el => el.remove());
	}

	makeEl(itemprop, content = null, {tag = 'span', as = 'text', attrs = {}} = {}) {
		const el = document.createElement(tag);
		el.slot = itemprop;
		el.setAttribute('itemprop', itemprop);

		if (['string', 'number'].some(type => typeof content === type)) {
			if (as === 'text') {
				el.textContent = content;
			} else {
				el.setAttribute(as, content);
			}
		}

		Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));

		return el;
	}
}
