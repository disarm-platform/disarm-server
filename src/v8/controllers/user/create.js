const ObjectID = require('mongodb').ObjectID
const bcrypt = require('bcrypt')

/**
 * @api {post} /user Create user
 * @apiName Create User
 * @apiGroup User
 *
 * @apiParam {string} username The username for the user
 * @apiParam {string} password The password for the user
 * @apiParam {string} instance_id The id for the instance, the user will be given access to
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "nd",
 *       "password": "m",
 *       "instance_id": "<mongo_id>",
 *     }
 */

module.exports = async function create(req, res) {
  const {username, password, instance_id} = req.body

  // TODO: Check if user is logged in and is allowed to create users, so is super-admin or admin for instance_id


  if (!username) {
    return res.status(400).send({error: "username is required"})
  }

  if (!password) {
    return res.status(400).send({ error: "password is required" })
  }

  if (!instance_id) {
    return res.status(400).send({ error: "instance_id is required" })
  }

  const instance = await req.db.collection('instances').findOne({ _id: ObjectID(instance_id)})

  if (!instance) {
    return res.status(400).send({ error: "Instance with instance_id could not be found" })
  }


  // TODO: Ensure no user exists with username

  const encrypted_password = await bcrypt.hash(password, 10)

  const { insertedId } = await req.db.collection('users').insertOne({
    username,
    encrypted_password,
  })

  // create permission for user
  await req.db.collection('permissions').insertOne({
    user_id: insertedId,
    instance_id: instance._id,
    value: 'basic'
  })

  const user = await req.db.collection('users').findOne({ _id: insertedId})
  res.send(user)
}