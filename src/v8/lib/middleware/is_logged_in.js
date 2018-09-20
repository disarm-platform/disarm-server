async function is_logged_in (req, res, next) {
  const api_key = req.get('API-Key')

  const found = await req.db.collection('sessions').findOne({ api_key })

  if (found) {
    next()
  } else {
    res.status(401).send({error: 'Not logged in'})
  }
}

module.exports = {
  is_logged_in
}