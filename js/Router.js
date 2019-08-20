const ROUTES = new Map();

export default class Router {
	constructor(routes = {}) {
		Object.entries(routes).forEach(([path, callback]) => {
			try {
				this.setRoute(path, callback);
			} catch(err) {
				console.error(err);
			}
		});
	}

	setRoute(path, callback) {
		if (typeof path === 'string' && callback instanceof Function) {
			ROUTES.set(path, callback);
		} else {
			console.info({path, callback});
			throw new Error('Cannot set route');
		}
	}

	hasRoute(path) {
		return ROUTES.has(path);
	}

	getRoute(path) {
		return ROUTES.get(path);
	}

	async go(path, ...args) {
		try {
			const route = this.getRoute(path);

			if (route instanceof Function) {
				return await route.call(this, ...args);
			} else {
				throw new Error(`No route for ${path}`);
			}
		} catch (err) {
			console.error(err);
			await customElements.whenDefined('toast-message');
			const Toast = customElements.get('toast-message');
			const toast = new Toast();
			const h3 = document.createElement('h3');
			const close = document.createElement('span');
			close.slot = 'close-icon';
			close.textContent = 'X';
			h3.classList.add('center');
			h3.slot = 'content';
			h3.textContent = 'An error occured';
			const error = document.createElement('code');
			error.slot = 'content';
			error.style.color = 'red';
			error.textContent = err.message;
			toast.append(close, h3, error);
			document.body.append(toast);
			await toast.show();
			await toast.closed;
			toast.remove();
		}
	}
}
