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

var payloadTemplate = new PayloadTemplate();
var currentPayload;

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
      console.log(e, body);
      return;
    }

    currentPayload = null;
    
    // productionBuild.green = false; // testing
    if (productionGreen && !productionBuild.green) {
      console.log(timeStamp(),"Production has been broken");
      currentPayload = payloadTemplate.red(productionBuild);
    } else if (!productionGreen && productionBuild.green) {
      currentPayload = payloadTemplate.green(productionBuild);
    }
    
    if (currentPayload) {
      request({
        url: config.webhookurl,
        method: 'POST',
        body: JSON.stringify(currentPayload)
      }, function(error, response, body){
        if (error) {
          console.log(timeStamp(), 'Error posting to slack: ', error, currentPayload);
        } else {
          console.log(timeStamp(), response.statusCode, body);
        }
      });
    }
    
    productionGreen = productionBuild.green;


    // ==========
    // Master
    // ==========
    
    currentPayload = null;

    try {
      masterBuild = JSON.parse(body).latest.filter(function(value) {
        return value.name === 'master';
      })[0];
    } catch(e) {
      console.log(e, body);
      return;
    }

    // masterBuild.green = false; //testing
    if (masterGreen && !masterBuild.green) {
      console.log(timeStamp(),'masters on fire');
      currentPayload = payloadTemplate.red(masterBuild);
    } else if (!masterGreen && masterBuild.green) {
      currentPayload = payloadTemplate.green(masterBuild);
    }
    
    if (currentPayload) {
      request({
        url: config.webhookurl,
        method: 'POST',
        body: JSON.stringify(currentPayload)
      }, function(error, response, body){
        if(error) {
          console.log(timeStamp(),'Error posting to slack: ', error, currentPayload);
        } else {
          console.log(timeStamp(),response.statusCode, body);
        }
      });
    }

    masterGreen = masterBuild.green;

  })
}, timerInterval);
