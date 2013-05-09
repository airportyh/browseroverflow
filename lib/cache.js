var fs = require('fs')

module.exports = Cache

function Cache(fun, filepath){

  filepath = filepath || 'cache.json'
  function putCache(obj, cb){
    Cache.store(obj, filepath, cb)
  }

  function getCache(cb){
    fs.readFile(filepath, function(err, json){
      var args = err ? [] : JSON.parse(json)
      cb.apply(this, args)
    })
  }

  var _fun = function(){
    var args = Array.prototype.slice.apply(arguments)
    var cb = args[args.length - 1]
    getCache(function(retval){
      if (arguments.length > 0){
        cb.apply(this, arguments)
      }else{
        args[args.length - 1] = function(retval){
          var resArgs = Array.prototype.slice.apply(arguments)
          putCache(resArgs, function(){
            cb.apply(this, resArgs)
          })
        }
        fun.apply(this, args)
      }
    })
  }

  _fun.cache = {
  
  }
  return _fun
}

Cache.store = function(obj, filepath, callback){
  fs.writeFile(filepath, JSON.stringify(obj), callback)
}