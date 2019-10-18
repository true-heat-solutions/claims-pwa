import {ENDPOINT} from '/js/consts.js';
import {getToken} from '/js/functions.js';

customElements.define('user-select', class HTMLUserSelectElement extends HTMLElement {
	constructor() {
		super();
		this.append(document.createElement('select'));
	}

	async connectedCallback() {
		const url = new URL('users/', ENDPOINT);
		url.searchParams.set('token', getToken());
		const resp = await fetch(url, {
			headers: new Headers({
				Accept: 'application/json',
			}),
			mode: 'cors',
		});

		if (resp.ok) {
			const users = await resp.json();
			const opts = users.map(user => {
				const opt = document.createElement('option');
				opt.textContent = user.person.name;
				opt.value = user.person.identifier;
				return opt;
			});
			this.querySelector('select').append(...opts);
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}
});
