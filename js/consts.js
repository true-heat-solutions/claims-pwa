export const SERVERS = {
	local: 'http://localhost:8001/',
	remote: 'https://e8640586-0899-49fe-a622-4c98878f4c31.kernvalley.us',
};

export const LOCAL = location.hostname === 'localhost';
export const ENVIRONMENT = LOCAL ? 'dev' : 'prod';
export const ENDPOINT = ENVIRONMENT === 'dev' ? SERVERS.local : SERVERS.remote;
