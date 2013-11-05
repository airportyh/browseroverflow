var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')
var getBrowserStackJar = require('../lib/get_browserstack_jar')

function Setup(config){
  this.config = config
  this.profileDir = this.config.profileDir
  this.getBrowserStackJar = getBrowserStackJar
}

Setup.prototype.getInfo = function getInfo(program, callback){
  var self = this
  program.prompt('Username: ', function(username){
    program.prompt('Access key: ', function(testingApiKey){
      callback({
        username: username,
        apiKey: testingApiKey
      })
    })
  })
}

Setup.prototype.base64Encode = function(str){
  return new Buffer(str).toString('base64')
}

Setup.prototype.ensureBrowsemDir = function(callback){
  mkdirp(this.profileDir, callback)
}

Setup.prototype.writeConfigFile = function(config, callback){
  var filePath = path.join(this.profileDir, 'browserstack.json')
  var content = JSON.stringify(config, null, '  ')
  fs.writeFile(filePath, content, function(){
    console.log('Wrote ' + filePath)
    if (callback) callback()
  })
}

Setup.prototype.ensureBrowserStackJar = function(callback){
  var filePath = path.join(this.profileDir, 'BrowserStackTunnel.jar')
  fs.stat(filePath, function(err, stat){
    if (err){
      this.getBrowserStackJar(this.profileDir, function(){
        callback()
      })
    }else{
      callback()
    }
  }.bind(this))
}

Setup.prototype.run = function(program){
  var self = this
  self.ensureBrowsemDir(function(){
    self.getInfo(program, function(config){
      self.writeConfigFile(config, function(){
        self.ensureBrowserStackJar(function(){
          process.exit()
        })
      })
    })
  })
}

module.exports = Setup
