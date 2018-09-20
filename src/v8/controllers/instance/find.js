const ObjectID = require('mongodb').ObjectID

module.exports = async function find(req, res) {
  // TODO: get the instances the user has access to, probably need to search for the correct permissions.

  const instance_ids_user_has_access_to = []

  try {
    const instances = await req.db.collection('instances').find({ _id: { $in: instance_ids_user_has_access_to} })
    res.send(instances)
  } catch (e) {
    res.status(500).send(e)
  }
}