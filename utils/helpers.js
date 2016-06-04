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
}
};