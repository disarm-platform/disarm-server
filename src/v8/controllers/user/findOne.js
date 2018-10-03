const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

module.exports = async function findOne(req, res) {
  const user_id = req.params.user_id
  const found_user = await req.db.collection('users').findOne({_id: ObjectID(user_id)})
  if (!found_user) {
    return res.status(400).send()
  }


  const user_permissions = await req.db.collection('permissions').find({ user_id: found_user._id }).toArray()
  const user_instances = user_permissions.map(p => p.instance_id)

  let allowed_to_edit_user = false
  for (const instance_id of user_instances) {
    const allowed = await can(req.user._id, instance_id)
    if (allowed) {
      allowed_to_edit_user = true
    }
  }

  if (!allowed_to_edit_user) {
    return res.status(401).send()
  }


  res.send(found_user)
}