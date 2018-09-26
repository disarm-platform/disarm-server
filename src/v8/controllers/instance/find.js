const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')
/**
 * @api {get} /instance Get instances
 * @apiName Get Instances
 * @apiGroup Instance
 *
 */

module.exports = async function find(req, res) {
  const is_super_admin = await can(req.user._id)

  const users_permissions_for_instances = await req.db.collection('permissions').find({
    user_id: ObjectID(req.user._id),
    value: {$in: ['basic', 'admin']} // only admin and basic permissions have instance_id attached
  }).toArray()

  const instance_ids_user_has_access_to = users_permissions_for_instances.map(permission => permission.instance_id)

  const query = {}
  
  // if the user is a super admin we want to return all the instances, if not we limit the instances
  if (!is_super_admin) {
    query._id = { $in: instance_ids_user_has_access_to } 
  }

  const instances = await req.db.collection('instances').find(query).toArray()
  res.send(instances)
}