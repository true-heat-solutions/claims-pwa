export default class HTMLCurrentYearElement extends HTMLTimeElement {
	constructor() {
		super();
		const now = new Date();
		this.textContent = now.getFullYear();
		this.dateTime = now.toISOString();
	}
}
