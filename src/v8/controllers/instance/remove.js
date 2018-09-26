const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

/**
 * @api {delete} /instance/:instance_id Remove instance
 * @apiName Remove Instance
 * @apiGroup Instance
 *
 * @apiParam {string} instance_id The id of the instance
 */

module.exports = async function remove(req, res) {
  const allowed = await can(req.user._id) // is super-admin?
  if (!allowed) {
    return res.status(401).send({ error: 'Not authorized'})
  }

  await req.db.collection('instances').remove({
    _id: ObjectID(req.params.instance_id)
  })

  res.send({status: 'success'})
}