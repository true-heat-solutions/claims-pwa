export async function importHTML(src) {
	const resp = await fetch(new URL(src, document.baseURI));
	if (resp.ok) {
		const parser = new DOMParser();
		const frag = document.createDocumentFragment();
		const doc = parser.parseFromString(await resp.text(), 'text/html');
		frag.append(...doc.head.children, ...doc.body.children);
		return frag;
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}
