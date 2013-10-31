var download = require('../lib/download')
var fs = require('fs')
var assert = require('assert')
var exec = require('child_process').exec
var sinon = require('sinon')

suite('download', function(){

  test('downloads file via http', function(done){
    download({
      url: avatarUrl('http'),
      file: filepath('avatar_http.jpg')
    }, function(err){
      var stat = fs.statSync(filepath('avatar_http.jpg'))
      done()
    })
  })

  test('downloads file via https', function(done){
    download({
      url: avatarUrl('https'),
      file: filepath('avatar_https.jpg')
    }, function(err){
      var stat = fs.statSync(filepath('avatar_https.jpg'))
      done()
    })

  })
  
  test('interfaces with progress bar', function(done){
    var progressBar = {
      tick: sinon.spy()
    }
    function makeProgressBar(len){
      assert(len > 0)
      return progressBar
    }
    download({
      url: avatarUrl('https'),
      file: filepath('avatar_https.jpg'),
      progressBar: makeProgressBar
    }, function(err){
      var stat = fs.statSync(filepath('avatar_https.jpg'))
      assert(progressBar.tick.called)
      done()
    })    
  })

  setup(function(done){
    exec('rm -f downloads/* && mkdir -p downloads/', function(){ done() })
  })

})

function filepath(file){
  return 'downloads/' + file
}

function avatarUrl(protocol){
  return protocol + '://si0.twimg.com/profile_images/52579241/avatar_normal.jpg'
}