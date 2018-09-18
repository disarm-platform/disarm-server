const get = require('lodash').get
const ObjectID = require('mongodb').ObjectID

module.exports = function get_updates(req, res) {
  const records = req.db.collection('records')

  const country = req.country
  const personalised_instance_id = req.personalised_instance_id
  const last_id = req.body.last_id
  const limit = get(req, 'body.limit', 1000)

  let query
  if (last_id) {
    query = { country, personalised_instance_id, _id: { $gt: new ObjectID(last_id) } }
  } else {
    query = { country, personalised_instance_id }
  }

  records
    .find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .toArray((err, docs) => {
      if (err) res.status(403).send(err)
      res.send(docs)
    })
}