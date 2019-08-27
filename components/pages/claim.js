import Router from '/js/Router.js';
class ClaimPage extends HTMLElement {
	constructor(uuid) {
		super();
		this.attachShadow({mode: 'open'});

		if (typeof uuid === 'string' && uuid !== 'new') {
			fetch(new URL('claims.json', import.meta.url)).then(async resp => {
				if (resp.ok) {
					const claims = await resp.json();
					const claim = claims.find(claim => claim.uuid === uuid);
					if (claim) {
						await this.ready;
						this.set('uuid', claim.uuid);
						this.set('customer[name]', claim.customer.name);
						this.set('contractor', claim.contractor.name);
						this.set('lead', claim.lead.name);
						this.set('opened', claim.opened);
						this.set('customer[address][streetAddress]', claim.customer.address.streetAddress);
						this.set('customer[address][addressLocality]', claim.customer.address.addressLocality);
						this.set('customer[address][addressRegion]', claim.customer.address.addressRegion);
						this.set('customer[address][postalCode]', claim.customer.address.postalCode);
						this.set('customer[address][addressCountry]', claim.customer.address.addressCountry);
					}
				}
			}).catch(console.error);
		}

		fetch(new URL('claim.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();

			doc.forms.claim.addEventListener('submit', async event => {
				event.preventDefault();
				await customElements.whenDefined('toast-message');
				const Toast = customElements.get('toast-message');
				const toast = new Toast();
				const pre = document.createElement('pre');
				const code = document.createElement('code');
				pre.slot = 'content';
				code.textContent = JSON.stringify(this, null, 2);
				pre.append(code);
				toast.append(pre);
				document.body.append(toast);
				await toast.show();
				await toast.closed;
				toast.remove();
			});

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

	toJSON() {
		return {
			uuid: this.get('uuid'),
			customer: {
				name: this.get('customer[name]'),
				telephone: this.get('customer[telephone]'),
				address: {
					streetAddress: this.get('customer[address][streetAddress]'),
					addressLocality: this.get('customer[address][addressLocality]'),
					addressRegion: this.get('customer[address][addressRegion]'),
					postalCode: this.get('customer[address][postalCode]'),
					addressCountry: this.get('customer[address][addressCountry]'),
				}
			},
			contractor: {
				name: this.get('contractor')
			},
			lead: {
				name: this.get('lead'),
			},
			opened: this.get('opened'),
		};
	}

	get(name) {
		const input = this.shadowRoot.querySelector(`[name="${name}"]`);
		return input instanceof HTMLElement ? input.value : null;
	}

	set(name, value) {
		const input = this.shadowRoot.querySelector(`[name="${name}"]`);
		if (input instanceof HTMLElement) {
			input.value = value;
		}
	}
}

customElements.define('claim-page', ClaimPage);

Router.setRoute('claim', async (...args) => {
	const el = new ClaimPage(...args);
	const app = document.body;
	[...app.children].forEach(el => el.remove());
	app.append(el);
});
