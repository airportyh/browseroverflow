var assert = require('chai').assert

var browserstack = require('../lib/browserstack')
var sinon = require('sinon')
var credentials = require(__dirname + '/browserstack.credentials.json')
var extend = require('../lib/extend')
var path = require('path')
var profileDir = path.join(__dirname, 'profile')

suite('browserstack', function(){

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

    test('sets timeout', function(){
      var bs = browserstack()
      var fakeClient = {
        createWorker: sinon.spy()
      }
      bs.client = fakeClient
      bs.launch({
        browser: 'firefox',
        version: '20.0',
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
        assert.equal(config.privateKey, '38etonOu04Abet')
        assert.equal(config.apiKey, '53cEoaN1o339oA')
        assert.equal(config.profileDir, profileDir)
        assert.equal(bs.config, config)
        assert.equal(bs.config.password, 's\u000bq%kw!\u0006')
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

      var bs = browserstack({
        profileDir: profileDir
      })

      bs.Process = FakeProc

      bs.tunnel('localhost:7357', function(err){
        assert.isNull(err)
        assert.equal(proc.exe, 'java')
        assert.deepEqual(proc.args, 
          ['-jar', path.join(profileDir, 'browserstack.jar'),
          '53cEoaN1o339oA', 'localhost,7357,0'])
        assert.deepEqual(proc.opts.goodIfMatches[0], /You can now access your local server/)
        assert.deepEqual(proc.opts.badIfMatches[0], /^\*\*Error: (.*)$/)
        done()
      })

      setTimeout(function(){
        proc.opts.good[0]()
      }, 20) // long enough for it to ready the config file
    })

    test('tunnel fatal error', function(done){

      var bs = browserstack({
        profileDir: profileDir
      })

      bs.Process = FakeProc

      bs.tunnel('localhost:7357', function(err){
        assert.equal(err, 'jar not found')
        done()
      })

      setTimeout(function(){
        proc.opts.bad[0]('jar not found')
      }, 20)
    })

    test('tunnel can optionally specify key', function(done){
      var bs = browserstack({
        profileDir: profileDir
      })

      bs.Process = FakeProc

      bs.tunnel({
        hostAndPort: 'localhost:7357', 
        key: 'mykey'
      }, function(err){
        assert.equal(proc.args[2], 'mykey')
        done()
      })

      setTimeout(function(){
        proc.opts.good[0]()
      }, 20)
    })

    test('uses private key if specifiy private', function(done){
            var bs = browserstack({
        profileDir: profileDir
      })

      bs.Process = FakeProc

      bs.tunnel({
        hostAndPort: 'localhost:7357', 
        usePrivateKey: true
      }, function(err){
        assert.equal(proc.args[2], '38etonOu04Abet')
        done()
      })

      setTimeout(function(){
        proc.opts.good[0]()
      }, 20)

    })

  })

})

