var assert = require('chai').assert
var exec = require('child_process').exec

suite('command line interface', function(){

  test('prints usage', function(done){
    exec('bin/cli.js', function(err, stdout){
      assert.isNull(err)
      assert.match(stdout, /Usage/)
      done()
    })
  })


})