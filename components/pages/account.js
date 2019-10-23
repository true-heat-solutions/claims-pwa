import Router from '/js/Router.js';
import {userCan, loggedIn} from '/js/functions.js';

class AccountPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('account.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);

			[...frag.querySelectorAll('[data-perms]')].forEach(el => {
				const perms = el.dataset.perms.split(' ').map(p => p.trim());
				el.hidden = ! userCan(...perms);
			});
			this.shadowRoot.append(frag);
		});
	}
}

customElements.define('account-page', AccountPage);

Router.setRoute('account', async (...args) => {
	if (loggedIn()) {
		const el = new AccountPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	} else {
		location.href = '#login';
	}
});
