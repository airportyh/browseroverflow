#! /usr/bin/env node

var cmd = require('commander')

cmd.version(require(__dirname + '/../package').version)

browserStack()
function browserStack(){
  var bs = cmd.command('browserstack')
  .description('Setup BrowserStack config')
  .action(function(){
    console.log('BrowserStack')
  })

  bs
    .command('list')
    .description('List active browsers')
    .action(function(){
      console.log('Listing active browsers for BrowserStack.')
    })

  bs
    .command('browsers')
    .description('List available browsers')
    .action(function(){
      console.log('Listing available browsers for BrowserStack.')
    })
  
}

sauceLabs()
function sauceLabs(){
  cmd.command('saucelabs <cmd>')
}


cmd.parse(process.argv)

if (cmd.args.length === 0){
  cmd.outputHelp()
}