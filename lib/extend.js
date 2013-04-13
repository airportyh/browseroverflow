module.exports = extend
function extend(dst, src){
  for (var prop in src){
    dst[prop] = src[prop]
  }
  return dst
}