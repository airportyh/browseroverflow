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
      version: parseVersion(parts[1])
    }
  }else{
    return {
      name: spec.name,
      version: parseFloat(spec.version),
      os: spec.os,
      os_version: spec.os_version ? parseVersion(spec.os_version) : undefined
    }
  }
}

function parseVersion(version){
  var result = parseFloat(version)
  if (!isNaN(result)){
    return result
  }
  return version
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
  return !spec.os || browser.os.toLowerCase() === spec.os.toLowerCase()
}

function osVersionMatch(browser, spec){
  if (!spec.os_version){
    return true
  }

  if (typeof spec.os_version === "string"){
    return browser.os_version.toLowerCase() === spec.os_version.toLowerCase()
  }else{
    return Number(browser.os_version) === spec.os_version
  }
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