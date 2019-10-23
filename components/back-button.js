customElements.define('back-button', class BackButtonElement extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('click', () => history.back());
		this.setAttribute('role', 'button');
		this.innerHTML = '<svg class="current-color icon" viewBox="0 0 10 16"><path fill-rule="evenodd" d="M6 3L0 8l6 5v-3h4V6H6V3z"/></svg>';
	}
});
