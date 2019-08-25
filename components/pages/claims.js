import Router from '/js/Router.js';

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

			this.shadowRoot.append(frag);
		});
	}
}

customElements.define('claims-page', ClaimsPage);

Router.setRoute('claims', async (...args) => {
	const el = new ClaimsPage(...args);
	const app = document.getElementById('app');
	[...app.children].forEach(el => el.remove());
	app.append(el);
});

Router.setRoute('my-claims', async (...args) => {
	const el = new ClaimsPage(...args);
	const app = document.getElementById('app');
	[...app.children].forEach(el => el.remove());
	app.append(el);
});
