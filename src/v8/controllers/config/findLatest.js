const ObjectID = require('mongodb').ObjectID
const { is_user } = require('../../lib/helpers/is_user')

module.exports = async function findLatest(req,res) {
    const {instance_id} = req.query;

    const allowed = await is_user(req.user._id, instance_id)
    if (!allowed) {
        return res.status(401).send({ error: 'Not authorized' })
    }
    
    const latest_config = await req.db.collection('instance_configs')
        .find({instance_id: ObjectID(instance_id)}).sort({_id: -1}).limit(1).toArray()
    res.send(latest_config.pop())
}
