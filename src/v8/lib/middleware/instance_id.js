async function instance_id(req, res, next) {
  const instance_id = req.query.instance_id

  if (!instance_id) {
    return res.status(400).send({error: "instance_id is required as a query parameter"})
  }

  next()
}

module.exports = {
  instance_id
}