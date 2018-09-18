module.exports = function update(req, res) {
  const geodata_collection = req.db.collection('geodata');
  try {
    // console.log('put', req.path)
    res.send(req.path)
  } catch (e) {

  }
}