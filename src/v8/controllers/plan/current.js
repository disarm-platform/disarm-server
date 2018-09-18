const { find_latest_plan } = require('../../lib/plan_helper')

module.exports = function current(req, res) {
  find_latest_plan(req)
    .then(docs => {
      let doc = docs
      if (typeof doc === 'undefined') {
        res.send({})
      } else {
        res.send(doc)
      }
    })
    .catch(err => {
      console.log('[get_current]', err)
      if (err) res.status(403).send(err)
    })
}