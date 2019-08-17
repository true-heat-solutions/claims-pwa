customElements.define('form-json', class HTMLFormJSONELement extends HTMLFormElement {
	constructor() {
		super();
		this.addEventListener('submit', async event => {
			event.preventDefault();

			try {
				const resp = await fetch(this.action, {
					headers: new Headers({
						Accept: 'application/json',
						'Content-Type': 'application/json',
					}),
					method: 'POST',
					mode: 'cors',
					body: JSON.stringify(this),
				});

				if (resp.ok) {
					const body = await resp.json();
					this.dispatchEvent(new CustomEvent('success', {detail: {
						url: new URL(resp.url),
						ok: resp.ok,
						status: resp.status,
						statusText: resp.statusText,
						redirected: resp.redirected,
						type: resp.type,
						headers: Object.fromEntries(resp.headers.entries()),
						body: body,
					}}));
				} else {
					const detail = await resp.json();
					if (detail.hasOwnProperty('error')) {
						this.dispatchEvent(new CustomEvent('fail', {detail}));
					}
				}
			} catch(err) {
				console.error(err);
			}
		});
	}

	toJSON() {
		return Object.fromEntries(new FormData(this).entries());
	}
}, {extends: 'form'});
