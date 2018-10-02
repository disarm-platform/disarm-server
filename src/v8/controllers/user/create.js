const ObjectID = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
const {can} = require('../../lib/helpers/can')

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

  if (!username) {
    return res.status(400).send({error: "username is required"})
  }

  if (!password) {
    return res.status(400).send({ error: "password is required" })
  }

  if (!instance_id) {
    return res.status(400).send({ error: "instance_id is required" })
  }

  const allowed = await can(req.user._id, instance_id)
  if (!allowed) {
    return res.status(401).send({ error: "Not authorised to create users" })
  }

  const instance = await req.db.collection('instances').findOne({ _id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send({ error: "Instance with instance_id could not be found" })
  }


  const user_with_same_user_name = await req.db.collection('users').findOne({username})
  if (user_with_same_user_name) {
    return res.status(400).send({error: 'User with username already exists.'})
  }

  const encrypted_password = await bcrypt.hash(password, 10)

  const { insertedId } = await req.db.collection('users').insertOne({
    username,
    encrypted_password,
  })

  const user = await req.db.collection('users').findOne({ _id: insertedId})
  res.send(user)
}