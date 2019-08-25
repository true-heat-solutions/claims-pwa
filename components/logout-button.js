customElements.define('logout-button', class LogoutButtonElement extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('click', () => location.hash = '#logout');
	}
});
