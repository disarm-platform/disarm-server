exports.sanitize_users = (users) => {
  if (!Array.isArray(users)) {
    delete users.encrypted_password
    return users
  }

  return users.map(user => {
    delete  user.encrypted_password
    return user
  })

}