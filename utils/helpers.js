/**
 * Created by hroshandel on 5/6/2016.
 */
/************************************
 * HELPER FUNCTIONS
 *************************************/
module.exports = {

    is_auth: function (req,res,next){
    if (!req.isAuthenticated()) {
        res.redirect('/');
    }else if(!req.user.emailVerified || req.user.emailVerified == undefined )
    {
        res.redirect('/verify-email');
    }
    else {
    console.log("***************"+req.user.emailVerified);
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
    if(req.session.code === "Fom2016")
        next()
    else
        res.redirect("/beta");
}

};