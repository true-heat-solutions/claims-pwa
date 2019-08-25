import Router from '/js/Router.js';
class RegisterPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('register.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);

			this.shadowRoot.append(frag);
		});
	}
}

customElements.define('register-page', RegisterPage);

Router.setRoute('register', async (...args) => {
	const el = new RegisterPage(...args);
	const app = document.getElementById('app');
	[...app.children].forEach(el => el.remove());
	app.append(el);
});
