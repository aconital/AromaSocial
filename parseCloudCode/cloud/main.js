Parse.Cloud.beforeSave(Parse.User, function(request, response) {
	if (!request.object.get("picture")) {
	  	var query = new Parse.Query("Static_Resources");
		query.get("EEgFIzn2ta", {
			success: function(res) {
	    		request.object.set("picture", res.get("file"));
	  			response.success();
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
				response.error(error);
			}
		});
	} else { response.success(); }
});

Parse.Cloud.beforeSave("Organization", function(request, response) {
	if (!request.object.get("picture")) {
	  	var query = new Parse.Query("Static_Resources");
		query.get("gXy3yIGZV1", {
			success: function(res) {
	    		request.object.set("picture", res.get("file"));
	  			response.success();
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
				response.error(error);
			}
		});
	} else { response.success(); }
});

Parse.Cloud.beforeSave("Data", function(request, response) {
	if (!request.object.get("picture")) {
	  	var query = new Parse.Query("Static_Resources");
		query.get("w6NYAKDKHb", {
			success: function(res) {
	    		request.object.set("picture", res.get("file"));
	  			response.success();
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
				response.error(error);
			}
		});
	} else { response.success(); }
});

Parse.Cloud.beforeSave("Model", function(request, response) {
	if (!request.object.get("picture")) {
	  	var query = new Parse.Query("Static_Resources");
		query.get("o59Ph5ELBC", {
			success: function(res) {
	    		request.object.set("picture", res.get("file"));
	  			response.success();
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
				response.error(error);
			}
		});
	} else { response.success(); }
});

Parse.Cloud.beforeSave("Equipment", function(request, response) {
	if (!request.object.get("picture")) {
	  	var query = new Parse.Query("Static_Resources");
		query.get("o59Ph5ELBC", {
			success: function(res) {
	    		request.object.set("picture", res.get("file"));
	  			response.success();
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
				response.error(error);
			}
		});
	} else { response.success(); }
});

Parse.Cloud.beforeSave("Project", function(request, response) {
	if (!request.object.get("picture")) {
	  	var query = new Parse.Query("Static_Resources");
		query.get("w6NYAKDKHb", {
			success: function(res) {
	    		request.object.set("picture", res.get("file"));
	  			response.success();
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
				response.error(error);
			}
		});
	} else { response.success(); }
});

Parse.Cloud.afterSave("Project", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var projId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("projectId", projId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "project");
				feed.set("projectId", projId);
				feed.save();
				response.success("Added Project Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Pub_Book", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubBookId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub_book");
				feed.set("pubBookId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Pub_Conference", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubConferenceId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub_conference");
				feed.set("pubConferenceId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Pub_Journal_Article", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubJournalId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub_journal");
				feed.set("pubJournalId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Pub_Patent", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubJournalId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub_patent");
				feed.set("pubPatentId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Pub_Report", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubReportId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub_report");
				feed.set("pubReportId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Pub_Thesis", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubThesisId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub_thesis");
				feed.set("pubThesisId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Pub_Unpublished", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var pubId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("pubUnpublishedId", pubId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "pub_unpublished");
				feed.set("pubUnpublishedId", pubId);
				feed.save();
				response.success("Added Publication Newsfeed Entry");
			}
		},
		error: function(error) {
		}
	});
});
Parse.Cloud.afterSave("Equipment", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var equipId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("equipId", equipId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("type", "equipment");
				feed.set("equipmentId", equipId);
				feed.save();
				response.success("Added Equipment Newsfeed Entry");
			}
		},
		error: function(error) {
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
		},
		error: function(error) {
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
			if (result==undefined) {
				feed.set("from", userId);
				feed.set("type", "dat");
				feed.set("datId", datId);
				feed.save();
				response.success("Added Data Newsfeed Entry");
			}
		},
		error: function(error) {
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
		query.each(function (relationship) {
			var org = relationship.get("orgId0");
			console.log("Cascade Check between org: "+ org.id +" and user: " + userId.id);
			var duplicateCheck = new Parse.Query("Relationship")
			duplicateCheck.equalTo("userId", userId);
			duplicateCheck.equalTo("orgId", org);
			duplicateCheck.first().then(function(duplicateRelationship){
				if(duplicateRelationship){
					console.log("Rel Cascade, Duplicate between org: "+ org.id +" and user: " + userId.id + " simply verify");
					duplicateRelationship.set("verified", true);
					duplicateRelationship.save();
				}
				else{
					console.log("No duplicates between org: "+ org.id +" and user: " + userId.id +", add");
					var addRelationship = Parse.Object.extend("Relationship");
					var relationship = new addRelationship();
					relationship.set("userId", userId);
					relationship.set("orgId", org);
					relationship.set("verified", true);
					relationship.set("isAdmin", false);
					relationship.save();
				}
			})
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
		query.each(function(user) {
			var user = user.get("userId");
			var duplicateCheck = new Parse.Query("Relationship")
			duplicateCheck.equalTo("userId", user);
			duplicateCheck.equalTo("orgId", orgId0);
			duplicateCheck.first().then(function(duplicateRelationship){
				if(duplicateRelationship){
					console.log("Org Cascade, Duplicate, simply verify")
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
	query.each(function(object){
		object.destroy({});
	}).then(function() {
		var query1 = new Parse.Query(RelationshipOrg);
		query1.equalTo("orgId0", orgId);
		query1.each(function (object) {
			object.destroy({});
		})
	}).then(function() {
		var query2 = new Parse.Query(RelationshipOrg);
		query2.equalTo("orgId1", orgId);
		query2.each(function (object) {
			object.destroy({});
		})
	}).then(function(){
		response.success("Deleted all connections to "+orgId.id);
	}), function(error){
		alert("Error: " + error.code + " " + error.message);
	}
});

Parse.Cloud.afterDelete("Pub_Book", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubBookId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Pub_Conference", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubConferenceId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Pub_Journal_Article", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubJournalId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Pub_Patent", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubPatentId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Pub_Report", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubReportId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Pub_Thesis", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubThesisId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Pub_Unpublished", function(request) {
	Parse.Cloud.useMasterKey();
	var pubId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("pubUnpublishedId", pubId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Equipment", function(request) {
	Parse.Cloud.useMasterKey();
	var equipId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("equipmentId", equipId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Project", function(request) {
	Parse.Cloud.useMasterKey();
	var projId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("projectId", projId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});