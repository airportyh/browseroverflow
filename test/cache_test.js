var cache = require('../lib/cache')
var assert = require('chai').assert
var sinon = require('sinon')
var fs = require('fs')

suite('Cache', function(){
  teardown(function(done){
    fs.unlink('cache.json', function(){
      done()
    })
  })
  test('it returns the same result as function', function(done){
    function fun(cb){
      cb('hello!')
    }
    var cachedFun = cache(fun)
    cachedFun(function(result){
      assert.strictEqual(result, 'hello!')
      done()
    })
  })

  test('it doesnt need to call the function the second time if cached', function(done){
    var callCount = 0
    var fun = cache(function(cb){
      callCount++
      cb('hello')
    })
    fun(function(result){
      assert.strictEqual(result, 'hello')
      assert.equal(1, callCount)  
      fun(function(result){
        assert.strictEqual(result, 'hello')
        assert.equal(1, callCount)
        done()
      })
    })
  })

  test('actually caches multiple arguments', function(done){
    var callCount = 0
    var fun = cache(function(cb){
      callCount++
      cb('hello', 'world')
    })
    fun(function(){
      assert.deepEqual(arguments, ['hello', 'world'])
      assert.equal(1, callCount)
      fun(function(){
        assert.deepEqual(arguments, ['hello', 'world'])
        assert.equal(1, callCount)
        done()
      })
    })
  })

  test('Cache.store stores in file', function(done){
    cache.store({a: 1}, 'a.json', function(){
      assert.equal(fs.readFileSync('a.json'), '{"a":1}')
      fs.unlinkSync('a.json') // cleanup
      done()
    })
  })

  test('stores in file if provided', function(done){
    function fun(cb){
      cb('hello!')
    }
    var cachedFun = cache(fun)
    sinon.spy(cache, 'store')
    cachedFun(function(){
      assert(cache.store.called, 'how come you didnt call')
      done()  
    })
  })
})