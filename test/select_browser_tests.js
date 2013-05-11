var selectBrowser = require('../lib/select_browser')
var assert = require('chai').assert

suite('BrowserSelector', function(){

  test('selects the matching browser:browser_version', function(){
    var browsers = [
      {browser_version: '27.0', browser: 'firefox'},
      {browser_version: '24.0', browser: 'firefox'},
      {browser_version: '8.0', browser: 'ie'}
    ]
    var spec = 'firefox:24.0'
    assert.deepEqual(selectBrowser(browsers, spec), 
      {browser_version: '24.0', browser: 'firefox'}) 
  })

  test('dont even have to write decimal', function(){
    var browsers = [
      {browser_version: '24.0', browser: 'firefox'},
      {browser_version: '27.0', browser: 'firefox'},
      {browser_version: '8.0', browser: 'ie'}
    ]
    var spec = 'firefox:24'
    assert.deepEqual(selectBrowser(browsers, spec), 
      {browser_version: '24.0', browser: 'firefox'}) 
  })

  test('no browser_versions provided means pick the latest', function(){
    var browsers = [
      {browser_version: '24.0', browser: 'firefox'},
      {browser_version: '27.0', browser: 'firefox'},
      {browser_version: '8.0', browser: 'firefox'},
      {browser_version: '8.0', browser: 'ie'}
    ]
    var spec = 'firefox'
    assert.deepEqual(selectBrowser(browsers, spec), 
      {browser_version: '27.0', browser: 'firefox'}) 
  })

  test('it also matches devices', function(){
    var devices = [
      {browser_version: '24.0', device: 'iPhone 5'}
    ]
    var spec = 'iPhone 5'
    assert.deepEqual(selectBrowser(devices, spec),
      {browser_version: '24.0', device: 'iPhone 5'})
  })

})