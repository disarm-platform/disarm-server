exports.sanitize_users = (users) => {
  if (!Array.isArray(users)) return sanitize_one(users)
  return users.map(user => sanitize_one(user))
}

function sanitize_one(user) {
  delete user.encrypted_password
  delete user.password
  return user
}