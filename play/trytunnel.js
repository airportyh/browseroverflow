#! /usr/bin/env node

var browserstack = require('../lib/browserstack')

var config = require('/Users/airportyh/.browserstack.json')
config.jarpath = 'jars/browserstack.jar'
var bs = browserstack(config)

bs.tunnel('localhost:7357', function(err){
  if (err){
    console.log('Tunneling didnt work :( ' + err)
    process.exit(1)
  }else{
    console.log('Tunneling is working! Go to http://localhost:7357/.')
  }
})

setInterval(function(){}, 1000)