module.exports = async function find  (req, res) {
  const plan_collection = req.db.collection('plans')
  const country = req.country
  const personalised_instance_id = req.personalised_instance_id
  plan_collection
    .find({ country, personalised_instance_id })
    .sort({ updated_at: -1 })
    .toArray()
    .then(plans => res.send(plans.map((plan) => {
      return {
        _id: plan._id,
        targets: plan.targets.length,
        date: plan.updated_at,
        name: plan.name
      }
    })))
    .catch(e => res.status(500).send(e))
}