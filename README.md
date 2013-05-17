BrowserOverflow
===============

An all-in-one library for launching BrowserStack browsers.

Install
-------

    npm install browseroverflow

This library has a companion command line utility: [browserstack-cli](https://github.com/airportyh/browserstack-cli). Install `browserstack-cli` globally and run

    browserstack setup

which will walk you through setting up your credentials and api keys for BrowserStack and download the jar required for tunneling. Once this is done, browseroverflow is ready to use.

API Walkthrough
---------------

Require it and create an instance

    var BrowserStack = require('browseroverflow');
    var bs = BrowserStack();

Get the list of available browsers on BrowserStack.

    bs.browsers(function(err, browsers){
      if (!err){
        console.log('These are all the browsers', browsers);
      }
    });

Launch a browser

    bs.launch({
      browser: 'firefox', 
      browser_version: '14.0', 
      os: 'OS X',
      os_version: 'Mountain Lion',
      url: 'http://test.com'
    }, function(err, job){
      if (!err){
        console.log('Created job ' + job.id);
      }
    });

If you don't care about the OS and all that, you can omit most of them. The only settings that are required are `browser`, and `url`

    bs.launch({
      browser: 'firefox', 
      url: 'http://test.com'
    }, function(err, job){
      if (!err){
        console.log('Created job ' + job.id);
      }
    });

List all launched browsers

    bs.jobs(function(err, jobs){
      if (!err){
        console.log('These are all the active jobs', jobs);
      }
    });

Kill a launched browser

    bs.kill(aJobId, function(err, info){
      if (!err){
        console.log('Kill job ' + aJobId + ' which ran for ' + info.time);
      }
    });

Kill all launched browsers

    bs.killAll(function(err){
      if (!err){
        console.log('Killed all the jobs');
      }
    });

Get the current API status

    bs.status(function(err, status){
      if (!err){
        console.log('The status is: ', status);
      }
    });

Setup a tunnel

    bs.tunnel('localhost:7357', function(err){
      if (!err){
        console.log('Tunnel is running!');
      }
    });

Contributors
------------

* [Toby Ho](http://github.com/airportyh)

License
-------

(The MIT License)

Copyright (c) 2013 Toby Ho &lt;airportyh@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
