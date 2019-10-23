export const SERVERS = {
	local: 'http://localhost:8001/',
	remote: 'https://e8640586-0899-49fe-a622-4c98878f4c31.kernvalley.us',
};
export const ALLOWED_UPLOAD_TYPES = [
	// Images
	'image/jpeg',
	'image/png',
	// Documents
	'application/pdf',
	'application/rtf', // Rich Text
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document' , // Word (.docx)
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excell (.xlsx)
	'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPOint (.pptx)
	'application/msword', // Word (.doc)
	'application/vnd.ms-excel', // Excell (.xls)
	'application/vnd.ms-powerpoint', // PowerPoint (.ppt)
	'application/vnd.oasis.opendocument.text', // LibreOffice Writer (.odt)
	'application/vnd.oasis.opendocument.spreadsheet', // LibreOffice Calc (.ods)
	'application/vnd.oasis.opendocument.presentation', // LibreOffice Impress (.opp)
];

export const LOCAL = location.hostname === 'localhost';
export const ENVIRONMENT = LOCAL ? 'dev' : 'prod';
export const ENDPOINT = ENVIRONMENT === 'dev' ? SERVERS.local : SERVERS.remote;
