const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')

/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Authentication
 *
 * @apiParam {string} username The username for a user 
 * @apiParam {string} password The password for the user
 * @apiParamExample {json} Request-Example:
 *     {
 *       username: 'user_2',
 *       password: 'super-secret'
 *     }
 */

module.exports = async function login(req, res) {
  const {username, password} = req.body

  // We should always return the same error when dealing with credentials
  const error = {message: 'Invalid credentials'}

  if (!username || !password) {
    return res.status(401).send(error)
  }

  const user = await req.db.collection('users').findOne({username})

  const valid_password = await bcrypt.compare(password, user.encrypted_password)

  if (!valid_password) {
    return res.status(401).send(error)
  }

  const api_key = uuid()

  await req.db.collection('sessions').insertOne({
    user_id: user._id,
    api_key
  })

  delete user.encrypted_password

  user.key = api_key

  res.send(user)

  // The old response
  // res.status(200).send({
  //   _id: user._id,
  //   name: user.name,
  //   username: user.username,
  //   key: user.key,
  //   instance_slug: user.instance_slug,
  //   permissions: user.permissions,
  //   allowed_apps: user.allowed_apps,
  // })
}
