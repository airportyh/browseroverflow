var getBrowserStackJar = require('../lib/get_browserstack_jar')
var fs = require('fs')
var exec = require('child_process').exec

suite('get the browserstack jar', function(){
  var destDir = 'downloads'

  test('gets the jar @slow', function(done){
    this.timeout(4000)
    getBrowserStackJar(destDir, function(){
      var stat = fs.statSync(destDir + '/browserstack.jar')
      done()
    })
  })

  setup(function(done){
    exec('rm downloads/browserstack.jar', function(){ done() })
  })

})