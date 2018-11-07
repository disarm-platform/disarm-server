const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')
/**
 * @api {get} /user Get users
 * @apiName Get users
 * @apiGroup User
 *
 * @apiParam {string} instance_id The id for the instance
 */

module.exports = async function find(req, res) {
  const instance_id = req.query['instance_id']

  if (!instance_id) {
    return res.status(400).send({error: "instance_id is required"})
  }

  const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send({ error: "invalid instance_id" })
  }
  
  //  Check if user is admin or super-admin
  const allowed = await can(req.user._id, instance_id)
  if (!allowed) {
    return res.status(401).send()
  }



  
  // Might have to first find permissions, if we go with new approach suggested
  const users = await req.db.collection('users').find({}).toArray()

  res.send(users)
}