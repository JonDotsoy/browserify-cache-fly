const through = require('through2')
const fs = require('fs')
const log = require('debug')('BrowserifyCacheFly')

const WITHCHANGES = 'WITH CHANGES'
const NOCHANGES = 'NO CHANGES'

function skipTheTransform () {
  return through(function (buffer, encode, next) {
    this.push(buffer)

    next()
  })
}

const mapFiles = new Map()

function CacheFlyGenerator (optsArg, ..._transforms) {
  const transforms = _transforms.map(e => [].concat(e))

  function startCacheFlyTransform (filePath, opts = {}) {
    const {mtime} = fs.statSync(filePath)

    const hash = mtime.toJSON()

    log('check file ' + filePath)

    if (mapFiles.has(filePath)) {
      log(`Load map file "${filePath}"`)
      const stateFile = mapFiles.get(filePath)

      if (hash === stateFile.hash) {
        log(`File no changes`)

        mapFiles.set(filePath, Object.assign(stateFile, {
          state: NOCHANGES
        }))
      } else {
        log(`File with changes`)

        mapFiles.set(filePath, Object.assign(stateFile, {
          hash,
          state: WITHCHANGES
        }))
      }
    } else {
      log(`new map file "${filePath}"`)

      mapFiles.set(filePath, {
        hash,
        state: WITHCHANGES
      })
    }

    return skipTheTransform()
  }

  function finishCacheFlyTransform (filePath, opts = {}) {

    if (mapFiles.has(filePath)) {
      const stateFile = mapFiles.get(filePath)

      if (stateFile.state === NOCHANGES) {
        log(`Load file from cache "${filePath}"`)

        return through(function (buffer, encode, next) {
          this.push(stateFile.buffer)

          next()
        })
      } else {
        return through(function (buffer, encode, next) {
          log(`Update chache file "${filePath}"`)
          mapFiles.set(filePath, Object.assign(stateFile, {
            buffer
          }))

          this.push(buffer)

          next()
        })
      }
    } else {
      return skipTheTransform()
    }
  }

  function wrapperToTransform (transform) {
    return function (filePath, opts) {
      if (mapFiles.has(filePath)) {
        const stateFile = mapFiles.get(filePath)

        if (stateFile.state === NOCHANGES) {
          log(`No changes "${filePath}"`)
          return skipTheTransform()
        } else {
          console.log('File update: ' + filePath)

          return transform(filePath, opts)
        }
      } else {
        return transform(filePath, opts)
      }
    }
  }

  return [
    [startCacheFlyTransform],
    ...(transforms.map(([transform, optsTransform]) => ([wrapperToTransform(transform), optsTransform]))),
    [finishCacheFlyTransform]
  ]
}

exports = module.exports = CacheFlyGenerator
