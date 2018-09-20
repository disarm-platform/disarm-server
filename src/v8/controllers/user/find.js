const ObjectID = require('mongodb').ObjectID

/**
 * @api {post} /user Create user
 * @apiName Create User
 * @apiGroup User
 *
 * @apiParam {string} instance_id The id for the instance
 */

module.exports = async function find(req, res) {
  const instance_id = req.query['instance_id']

  if (!instance_id) {
    return res.status(400).send({error: "instance_id is required"})
  }

  // TODO: Check if user is admin or super-admin
  
  // Might have to first find permissions, if we go with new approach suggested
  const users = await req.db.collection('users').find({})

  res.send(users)
}