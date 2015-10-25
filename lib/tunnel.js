var path = require('path')
var BrowserStackTunnel = require('browserstacktunnel-wrapper')

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
    key = key || (usePrivateKey ? config.privateKey : config.apiKey)
    timeout = timeout || config.tunnelTimeout || config.timeout || 5000

    var tunnelConfig = {
      key: key,
      hosts: [{
        name: host,
        port: port,
        sslFlag: 0
      }]
    }

    var binDirConfigKey = 'win32Bin'

    switch (process.platform) {
      case 'linux':
        binDirConfigKey = (process.arch === 'x64') ? 'linux64Bin' : 'linux32Bin'
        break

      case 'darwin':
        binDirConfigKey = 'osxBin'
        break
    }

    tunnelConfig[binDirConfigKey] = config.profileDir
    browserStackTunnel = new BrowserStackTunnel(tunnelConfig)

    var callbackOnce = function (err) {
      if (callback) {
        callback(err)
        callback = null
      }
    }

    browserStackTunnel.start(function (err) {
      if (!err) {
        self.tunnel = browserStackTunnel

        clearTimeout(self.tunnelStartTimeout)
        self.tunnelStartTimeout = null
      }

      callbackOnce(err)
    })

    self.tunnelStartTimeout = setTimeout(function () {
      if (!self.tunnel) {
        browserStackTunnel.stop(function () {
          self.tunnel = null
          callbackOnce(new Error('Failed to start tunnel in ' + timeout + 'ms'))
        })
      }
    }, timeout)
  }.bind(bs))
}

Tunnel.prototype.stop = function(callback){
  var self = this
  if (!this.tunnel) {
    callback && callback()
    return
  }

  this.tunnel.stop(function (err) {
    if (!err) {
      self.tunnel = null
    }

    callback && callback(err)
  })
}

module.exports = Tunnel
