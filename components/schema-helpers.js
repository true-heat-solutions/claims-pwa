export function makeEl({itemprop, content, tag = 'span'}) {
	const el = document.createElement(tag);
	el.slot = itemprop;
	el.setAttribute('itemprop', itemprop);
	el.textContent = content;
	return el;
}
