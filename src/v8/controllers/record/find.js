module.exports = function find(req, res) {
  const records = req.db.collection('records')

  const country = req.country
  const personalised_instance_id = req.personalised_instance_id

  records
    .find({ country, personalised_instance_id })
    .sort({ recorded_at: -1 })
    .toArray((err, docs) => {
      if (err) res.status(403).send(err)
      res.send(docs)
    })
}