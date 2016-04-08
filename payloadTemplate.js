var PayloadTemplate = function() {
};

PayloadTemplate.prototype = {
  ICON_URL: "http://i.imgur.com/ijJCNrh.jpg",

  build: function(project, branch, build) {
    if (build.green) {
      return this.green(project, branch, build);
    } else {
      return this.red(project, branch, build);
    }
  },
  
  red: function(project, branch, build) {
    var config = {
      "username" : "Rick Sanchez",
      "icon_url" : this.ICON_URL,
    };
  
    if (project === "web") {
      config.text = "Alright... who broke " + this._buildNameFormatted(project, branch) + "? :rotating_light: :rotating_light: :rotating_light: <" + build.url + "|View build>";
    
      config.attachments = [
        {
            "fallback": this._buildNameFormatted(project, branch) + " is broken!",
            "color": "danger",
            "title": "Last commit by " + build.author,
            "image_url": this._failureImageByBranch(project, branch),
            "thumb_url": this._failureImageByBranch(project, branch)
        }
      ];

    } else {
      config.text = this._buildNameFormatted(project, branch) + " is broken! :rotating_light: <" + build.url + "|View build>";
    }

    return config;
  },

  green: function(project, branch, build) {
    return { 
      "text": this._buildNameFormatted(project, branch) + " is green again! :invoca: <" + build.url + "|View build>", 
      "username" : "Rick Sanchez", 
      "icon_url" : this.ICON_URL,
      "attachments" : [
        {
          "text": ":clap: " + build.author
        }
      ]
    };
  },

  _buildNameFormatted: function(project, branch) {
    return "*" + project + ":" + branch + "*";
  },

  _failureImageByBranch: function(project, branch) {
    switch(branch) {
    case "production":
      return "http://i.imgur.com/oUoXMDp.jpg";
    
    case "master":
      return "http://i.imgur.com/CNSlbcg.jpg";
    
    default:
      return "http://i.imgur.com/7NTbP.jpg";
    }
  }
};

module.exports = PayloadTemplate;
