var exec = require('child_process').exec

module.exports = function(cmd, config){
  return new SimpleProcess(cmd, config)
}

function SimpleProcess(cmd, config){
  this.cmd = cmd
  this.config = extend({
    stdout: function(){},
    success: function(){},
    fail: function(){}
  }, config)
}

SimpleProcess.prototype = {
  start: function(){
    var proc = exec(this.cmd)

    proc.stdout.on('data', function(data){
      data = data.toString()
      this.config.stdout(data)
      if (this.successMatched(data)){
        this.config.success()
      }
    }.bind(this))

    proc.stderr.on('data', function(data){
      this.config.fail(data)
    }.bind(this))
  },
  successMatched: function(data){
    return this.config.successWhenMatches && 
      data.match(this.config.successWhenMatches)
  }
}

function extend(dst, src){
  for (var prop in src){
    dst[prop] = src[prop]
  }
  return dst
}
