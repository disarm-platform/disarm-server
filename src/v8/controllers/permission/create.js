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
  const permission = req.body.value
  const permission_strings = permissions.map(p => p.value)
  if (!permission_strings.includes(permission)) {
    return res.status(400).send()
  }
  

  // if not admin reject
  const allowed = await can(req.user._id, instance_id)
  if (!allowed) {
    return res.status(401).send()
  }

  const is_super_admin = await can(req.user._id)
  if (permission === 'admin' && !is_super_admin) {
    return res.status(401).send()
  }
  
  res.send()
}

