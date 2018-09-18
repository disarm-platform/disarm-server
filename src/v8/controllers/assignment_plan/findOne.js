module.exports = function read(req, res) {
  const assignment_plan = req.db.collection('assignment_plan')
  const country = req.country
  const personalised_instance_id = req.personalised_instance_id

  assignment_plan
    .find({ country, personalised_instance_id })
    .sort({ updated_at: -1 })
    .limit(1)
    .toArray()
    .then(docs => {
      let doc = docs[0]
      if (typeof doc === 'undefined') {
        res.send({})
      } else {
        res.send(doc)
      }
    })
    .catch(err => {
      res.status(403).send(err)
    })
}