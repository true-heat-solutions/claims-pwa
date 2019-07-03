import webShareApi from 'https://cdn.kernvalley.us/js/std-js/webShareApi.js';
import {
	facebook,
	twitter,
	linkedIn,
	reddit,
	gmail,
	email,
} from './share-config.js';

webShareApi(facebook, twitter, linkedIn, reddit, gmail, email);

export default class HTMLShareButtonElement extends HTMLButtonElement {
	constructor() {
		super();
		this.hidden = ! (navigator.share instanceof Function);
		this.addEventListener('click', async event => {
			event.preventDefault();
			event.stopPropagation();

			try {
				const {title, text, url} = this;
				await navigator.share({title, text, url});
			} catch(err) {
				console.error(err);
			}
		});
	}

	get text() {
		return this.getAttribute('text');
	}

	set text(text) {
		this.setAttribute('text', text);
	}

	get url() {
		return this.hasAttribute('url')
			? new URL(this.getAttribute('url'), document.baseURI).href
			: location.href;
	}

	set url(url) {
		this.setAttribute('url', url);
	}

	get title() {
		return this.hasAttribute('title') ? this.getAttribute('title') : document.title;
	}

	set title(title) {
		this.setAttribute('title', title);
	}
}

if ('customElements' in window) {
	customElements.define('share-button', HTMLShareButtonElement, {extends: 'button'});
}
