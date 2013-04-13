var SimpleProcess = require('../lib/simple_process')
var sinon = require('sinon')
var assert = require('chai').assert

suite('simple process', function(){

  test('basic', function(done){
    SimpleProcess('echo hello', {
      stdout: function(data){
        assert.equal(data, 'hello\n')
        done()
      }
    }).start()
  })

  test('succeed', function(done){
    SimpleProcess('echo hello', {
      successWhenMatches: /hello/,
      success: function(){
        done()
      }
    }).start()
  })

  test('fail', function(done){
    SimpleProcess('blarg', {
      fail: function(data){
        assert.match(data, /command not found/)
        done()
      }
    }).start()
  })

})