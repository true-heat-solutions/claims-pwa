import Router from '/js/Router.js';
class ForgotPasswordPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('forgot-password.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);

			this.shadowRoot.append(frag);
		});
	}
}

customElements.define('forgot-password-page', ForgotPasswordPage);

Router.setRoute('forgot-password', async (...args) => {
	const el = new ForgotPasswordPage(...args);
	const app = document.getElementById('app');
	[...app.children].forEach(el => el.remove());
	app.append(el);
});
