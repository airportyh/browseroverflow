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

    test('tunnel success', function(done){
      function FakeProc(cmd, config){
        assert.deepEqual(config.successWhenMatches, /You can now access your local server/)
        assert.equal(cmd, 
          'java -jar jars/browserstack.jar ' + credentials.key + ' localhost,7357,0')
        return {
          cmd: cmd,
          config: config,
          start: function(){
            config.success()
          }
        }
      }

      bs = browserstack(extend(credentials, {
        jarpath: 'jars/browserstack.jar',
        SimpleProcess: FakeProc
      }))

      bs.tunnel('localhost', 7357, function(err){
        assert.isNull(err)
        done()
      })
    })

    test('tunnel fatal error', function(done){
      function FakeProc(cmd, config){
        return {
          start: function(){
            config.fail('jar not found')
          }
        }
      }

      bs = browserstack(extend(credentials, {
        jarpath: 'jars/browserstack.jar',
        SimpleProcess: FakeProc
      }))

      bs.tunnel('localhost', 7357, function(err){
        assert.equal(err, 'jar not found')
        done()
      })
    })

    test('tunnel subtle error', function(done){
      function FakeProc(cmd, config){
        return {
          start: function(){
            config.stdout('blah blah\n**Error: blah blah blah\nblah blah\n')
          }
        }
      }

      bs = browserstack(extend(credentials, {
        jarpath: 'jars/browserstack.jar',
        SimpleProcess: FakeProc
      }))

      bs.tunnel('localhost', 7357, function(err){
        assert.equal(err, 'blah blah blah')
        done()
      })
    })

  })

  teardown(function(done){
    bs.killAllJobs(function(){ done() })
  })

})

