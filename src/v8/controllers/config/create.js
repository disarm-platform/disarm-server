module.exports = async function create(req, res) {
  const config_collection = req.db.collection('config');
  const config_id = req.params['config_id'];
  const config_data = req.body.config_data;
  const calculated_id = `${config_data.config_id}@${config_data.config_version}`

  if (config_id && (config_id === calculated_id)) {
    try {
      await config_collection.updateOne({ _id: config_id }, { ...req.body.config_data })
      res.status(201).send({ success: true })
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
    }
  } else {
    try {
      await config_collection.removeOne({ _id: `${req.body.config_data.config_id}@${req.body.config_data.config_version}` })
      await config_collection.insertOne({
        _id: `${req.body.config_data.config_id}@${req.body.config_data.config_version}`,
        ...req.body.config_data
      })
      res.status(201).send({ success: true })
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
    }
  }

}