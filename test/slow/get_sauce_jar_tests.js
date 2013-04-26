var getSauceJar = require('../../lib/get_sauce_jar')
var fs = require('fs')
var exec = require('child_process').exec

suite('get the sauce jar', function(){
  var destDir = 'downloads'

  test('gets the jar @slow', function(done){
    this.timeout(60000) // will take a while to download
    getSauceJar(destDir, function(){
      var stat = fs.statSync(destDir + '/sauce.jar')
      done()
    })
  })

  setup(function(done){
    exec('rm downloads/sauce.jar', function(){ done() })
  })

})