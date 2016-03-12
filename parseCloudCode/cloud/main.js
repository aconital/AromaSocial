// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.afterSave("Publication", function(request) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub");
				feed.set("modId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
			//if found already in newsfeed  compare update times
			var currentTime=new Date();
			var limitTime=new Date (result.updatedAt.getTime() + 5*60000);
			//if last updated within 5 minutes ignore
			if (currentTime>limitTime) {
				feed.set("from", userId);
				//feed.set("type", "Will update: Limit =" + limitTime + "Current = " + currentTime);
				feed.set("type", "pub");
				feed.set("pubId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
			response.success("Publication Entry Ignored");
		},
		error: function(error) {
			//else simply insert it
			feed.set("from", userId);
			feed.set("type", "pub");
			feed.set("pubId", pubId);
			feed.save();
			response.success("Added Publication Newsfeed Entry");
		}
	});
});

Parse.Cloud.afterSave("Model", function(request) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var modId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("modId", modId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "mod");
				feed.set("modId", datId);
				feed.save();
				response.success("Added Model Newsfeed Entry");
			}
			//if found already in newsfeed  compare update times
			var currentTime=new Date();
			var limitTime=new Date (result.updatedAt.getTime() + 5*60000);
			//if last updated within 5 minutes ignore
			if (currentTime>limitTime) {
				feed.set("from", userId);
				//feed.set("type", "Will update: Limit =" + limitTime + "Current = " + currentTime);
				feed.set("type", "mod");
				feed.set("modId", modId);
				feed.save();
				response.success("Added Model Newsfeed Entry");
			}
			response.success("Model Entry Ignored");
		},
		error: function(error) {
			//else simply insert it
			feed.set("from", userId);
			feed.set("type", "mod");
			feed.set("modId", modId);
			feed.save();
			response.success("Added Model Newsfeed Entry");
		}
	});
});

Parse.Cloud.afterSave("Data", function(request) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var datId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("datId", datId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "dat");
				feed.set("datId", datId);
				feed.save();
				response.success("Added Data Newsfeed Entry");
			}
			//if found already in newsfeed  compare update times
			var currentTime=new Date();
			var limitTime=new Date (result.updatedAt.getTime() + 5*60000);
			//if last updated within 5 minutes ignore
			if (currentTime>limitTime) {
				feed.set("from", userId);
				//feed.set("type", "Will update: Limit =" + limitTime + "Current = " + currentTime);
				feed.set("type", "dat");
				feed.set("datId", datId);
				feed.save();
				response.success("Added Data Newsfeed Entry");
			}
			response.success("Data Entry Ignored");
		},
		error: function(error) {
			//else simply insert it
			feed.set("from", userId);
			feed.set("type", "dat");
			feed.set("datId", datId);
			feed.save();
			response.success("Added Data Newsfeed Entry");
		}
	});
});

Parse.Cloud.beforeDelete("Organization", function(request) {
	Parse.Cloud.useMasterKey();
	var orgId = request.object;
	var Relationship = Parse.Object.extend("Relationship");
	var query = new Parse.Query(Relationship);
	query.equalTo("orgId", orgId);
	query.find({
		success: function(objects){
			for (var i = 0; i < objects.length; i+=1) {
				objects[i].destroy({});
			}
		},
		error: function(error){
			alert("Error: " + error.code + " " + error.message);
		}
	})
	var RelationshipOrg = Parse.Object.extend("RelationshipOrg");
	var query1 = new Parse.Query(RelationshipOrg);
	query1.equalTo("orgId0", orgId);
	//query1.equalTo("orgId0", {__type: "Pointer", className: "Organization", objectId: orgId});
	query1.find({
		success: function(objects){
			for (var i = 0; i < objects.length; i+=1) {
				objects[i].destroy({});
			}
		},
		error: function(error){
			alert("Error: " + error.code + " " + error.message);
		}
	})
	var query2 = new Parse.Query(RelationshipOrg);
	query2.equalTo("orgId1", orgId);
	query2.find({
		success: function(objects){
			for (var i = 0; i < results.length; i+=1) {
				objects[i].destroy({});
			}
		},
		error: function(error){
			alert("Error: " + error.code + " " + error.message);
		}
	})
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