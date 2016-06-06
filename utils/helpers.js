/**
 * Created by hroshandel on 5/6/2016.
 */
/************************************
 * HELPER FUNCTIONS
 *************************************/
var config = require('../config/configs');
var SparkPost = require('sparkpost');
var sp = new SparkPost('5c4cf399a6bbc1f2bd87a881d08756458b0834cb');
var request = require('request').defaults({ encoding: null });
var _ = require('underscore');

var Parse = require('parse/node');
Parse.initialize(config.db_name, config.username, config.password);
Parse.serverURL = config.url;

module.exports = {

is_auth: function (req,res,next){

    if (!req.isAuthenticated()) {
        //maybe there is cookie for remember me
        if(req.cookies.syncholar_cookie != null)
        {
            var cookie_token= req.cookies.syncholar_cookie;
            var query = new Parse.Query(Parse.User);
            query.equalTo("cookie_token", cookie_token);
            query.first({
                success: function (result) {
                    if (result) {
                      var username=result.get("username");
                        req.login(username, function(err){
                            if(err) res.redirect('/');

                            res.redirect(req.originalUrl);
                        });

                    }
                },
                error: function ( error) {
                    console.log("Couldnt save cookie token")
                }
            });
        }
        //nope user is not logged in
        else
        res.redirect('/');
    }else if(req.user.emailVerified != true )
    {
        res.redirect('/verify-email');
    }
    else {
        res.locals.user = req.user;
        next();
    }
},
include_user:function(req,res,next){
    if (!req.isAuthenticated()) {
        //maybe there is cookie for remember me
        if(req.cookies.syncholar_cookie != null)
        {
            var cookie_token= req.cookies.syncholar_cookie;
            var query = new Parse.Query(Parse.User);
            query.equalTo("cookie_token", cookie_token);
            query.first({
                success: function (result) {
                    if (result) {
                        var username=result.get("username");
                        req.login(username, function(err){
                            if(err) res.redirect('/');

                            res.redirect(req.originalUrl);
                        });

                    }
                },
                error: function ( error) {
                    console.log("Couldnt save cookie token")
                }
            });
        }
        else
        next();
    }else
    {
        res.locals.user = req.user;
        next();
    }
},
processLinkedinImage:function(email,input){
    if(input.pictureUrls.values != null) {
        request.get(input.pictureUrls.values[0], function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var pictureName = "user_picture.jpg";
                var data = {
                    base64: new Buffer(body,'base64')
                };
                var file = new Parse.File(pictureName, data);
                var query = new Parse.Query(Parse.User);
                query.equalTo("email", email);
                query.first({
                    success: function (result) {
                        if (result) {
                            result.set("picture",file);
                            result.save(null, { useMasterKey: true });
                        }
                    },
                    error: function ( error) {
                        console.log("Couldnt save photo from linkedin")
                    }
                });
            }
        });
    }
},
randomString: function (len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
},
hasBetaCode: function (req,res,next)
{
    if(req.session.code === "summer2016") {
        next();
    } else {
        console.log("==========================");
        console.log("DEBUG: REQ URL => ", req.url);
        console.log("==========================");
        var str = encodeURIComponent(req.url);
        res.redirect("/beta?redLink=" + str);
    }
},
    sendMail:function(subject,html,to)
    {
        sp.transmissions.send({
            transmissionBody: {
                content: {
                    from: 'no-reply@syncholar.com',
                    subject: subject,
                    html: html
                },
                recipients: [
                    {address: to}
                ]
            }
        }, function(err, res) {
            if (err) {
                console.log('Whoops! Something went wrong');
                console.log(err);
            } else {
                console.log('Woohoo! You just sent your first mailing!');
            }
        });
    },

formatParams: function(params) {
    var queryParams = Object.keys(params).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
    }).join('&')
    return queryParams;
},

// used by partitioner in routes/fetchworks.get to determine which are new and which duplicates
pubAlreadyExists: function(pub) {
    for (pub in publications) {

    console.log(JSON.stringify(pub['E'],null,2));
      var pubClass = pub.hasOwnProperty('J') ? "Pub_Journal_Article" : "Pub_Conference";
      var query = new Parse.Query(pubClass);
      query.equalTo("doi", pub['E']['DOI']);
      query.first({
        success: function(object) {
            console.log(JSON.stringify(object,null,2));
          if (object) {
            return true; // A publication with this DOI already exists
          } else {
            return false; // this is a new publication
          }
        },
        error: function(error) {
          return false;
        }
      });
    }
},

// converts publication type to class name
pubTypeToClass: function(type) {
    switch (type) {
        case "journal":
            return "Pub_Journal_Article";
        case "conference":
            return "Pub_Conference";
        case "book":
        case "chapter":
            return "Pub_Book";
        case "report":
            return "Pub_Report";
        case "thesis":
            return "Pub_Thesis";
        case "patent":
            return "Pub_Patent";
        case "unpublished":
            return "Pub_Unpublished";
        default:
            console.log("Warning: pub type not identified", type);
            return "Pub_Unpublished";
    }
},

// used by routes/fetchworks.get to determine which are new and which are duplicates
findDuplicatePubs: function(publications, currentUser) {
    var self = this,
        newPubs = [], duplicates = [],
        existingPubs = []; // if there are duplicates, we want to associate the existing publications with the new contributor.
        // existingPubs = {journal: [], conference: []};

    return Parse.Promise.as().then(function() {
        var promise = Parse.Promise.as(); // define a promise

        _.each(publications, function(pub) {
            promise = promise.then(function() { // each time this loops the promise gets reassigned to the function below

            var pubClass = pub.hasOwnProperty('J') ? "Pub_Journal_Article" : "Pub_Conference",
                extendedObj = JSON.parse(pub['E']),
                query = new Parse.Query(pubClass);
            query.equalTo("doi", extendedObj['DOI']);

            return query.first().then(function(result) { // the code will wait (run async) before looping again knowing that this query (all parse queries) returns a promise.
                if (result) {
                    console.log("this IS a duplicate!\n");
                    // TODO: need to edit later to add link to contributors. Add doi.objectId to pass to client to pass to server again
                    //       OR... make the necessary changes in here.
                    // TODO: also show on prof?
                    var relation = result.relation("other_users");
                    relation.add(currentUser);

                    return result.save(null, { useMasterKey: true }).then(function () {
                        duplicates.push(pub); // A publication with this DOI already exists
                        existingPubs.push({id: result.id, type: result.get('type')});
                    });
                    // existingPubs[result.get('type')].push(result.id); // add the objectIds of the existing publications
                } else {
                    console.log("NOT a duplicate!\n");
                    newPubs.push(pub); // this is a new publication
                }

              return Parse.Promise.as(); // the code will wait again for the above to complete because there is another promise returning here

            }, function (error) {
              console.error("findDuplicatePubs failed with error.code: " + error.code + " error.message: " + error.message);
            });
          });
        });
        return promise; // this will not be triggered until the whole loop above runs and all promises above are resolved

    }).then(function() {
        // console.log('get user');
        // var user = new Parse.Query(Parse.User);
        // return user.get(currentUser.id)
        // .then(function (result) {
        //     // might want to append/merge?
        //     console.log(existingPubs);
        //     result.set('other_pubs', existingPubs)
        //     console.log('set user');
        //     return result.save(null, { useMasterKey: true })
        //     .then(function () {
                console.log('updated user');
                return {new: newPubs, duplicates: duplicates};
        //     });
        // });
        
    }, function (error) {
        console.error("findDuplicatePubs failed with error.code: " + error.code + " error.message: " + error.message);
        return {new: [], duplicates: []};
    });
}
};