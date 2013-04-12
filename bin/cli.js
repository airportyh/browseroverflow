#! /usr/bin/env node

var cmd = require('commander')

cmd.version(require(__dirname + '/../package').version)

browserStack()
function browserStack(){
  cmd.command('browserstack')
  .description('Setup BrowserStack config')
  
}

sauceLabs()
function sauceLabs(){
  cmd.command('saucelabs <cmd>')
}


cmd.parse(process.argv)

if (cmd.args.length === 0){
  cmd.outputHelp()
}