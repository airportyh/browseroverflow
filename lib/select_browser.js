module.exports = selectBrowser

function selectBrowser(browsers, spec){
  spec = parseSpec(spec)
  browsers = sort(browsers)
  return browsers.filter(function(browser){
    return match(browser, spec)
  })[0]
}

function parseSpec(spec){
  var parts = spec.split(':')
  return {
    name: parts[0],
    version: parseInt(parts[1], 10)
  }
}

function version(browser){
  return browser.browser_version
}

function match(browser, spec){
  return nameMatch(browser, spec) && versionMatch(browser, spec)
}

function nameMatch(browser, spec){
  return browser.browser === spec.name || browser.device === spec.name
}

function versionMatch(browser, spec){
  return !spec.version || Number(version(browser)) === spec.version
}

function sort(browsers){
  return browsers.sort(function(one, other){
    var oneVersion = Number(version(one))
    var otherVersion = Number(version(other))
    if (oneVersion < otherVersion){
      return 1
    }else if (oneVersion > otherVersion){
      return -1
    }else{
      return 0
    }
  })
}