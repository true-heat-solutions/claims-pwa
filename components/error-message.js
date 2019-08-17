customElements.define('error-message', class ErrorMessageElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('error-message.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);
			this.shadowRoot.append(frag);
		});
	}

	get message() {
		const slot = this.shadowRoot.querySelector('slot[name="message"]');
		const nodes = slot.assignedNodes();

		if (nodes.length !== 0) {
			return nodes[0].textContent;
		} else {
			return null;
		}
	}

	set message(message) {
		this.clear();
		this.addError(message);
	}

	addError(...messages) {
		const els = messages.map(message => {
			const el = document.createElement('div');
			el.slot = 'message';
			el.classList.add('error-message', 'cursor-pointer');
			el.textContent = message;
			el.animate([
				{opacity: 0},
				{opacity: 1},
			], {
				duration: 800,
				easing: 'ease-in-out',
				fill: 'forwards',
			});
			el.addEventListener('click', () => el.remove());
			return el;
		});

		this.append(...els);
	}

	clear() {
		const slot = this.shadowRoot.querySelector('slot[name="message"]');
		[...slot.assignedNodes()].forEach(el => el.remove());
	}
});
