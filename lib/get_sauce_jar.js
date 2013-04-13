var download = require('./download')
var fs = require('fs')
var unzip = require('unzip')
var JAR_URL = 'http://saucelabs.com/downloads/Sauce-Connect-latest.zip'
var ProgressBar = require('progress')

module.exports = getSauceJar
function getSauceJar(destDir, callback){
  var zipFilePath = destDir + '/__sauce__.zip'
  console.log()
  download({
    url: JAR_URL,
    file: zipFilePath,
    progressBar: makeBar
  }, function(err){
    console.log()
    console.log('Extracting jar file')
    extractJarFile(zipFilePath, destDir, function(err){
      fs.unlink(zipFilePath, function(err){
        console.log('Done')
        callback()
      })
    })
  })
}

function makeBar(len){
  return new ProgressBar(
    'Downloading Sauce-Connect-latest.zip [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: len
    }
  )
}

function extractJarFile(zipFilePath, destDir, callback){
  fs.createReadStream(zipFilePath)
    .pipe(unzip.Parse())
    .on('entry', function(entry){
      if (entry.path.match(/\.jar$/)){
        var jarStream = fs.createWriteStream(destDir + '/sauce.jar')
        entry.pipe(jarStream)
        jarStream.on('finish', function(){
          callback()
        })
      }else{
        entry.autodrain()
      }
    })
}