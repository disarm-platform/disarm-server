module.exports = function remove(req, res) {
  const config_collection = req.db.collection('config');
  try {
    // console.log('delete', req.path,req.body.query)
    const query = req.body.query
    config_collection.deleteMany(query)
      .catch(console.log)
      .then(console.log)
    // res.send(req.path)
  } catch (e) {

  }
}