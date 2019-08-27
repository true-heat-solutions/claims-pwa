customElements.define('logo-img', class LogoImageElement extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({mode: 'closed'});
		fetch(new URL('logo-img.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);
			shadow.append(frag);
			this.dispatchEvent(new Event('ready'));
		});
	}
});
