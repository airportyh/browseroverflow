var assert = require('chai').assert

var browserstack = require('../lib/browserstack')
var sinon = require('sinon')
var credentials = require(__dirname + '/browserstack.credentials.json')
var extend = require('../lib/extend')
var path = require('path')
var profileDir = path.join(__dirname, 'profile')
var BodyDouble = require('bodydouble')
var Process = require('did_it_work')

suite('browserstack', function(){

  teardown(function(){
    BodyDouble.restoreStubs()
  })

  suite('client apis', function(){

    var bs

    setup(function(){
      bs = browserstack(credentials)
    })

    test('launch', function(done){
      bs.launch({
        browser: 'firefox',
        browser_version: '14.0',
        os: 'OS X',
        os_version: 'Mountain Lion',
        url: 'http://google.com'
      }, function(err, worker){
        assert.typeOf(worker.id, 'number')
        assert.isNull(err)
        done()
      })
    })

    test('launch with underspecified settings', function(done){
      bs.launch({
        browser: 'firefox',
        url: 'http://google.com'
      }, function(err, worker){
        assert.typeOf(worker.id, 'number')
        assert.isNull(err)
        done()
      })
    })

    test('sets timeout', function(){
      var bs = browserstack()
      var fakeClient = {
        createWorker: sinon.spy()
      }
      bs.client = fakeClient
      bs.launch({
        browser: 'firefox',
        browser_version: '14.0',
        os: 'OS X',
        os_version: 'Mountain Lion',
        url: 'http://google.com',
        timeout: 40
      }, function(){})
      var timeout = fakeClient.createWorker.args[0][0].timeout
      assert.equal(timeout, 40)
    })

    test('kill a job', function(done){
      bs.launch({
        browser: 'firefox',
        browser_version: '14.0',
        os: 'OS X',
        os_version: 'Mountain Lion',
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
        assert('browser_version' in browser)
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

    test('status', function(done){
      bs.status(function(err, status){
        assert(status != null)
        done()
      })
    })

    teardown(function(done){
      bs.killAllJobs(function(){ done() })
    })

  })

  suite('self configure', function(){

    test('reads config from profile dir', function(done){
      var orgConfig = {
        profileDir: profileDir
      }
      var bs = browserstack(orgConfig)
      bs.configure(function(config){
        var expected = extend(require(path.join(profileDir, 'browserstack.json')), orgConfig)
        assert.equal(config.username, 'johnsmith')
        assert.equal(config.apiKey, '53cEoaN1o339oA')
        assert.equal(config.password, '53cEoaN1o339oA')
        assert.equal(config.profileDir, profileDir)
        assert.equal(bs.config, config)
        done()
      })
    })

    test('defaults profileDir to .browserstack in your home dir', function(){
      var bs = browserstack()
      var homeDir = process.env.HOME || process.env.USERPROFILE
      assert.equal(bs.config.profileDir, path.join(homeDir, '.browserstack'))
    })

  })

  suite('tunneling', function(){

    var bs

    beforeEach(function(){
      bs = browserstack({
        profileDir: profileDir
      })
    })

    test('tunnel success', function(done){
      var tunnel = bs.tunnel('localhost:7357', function(err){
        assert.isNull(err)

        tunnel.stop(function(err) {
          assert.isUndefined(err)
          done()
        })
      })
    })

    test('tunnel start timeout', function(done){
      // using an absurd timeout value
      var startTimeout = 10
      bs.config.timeout = startTimeout

      bs.tunnel('localhost:7357', function(err){
        assert.instanceOf(err, Error, 'Failed to start tunnel in ' + startTimeout + 'ms')
        done()
      })
    })
  })

})
