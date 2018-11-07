module.exports = async function date_filtered(req, res) {
  const records = req.db.collection('records')
  const { start_date, end_date } = req.query
  const personalised_instance_id = req.query.personalised_instance_id

    const instance_id = req.query.instance_id
    const instance = await req.db.collection('instances').findOne({ _id: ObjectID(instance_id)})
    if (!instance) {
        return res.status(400).send()
    }

    const allowed = await can_any(req.user._id, instance_id, ['read:irs_records_point'])
    if (!allowed) {
        return res.status(401).send()
    }

  records.find({ instance_id , personalised_instance_id })
    .toArray()
    .then(docs => {
      const _docs = docs
        .filter(doc => new Date(doc.recorded_on) > new Date(start_date))
        .filter(doc => new Date(doc.recorded_on) < new Date(end_date))

      res.send(_docs)
    })
    .catch(error => res.status(500).send(error))
}