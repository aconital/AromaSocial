module.exports = function() {

	// encodes uploaded file and prepares parameters to pass to S3
	function encodeFile(username, objectId, reqBody) {
		var key = req.params.username + "_" + objectId + "." + reqBody.fileType;
		var contentType = reqBody.file.match(/^data:(\w+\/.+);base64,/);
		var fileBuff = new Buffer(reqBody.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
		var params = {
			Key: key,
			Body: fileBuff,
			ContentEncoding: 'base64',
			ContentType: (contentType ? contentType[1] : 'text/plain')
		};
		return params
	}

}