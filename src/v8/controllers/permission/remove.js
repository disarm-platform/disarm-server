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

  const {user_id, instance_id, value} = req.body

  const is_admin = await can(req.user._id, instance_id)
  if (!is_admin) {
    return res.status(401).send()
  }

  const is_admin_permission = value === 'admin'
  const user_is_deployment_admin = await can(req.user._id)
  if (!user_is_deployment_admin && is_admin_permission) {
    return res.status(401).send()
  }

  console.log(user_id,instance_id,value)



  await req.db.collection('permissions').deleteMany({
      user_id:ObjectID(user_id),
      instance_id:ObjectID(instance_id),
      value})

  res.send()
}

