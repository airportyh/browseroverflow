#! /usr/bin/env node

var program = require('commander')
var BrowserStack = require('../lib/browserstack')

program.version(require(__dirname + '/../package').version)

program
  .command('setup')
  .description('Required initial setup')
  .action(function(){
    BrowserStack().setup(program)
  })

program
  .command('launch <browser> <url>')
  .description('Launch a browser')
  .action(function(browser, url){
    var config = calculateLaunchConfig(browser, url)
    BrowserStack().launch(config, exitIfErrorElse(function(worker){
      console.log('Launched worker ' + worker.id + '.')
    }))
  })

program
  .command('browsers')
  .description('List available browsers')
  .action(function(){
    BrowserStack().browsers(exitIfErrorElse(function(browsers){
      console.log(browsers)
    }))
  })

program
  .command('jobs')
  .description('List active jobs')
  .action(function(){
    BrowserStack().jobs(exitIfErrorElse(function(jobs){
      if (jobs.length === 0){
        console.log('No active jobs.')
      }else{
        console.log(jobs)
      }
    }))
  })

program
  .command('kill <job_id>')
  .description('Kill an active job')
  .action(function(jobId){
    BrowserStack().kill(jobId, exitIfErrorElse(function(info){
      console.log('Killed worker ' + jobId + ' which ran for ~' + 
        Math.round(info.time) + 's.')
    }))
  })

program
  .command('killall')
  .description('Kill all active jobs')
  .action(function(){
    BrowserStack().killAllJobs(exitIfErrorElse(function(){
      console.log('Killed all the jobs.')
    }))
  })

program
  .command('tunnel <host> <port>')
  .description('Setup tunneling')
  .action(function(host, port){
    BrowserStack().tunnel(host, port, exitIfErrorElse(function(){
      console.log('Tunnel is running.')
      process.stdin.resume()
    }))
  })

program.parse(process.argv)

if (program.args.length === 0){
  program.outputHelp()
}

function calculateLaunchConfig(browser, url){
  var parts = browser.split(':')
  browser = parts[0]
  var version = parts[1]
  return {
    browser: browser,
    version: version,
    url: url
  }
}

function exitIfErrorElse(callback){
  return function(err){
    if (err){
      console.error(err.message)
      return process.exit(1)
    }
    var args = Array.prototype.slice.call(arguments, 1)
    callback.apply(this, args)
  }
}
