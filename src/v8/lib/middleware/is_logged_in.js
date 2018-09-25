const ObjectID = require('mongodb').ObjectID

async function is_logged_in (req, res, next) {
  const api_key = req.get('API-Key')

  const found = await req.db.collection('sessions').findOne({ api_key })

  if (found) {
    req.user = await req.db.collection('users').findOne({ _id: ObjectID(found.user_id)})
    next()
  } else {
    res.status(401).send({error: 'Not logged in'})
  }
}

module.exports = {
  is_logged_in
}