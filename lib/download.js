var http = require('http')
var https = require('https')
var fs = require('fs')

module.exports = download
function download(options, callback){
  var url = options.url
  var file = options.file
  var progressBar = options.progressBar
  var protocol = (url.substring(0, 5) === 'https' ? https : http)
  var req = protocol.get(url, function(resp){
    resp.pipe(fs.createWriteStream(file))
    resp.on('end', function(){
      callback()
    })

    setupProgressBar(progressBar, resp)
  })
}

function setupProgressBar(makeBar, resp){
  if (!makeBar) return
  var len = parseInt(resp.headers['content-length'], 10)
  var bar = makeBar(len)
  resp.on('data', function(chunk){
    bar.tick(chunk.length)
  })
}