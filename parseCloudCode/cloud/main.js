// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.afterSave("Publication", function(request, response) {
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

Parse.Cloud.afterSave("Model", function(request, response) {
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

Parse.Cloud.afterSave("Data", function(request, response) {
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

//cascade through to other connected organizations
Parse.Cloud.afterSave("Relationship", function(request) {
	Parse.Cloud.useMasterKey();
	var userId = request.object.get("userId");
	var orgId = request.object.get("orgId");
	var verified = request.object.get("verified");
	if (verified) {
		var query = new Parse.Query("RelationshipOrg");
		query.equalTo("orgId1", orgId);
		query.equalTo("type", 'contains');
		query.find().then(function (relationships) {
			for (var i = 0; i < relationships.length; i += 1) {
				var org = relationships[i].get("orgId0");
				var duplicateCheck = new Parse.Query("Relationship")
				duplicateCheck.equalTo("userId", userId);
				duplicateCheck.equalTo("orgId", org);
				duplicateCheck.first().then(function(duplicateRelationship){
					if(duplicateRelationship){
						duplicateRelationship.set("verified", true);
						duplicateRelationship.save();
					}
					else{
						var addRelationship = Parse.Object.extend("Relationship");
						var relationship = new addRelationship();
						relationship.set("userId", userId);
						relationship.set("orgId", org);
						relationship.set("verified", true);
						relationship.set("isAdmin", false);
						relationship.save();
					}
				})
			}
		})
	}
});

//all users within the contained org is added to parent arg
Parse.Cloud.afterSave("RelationshipOrg", function(request){
	Parse.Cloud.useMasterKey();
	//orgId0 CONTAINS orgId1
	var orgId0 = request.object.get("orgId0");
	var orgId1 = request.object.get("orgId1");
	var type = request.object.get("type");
	var verified = request.object.get("verified");
	console.log("org0" + orgId0);
	console.log("org1" + orgId1);
	console.log("type" + type);
	console.log("verified" + verified);
	if (type=='contains' && verified==true){
		var query = new Parse.Query("Relationship");
		query.equalTo("orgId", orgId1);
		console.log("Cascade users from " + orgId1.id + " to " + orgId0.id);
		query.equalTo("verified", true);
		query.find().then(function(users) {
			console.log("find users to cascade");
			for (var i =0; i < users.length; i+=1){
				var user = users[i].get("userId");
				var duplicateCheck = new Parse.Query("Relationship")
				duplicateCheck.equalTo("userId", user);
				duplicateCheck.equalTo("orgId", orgId0);
				duplicateCheck.first().then(function(duplicateRelationship){
					if(duplicateRelationship){
						duplicateRelationship.set("verified", true);
						duplicateRelationship.save();
					}
					else{
						var addRelationship = Parse.Object.extend("Relationship");
						var relationship = new addRelationship();
						relationship.set("userId", user);
						relationship.set("orgId", orgId0);
						relationship.set("verified", true);
						relationship.set("isAdmin", false);
						relationship.save();
					}
				})
			}
		})
	}
});

Parse.Cloud.beforeDelete("Organization", function(request, response) {
	Parse.Cloud.useMasterKey();
	var orgId = request.object;
	var Relationship = Parse.Object.extend("Relationship");
	var RelationshipOrg = Parse.Object.extend("RelationshipOrg");
	var query = new Parse.Query(Relationship);
	query.equalTo("orgId", orgId);
	query.find().then(function(objects){
		for (var i = 0; i < objects.length; i+=1) {
			objects[i].destroy({});
		}
	}).then(function() {
		var query1 = new Parse.Query(RelationshipOrg);
		query1.equalTo("orgId0", orgId);
		query1.find().then(function (objects) {
			for (var i = 0; i < objects.length; i += 1) {
				objects[i].destroy({});
			}
		})
	}).then(function() {
		var query2 = new Parse.Query(RelationshipOrg);
		query2.equalTo("orgId1", orgId);
		query2.find().then(function (objects) {
			for (var i = 0; i < objects.length; i += 1) {
				objects[i].destroy({});
			}
		})
	}).then(function(){
		response.success("Deleted all connections to "+orgId.id);
	}), function(error){
		alert("Error: " + error.code + " " + error.message);
	}
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