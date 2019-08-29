import Router from '/js/Router.js';
class ProfilePage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('profile.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();

			doc.forms.profile.addEventListener('submit', async event => {
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
			this.set('givenName', localStorage.getItem('givenName'));
			this.set('familyName', localStorage.getItem('familyName'));
			this.set('email', localStorage.getItem('email'));
			this.set('telephone', localStorage.getItem('telephone'));
		});
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

	toJSON() {
		return {
			givenName: this.get('givenName'),
			familyName: this.get('familyName'),
			password: {
				current: this.get('password[current]'),
				'new': this.get('password[new]'),
				repeat: this.get('password[repeat]'),
			},
			telephone: this.get('telephone'),
		};
	}
}

customElements.define('profile-page', ProfilePage);

Router.setRoute('profile', async (...args) => {
	const el = new ProfilePage(...args);
	const app = document.body;
	[...app.children].forEach(el => el.remove());
	app.append(el);
});
