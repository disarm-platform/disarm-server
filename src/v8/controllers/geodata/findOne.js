const ObjectID = require('mongodb').ObjectID
const { is_user } = require('../../lib/helpers/is_user')

/**
 * @api {get} /geodata/:level_name Create geodata level
 * @apiName Get Geodata Level
 * @apiGroup Geodata
 *
 * @apiParam {string} level_name The id of the level
 */


module.exports = async function findOne(req, res) {
  const level_id = req.params['level_id']
    const instance_id = req.query.instance_id

    const geodata_level_with_highest_version = await req.db.collection('geodata')
        .findOne({
           _id: ObjectID(level_id)
        })

  const allowed = await is_user(req.user._id, geodata_level_with_highest_version.instance_id)
  if (!allowed) {
    return res.status(401).send({ error: 'Not authorized' })
  }

  res.send(geodata_level_with_highest_version.geojson)
}