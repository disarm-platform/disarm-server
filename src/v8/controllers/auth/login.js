// const User = require('../../lib/auth')
const bcrypt = require('bcrypt')

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

  // TODO: Create session and api_key, send with user

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
