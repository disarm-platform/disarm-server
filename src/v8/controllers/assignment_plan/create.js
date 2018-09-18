const { decorate_incoming_document } = require('../../lib/decorate_incoming_document')


module.exports = function create(req, res) {
  const assignment_plan = req.db.collection('assignment_plan')
  let incoming_assignment_plan = decorate_incoming_document({ doc: req.body, req })

  assignment_plan
    .insertOne(incoming_assignment_plan)
    .then(result => {
      const first = result.ops[0]
      console.log('id', first._id)
      res.send(result.ops)
    })
    .catch(err => res.status(403).send(err))
}