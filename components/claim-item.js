import {confirm, alert} from '/js/std-js/asyncDialog.js';
import {ENDPOINT} from '/js/consts.js';

customElements.define('claim-item', class ClaimItemElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('claim-item.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			doc.querySelector('.edit-btn-container').addEventListener('click', () => this.edit());
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);
			frag.querySelector('[name="status"]').addEventListener('change', async event => {
				const el = event.target;
				if (await confirm(`Are you sure you want to change the status to ${el.value}?`)) {
					try {
						const body = JSON.stringify({
							token: localStorage.getItem('token'),
							uuid: this.uuid,
							status: this.status,
						});
						const url = new URL('/Claim/', ENDPOINT);
						const headers = new Headers({
							Accept: 'application/json',
							'Content-Type': 'application/json',
						});
						const resp = await fetch(url, {
							method: 'POST',
							mode: 'cors',
							headers,
							body,
						});

						if (resp.ok) {
							this.shadowRoot.getElementById('container').dataset.status = el.value;
							this.dataset.status = el.value;
						} else {
							throw new Error('Claim status update failed');
						}
					} catch (err) {
						el.value = this.dataset.status;
						alert('There was an error updating claim status');
						console.error(err);
					}

				} else {
					el.value = this.dataset.status;
				}
			}, {
				passive: true,
			});
			this.shadowRoot.append(frag);
			this.dispatchEvent(new Event('ready'));
		});
	}

	get ready() {
		return new Promise(resolve => {
			if (this.shadowRoot instanceof ShadowRoot && this.shadowRoot.childElementCount !== 0) {
				resolve();
			} else {
				this.addEventListener('ready', () => resolve(), {once: true});
			}
		});
	}

	get uuid() {
		return this.getAttribute('uuid');
	}

	set uuid(uuid) {
		this.setAttribute('uuid', uuid);
	}

	set customer(val) {
		const el = document.createElement('span');
		el.slot = 'customer';
		el.textContent = val;
		this.append(el);
	}

	set date(val) {
		if (! (val instanceof Date)) {
			val = new Date(val);
		}
		const el = document.createElement('time');
		el.slot = 'date';
		el.textContent = val.toLocaleDateString();
		el.dateTime = val.toISOString();
		this.append(el);
	}

	set status(val) {
		this.shadowRoot.getElementById('container').dataset.status = val.toLowerCase();
		this.dataset.status = val.toLowerCase();
		this.shadowRoot.querySelector('[name="status"]').value = val.toLowerCase();
	}

	get status() {
		return this.shadowRoot.querySelector('[name="status"]').value;
	}

	view() {
		location.hash = `#claim/${this.uuid}`;
	}

	edit() {
		location.hash = `#claim/${this.uuid}/edit`;
	}
});

