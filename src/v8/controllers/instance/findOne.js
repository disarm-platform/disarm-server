const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
/**
 * @api {get} /instance/:instance_id Get instance
 * @apiName Get Instance
 * @apiGroup Instance
 *
 * @apiParam {string} id The name of the instance
 */

module.exports = async function findOne(req, res) {
  const instance_id = req.params.instance_id

  const users_permissions_for_instances = await req.db.collection('permissions').find({
    user_id: ObjectID(req.user._id)
  }).toArray()

  const instance_id_strings = users_permissions_for_instances.map(permission => permission.instance_id.toString())

  const allowed = instance_id_strings.includes(instance_id)
  if (!allowed) {
    return res.status(401).send({ error: 'Not authorized'})
  }

  try {
    const instance = await req.db.collection('instances').findOne({ _id: ObjectID(instance_id) })
    res.send(instance)
  } catch (e) {
    res.status(500).send(e)
  }
}