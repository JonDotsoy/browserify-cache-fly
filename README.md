# browserify-cache-fly 📝✈️

A plugin to [Browserify][browserify] to Ignore the files when they have not been modified.

## How to Install

    npm install --save-dev browserify-cache-fly

## How to Use

```javascript
const cacheFly = require('browserify-cache-fly')

const bundler = browserify({
  transform: cacheFly(null, babelify)
})
bundler.add('./app.js')
// ...
```

### [Docs](./docs)
- [API](./docs/API.md)

[browserify]: https://github.com/substack/node-browserify "browser-side require() the node way"
