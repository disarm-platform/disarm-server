const as_table = require('as-table')
const endpoints = require('./src/v8/routes')

const endpoints_with_fn_names = endpoints.map(e => {
  return {
    method: e.method,
    path: e.path,
    callback: e.callback.name,
  }
})

console.log(as_table(endpoints_with_fn_names))