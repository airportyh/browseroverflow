var bs = require('browserstack')
var async = require('async')

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
  }
}