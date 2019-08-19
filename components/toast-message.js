customElements.define('toast-message', class HTMLToastMessageElement extends HTMLElement {
	constructor(message = null) {
		super();
		this.hidden = ! this.open;
		this.attachShadow({mode: 'open'});

		fetch(new URL('toast-message.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);

			frag.getElementById('close-toast-button').addEventListener('click', () => {
				this.close();
			}, {
				passive: true,
			});

			this.shadowRoot.append(frag);

			if (typeof message === 'string') {
				this.text = message;
			}
		});
	}

	get open() {
		return this.hasAttribute('open');
	}

	set open(open) {
		this.toggleAttribute('open', open);
	}

	set text(text) {
		const el = document.createElement('div');
		el.textContent = text;
		this.contentElement = el;
	}

	get color() {
		return this.getAttribute('color');
	}

	set color(color) {
		this.setAttribute('color', color);
	}

	get background() {
		return this.getAttribute('background');
	}

	set background(color) {
		this.setAttribute('background', color);
	}

	get duration() {
		return this.hasAttribute('duration') ? parseInt(this.getAttribute('duration')) : 400;
	}

	set duration(duration) {
		if (Number.isInteger(duration)) {
			this.setAttribute('duration', duration);
		} else {
			throw new Error('Duration must be an integer');
		}
	}

	get contentSlot() {
		return this.shadowRoot.querySelector('slot[name="content"]');
	}

	get contentNodes() {
		return this.contentSlot.assignedNodes();
	}

	set contentNodes(nodes) {
		if (Array.isArray(nodes)) {
			nodes.forEach(node => {
				node.slot = 'content';
			});
			this.contentNodes.forEach(el => el.remove());
			this.append(...nodes);
		} else {
			throw new Error('contentNodes must be an array of Nodes');
		}
	}

	set contentElement(el) {
		el.slot = 'content';
		this.contentNodes.forEach(el => el.remove());
		this.append(el);
	}

	get height() {
		return this.getBoundingClientRect().height;
	}

	async show() {
		this.hidden = false;
		const anim = this.animate([{
			bottom: `-${this.height}px`,
			opacity: 0,
		}, {
			bottom: '0',
			opacity: 1,
		}], {
			duration: this.duration,
			easing: 'ease-in-out',
			fill: 'both',
		});
		this.open = true;
		await anim.finished;
		return this;
	}

	async close() {
		const anim = this.animate([{
			bottom: `-${this.height}px`,
			opacity: 0,
		}, {
			bottom: '0',
			opacity: 1,
		}], {
			duration: this.duration,
			easing: 'ease-in-out',
			fill: 'both',
			direction: 'reverse',
		});

		await anim.finished;
		this.open = false;
		this.hidden = true;
		return this;
	}

	get opened() {
		return new Promise(resolve => {
			if (this.open === false) {
				this.addEventListener('open', () => resolve(this), {once: true});
			} else {
				resolve(this);
			}
		});
	}

	get closed() {
		return new Promise(resolve => {
			if (this.open === true) {
				this.addEventListener('close', () => resolve(this), {once: true});
			} else {
				resolve(this);
			}
		});
	}

	async attributeChangedCallback(attr, oldVal, newVal) {
		switch(attr) {
		case 'open':
			if (newVal !== null) {
				await this.show();
				this.dispatchEvent(new Event('open'));
			} else {
				await this.close();
				this.dispatchEvent(new Event('close'));
			}
			break;
		case 'color':
			if (newVal !== null) {
				this.style.setProperty('--toast-color', newVal);
			} else {
				this.style.removeProperty('--toast-color');
			}
			break;
		case 'background':
			if (newVal !== null) {
				this.style.setProperty('--toast-background', newVal);
			} else {
				this.style.removeProperty('--toast-background');
			}
			break;

		case 'height':
			if (newVal !== null) {
				this.style.setProperty('--toast-height', newVal);
			} else {
				this.style.removeProperty('--toast-height');
			}
			break;
		}
	}

	static get observedAttributes() {
		return [
			'open',
			'color',
			'background',
			'height',
		];
	}

	static async toast(text, {
		duration   = NaN,
		color      = null,
		background = null,
	} = {}) {
		const toast = new HTMLToastMessageElement(text);
		if (Number.isInteger(duration)) {
			toast.duration = duration;
		}

		if (typeof color === 'string') {
			toast.color = color;
		}

		if (typeof background === 'string') {
			toast.background = background;
		}
		document.body.append(toast);
		await toast.show();
		await toast.closed;
		toast.remove();
	}
});
