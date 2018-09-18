module.exports = async function findOne(req, res) {
  const geodata_collection = req.db.collection('geodata');
  const { instance, spatial_hierarchy } = req.params;
  try {
    if (spatial_hierarchy) {
      const _id = `${instance}/${spatial_hierarchy}`
      res.send(await geodata_collection.findOne({ _id }))
    } else if (instance) {
      const geodatas = await geodata_collection.find({ instance }).toArray()
      res.send(geodatas.map(e => e.spatial_hierarchy))
    } else {
      res.send(await geodata_collection.find({}).toArray())
    }

  } catch (e) {
    res.status(500).send(e.message)
  }
}