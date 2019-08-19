import {importHTML} from './functions.js';
import HTMLGravatarImageElement from './gravatar-img.js';
import {$, notify, ready} from '/js/std-js/functions.js';

async function route() {
	if (location.hash.startsWith('#') && location.hash.length > 1) {
		switch(location.hash.substring(1)) {
		case 'login':
			(async () => {
				const login = await importHTML('/components/login/login.html');
				$('#app > *').remove();
				document.getElementById('app').append(login);

				document.forms.login.addEventListener('fail', async ({target, detail}) => {
					target.querySelector('error-message').message = detail.error.message;
				});

				document.forms.login.addEventListener('success', ({target, detail}) => {
					console.info(detail);
					target.querySelector('error-message').clear();
					localStorage.setItem('token', detail.body.token);
					localStorage.setItem('givenName', detail.body.person.givenName);
					localStorage.setItem('additionalName', detail.body.person.additionalName);
					localStorage.setItem('familyName', detail.body.person.familyName);
					localStorage.setItem('email', detail.body.person.email);

					notify(`Welcome back, ${detail.body.person.honorificPrefix} ${detail.body.person.familyName}`, {
						body: 'We missed you!',
						icon: HTMLGravatarImageElement.url({
							email: detail.body.person.email,
							size: 64,
						}),
					});
				});
			})();
			break;

		default:
			(async () => {
				await customElements.whenDefined('toast-message');
				const Toast = customElements.get('toast-message');
				$('#app > *').remove();
				await Toast.toast(`No route available for ${location.href}`);
				location.hash = '';
			})();
		}
	} else {
		location.hash = '#login';
	}
}

window.addEventListener('hashchange', route);

if (location.hash === '') {
	location.hash = '#login';
}

ready().then(route);
