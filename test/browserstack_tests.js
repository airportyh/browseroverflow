var assert = require('chai').assert

var browserstack = require('../lib/browserstack')
var credentials = require(__dirname + '/browserstack.credentials.json')
var extend = require('../lib/extend')
var sinon = require('sinon')


suite('browserstack', function(){

  var bs

  setup(function(){
    bs = browserstack(credentials)
  })

  test('launch', function(done){
    bs.launch({
      browser: 'firefox', 
      version: '14.0', 
      url: 'http://google.com'
    }, function(err, worker){
      assert.typeOf(worker.id, 'number')
      assert.isNull(err)
      done()
    })
  })

  test('kill a job', function(done){
    bs.launch({
      browser: 'firefox', 
      version: '14.0', 
      url: 'http://google.com'
    }, function(err, worker){
      bs.kill(worker.id, function(err){
        assert.isNull(err)
        bs.jobs(function(err, jobs){
          var jobIds = jobs.map(function(job){
            return job.id
          })
          assert(jobIds.indexOf(worker.id) === -1)
          done()
        })
      })
    })
  })

  test('list browsers', function(done){
    bs.browsers(function(err, browsers){
      var browser = browsers[0]
      assert('version' in browser)
      assert('os' in browser)
      done()
    })
  })

  test('list jobs', function(done){
    bs.jobs(function(err, jobs){
      assert.typeOf(jobs.length, 'number')
      done()
    })
  })

  test('kill all jobs', function(done){
    bs.killAllJobs(function(err, jobs){
      bs.jobs(function(err, jobs){
        assert.equal(jobs.length, 0)
        done()
      })
    })
  })

  suite('tunneling', function(){

    var proc
    function FakeProc(exe, args){
      proc = {}
      proc.exe = exe
      proc.args = args
      proc.opts = {}
      var methods = 'good bad complete goodIfMatches badIfMatches'.split(' ')
      methods.forEach(function(method){
        proc[method] = function(){
          proc.opts[method] = arguments
          return proc
        }
      })
      return proc
    }

    test('tunnel success', function(done){

      bs = browserstack(extend(credentials, {
        jarpath: 'jars/browserstack.jar',
        process: FakeProc
      }))

      bs.tunnel('localhost', 7357, function(err){
        assert.isNull(err)
        assert.equal(proc.exe, 'java')
        assert.deepEqual(proc.args, 
          ['-jar', 'jars/browserstack.jar',
          '9ywjxxgvS8JVyIv4vwQY', 'localhost,7357,0'])
        assert.deepEqual(proc.opts.goodIfMatches[0], /You can now access your local server/)
        assert.deepEqual(proc.opts.badIfMatches[0], /^\*\*Error: (.*)$/)
        done()
      })

      process.nextTick(function(){
        proc.opts.good[0]()
      })
    })

    test('tunnel fatal error', function(done){

      bs = browserstack(extend(credentials, {
        jarpath: 'jars/browserstack.jar',
        process: FakeProc
      }))

      bs.tunnel('localhost', 7357, function(err){
        assert.equal(err, 'jar not found')
        done()
      })

      process.nextTick(function(){
        proc.opts.bad[0]('jar not found')
      })
    })

  })

  teardown(function(done){
    bs.killAllJobs(function(){ done() })
  })

})

