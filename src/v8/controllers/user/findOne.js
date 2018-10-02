const ObjectID = require('mongodb').ObjectID

module.exports = async function findOne(req, res) {
  const user_id = req.params.user_id
  const found_user = await req.db.collection('users').findOne({_id: ObjectID(user_id)})
  if (!found_user) {
    return res.status(400).send()
  }

  const incoming_user_permissions = await req.db.collection('permissions').find({}).toArray()

  const logged_in_user_permissions = await req.db.collection('permissions').find({}).toArray()

  // TODO: Do some sort of overlap checking, should probably find different approach

  res.send()
}