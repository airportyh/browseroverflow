var bs = require('browserstack')
var async = require('async')
var exec = require('child_process').exec
var Process = require('did_it_work')
var extend = require('./extend')
var fs = require('fs')
var path = require('path')
var Setup = require('./setup')
var cache = require('./cache')
var selectBrowser = require('./select_browser')
var Tunnel = require('./tunnel')

module.exports = function(config){
  return new BrowserStack(config)
}

function BrowserStack(config){
  this.config = config || {}
  if (!this.config.profileDir){
    var homeDir = process.env.HOME || process.env.USERPROFILE
    this.config.profileDir = path.join(homeDir, '.browserstack')
  }
  this.Process = Process
  var filepath = path.join(this.config.profileDir, 'browsercache.json')
  this.browsers = cache(this._browsers.bind(this), filepath)
}

BrowserStack.prototype = {

  configure: function(callback){
    if (!this.client){
      var configFile = path.join(this.config.profileDir, 'browserstack.json')
      var self = this
      fs.readFile(configFile, function(err, text){
        if (!err){
          var fileConfig = JSON.parse(text)
          fileConfig.password = self.base64Decode(fileConfig.password)
          self.config = extend(fileConfig, self.config)
        }
        self.createClient()
        callback(self.config)
      })
    }else{
      callback(this.config)
    }
  },

  createClient: function(){
    var cred = {
      username: this.config.username,
      password: this.config.password
    }
    this.client = bs.createClient(cred)
  },

  base64Decode: function(str){
    return new Buffer(str, 'base64').toString('ascii')
  },

  selectBrowser: selectBrowser,

  setup: function(program){
    new Setup(this.config).run(program)
  },

  launch: function(settings, callback){
    this.configure(function(){
      this.browsers(function(err, browsers){
        var spec = {name: settings.browser, version: settings.browser_version,
          os: settings.os, os_version: settings.os_version}
        var browser = this.selectBrowser(browsers, spec)
        if (browser){
          settings = extend(settings, browser)
          this.launchIt(settings, callback)
        }else{
          callback(new Error("Unsupported browser and or OS combination"))
        }
      }.bind(this))
    }.bind(this))
  },

  launchIt: function(settings, callback){
    this.client.createWorker(settings, 
      function(err, worker){
        callback(err, worker)
      }
    )
  },

  // this method is to be cached
  _browsers: function(callback){
    this.configure(function(){
      this.client.getBrowsers(callback)
    }.bind(this))
  },

  jobs: function(callback){
    this.configure(function(){
      this.client.getWorkers(function(err, workers){
        callback(err, workers)
      })
    }.bind(this))
  },

  kill: function(jobId, callback){
    this.configure(function(){
      this.client.terminateWorker(jobId, function(err, data){
        callback(err, data)
      })
    }.bind(this))
  },

  killAllJobs: function(callback){
    var self = this
    self.configure(function(){
      self.jobs(function(err, jobs){
        async.each(jobs, function(job, done){
          self.kill(job.id, done)
        }, function(err){
          callback(err)
        })
      })
    })
  },

  status: function(callback){
    this.configure(function(){
      this.client.status(callback)
    }.bind(this))
  },

  tunnel: function(hostOrSettings, callback){
    var tunnel = new Tunnel(this)
    tunnel.run(hostOrSettings, callback)
    return tunnel
  }

}



