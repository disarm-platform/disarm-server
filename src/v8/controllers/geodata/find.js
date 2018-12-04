const ObjectID = require('mongodb').ObjectID
const { is_user } = require('../../lib/helpers/is_user')

/**
 * @api {get} /geodata/:level_id Create geodata level
 * @apiName Get Geodata Level
 * @apiGroup Geodata
 *
 * @apiParam {string} level_id The id of the level
 */


module.exports = async function findOne(req, res) {
    const level_id = req.params['level_id']


    const level = await req.db.collection('geodata').findOne({_id: ObjectID(level_id)})
    if (!level) {
        return res.status(400).send({ error: 'Invalid level_id' })
    }

    const allowed = await is_user(req.user._id, level.instance_id)
    if (!allowed) {
        return res.status(401).send({ error: 'Not authorized' })
    }

    res.send(level)
}