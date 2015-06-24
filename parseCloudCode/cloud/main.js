
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.afterSave("Publication", function(request) { 
Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var feed = new NewsFeed();
	feed.set("from",userId);
	feed.set("type","pub");
	feed.set("pubId",pubId);
	feed.save();
});


Parse.Cloud.afterDelete("Publication", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
