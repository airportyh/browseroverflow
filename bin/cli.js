#! /usr/bin/env node

var program = require('commander')
var Setup = require('../lib/setup')
var BrowserStack = require('../lib/browserstack')
var path = require('path')

program.version(require(__dirname + '/../package').version)

program
  .command('setup')
  .description('Required initial setup')
  .action(function(){
    new Setup().run(program)
  })

program
  .command('launch <browser> <url>')
  .description('Launch a browser')
  .action(function(browser, url){
    var config = calculateLaunchConfig(browser, url)
    var bs = createClient()
    bs.launch(config, function(err, worker){
      if (err){
        console.error(err)
        return process.exit(1)
      }
      console.log('Launched worker ' + worker.id + '.')
    })
  })

program
  .command('browsers')
  .description('List available browsers')
  .action(function(){
    createClient().browsers(function(err, browsers){
      if (err){
        console.error(err)
        return process.exit(1)
      }
      console.log(browsers)
    })
  })

program
  .command('jobs')
  .description('List active jobs')
  .action(function(){
    createClient().jobs(function(err, jobs){
      if (err){
        console.error(err)
        return process.exit(1)
      }
      if (jobs.length === 0){
        console.log('No active jobs.')
      }else{
        console.log(jobs)
      }
    })
  })

program
  .command('kill <job_id>')
  .description('Kill an active job')
  .action(function(jobId){
    createClient().kill(jobId, function(err, data){
      if (err){
        console.error(err)
        return process.exit(1)
      }
      console.log('Killed worker ' + jobId + ' which ran for ~' + Math.round(data.time) + 's.')
    })
  })

program
  .command('killall')
  .description('Kill all active jobs')
  .action(function(){
    createClient().killAllJobs(function(err){
      if (err){
        console.error(err)
        return process.exit(1)
      }
      console.log('You killed all the jobs. Happy now?')
    })
  })

program
  .command('tunnel <host> <port>')
  .description('Setup tunneling')
  .action(function(host, port){
    createClient().tunnel(host, port, function(err){
      if (err){
        console.error(err.message)
        return process.exit(1)
      }
      console.log('Tunnel is running.')
      process.stdin.resume()
    })
  })

program.parse(process.argv)

if (program.args.length === 0){
  program.outputHelp()
}

function createClient(){
  var homeDir = process.env.HOME || process.env.USERPROFILE
  var jarPath = path.join(homeDir, '.browsem', 'browserstack.jar')
  var info = require(path.join(homeDir, '.browsem', 'browserstack.json'))
  var bs = BrowserStack({
    username: info.username,
    password: base64decode(info.password),
    jarpath: jarPath,
    key: info.apiKey
  })
  return bs
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

function base64decode(str){
  return new Buffer(str, 'base64').toString('ascii')
}
