var request = require('request');
var config = require('./config');
var PayloadTemplate = require('./payloadTemplate');
var timerInterval = 5000; // how long between checks?


var timeStamp = function() {
  return '[' + new Date().toUTCString() + '] ';
}

// new greeting
console.log(timeStamp(),'Rickbot online!');


// fault in core projects so that we can immediately show their red status if they are currenty red
var projectCache = {
  web: {
    production: { green: true },
    master:     { green: true }
  },
  PNAPI: {
    master:     { green: true }
  },
  backdraft: {
    production: { green: true },
    master:     { green: true }
  }
};

var payloadTemplate = new PayloadTemplate();
var currentPayload;

var loop = setInterval( function() {
  console.log(timeStamp(),'checking...');

  request(config.jenkinstein, function (error, response, body) {

    if (error) {
      console.log(timeStamp(),'Error requesting jenkinstein api:', error);
      return
    }

    try {
      var projects = JSON.parse(body).projects;
    } catch(e) {
      console.log(e, body);
      return;
    }
    
    function fireWebhook(payload) {
      request({
        url: config.webhookurl,
        method: 'POST',
        body: JSON.stringify(payload)
      }, function(error, response, body){
        if (error) {
          console.log(timeStamp(), 'Error posting to slack: ', error, payload);
        } else {
          console.log(timeStamp(), response.statusCode, body);
        }
      });
    };

    currentPayload = null;
    
    for (var projectName in projects) {
      var cachedProject = projectCache[projectName];
      var currentProject = projects[projectName];
      
      //if (projectName == "web") currentProject.production.green = false; // testing
      //if (projectName == "backdraft") currentProject.master.green = false; // testing

      // let's first make sure we even know about the production branch in both the cache and server
      ['production', 'master'].forEach(function(branch) {
        if (cachedProject && cachedProject[branch] && currentProject[branch]) {
        
          if (cachedProject[branch].green != currentProject[branch].green) {
            console.log(timeStamp(), projectName + ":" + branch + " has been " + (currentProject[branch].green ? "fixed" : "broken"));
            fireWebhook(payloadTemplate.build(projectName, branch, currentProject[branch]));
          }
        }
      });
    }

    // clone latest project status into cache
    projectCache = JSON.parse(JSON.stringify(projects));

  })
}, timerInterval);