class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message);  // Pass the message to the parent Error class constructor
        this.statusCode = statusCode;  // Set the statusCode property
    }
}

module.exports = ExpressError;
