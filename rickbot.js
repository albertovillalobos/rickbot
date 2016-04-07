var request = require('request');
var config = require('./config');
var PayloadTemplate = require('./payloadTemplate');

var timerInterval = 5000; // how long between checks?


var timeStamp = function() {
  return '[' + new Date().toUTCString() + '] ';
}

// new greeting
console.log(timeStamp(),'Rickbot online!');



var productionGreen = true;
var masterGreen = true;
var productionBuild = {};
var masterBuild = {};

var payload = new PayloadTemplate();

setInterval( function() {
  console.log(timeStamp(),'checking...');

  request(config.jenkinstein, function (error, response, body) {

    if (error) {
      console.log(timeStamp(),'Error requesting jenkinstein api:', error);
      return
    }

    try {
      productionBuild = JSON.parse(body).latest.filter(function(build) {
        return build.name === 'production';
      })[0];
    } catch(e) {
      console.log(e);
      console.log(body);
      return;
    }

    // productionBuild.green = false; // testing
    if (productionGreen && !productionBuild.green) {
      console.log(timeStamp(),"Production has been broken");
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(payload.red(productionBuild))
      }, function(error, response, body){
          if(error) {
              console.log(timeStamp(),'Error posting to slack after prod broken',error);
          } else {
              console.log(timeStamp(),response.statusCode, body);
          }
      });
    }

    if (!productionGreen && productionBuild.green) {
      console.log(timeStamp(),"Production has been fixed");
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(payload.green(productionBuild))
      }, function(error, response, body){
          if(error) {
              console.log(timeStamp(),'Error posting to slack after prod fix',error);
          } else {
              console.log(timeStamp(),response.statusCode, body);
          }
      });
    }

    productionGreen = productionBuild.green;




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
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(payload.red(masterBuild))
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
      request({
          url: config.webhookurl,
          method: 'POST',
          body: JSON.stringify(payload.green(masterBuild))
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
