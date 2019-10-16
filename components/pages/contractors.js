import Router from '/js/Router.js';
import {$} from '/js/std-js/functions.js';
import {confirm} from '/js/std-js/asyncDialog.js';
import {ENDPOINT} from '/js/consts.js';

class ContractorsPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('contractors.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');

			doc.forms.addContractor.addEventListener('submit', async event => {
				event.preventDefault();
				const {target} = event;
				const data = new FormData(target);
				const resp = await fetch(new URL('Contractors/', ENDPOINT), {
					method: 'POST',
					mode: 'cors',
					headers: new Headers({
						Accept: 'application/json',
						'Content-Type': 'application/json',
					}),
					body: JSON.stringify({
						name: data.get('name'),
						token: localStorage.getItem('token'),
					})
				});

				if (resp.ok) {
					target.reset();
					this.contractors = [{name: data.get('name')}];
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
				}
			});

			doc.forms.addContractor.addEventListener('reset', async ({target}) => {
				const dialog = target.closest('dialog[open]');
				if (dialog instanceof HTMLElement) {
					dialog.close();
				}
			});

			doc.getElementById('add-contractor-btn').addEventListener('click', () => {
				this.shadowRoot.querySelector('#add-contrator-dialog').showModal();
			});

			doc.querySelector('.page-container').classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLElement);

			const frag = document.createDocumentFragment();

			frag.append(...doc.head.children, ...doc.body.children);

			this.shadowRoot.append(frag);
			const contr_url = new URL('Contractors/', ENDPOINT);
			contr_url.searchParams.set('token', localStorage.getItem('token'));

			const contr_resp = await fetch(contr_url, {
				mode: 'cors',
				headers: new Headers({
					Accept: 'application/json',
				}),
			});
			const contractors = await contr_resp.json();
			this.contractors = contractors;
		});
	}

	set contractors(val) {
		if (Array.isArray(val)) {
			const tmp = this.shadowRoot.getElementById('contrator-template').content;
			const els = val.map(contractor => {
				const el = tmp.cloneNode(true);
				$('[data-uuid]', el).data({uuid: contractor.uuid});
				$('[data-field="name"]', el).text(contractor.name);
				$('[data-click="delete"]', el).click(async event => {
					const container = event.target.closest('[data-uuid]');

					if (container instanceof HTMLElement && await confirm('Are you sure you wish to delete this contractor?')) {
						const url = new URL('Contractors/', ENDPOINT);
						url.searchParams.set('token', localStorage.getItem('token'));
						url.searchParams.set('uuid', container.dataset.uuid);

						const resp = await fetch(url, {
							method: 'DELETE',
							mode: 'cors',
						});

						if (resp.ok) {
							container.remove();
						} else {
							throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
						}
					}
				});

				return el;
			});

			this.append(...els);
		}
	}
}

customElements.define('contractors-page', ContractorsPage);

Router.setRoute('contractors', async (...args) => {
	if (localStorage.hasOwnProperty('token')) {
		const el = new ContractorsPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	} else {
		location.href = '#login';
	}
});
