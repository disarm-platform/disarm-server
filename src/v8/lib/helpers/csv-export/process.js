const json2csv = require('json2csv').parse;

module.exports.process = (json_array) => {
    if (json_array.length === 0) return ''
    // flatten every record
    const opts = {flatten: true}

    // convert to CSV string from JSON using options
    return json2csv(json_array, opts)
}
