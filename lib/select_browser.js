module.exports = selectBrowser

function selectBrowser(browsers, spec){
  spec = parseSpec(spec)
  browsers = sort(browsers)
  return browsers.filter(function(browser){
    return match(browser, spec)
  })[0]
}

function parseSpec(spec){
  if (typeof spec === 'string'){
    var parts = spec.split(':')
    return {
      name: parts[0],
      version: parseInt(parts[1], 10)
    }
  }else{
    return {
      name: spec.name,
      version: parseInt(spec.version, 10),
      os: spec.os,
      os_version: spec.os_version ? parseInt(spec.os_version, 10) : undefined
    }
  }
}

function version(browser){
  return browser.browser_version
}

function match(browser, spec){
  return nameMatch(browser, spec) && versionMatch(browser, spec) &&
    osNameMatch(browser, spec) && osVersionMatch(browser, spec)
}

function nameMatch(browser, spec){
  return browser.browser === spec.name || browser.device === spec.name
}

function versionMatch(browser, spec){
  return !spec.version || Number(version(browser)) === spec.version
}

function osNameMatch(browser, spec){
  return !spec.os || browser.os === spec.os
}

function osVersionMatch(browser, spec){
  return !spec.os_version || browser.os_version === spec.os_version
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