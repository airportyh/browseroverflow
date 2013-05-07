#! /usr/bin/env node

var program = require('commander')
var BrowserStack = require('../lib/browserstack')
var extend = require('../lib/extend')
var cli_util = require('../lib/cli_util')
var exitIfErrorElse = cli_util.exitIfErrorElse
var hangOnTillExit = cli_util.hangOnTillExit

program.version(require(__dirname + '/../package').version)

program
  .option('-u, --user <user:password>', 'Browserstack authentication')
  .option('-a, --attach', "Attach process to launched browser")
  .option('-o, --os', 'The os of the browser or device. Defaults to "win"')
  .option('-t, --timeout <seconds>', "Launch duration after which browsers exit")
  .option('-p, --private', "Use the private web tunneling key for manual testing")
  .option('-k, --key <key>', "Tunneling key")


program
  .command('setup')
  .description('Initial setup')
  .action(function(){
    createClient().setup(program)
  })

program
  .command('launch <browser> <url>')
  .description('Launch a browser')
  .action(function(browser, url){
    var config = calculateLaunchConfig(browser, url)
    config.timeout = program.timeout
    var client = createClient()
    client.launch(config, exitIfErrorElse(function(job){
      console.log('Launched job ' + job.id + '.')
      if (program.attach){
        console.log('Ctrl-C to kill job.')
        hangOnTillExit(function(){
          killJob(job.id)
        })
      }
    }))
  })

program
  .command('browsers')
  .description('List available browsers')
  .action(function(){
    createClient().browsers(exitIfErrorElse(function(browsers){
      console.log(browsers)
    }))
  })

program
  .command('jobs')
  .description('List active jobs')
  .action(function(){
    createClient().jobs(exitIfErrorElse(function(jobs){
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
  .action(killJob)

program
  .command('killall')
  .description('Kill all active jobs')
  .action(function(){
    createClient().killAllJobs(exitIfErrorElse(function(){
      console.log('Killed all the jobs.')
    }))
  })

program
  .command('tunnel <host:port>')
  .description('Setup tunneling')
  .action(function(hostAndPort){
    createClient().tunnel({
      hostAndPort: hostAndPort,
      key: program.key,
      usePrivateKey: program['private']
    }, exitIfErrorElse(function(){
      console.log('Tunnel is running.')
      process.stdin.resume()
    }))
  })

program.parse(process.argv)

if (program.args.length === 0){
  program.outputHelp()
}

function createClient(){
  return BrowserStack(configFromOptions(program))
}

function configFromOptions(program){
  if (!program.user) return {}
  var parts = program.user.split(':')
  if (parts.length !== 2){
    console.error('--user option should be in format "user:password"')
    process.exit(1)
  }
  return {
    username: parts[0],
    password: parts[1]
  }
}

function killJob(jobId){
  createClient().kill(jobId, exitIfErrorElse(function(info){
    console.log('Killed job ' + jobId + ' which ran for ' + 
      Math.round(info.time) + 's.')
  }))
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


