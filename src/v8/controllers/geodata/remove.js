module.exports = function remove (req, res) {
  const geodata_collection = req.db.collection('geodata');
  try {
    //console.log('delete', req.path)
    res.send(req.path)
  } catch (e) {

  }
}