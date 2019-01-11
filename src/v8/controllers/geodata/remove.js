module.exports = function remove (req, res) {
  const geodata_collection = req.db.collection('geodata');
  try {
    res.send(req.path)
  } catch (e) {

  }
}