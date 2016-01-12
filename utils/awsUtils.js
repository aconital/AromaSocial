module.exports = {
	// encodes uploaded file and returns parameters to pass to S3
	encodeFile: function(username, objectId, file, filetype, keyPart) {
		var key = username + keyPart + objectId + "." + filetype;
		var contentType = file.match(/^data:(\w+\/.+);base64,/);
		var fileBuff = new Buffer(file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
		var params = {
			Key: key,
			Body: fileBuff,
			ContentEncoding: 'base64',
			ContentType: (contentType ? contentType[1] : 'text/plain')
		};
		return params;
	}
}