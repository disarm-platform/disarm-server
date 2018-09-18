const semverSort = require('semver-sort');

module.exports = async function findOne(req, res) {
  // TODO: Split into two methods.
  // Since this is used for two endpoints, /config and /config/:config_id. It will be easier to read and maintain
  const config_collection = req.db.collection('config');
  const config_id = req.params.config_id

  try {
    if (config_id) {//
      if (config_id.indexOf('@') > 0) { //Has version
        res.send(await config_collection.findOne({ _id: config_id }));
      } else {
        // This is where the user sent bwa,nam
        const configs = await config_collection.find({ config_id }).toArray()
        if (!configs.length) {
          res.status(404).send(`There is no config for ${config_id}`)
        }

        const latest_config = configs.find(cfg => {
          return cfg.config_version === semverSort.desc(configs.map(config => config.config_version))[0]
        })

        res.send(latest_config)
      }
    } else {
      // TODO: Only return one config per config_id, no need to send all versions.
      const configs = await config_collection.find({}).toArray()
      res.send(configs.map(cfg => {
        return {
          config_id: cfg.config_id,
          config_version: cfg.config_version
        }
      }));
    }
  } catch (e) {
    res.status(500).send(e.message)
  }
}