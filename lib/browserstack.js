var bs = require('browserstack')
var async = require('async')
var exec = require('child_process').exec

module.exports = function(config){
  return new BrowserStack(config)
}

function BrowserStack(config){
  this.config = config
  var cred = {
    username: this.config.username,
    password: this.config.password
  }
  this.client = bs.createClient(cred)
}

BrowserStack.prototype = {

  launch: function(settings, callback){
    this.client.createWorker({
      os: 'mac',
      browser: settings.browser,
      version: settings.version,
      url: settings.url
    }, function(err, worker){
      callback(err, worker)
    })
  },

  browsers: function(callback){
    this.client.getBrowsers(callback)
  },

  jobs: function(callback){
    this.client.getWorkers(function(err, workers){
      callback(err, workers)
    })
  },

  kill: function(jobId, callback){
    this.client.terminateWorker(jobId, function(err, data){
      callback(err, data)
    })
  },

  killAllJobs: function(callback){
    var self = this
    self.jobs(function(err, jobs){
      async.each(jobs, function(job, done){
        self.kill(job.id, done)
      }, function(err){
        callback(err)
      })
    })
  },

  tunnel: function(host, port, callback){
    var jarpath = this.config.jarpath
    var key = this.config.key
    var cmd = 'java -jar blah/' + jarpath + ' ' + key + 
      ' ' + host + ',' + port + ',0'
    console.log(cmd)
    var ps = exec(cmd)
    ps.stderr.on('data', function(err, data){
      if (err){
        console.error(err)
        return
      }
      process.stderr.write(data.toString())
    })
    ps.stdout.on('data', function(err, data){
      if (err){
        console.error(err)
        return
      }
      process.stdout.write(data.toString())
    })
  }

}