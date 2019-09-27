import Router from '/js/Router.js';
import '../user-el.js';
import {ENDPOINT} from '/js/consts.js';
class UsersPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('users.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);

			this.shadowRoot.append(frag);
			const url = new URL('users', ENDPOINT);
			url.searchParams.set('token', localStorage.getItem('token'));
			const userResp = await fetch(url, {mode: 'cors'});
			const users = await userResp.json();
			const list = this.shadowRoot.querySelector('ul');
			if (Array.isArray(users)) {
				await customElements.whenDefined('user-el');
				const HTMLUserElement = customElements.get('user-el');
				users.forEach(user => {
					const li = document.createElement('li');
					const el = new HTMLUserElement();
					el.name = user.person.name;
					el.role = user.role;
					el.telephone = user.person.telephone;
					el.email = user.person.email;
					if  (typeof user.person.image.url === 'string') {
						el.image = user.person.image.url;
					}
					li.append(el);
					list.append(li);
				});
			}
			console.log(users);
		});
	}
}

customElements.define('user-pages', UsersPage);

Router.setRoute('users', async (...args) => {
	if (localStorage.hasOwnProperty('token')) {
		const el = new UsersPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	} else {
		location.href = '#login';
	}
});
