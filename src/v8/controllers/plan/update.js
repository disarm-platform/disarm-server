const { filter_plan_targets_for_focus_area } = require('../../lib/plan_helper')
const { decorate_incoming_document } = require('../../lib/decorate_incoming_document')

module.exports = async function update (req, res) {
  try {
    let { _id } = req.params
    const plan_collection = req.db.collection('plans')
    let incoming_plan = decorate_incoming_document({ doc: req.body, req })
    plan_collection
      .findOne({ _id: ObjectID(_id) })
      .then(async current_plan => {
        if (incoming_plan.focus_filter_area) {
          try {
            console.log('Current Plan ', current_plan)
            incoming_plan = await filter_plan_targets_for_focus_area(req, incoming_plan, current_plan)
          } catch (e) {
            console.log('Current Plan ', e)
            return res.status(400).send({ message: e })
          }
        }

        delete incoming_plan._id
        plan_collection.updateOne({ _id: ObjectID(_id) }, { ...incoming_plan })
          .then(saved => res.send(saved))
          .catch(error => res.status(500).send('There was an error while saving'))
      })
      .catch(error => {
        console.log('404', error)
        res.status(404).send('Plan could not be found')
      })

  }
  catch (e) {
    console.log('Internal Server Error', e)
    res.status(500).send('Internal server error')
  }
}