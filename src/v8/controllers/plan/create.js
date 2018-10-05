const ObjectID = require('mongodb').ObjectID
const { filter_plan_targets_for_focus_area } = require('../../lib/plan_helper')
const { decorate_incoming_document } = require('../../lib/decorate_incoming_document')

module.exports = async function create (req, res) {
  const instance_id = req.query.instance_id
  const instance = await req.db.collection('instances').findOne({ _id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send()
  }

  const doc = req.body
  doc.instance_id = instance_id

  let incoming_plan = decorate_incoming_document({ doc, req })
  if (incoming_plan.focus_filter_area) {
    try {
      incoming_plan = await filter_plan_targets_for_focus_area(req, incoming_plan)
    } catch (e) {
      return res.status(400).send({ message: e.message })
    }
  }

  req.db.collection('plans')
    .insertOne(incoming_plan)
    .then((result, err) => res.send(result.ops))
    .catch(err => res.status(403).send(err))
}