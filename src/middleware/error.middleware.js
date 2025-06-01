// error.middleware.js

class ErrorMiddleware {
    // Method to handle errors
    handleError(err, req, res, next) {
        // Log the error (use advanced logging tools like Winston if needed)
        console.error(err.stack);

        // Extract status code or default to 500
        const statusCode = err.status || 500;

        // Prepare the error response object
        const response = {
            success: false,
            message: err.message || "Internal Server Error",
        };

        // Include stack trace in development mode
        if (process.env.NODE_ENV === "development") {
            response.stack = err.stack;
        }

        // Send the response
        res.status(statusCode).json(response);
    }

    // Method for handling 404 errors
    notFound(req, res, next) {
        res.status(404).json({
            success: false,
            message: "Resource not found",
        });
    }
}

// Export an instance of the ErrorMiddleware class
export default new ErrorMiddleware();
