const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

/**
 * @api {delete} /permission/:permission_id Remove permissions for a user
 * @apiName Remove permissions for a user
 * @apiGroup Permission
 *
 * @apiParam {string} permission_id The id of the permission 
 */

module.exports = async function remove(req, res) {
  const permission_id = req.params.permission_id

  const permission = await req.db.collection('permissions').findOne({_id: ObjectID(permission_id)})
  if (!permission) {
    return res.status(400).send()
  }

  const is_admin = await can(req.user._id, permission.instance_id)
  if (!is_admin) {
    return res.status(401).send()
  }

  const is_admin_permission = permission.value === 'admin'
  const user_is_deployment_admin = await can(req.user._id)
  if (!user_is_deployment_admin && is_admin_permission) {
    return res.status(401).send()
  }

  await req.db.collection('permissions').remove({_id: ObjectID(permission_id)})

  res.send()
}

