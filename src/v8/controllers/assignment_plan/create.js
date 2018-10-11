const ObjectID = require('mongodb').ObjectID
const { can_any } = require('../../lib/helpers/can')
const { decorate_incoming_document } = require('../../lib/decorate_incoming_document')


module.exports = async function create(req, res) {
  const assignment_plan = req.db.collection('assignment_plans')
  let incoming_assignment_plan = decorate_incoming_document({ doc: req.body, req })

    const instance_id = req.query.instance_id
    const instance = await req.db.collection('instances').findOne({ _id: ObjectID(instance_id)})

    if (!instance) {
        return res.status(400).send()
    }

    const allowed = await can_any(req.user._id, instance_id, ['write:irs_assignment_plan'])
    if (!allowed) {
        return res.status(401).send()
    }

  assignment_plan
    .insertOne(incoming_assignment_plan)
    .then(result => {
      res.send(result.ops)
    })
    .catch(err => res.status(403).send(err))
}