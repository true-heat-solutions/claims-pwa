import md5 from 'https://cdn.kernvalley.us/js/std-js/md5.js';

const GRAVATAR = 'https://secure.gravatar.com/avatar/';
const SIZES = [
	1024,
	800,
	512,
	400,
	300,
	256,
	180,
	128,
	98,
	64,
	32,
];

function sortDesc(arr) {
	return [...arr].sort((x, y) => x === y ? 0 : x < y ? 1 : -1);
}

function getSrcs({hash, sizeList, fallback = 'mp', rating = 'g', force = false}) {
	const src = new URL(hash, GRAVATAR);
	src.searchParams.set('d', fallback);
	src.searchParams.set('r', rating);
	if (force) {
		src.searchParams.set('f', 'y');
	}
	return sizeList.map(size => {
		src.searchParams.set('s', size);
		return `${src} ${size}w`;
	});
}

function update(img) {
	const {hash, sizeList, fallback, rating, force, defaultSize} = img;
	const src = new URL(hash, GRAVATAR);
	src.searchParams.set('s', defaultSize);
	src.searchParams.set('d', fallback);
	src.searchParams.set('r', rating);
	if (force) {
		src.searchParams.set('f', 'y');
	}
	if (sizeList.length !== 0) {
		img.srcset = getSrcs({hash, sizeList, fallback, rating, force}).join(',');
	}
	img.src = src.href;
}

export default class HTMLGravatarImageElement extends HTMLImageElement {
	constructor({
		email          = null,
		hash           = null,
		defaultSize    = 256,
		sizeList       = undefined,
		fallback       = 'mp',
		rating         = 'g',
		force          = false,
		width          = undefined,
		height         = undefined,
		sizes          = undefined,
		decoding       = undefined,
		referrerPolicy = undefined,
	} = {}) {
		super(width, height);

		if (typeof referrerPolicy === 'string') {
			this.referrerPolicy = referrerPolicy;
		}

		if (typeof decoding === 'string') {
			this.decoding = decoding;
		}

		if (typeof sizes === 'string') {
			this.sizes = sizes;
		}

		this.fallback = fallback;
		this.rating = rating;
		this.force = force;
		this.defaultSize = defaultSize;

		if (typeof email === 'string') {
			this.email = email;
		} else if (typeof hash === 'string') {
			this.hash = hash;
		}


		if (Array.isArray(sizeList)) {
			this.sizeList = sizeList;
		}
	}

	set email(email) {
		this.hash = md5(email);
	}

	set hash(hash) {
		this.setAttribute('hash', hash);
	}

	get hash() {
		return this.getAttribute('hash') || null;
	}

	set sizeList(sizes) {
		if (Array.isArray(sizes)) {
			this.setAttribute('size-list', sortDesc(sizes).join(', '));
		} else {
			throw new Error('Expected an array of sizes');
		}
	}

	get sizeList() {
		if (this.hasAttribute('size-list')) {
			const list = this.getAttribute('size-list').split(',').map(size => parseInt(size.trim()));
			return sortDesc(list);
		} else {
			return SIZES;
		}
	}

	set defaultSize(size) {
		this.setAttribute('default-size', size);
	}

	get defaultSize() {
		return parseInt(this.getAttribute('default-size')) || 256;
	}

	set fallback(fallback) {
		this.setAttribute('fallback', fallback);
	}

	get rating() {
		return this.getAttribute('rating') || 'g';
	}

	set rating(rating) {
		this.setAttribute('rating', rating);
	}

	get force() {
		return this.hasAttribute('force');
	}

	set force(force) {
		this.toggleAttribute('force', force);
	}

	get fallback() {
		return this.getAttribute('fallback') || 'mp';
	}

	static get observedAttributes() {
		return [
			'hash',
			'email',
		];
	}

	static url({
		email          = null,
		hash           = null,
		size           = 256,
		fallback       = 'mp',
		rating         = 'g',
		force          = false,
	} = {}) {
		if (typeof email == 'string' && hash === null) {
			hash = md5(email);
		} else if (typeof hash !== 'string') {
			throw new Error('Gravatar requires an email or hash');
		}
		const url = new URL(hash, GRAVATAR);
		url.searchParams.set('s', size);
		url.searchParams.set('d', fallback);
		url.searchParams.set('r', rating);
		if (force) {
			url.searchParams.set('f', 'y');
		}
		return url;
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
		case 'hash':
			if (newValue !== null) {
				update(this);
			}
			break;
		case 'email':
			if (newValue !== null) {
				this.hash = md5(newValue);
				this.removeAttribute('email');
			}
			break;
		default:
			throw new Error(`Unhandled attribute change: "${name}"`);
		}
	}

	connectedCallback() {
		if (this.hasAttribute('hash')) {
			update(this);
		}
	}
}

customElements.define('gravatar-img', HTMLGravatarImageElement, {extends: 'img'});
