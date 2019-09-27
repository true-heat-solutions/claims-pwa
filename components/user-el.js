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

			this.shadowRoot.append(frag);
		});
	}

	set name(val) {
		const el = document.createElement('span');
		el.slot = 'name';
		el.textContent = val;
		this.append(el);
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
