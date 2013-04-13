#! /usr/bin/env node

var browserstack = require('../lib/browserstack')

var config = require('/Users/airportyh/.browserstack.json')
config.jarpath = 'jars/browserstack.jar'
var bs = browserstack(config)

bs.tunnel('localhost', 7357)

setInterval(function(){}, 1000)