const ENDPOINT = 'https://i.imgur.com';

export default class HTMLImgurImgElement extends HTMLPictureElement {
	get hash() {
		return this.getAttribute('hash');
	}

	set hash(hash) {
		this.setAttribute('hash', hash);
	}

	get defaultExtension() {
		return this.getAttribute('default-extension') || '.png';
	}

	set defaultExtension(ext) {
		this.setAttribute('default-extension', ext);
	}

	get defaultSize() {
		return this.getAttribute('default-size') || 'm';
	}

	set defaultSize(size) {
		this.setAttribute('default-size', size);
	}

	get sizes() {
		return this.getAttribute('sizes') || '100vw';
	}

	set sizes(sizes) {
		this.setAttribute('sizes', sizes);
	}

	get alt() {
		return this.getAttribute('alt');
	}

	set alt(alt) {
		this.setAttribute('alt', alt);
	}

	get decoding() {
		return this.getAttribute('decoding') || 'async';
	}

	set decoding(decoding) {
		this.setAttribute('decoding', decoding);
	}

	get referrerPolicy() {
		return this.getAttribute('referrerpolicy') || 'origin-when-cross-origin';
	}

	set referrerPolicy(policy) {
		this.setAttribute('referrerpolicy', policy);
	}

	get crossOrigin() {
		return this.getAttribute('crossorigin') || 'anonymous';
	}

	set crossOrigin(val) {
		this.setAttribute('crossorigin', val);
	}

	get width() {
		return parseInt(this.getAttribute('w'));
	}

	set width(width) {
		this.setAttribute('width', width);
	}

	get height() {
		return parseInt(this.getAttribute('height'));
	}

	set height(height) {
		this.setAttribute('height', height);
	}

	get dimensions() {
		const {height, width} = this;
		return {height, width};
	}

	get orientation() {
		const {height, width} = this.dimensions;
		if (height > width) {
			return 'portait';
		} else if (width > height) {
			return 'landscape';
		} else if (width === height) {
			return 'square';
		} else {
			return undefined;
		}
	}

	get extensions() {
		if (this.hasAttribute('extensions')) {
			return this.getAttribute('extensions').split(',').map(ext => {
				if (! ext.startsWith('.')) {
					ext = `.${ext}`;
				}
				return ext.toLowerCase();
			});
		} else {
			return [
				'.png',
			];
		}
	}

	get highWidth() {
		return parseInt(this.getAttribute('high-width')) || 1024;
	}

	set highWidth(width) {
		this.setAttribute('high-width', width);
	}

	get largeWidth() {
		return parseInt(this.getAttribute('large-width')) || 640;
	}

	set largeWidth(width) {
		this.setAttribute('large-width', width);
	}

	get mediumWidth() {
		return parseInt(this.getAttribute('medium-width')) || 320;
	}

	set mediumWidth(width) {
		this.setAttribute('medium-width', width);
	}

	get smallWidth() {
		return parseInt(this.getAttribute('small-width')) || 160;
	}

	set smallWidth(width) {
		this.setAttribute('small-width', width);
	}

	async connectedCallback() {
		[...this.children].forEach(child => child.remove());
		const src = new URL(ENDPOINT);
		const {hash, extensions, sizes, defaultSize, defaultExtension} = this;
		const img = document.createElement('img');
		const sizeList = Object.entries({
			h: this.highWidth,
			l: this.largeWidth,
			m: this.largeWidth,
			t: this.smallWidth,
		});
		img.decoding = this.decoding;
		img.referrerPolicy = this.referrerPolicy;
		img.crossOrigin = this.crossOrigin;
		extensions.forEach(ext => {
			const source = document.createElement('source');
			source.type = HTMLImgurImgElement.getType(ext);
			source.sizes = sizes;
			source.srcset = sizeList.map(([s, w]) => {
				src.pathname = `${hash}${s}${ext}`;
				return `${src} ${w}w`;
			}).join(', ');
			src.pathname = `${hash}${defaultSize}${ext}`;
			source.src = src.href;
			this.append(source);
		});
		src.pathname = `${hash}${defaultSize}${defaultExtension}`;
		img.src = src.href;
		this.append(img);
	}

	static getType(ext) {
		switch(ext.toLowerCase()) {
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.png':
			return 'image/png';
		case '.webp':
			return 'image/webp';
		case '.gif':
			return 'image/gif';
		default:
			throw new Error(`Unknown image extension: "${ext}"`);
		}
	}
}

customElements.define('imgur-img', HTMLImgurImgElement, {extends: 'picture'});
