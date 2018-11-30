const ObjectID = require('mongodb').ObjectID
const { is_user } = require('../../lib/helpers/is_user')

/**
 * @api {get} /config/:config_id Get config
 * @apiName Get Config
 * @apiGroup Config
 *
 * @apiParam {string} config_id The id of the config
 */

module.exports = async function findOne(req, res) {
    const instance_id = req.query.instance_id
    try{
        const configs = await req.db.collection('instance_configs').findOne({ instance_id: ObjectID(instance_id)}).toArray()

        const allowed = await is_user(req.user._id, instance_id)
        if (!allowed) {
            return res.status(401).send({ error: 'Not authorized' })
        }

        res.send(configs)
    }catch (e) {
        res.status.send(e.message)
    }

}