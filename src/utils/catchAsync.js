import SendResponse from "./SendResponse.js";

const catchAsync =fn =>{
	return (req, res, next) => {
		fn(req, res, next).catch(error=>{
			let errMsg;
			if (error.code == 11000) {
				errMsg = Object.keys(error.keyValue)[0] + " already exists.";
			} else {
				errMsg = error.message;
			}
			return next(res.status(400).json(new SendResponse(400,errMsg,null)))

    });
	};
};

export default catchAsync
