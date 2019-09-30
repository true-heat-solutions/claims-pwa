import {ENDPOINT} from '/js/consts.js';
import Router from '/js/Router.js';
import {getRoles} from '/js/functions.js';

class ProfilePage extends HTMLElement {
	constructor(uuid = null) {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('profile.html', import.meta.url)).then(async resp => {
			try {
				const user = await ProfilePage.fetchUser({
					token: localStorage.getItem('token'),
					uuid,
				});
				const parser = new DOMParser();
				const html = await resp.text();
				const doc = parser.parseFromString(html, 'text/html');
				const frag = document.createDocumentFragment();
				const roles = await getRoles();
				const roleSelect = doc.querySelector('[name="role"]');

				roles.forEach(role => {
					const opt = document.createElement('option');
					opt.textContent = role.name;
					opt.value = role.id;
					roleSelect.append(opt);
				});

				roleSelect.value = user.roleId;
				console.info(roles);

				doc.forms.profile.addEventListener('submit', async event => {
					event.preventDefault();
					const resp = await fetch(new URL('/test/', ENDPOINT), {
						method: 'POST',
						mode: 'cors',
						headers: new Headers({
							Accept: 'application/json',
							'Content-Type': 'application/json',
						}),
						body: JSON.stringify(this),
					});
					await customElements.whenDefined('toast-message');
					const data = await resp.json();
					const Toast = customElements.get('toast-message');
					const toast = new Toast();
					const pre = document.createElement('pre');
					const code = document.createElement('code');
					pre.slot = 'content';
					code.textContent = JSON.stringify(data, null, 2);
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
				this.set('givenName', user.givenName);
				this.set('familyName', user.familyName);
				this.set('email', user.email);
				this.set('telephone', user.telephone);
				console.info({user});
			} catch(err) {
				console.error(err);
			}
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

	get role() {
		const select = this.shadowRoot.querySelector('[name="role"]');
		return select.value;
	}

	set role({name, id}) {
		const select = this.shadowRoot.querySelector('[name="role"]');
		select.value = id;
	}

	toJSON() {
		return {
			token: localStorage.getItem('token'),
			person: {
				givenName: this.get('givenName'),
				familyName: this.get('familyName'),
				password: {
					current: this.get('password[current]'),
					'new': this.get('password[new]'),
					repeat: this.get('password[repeat]'),
				},
				telephone: this.get('telephone'),
			}
		};
	}

	static async fetchUser({token = localStorage.getItem('token'), uuid = null} = {}) {
		const url = new URL('/user/', ENDPOINT);
		url.searchParams.set('token', token);
		if (typeof uuid === 'string' && uuid.length !== 0) {
			url.searchParams.set('uuid', uuid);
		} else {
			url.searchParams.set('uuid', localStorage.getItem('identifier'));
		}
		const resp = await fetch(url, {
			mode: 'cors',
			headers: new Headers({
				Accept: 'application/json',
			}),
		});

		if (resp.ok) {
			return await resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}
}

customElements.define('profile-page', ProfilePage);

Router.setRoute('profile', async (...args) => {
	if (localStorage.hasOwnProperty('token')) {
		const el = new ProfilePage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	} else {
		location.href = '#login';
	}
});
