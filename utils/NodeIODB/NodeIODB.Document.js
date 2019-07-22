const Utils = require("./NodeIODB.Utils");

/**
 * Document Object
 * @param {object} object Document data
 * @returns {object} Document data
 */
function Document(object) {
    if (!Utils.isObject(object))
        throw new Error("Invalid argument. Expected an Object.");
    if (object.hasOwnProperty("_id") === false)
        object._id = Utils.uuid();
    this.object = object;
    return this.object;
}

module.exports = Document;