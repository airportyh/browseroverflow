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
      var optionalFields = ['os', 'os_version', 'browser_version']
      var gotThemAll = optionalFields.every(function(field){
        return field in settings
      })
      if (gotThemAll){
        this.launchIt(settings, callback)
      }else{
        this.browsers(function(err, browsers){
          var spec = {name: settings.browser, version: settings.browser_version}
          var browser = this.selectBrowser(browsers, spec)
          settings = extend(settings, browser)
          this.launchIt(settings, callback)
        }.bind(this))
      }
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
    var hostAndPort
    var key
    var usePrivateKey
    if (typeof hostOrSettings === 'string'){
      hostAndPort = hostOrSettings
    }else{ // object
      hostAndPort = hostOrSettings.hostAndPort
      key = hostOrSettings.key
      usePrivateKey = hostOrSettings.usePrivateKey
    }
     
    var parts = hostAndPort.split(':')
    var host = parts[0]
    var port = parts[1]
    
    this.configure(function(){
      callback = callback || function(){}
      var jarpath = path.join(this.config.profileDir, 'browserstack.jar')
      key = key || (usePrivateKey ? this.config.privateKey : this.config.apiKey)
      var exe = 'java'
      var args = [
        '-jar',
        jarpath,
        key,
        host + ',' + port + ',0'
      ]
      this.Process(exe, args)
        .goodIfMatches(/You can now access your local server/, 5000)
        .good(function(){
          callback(null)
        })
        .badIfMatches(/^\*\*Error: (.*)$/)
        .bad(function(data, stdout, stderr){
          callback(data)
        })
    }.bind(this))
  }

}
