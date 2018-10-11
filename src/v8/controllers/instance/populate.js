const ObjectID = require('mongodb').ObjectID
const { is_user } = require('../../lib/helpers/is_user')

/**
 * @api {get} /instance/:instance_id/published_configs Get config
 * @apiName Get Config
 * @apiGroup Config
 *
 * @apiParam {string} config_id The id of the config
 */

module.exports = async function findOne(req, res) {

    const instance_id = req.params.instance_id

    const allowed = await is_user(req.user._id, instance_id)
    if (!allowed) {
        return res.status(401).send({ error: 'Not authorized' })
    }


    const configs = await req.db
        .collection('instance_configs')
        .find({ instance_id: ObjectID(instance_id)})
        .toArray()

    res.send(configs)
}