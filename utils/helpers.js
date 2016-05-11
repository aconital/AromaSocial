/**
 * Created by hroshandel on 5/6/2016.
 */
/************************************
 * HELPER FUNCTIONS
 *************************************/
var SparkPost = require('sparkpost');
var sp = new SparkPost('5c4cf399a6bbc1f2bd87a881d08756458b0834cb');

module.exports = {

is_auth: function (req,res,next){
    if (!req.isAuthenticated()) {
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
    if(req.session.code === "Fom2016") {
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
                    from: 'support@syncholar.com',
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
    }

};