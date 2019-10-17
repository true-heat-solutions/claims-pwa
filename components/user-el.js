import {ENDPOINT} from '/js/consts.js';
import {confirm} from '/js/std-js/asyncDialog.js';
import {$} from '/js/std-js/functions.js';
import {userCan} from '/js/functions.js';
class HTMLUserElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('user-el.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);

			[...frag.querySelectorAll('[data-perms]')].forEach(el => {
				const perms = el.dataset.perms.split(' ').map(p => p.trim());
				el.hidden = ! userCan(...perms);
			});

			$('[data-click="delete"]', frag).click(async () => {
				if (await confirm(`Are you sure you want to delete "${this.get('name')}"?`)) {
					const url = new URL('/users/', ENDPOINT);
					url.searchParams.set('token', localStorage.getItem('token'));
					url.searchParams.set('uuid', this.uuid);

					const resp = await fetch(url, {
						method: 'DELETE',
						mode: 'cors',
					});

					if (resp.ok) {
						this.remove();
					} else {
						throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
					}

				}
			});

			$('[data-click="edit"]', frag).click(() => {
				location.hash = `#profile/${this.uuid}`;
			});

			this.shadowRoot.append(frag);
		});
	}

	get uuid() {
		return this.getAttribute('uuid');
	}

	set uuid(val) {
		this.setAttribute('uuid', val);
	}

	get(name, attr = 'text') {
		const slot = this.shadowRoot.querySelector(`slot[name="${name}"]`);
		if (slot instanceof HTMLElement) {
			const nodes = slot.assignedNodes();
			if (nodes.length === 1) {
				return attr === 'text' ? nodes[0].textContent : nodes[0].getAttribute(attr);
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	set(name, value, {
		tag = 'span',
		attr = 'text',
	} = {}) {
		const el = document.createElement(tag);

		if (attr === 'text') {
			el.textContent = value;
		} else {
			el.setAttribute(attr, value);
		}

		el.slot = name;
		this.append(el);
		return el;
	}

	set role(val) {
		const el = document.createElement('span');
		el.slot = 'role';
		el.textContent = val;
		this.append(el);
	}

	set telephone(val) {
		const el = document.createElement('a');
		el.slot = 'telephone';
		el.textContent = val;
		el.href = `tel:${val}`;
		this.append(el);
	}

	set email(val) {
		const el = document.createElement('a');
		el.slot = 'email';
		el.textContent = val;
		el.href = `mailto:${val}`;
		this.append(el);
	}

	set image(url) {
		if (typeof url === 'string') {
			const el = document.createElement('img');
			el.slot = 'image';
			el.decoding = 'async';
			el.classList.add('float-left', 'round');
			el.src = url;
			this.append(el);
		}
	}
}

customElements.define('user-el', HTMLUserElement);
