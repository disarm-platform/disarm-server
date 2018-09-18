module.exports = async function date_filtered(req, res) {
  const records = req.db.collection('records')
  const { start_date, end_date } = req.query
  const country = req.country
  const personalised_instance_id = req.personalised_instance_id

  records.find({ country, personalised_instance_id })
    .toArray()
    .then(docs => {
      //console.log('docs',docs.length)
      const _docs = docs
        .filter(doc => new Date(doc.recorded_on) > new Date(start_date))
        .filter(doc => new Date(doc.recorded_on) < new Date(end_date))
      // console.log('_docs',_docs)
      res.send(_docs)
    })
    .catch(error => res.status(500).send(error))
}