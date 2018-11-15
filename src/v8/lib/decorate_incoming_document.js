const ObjectID = require('mongodb').ObjectID

const decorate_incoming_document = ({doc, req}) => {
    doc.personalised_instance_id = req.query.personalised_instance_id
    doc.instance_id = ObjectID(req.query.instance_id)
    doc.updated_at = (+new Date())
    doc.name = doc.name ? doc.name : 'Unnamed'
    return doc
}

module.exports = {decorate_incoming_document}
