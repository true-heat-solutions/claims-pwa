import Router from '/js/Router.js';
import '../claim-item.js';
import './claim.js';

class ClaimsPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('claims.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);
			const btns = frag.querySelectorAll('[data-filter-status]');
			btns.forEach(btn => {
				if (btn.dataset.filterStatus === '*') {
					btn.addEventListener('click', event => {
						const btn = event.target.closest('[data-filter-status]');
						btns.forEach(button => button.disabled = button === btn);
						this.claims.forEach(claim => claim.hidden = false);
					});
				} else {
					btn.addEventListener('click', event => {
						const claims = this.claims;
						const btn = event.target.closest('[data-filter-status]');
						btns.forEach(button => button.disabled = button === btn);
						const status = btn.dataset.filterStatus;
						claims.forEach(claim => claim.hidden = claim.status !== status);
					});
				}
			});

			let items = await ClaimsPage.items;
			if (location.hash.startsWith('#my-claims')) {
				items = items.filter(item => item.lead.name === 'Kishan');
			}
			console.log(items);
			await customElements.whenDefined('claim-item');
			const ClaimItem = customElements.get('claim-item');
			const els = await Promise.all(items.map(async item => {
				const el = new ClaimItem();
				await el.ready;
				el.uuid = item.uuid;
				el.customer = item.customer.name;
				el.status = item.status;
				el.date = item.opened;
				el.slot = 'claim';
				return el;
			}));

			this.shadowRoot.append(frag);
			this.append(...els);
		}).catch(console.error);
	}

	get claims() {
		const slot = this.shadowRoot.querySelector('slot[name="claim"]');
		return slot.assignedElements();
	}

	static get items() {
		return new Promise(async (resolve, reject) => {
			const url = new URL('claims.json', import.meta.url);
			const resp = await fetch(url);
			if (resp.ok) {
				const items = await resp.json();
				resolve(items.map(item => {
					item.opened = new Date(item.opened);
					return item;
				}));
			} else {
				reject(new Error(`${resp.url} [${resp.status} ${resp.statusText}]`));
			}
		});
	}
}

customElements.define('claims-page', ClaimsPage);

Router.setRoute('claims', async uuid => {
	const el = new ClaimsPage(uuid);
	console.log(uuid);
	const app = document.body;
	[...app.children].forEach(el => el.remove());
	app.append(el);
});

Router.setRoute('my-claims', async uuid => {
	const el = new ClaimsPage(uuid);
	console.log(uuid);
	const app = document.body;
	[...app.children].forEach(el => el.remove());
	app.append(el);
});
