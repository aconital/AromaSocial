/**
 * Created by hroshandel on 5/30/2016.
 */

var MODES= ["DEV","PROD"];
var mode= MODES[0];

if(mode == "PROD") {

    module.exports = {
        db_name: "production",
        username: "production",
        password: "Fomsummer2014",
        url: "http://159.203.60.67:1337/parse/",
        linkedin_callback:"https://syncholar.com/auth/linkedin/callback",
        msftCogServAPIKey: "4e12b17ee21441fca62a50d570acc065",
        baseUrl: "https://syncholar.com"
    }
}
else {
    module.exports = {
        db_name: "development",
        username: "development",
        password: "Fomsummer2014",
        url: "http://159.203.60.67:1336/parse/",
        linkedin_callback:"http://localhost:3000/auth/linkedin/callback",
        msftCogServAPIKey: "69bc82dd085d458bbcf261cf06a68558",
        baseUrl: "http://127.0.0.1:3000"
    }
}