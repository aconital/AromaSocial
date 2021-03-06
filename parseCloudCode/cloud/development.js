Parse.Cloud.beforeSave(Parse.User, function(request, response) {
	if (request.object.get("fullname")) {
		request.object.set("search", request.object.get("fullname").toLowerCase());
	}
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
	if (request.object.get("displayName")) {
		request.object.set("search", request.object.get("displayName").toLowerCase());
	}
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
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
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
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
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
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
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
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
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

Parse.Cloud.beforeSave("Pub_Book", function(request, response) {
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
	response.success();
});

Parse.Cloud.beforeSave("Pub_conference", function(request, response) {
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
	response.success();
});

Parse.Cloud.beforeSave("Pub_Journal_Article", function(request, response) {
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
	response.success();
});

Parse.Cloud.beforeSave("Pub_Patent", function(request, response) {
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
	response.success();
});

Parse.Cloud.beforeSave("Pub_Report", function(request, response) {
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
	response.success();
});

Parse.Cloud.beforeSave("Pub_Thesis", function(request, response) {
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
	response.success();
});

Parse.Cloud.beforeSave("Pub_Unpublished", function(request, response) {
	if (request.object.get("title")) {
		request.object.set("search", request.object.get("title").toLowerCase());
	}
	response.success();
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
		}
	});
});
Parse.Cloud.afterSave("Equipment", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("user");
	var orgId=request.object.get("organization");
	var equipId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.select("updatedAt");
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("organization", orgId);
	newsQuery.equalTo("equipId", equipId);
	newsQuery.addDescending("updatedAt");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("from", userId);
				feed.set("orgId", orgId);
				feed.set("type", "equipment");
				feed.set("equipmentId", equipId);
				feed.save();
				response.success("Added Equipment Newsfeed Entry");
			}
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
		}
	});
});

Parse.Cloud.afterSave("Discussion", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId=request.object.get("madeBy");
	var orgId=request.object.get("orgId");
	var discId=request.object;
	var newsFeed=Parse.Object.extend("NewsFeed");
	var newsQuery=new Parse.Query(newsFeed);
	var feed = new newsFeed();
	newsQuery.equalTo("from", userId);
	newsQuery.equalTo("discId", discId);
	newsQuery.equalTo("type", "discussion");
	newsQuery.first({
		success: function(result) {
			if (result==undefined){
				feed.set("type", "discussion");
				feed.set("orgId", orgId);
				feed.set("discId", discId);
				feed.set("from", userId);
				feed.save();
				response.success("Added Discussion Newsfeed Entry");
			}
		}
	});
})

Parse.Cloud.afterSave("RelationshipUser", function(request, response) {
	Parse.Cloud.useMasterKey();
	var userId0 = request.object.get("userId0");
	var userId1 = request.object.get("userId1");
	var verified = request.object.get("verified");
	if (verified) {
		var newsFeed = Parse.Object.extend("NewsFeed");
		var newsQuery = new Parse.Query(newsFeed);
		var feed = new newsFeed();
		newsQuery.equalTo("userId0", userId0);
		newsQuery.equalTo("userId1", userId1);
		newsQuery.first({
			success: function (newsResult) {
				if (newsResult == undefined) {
					feed.set("type", "friend_make");
					feed.set("from", userId0);
					feed.set("userId", userId1);
					feed.save();
					response.success("Added friend to Newsfeed Entry");
				}
			}
		});
	}
});

//cascade through to other connected organizations
Parse.Cloud.afterSave("Relationship", function(request) {
	Parse.Cloud.useMasterKey();
	var userId = request.object.get("userId");
	var orgId = request.object.get("orgId");
	var verified = request.object.get("verified");
	if (verified) {
		var newsFeed=Parse.Object.extend("NewsFeed");
		var newsQuery=new Parse.Query(newsFeed);
		var feed = new newsFeed();
		newsQuery.equalTo("orgId", orgId);
		newsQuery.first({
			success: function (newsResult) {
				if (newsResult == undefined) {
					feed.set("type", "org_create");
					feed.set("from", userId);
					feed.set("orgId", orgId);
					feed.save();
				}
				else{
					var newsQuery2=new Parse.Query(newsFeed);
					newsQuery2.equalTo("orgId", orgId);
					newsQuery2.equalTo("from", userId);
					newsQuery2.equalTo("type", "org_join");
					newsQuery2.first({
						success: function(newsResult2) {
							if (newsResult2 == undefined) {
								feed.set("type", "org_join");
								feed.set("from", userId);
								feed.set("orgId", orgId);
								feed.save();
							}
						}
					});
				}
			}
		});
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
Parse.Cloud.afterDelete("Model", function(request) {
	Parse.Cloud.useMasterKey();
	var modId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("modId", modId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Data", function(request) {
	Parse.Cloud.useMasterKey();
	var datId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("datId", datId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete("Discussion", function(request) {
	Parse.Cloud.useMasterKey();
	var discId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("discId", discId);
	query.first({
		success: function(object) {
			object.destroy();

		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});
Parse.Cloud.afterDelete(Parse.User, function(request) {
	Parse.Cloud.useMasterKey();
	var userId= request.object;
	var NewsFeed = Parse.Object.extend("NewsFeed");
	var query = new Parse.Query(NewsFeed);
	query.equalTo("from", userId);
	query.first({
		success: function(object) {
			object.destroy();
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
	var query2 = new Parse.Query(NewsFeed);
	query2.equalTo("userId", userId);
	query2.first({
		success: function(object) {
			object.destroy();
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});