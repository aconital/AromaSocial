/**
 * Created by hroshandel on 5/31/2016.
 */
var fs= require('fs');
var _ =require('underscore');
var config = require('../config/configs');
var Queue=  require('../public/javascripts/Queue');
var Parse = require('parse/node');
var async= require('async');
var CronJob = require('cron').CronJob;

Parse.initialize(config.db_name, config.username, config.password);
Parse.serverURL = config.url;

var request_queue = new Queue();

module.exports= function parseUniversities() {

        var q = async.queue(function (data, done)
        {
////////
            var dName = data.name;
            var orgName = data.name.toLowerCase().replace(/'/g, "_").replace(/ /g, "_");

            // check if name already exists in db
            var Organization = Parse.Object.extend("Organization");
            var maxIndexSoFar = -1;
            var query = new Parse.Query(Organization);
            query.startsWith("displayName", data.name.toLowerCase());
            query.each(function(result) {
                console.log("DEBUG: Result => ", result);
                var str = result.get("name");
                console.log("NAME is ==>> ", str);
                var strArr = str.split(".");
                if (strArr.length == 0 || strArr[1] == undefined) {
                    if (str == orgName) {
                        orgName += ".0";
                    }
                    return;
                }
                var index = parseInt(strArr[1]);
                console.log("INDEX: ", index);
                if (maxIndexSoFar < index) {
                    maxIndexSoFar = index;
                }
            }).then(function() {
                //  console.log("Max index in db: ", maxIndexSoFar);
                if (maxIndexSoFar == -1) {
                    // no match in db, all good - keeping this just in case we need to hand such a case (e.g if we dont want to include a seq num for the very first organization)
                } else {
                    // update orgName to use next index
                    var newIndex = maxIndexSoFar + 1;
                    orgName = data.name.toLowerCase() + "." + newIndex;
                }
            }, function(error) {
                console.log("ERROR THROWN: ");
                console.log(error);
            }).then(function() {
                var objectId;
                // var org = Parse.Object.extend("Organization");
                var org = new Organization();
                org.set('cover_imgURL', '/images/banner.png'); // default. replace later
                org.set('profile_imgURL', '/images/organization.png');
                org.set('name', orgName);
                org.set('displayName', dName);

                org.set('country','United States');
                org.set('prov', data.state ? data.state : '');
                org.set('city', data.city? data.city : '');
                org.set('fax', data.fax? data.fax : '');
                org.set('tel', data.tel? data.tel : '');
                org.set('street', data.street ? data.street : '');
                org.set('postalcode', data.zip ? data.zip : '');
                org.set('website', data.url ? data.url : '');

                org.set('carousel_1_img','/images/carousel.png');
                org.set('carousel_1_head', '');
                org.set('carousel_1_body', '');
                org.set('carousel_2_img','/images/carousel.png');
                org.set('carousel_2_head', '');
                org.set('carousel_2_body', '');
                org.set('carousel_3_img','/images/carousel.png');
                org.set('carousel_3_head', '');
                org.set('carousel_3_body', '');

                var location= '';
                if (data.city ) {
                    location = data.city;
                } if (data.state) {
                    if(location!='')
                        location = location +', ' +data.state;
                    else
                        location = data.state;
                } if (data.country) {
                    if(location!='')
                        location = location +', ' +data.country;
                    else
                        location = data.country;
                }
                org.set('location', location);
                console.log(org);
                org.save();


            })
///////
        },100000);

        var contents = fs.readFileSync("./public/json/universities.json");
        var jsonContent = JSON.parse(contents);
        //for(var o in jsonContent){
          // var obj=jsonContent[o];
           _.each(jsonContent,function(obj){
           var name= obj.INSTNM;

            if(name != undefined) {
                var data = {
                    name: obj.INSTNM,
                    street: obj.ADDR,
                    city: obj.CITY,
                    country: "United States",
                    state: obj.STABBR,
                    zip: obj.ZIP,
                    tel: obj.GENTELE,
                    fax: obj.FAXTELE,
                    url: obj.WEBADDR
                }


            }
        });
    request_queue.enqueue({a:1});
    var apicall_cronjob = new CronJob('* * * * * *', function() {


            console.log( request_queue.dequeue());

        }, function () {
            console.log('Woops apicall cron stopped!');
        },
        true /* Start the job right now */
    ); //end of cron


}