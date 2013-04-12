var download = require('./download')
var path = require('path')
var ProgressBar = require('progress')
var JAR_URL = 'http://www.browserstack.com/BrowserStackTunnel.jar'

module.exports = getBrowserStackJar
function getBrowserStackJar(destDir, callback){
  var jarFilePath = path.join(destDir, 'browserstack.jar')
  download({
    url: JAR_URL,
    file: jarFilePath,
    progressBar: makeBar
  }, function(){
    callback()
  })
}

function makeBar(len){
  return new ProgressBar(
    'Downloading BrowserStackTunnel.zip [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: len
    }
  )
}
