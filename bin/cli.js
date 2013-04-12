#! /usr/bin/env node

var download = require('../lib/download')
var ProgressBar = require('progress')

download({
  url: 'http://saucelabs.com/downloads/Sauce-Connect-latest.zip',
  file: 'downloads/sauce.zip',
  progressBar: makeBar,
}, function(){
  console.log()
  process.exit()
})

function makeBar(len){
  return new ProgressBar(
    'Downloading Sauce-Connect-latest.zip [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: len
    }
  )
}