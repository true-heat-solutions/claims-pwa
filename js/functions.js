import {ENDPOINT} from './consts.js';
const STORAGE = localStorage;

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

export function userCan(...perms) {
	const allowed = getPermissions();
	return perms.every(perm => allowed.includes(perm));
}

export function getToken() {
	return STORAGE.getItem('token');
}

export function setToken(val) {
	STORAGE.setItem('token', val);
}

export function getPermissions() {
	const str = STORAGE.getItem('permissions') || '';
	return str.split(',');
}

export function setPermissions(val) {
	if (Array.isArray(val)) {
		STORAGE.setItem('permissions', val.join(','));
	} else if (typeof val === 'object') {
		STORAGE.setItem('permissions', Object.entries(val)
			.filter(([k, v]) => typeof k === 'string' && v === true)
			.map(([k]) => k)
			.join(','));
	} else {
		STORAGE.setItem('permissions', val);
	}
}

export function loggedIn() {
	return STORAGE.hasOwnProperty('token');
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
