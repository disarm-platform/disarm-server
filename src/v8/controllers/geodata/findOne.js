const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

/**
 * @api {get} /geodata/:level_id Create geodata level
 * @apiName Get Geodata Level
 * @apiGroup Geodata
 *
 * @apiParam {string} level_id The id of the level
 */


module.exports = async function findOne(req, res) {
  const level_id = req.params['level_id']
  
  const level = await req.db.collection('geodata').findOne({_id: ObjectID(level_id)})
  if (!level) {
    return res.status(400).send({ error: 'Invalid level_id' })
  }

  const users_permissions_for_instances = await req.db.collection('permissions').find({
    user_id: ObjectID(req.user._id)
  }).toArray()

  const instance_id_strings = users_permissions_for_instances.map(permission => permission.instance_id.toString())

  const allowed = instance_id_strings.includes(level.instance_id.toString())
  if (!allowed) {
    return res.status(401).send({ error: 'Not authorized' })
  }

  res.send(level)
}