import {confirm} from '../js/std-js/asyncDialog.js';

customElements.define('logout-button', class LogoutButtonElement extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('click', async () => {
			if (await confirm('Are you sure you want to logout?')) {
				location.hash = '#logout';
			}
		});
	}
});
