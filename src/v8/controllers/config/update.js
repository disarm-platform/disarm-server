module.exports = async function  update(req, res) {
  const config_collection = req.db.collection('config');
  const config_id = req.params.config_id
  const config_data = req.body.config_data ? req.body.config_data : req.body
  const config_version = config_data.config_version
  try {
    if (config_id) {// if the config id is specified as part of the path
      if (config_id.indexOf('@') > 0) { //the _id is instance@version
        //TODO check that _id is instace@version
        await config_collection.updateOne({ _id: config_id }, { ...config_data })
        const updated_config = await config_collection.findOne({ _id: config_id })
        // console.log(updated_config)
        res.send(updated_config);
      } else { //In the else there is no version in the _id
        // TODO: Clarify what is going on here, what's happening in the else?
        if (config_version) {
          // TODO: you shouldn't be able to update a config with the same version, then it's not the same version.
          // TODO: We should use the mongo ids, not create our own. We should query by config_id and config_version though.

          await config_collection.removeOne({ _id: `${req.body.config_data.config_id}@${req.body.config_data.config_version}` })
          await config_collection.insertOne({
            _id: `${req.body.config_data.config_id}@${req.body.config_data.config_version}`,
            ...req.body.config_data
          })
          res.status(201).send({ success: true })
        } else {
          const config = await config_collection.updateMany({ config_id: config_id }, { $set: { ...config_data } })
          const updated_configs = config_collection.find({ config_id: config_id }).toArray()
          if (updated_configs.length) {
            res.send(updated_configs);
          } else {
            res.status(404).send(`There is no config for ${config_id}`)
          }
        }
      }
    }
  } catch (e) {
    res.status(500).send(e.message)
  }
}