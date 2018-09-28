const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

/**
 * @api {get} /permission/:user_id/:instance_id Get permissions for a user
 * @apiName Get permissions for a user
 * @apiGroup Permission
 *
 * @apiParam {string} user_id The id of the user 
 * @apiParamExample {json} Request-Example:
 */

module.exports = async function find(req, res) {
  const user_id = req.params.user_id
  
  const user = await req.db.collection('users').findOne({_id: ObjectID(user_id)})
  if (!user) {
    return res.status(400).send()
  }

  // if the user is you, then return all your permissions here
  if (req.user._id.toString() === user_id) {
    const permissions = await req.db.collection('permissions').find({user_id: ObjectID(user_id)}).toArray()
    return res.send(permissions)
  }

  const instance_id = req.params.instance_id
  const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send()
  }

  const is_admin = await can(req.user._id, instance_id)
  if (!is_admin) {
    return res.status(401).send()
  }

  const permissions = await req.db.collection('permissions').find({ 
    user_id: ObjectID(user_id),
    instance_id: ObjectID(instance_id)
  }).toArray()
  
  return res.send(permissions)
}

