const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')
const {permissions } = require('../../lib/permissions')
/**
 * @api {post} /permission Create permission for user
 * @apiName Create permission for user
 * @apiGroup Permission
 *
 * @apiParam {string} user_id The id of the user 
 * @apiParamExample {json} Request-Example:
 *     {
 *       user_id: "<mongo_id>"",
 *       instance_id: "<mongo_id>"",
 *       value: "read:irs_monitor"
 *     }
 */

module.exports = async function create(req, res) {

  const instance_id = req.body.instance_id
  const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send()
  }

  const user_id = req.body.user_id
  const user = await req.db.collection('users').findOne({ _id: ObjectID(user_id) })
  if (!user) {
    return res.status(400).send()
  }

  // if not valid permission
  const incoming_permission_string = req.body.value
  const permission_strings = permissions.map(p => p.value)
  if (!permission_strings.includes(incoming_permission_string)) {
    return res.status(400).send()
  }
  

  // if not admin reject
  const allowed = await can(req.user._id, instance_id)
  if (!allowed) {
    return res.status(401).send()
  }

  const is_super_admin = await can(req.user._id)
  if (incoming_permission_string === 'admin' && !is_super_admin) {
    return res.status(401).send()
  }

  const {insertedId: permission_id} = await req.db.collection('permissions').insertOne({
    instance_id: ObjectID(instance_id),
    user_id: ObjectID(user_id),
    value: incoming_permission_string
  })

  const inserted_permission = await req.db.collection('permissions').findOne({_id: permission_id})

  res.send(inserted_permission)
}

