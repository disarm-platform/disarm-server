const ObjectID = require('mongodb').ObjectID

module.exports = async function find(req, res) {
  const instance_id = req.query.instance_id
  const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send()
  }

  const personalised_instance_id = req.query.personalised_instance_id
  if (!personalised_instance_id) {
    return res.status(400).send()
  }
  
  const raw_plans = await req.db.collection('plans')
    .find({ instance_id: ObjectID(instance_id), personalised_instance_id })
    .sort({ updated_at: -1 })
    .toArray()

  const formatted_plans = raw_plans.map((plan) => {
    return {
      _id: plan._id,
      targets: plan.targets.length,
      date: plan.updated_at,
      name: plan.name
    }
  })

  res.send(formatted_plans)
}