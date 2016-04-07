var PayloadTemplate = function() {
};

PayloadTemplate.prototype = {
  ICON_URL: "http://i.imgur.com/ijJCNrh.jpg",

  red: function(build) {
    var config = {
      "username" : "Rick Sanchez",
      "icon_url" : this.ICON_URL,
    };
  
    if (build.project_name === "web") {
      config.text = "Alright... who broke " + this._buildNameFormatted(build.project_name, build.name) + "? :rotating_light: :rotating_light: :rotating_light: <" + build.url + "|View build>";
    
      config.attachments = [
        {
            "fallback": this._buildNameFormatted(build.project_name, build.name) + " is broken!",
            "color": "danger",
            "title": "Last commit by " + build.author,
            "image_url": this._failureImageByBranch(build.project_name, build.name),
            "thumb_url": this._failureImageByBranch(build.project_name, build.name)
        }
      ];

    } else {
      config.text = this._buildNameFormatted(build.project_name, build.name) + " is broken! <" + build.url + "|View build>";
    }

    return config;
  },

  green: function(build) {
    return { 
      "text": this._buildNameFormatted(build.project_name, build.name) + " is green again! <" + build.url + "|View build>", 
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
