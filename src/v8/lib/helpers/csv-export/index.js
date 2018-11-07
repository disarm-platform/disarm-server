const {check_input} = require('./check_input')
const {process} = require('./process')

/**
 * Take an array of odd-shaped and nested JSON, return the CSV string
 * @param json_array
 * @returns {*}
 */
module.exports.flatten_json_to_csv = (json_array) => {
  if (!check_input(json_array)) return []
  return process(json_array)
}