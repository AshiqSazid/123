class SendResponse {
	constructor(statusCode, message, data = null, results = null) {
		this.status = statusCode;
		this.message = message;
		this.data = data;
		this.results = results;
		this.status_message = `${statusCode}`.startsWith(2) ? 'success' : 'failed';
	}

	send(res) {
		res.status(this.statusCode).json({
			status: this.status,
			status_message: this.status,
			message: this.message,
			data: this.data,
			results: this.results
		});
	}
}
export default SendResponse
