var request = require('request');
var config = require('./config');

var timerInterval = 5000; // how long between checks?


var timeStamp = function() {
  return '[' + new Date().toUTCString() + '] ';
}

var youBrokeProductionPayload = {
    "text": "Alright... who broke production? :rotating_light: :rotating_light: :rotating_light:",
    "username" : "Rick Sanchez",
    "icon_url" : "http://i.imgur.com/ijJCNrh.jpg",
    "attachments": [
        {
            "fallback": "Production is broken!",
            "color": "danger",
            "title": "View on Jenkins",
            "title_link": "https://hq.ringrevenue.net:9443/job/production/",
            "image_url": "http://i.imgur.com/oUoXMDp.jpg",
            "thumb_url": "http://i.imgur.com/oUoXMDp.jpg"
        }
    ]
}

var youBrokeMasterPayload = {
    "text": "Alright... who broke master? :rotating_light: :rotating_light: :rotating_light:",
    "username" : "Rick Sanchez",
    "icon_url" : "http://i.imgur.com/ijJCNrh.jpg",
    "attachments": [
        {
            "fallback": "Master is broken!",
            "color": "danger",
            "title": "View on Jenkins",
            "title_link": "https://hq.ringrevenue.net:9443/job/master/",
            "image_url": "http://i.imgur.com/CNSlbcg.jpg",
            "thumb_url": "http://i.imgur.com/CNSlbcg.jpg"
        }
    ]
}



//======= Greeting
// var payload = {
//   'text': 'Production & Master build alert system online. And awaaaay we go!',
//   'username': 'Rick Sanchez',
//   'icon_url': 'http://i.imgur.com/ijJCNrh.jpg'
// };
//
// request({
//     url: config.webhookurl,
//     method: 'POST',
//     body: JSON.stringify(payload)
// }, function(error, response, body){
//     if(error) {
//         console.log(timeStamp(),error);
//     } else {
//         console.log(timeStamp(),response.statusCode, body);
//     }
// });

//======= end greeting
// new greeting
console.log(timeStamp(),'Rickbot online!');



var green = true;
var masterGreen = true;
var productionBuild = {};
productionBuild.green = true;
var masterBuild = {};
masterBuild.green = true;

setInterval( function() {
  console.log(timeStamp(),'checking...');

  request(config.jenkinstein, function (error, response, body) {

    if (error) {
      console.log(timeStamp(),'Error requesting jenkinstein api:', error);
      return
    }

    try {
      productionBuild = JSON.parse(body).latest.filter(function(value) {
        return value.name === 'production';
      })[0];
    } catch(e) {
      console.log(e);
      console.log(body);
      return;
    }

    // productionBuild.green = false; // testing
    if (green && !productionBuild.green) {
      console.log(timeStamp(),"Production has been broken");
      youBrokeProductionPayload.attachments[0].title_link = productionBuild.url;
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(youBrokeProductionPayload)
      }, function(error, response, body){
          if(error) {
              console.log(timeStamp(),'Error posting to slack after prod broken',error);
          } else {
              console.log(timeStamp(),response.statusCode, body);
          }
      });
    }

    if (!green && productionBuild.green) {
      console.log(timeStamp(),"Production has been fixed");

      var payload = {  "text": "Production's green again! <"+productionBuild.url+'| Build here>', "username" : "Rick Sanchez", "icon_url" : "http://i.imgur.com/ijJCNrh.jpg"};
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(payload)
      }, function(error, response, body){
          if(error) {
              console.log(timeStamp(),'Error posting to slack after prod fix',error);
          } else {
              console.log(timeStamp(),response.statusCode, body);
          }
      });
    }

    green = productionBuild.green;




    // ==========
    // Master
    // ==========



    try {
      masterBuild = JSON.parse(body).latest.filter(function(value) {
        return value.name === 'master';
      })[0];
    } catch(e) {
      console.log(e);
      console.log(body);
      return;
    }



    // masterBuild.green = false; //testing
    if (masterGreen && !masterBuild.green) {
      console.log(timeStamp(),'masters on fire');
      youBrokeMasterPayload.attachments[0].title_link = masterBuild.url;
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(youBrokeMasterPayload)
      }, function(error, response, body){
          if(error) {
              console.log(timeStamp(),'Error posting to slack on master broken',error);
          } else {
              console.log(timeStamp(),response.statusCode, body);
          }
      });

    }
    if (!masterGreen && masterBuild.green) {
      console.log(timeStamp(),'masters fixed!');
      var payload = {  "text": "Master is green again! <"+masterBuild.url+'| Build here>', "username" : "Rick Sanchez", "icon_url" : "http://i.imgur.com/ijJCNrh.jpg"};
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(payload)
      }, function(error, response, body){
          if(error) {
              console.log(timeStamp(),'Error posting to slack on master fixed',error);
          } else {
              console.log(timeStamp(),response.statusCode, body);
          }
      });
    }

    masterGreen = masterBuild.green;

  })
}, timerInterval);
