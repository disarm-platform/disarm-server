module.exports = async function post(req, res) {
  const geodata_collection = req.db.collection('geodata');
  const { instance, spatial_hierarchy } = req.params;
  try {
    await geodata_collection.removeOne({ _id: `${instance}/${spatial_hierarchy}` })
    await geodata_collection.insertOne({
      _id: `${instance}/${spatial_hierarchy}`,
      instance,
      spatial_hierarchy,
      geodata_data: req.body
    })
    res.status(201).send({ success: true })
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}