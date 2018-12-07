const ObjectID = require('mongodb').ObjectID
const { can_any } = require('../../lib/helpers/can')

module.exports = async function read(req, res) {
    const assignment_plan = req.db.collection('assignment_plans')
    const personalised_instance_id = req.personalised_instance_id

    const instance_id = req.query.instance_id
    const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})

    if (!instance) {
        return res.status(400).send()
    }

    const allowed = await can_any(req.user._id, instance_id, ['read:irs_assignment_plan'])
    if (!allowed) {
        return res.status(401).send()
    }

    assignment_plan
        .find({instance_id, personalised_instance_id})
        .sort({updated_at: -1})
        .limit(1)
        .toArray()
        .then(docs => {
            let doc = docs[0]
            if (typeof doc === 'undefined') {
                res.send({})
            } else {
                res.send(doc)
            }
        })
        .catch(err => {
            res.status(403).send(err)
        })
}