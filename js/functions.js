import {ENDPOINT} from './consts.js';
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

export function userCan(...req) {
	const perms = localStorage.getItem('permissions').split(',');
	return req.every(perm => perms.includes(perm));
}

export async function getRoles() {
	const resp = await fetch(new URL('/Roles/', ENDPOINT), {
		mode: 'cors',
		headers: new Headers({
			Accept: 'application/json',
		}),
	});

	if (resp.ok) {
		return await resp.json();
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}

export async function getContractors(token) {
	const url = new URL('Contractors/', ENDPOINT);
	url.searchParams.set('token', token);
	const resp = await fetch(url, {
		mode: 'cors',
		headers: new Headers({
			Accept: 'application/json',
		}),
	});

	if (resp.ok) {
		return resp.json();
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}

export async function getLeads(token) {
	const url = new URL('Lead/', ENDPOINT);
	url.searchParams.set('token', token);
	const resp = await fetch(url, {
		mode: 'cors',
		headers: new Headers({
			Accept: 'application/json',
		}),
	});

	if (resp.ok) {
		return resp.json();
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}
