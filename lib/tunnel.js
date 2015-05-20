var path = require('path')

function Tunnel(bs){
  this.bs = bs
}
Tunnel.prototype.run = function(hostOrSettings, callback){
  var self = this
  var bs = this.bs
  var hostAndPort
  var key
  var usePrivateKey
  var timeout
  
  if (typeof hostOrSettings === 'string'){
    hostAndPort = hostOrSettings
  }else{ // object
    hostAndPort = hostOrSettings.hostAndPort
    key = hostOrSettings.key
    usePrivateKey = hostOrSettings.usePrivateKey
    timeout = hostOrSettings.timeout
  }
   
  var parts = hostAndPort.split(':')
  var host = parts[0]
  var port = parts[1]
  
  bs.configure(function(){
    var config = bs.config
    callback = callback || function(){}
    var jarpath = path.join(config.profileDir, 'BrowserStackTunnel.jar')
    key = key || (usePrivateKey ? config.privateKey : config.apiKey)
    timeout = timeout || config.tunnelTimeout || config.timeout || 5000
    var exe = 'java'
    var args = [
      '-jar',
      jarpath,
      key,
      host + ',' + port + ',0'
    ]
    self.process = bs.Process(exe, args)
      .goodIfMatches(/You can now access your local server/, timeout)
      .good(function(){
        callback(null)
      })
      .badIfMatches(/\*\* Error: (.*)$/m)
      .bad(function(data, stdout, stderr){
        self.process.kill()
        callback(data)
      })
  }.bind(bs))
}

Tunnel.prototype.stop = function(){
  if (this.process) this.process.kill()
}

module.exports = Tunnel