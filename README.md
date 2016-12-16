# browsery-cache-fly 📝✈️

Observe if exists changes in the files, if exists it this is transform.

## How to Install

    npm install --save-dev git@github.com:JonDotsoy/browsery-cache-fly.git

## How to Use

```javascript
const cacheFly = require('browsery-cache-fly')

const bundler = browserify()
bundler.add('./app.js')

bundler.transform(cacheFly, {})
// ...
```

