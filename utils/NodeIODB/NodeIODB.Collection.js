const Utils = require("./NodeIODB.Utils");
const Query = require("./NodeIODB.Query");
const Document = require("./NodeIODB.Document");


/**
 * Collection Object
 * @param name Collection name
 * @param options Options additional options
 * @returns {Collection}
 */
function Collection(name, options) {
    if (!name) {
        throw new Error("Collection requires a name");
    }
    this.name = name;
    this.documents = [];
    this.options = options || {};
    this.length = 0;
    return this;
}

Collection.prototype = {
    /**
     * Inserts data into a collection
     *
     * @example
     * var Examples = Store.addCollection('example');
     * Examples.insert({ forename: 'Foo', surname: 'Bar' });
     * Examples.insert([{ forename: 'Pete', surname: 'Johnson' }, { forename: 'Joe', surname: 'Bloggs' }])
     *
     * @param {object|Array} doc Data to be inserted into the collection. Can also be array of data.
     * @param {Function} [callback] Async callback
     * @returns {Document|Array}
     */
    insert: function (doc) {
        var document;
        if (Utils.isArray(doc)) {
            document = doc.map(function (document) {
                document = new Document(document);
                this.documents.push(document);
                return document;
            }, this);
        } else {
            document = new Document(doc);
            this.documents.push(document);
        }
        this.length = this.documents.length;
        return this;
    },

    /**
     * Returns an array of documents which satisfy the query given
     *
     * @example
     * var Examples = Store.addCollection('example');
     * Examples.insert({ _id: '1', forename: 'Foo', surname: 'Bar' });
     * Examples.insert({ _id: '2', forename: 'Bar', surname: 'Foo' });
     * Examples.insert({ _id: '3', forename: 'Foo', surname: 'Bar' });
     * console.log(Examples.length) // 2
     *
     * var results = Examples.find({ forename: 'Foo' });
     * console.log(results) // [{ _id: '1', forename: 'Foo', surname: 'Bar' }, { _id: '3', forename: 'Foo', surname: 'Bar' }]
     *
     * @param {object|number|string} [query] Query which tests for valid documents
     * @return {Collection[]}
     */
    find: function (query) {
        var keys,
            results;
        var _this = this;
        // Get clone of documents in collection
        let collection = this;
        _this.documents = collection.documents;
        _this.length = collection.length;
        results = _this.documents.slice(0);
        query = Query.format(query);
        // Get query keys
        keys = Object.keys(query);
        while (keys.length > 0) {
            // Break out of loop if we have 0 documents in result
            if (results.length === 0) {
                break;
            }
            results = results.filter((document) => {
                let part = {};
                part[keys[0]] = query[keys[0]];
                return Query.compare(document, part);
            });
            // Remove query key
            keys.splice(0, 1);
        }
        return results;
    },

    /**
     * Returns the first document which satisfied the query given
     *
     * @example
     * var Examples = Store.addCollection('example');
     * Examples.insert({ _id: '1', forename: 'Foo', surname: 'Bar' });
     * Examples.insert({ _id: '2', forename: 'Foo', surname: 'Bar' });
     * console.log(Examples.length) // 2
     *
     * var result = Examples.findOne({ forename: 'Foo', surname: 'Bar' });
     * console.log(result) // { _id: '1', forename: 'Foo', surname: 'Bar' }
     *
     * @param {object|number|string} [query] Query which tests for valid documents
     * @return {Collection}
     */
    findOne: function (query) {
        let res = this.find(query);
        if (res && res.length > 0) {
            return [0];

        }
        return null;
    },

    /**
     * Updates an existing document inside the collection
     * Supports partial updates
     *
     * @example
     * var Examples = Store.addCollection('example');
     * Examples.insert({ _id: 0, forename: 'Foo', surname: 'Bar' });
     * Examples.update({ _id: 0 },{ title: 'Mrs' });
     *
     * var result = Examples.findOne({ _id:0 });
     * console.log(result) // { _id: '0', forename: 'Foo', surname: 'Bar', title: 'Mrs' }
     *
     * @param {object|number|string} [query] Query which tests for valid documents
     * @param {object} doc Data to be inserted into the collection
     * @param {Function} [callback] Async callback
     * @returns {Collection}
     */
    update: function (query, doc) {
        var documents = this.find(Query.format(query));
        // Iterate through query results and update
        documents.forEach(function (document) {
            // Get index of document in the collection
            var index = this.documents.indexOf(document);
            // If index is not -1 (means it wasn't found in the array)
            if (index !== -1) {
                //  Merge currently record with update object
                this.documents[index] = new Document(Utils.merge(this.documents[index], doc));
            }
        }, this);
    },
    /**
     * Updates or insert document inside the collection
     * Supports partial updates
     *
     * @example
     * var Examples = Store.addCollection('example');
     * Examples.insert({ _id: 0, forename: 'Foo', surname: 'Bar' });
     * Examples.update({ _id: 0 },{ title: 'Mrs' });
     *
     * var result = Examples.findOne({ _id:0 });
     * console.log(result) // { _id: '0', forename: 'Foo', surname: 'Bar', title: 'Mrs' }
     *
     * @param {object|number|string} [query] Query which tests for valid documents
     * @param {object} doc Data to be inserted into the collection
     * @param {Function} [callback] Async callback
     * @returns {Collection}
     */
    upsert: function (query, doc) {
        var documents = this.find(Query.format(query));
        // Iterate through query results and update
        if (documents.length === 0) {
            return this.insert(doc);
        } else {
            documents.forEach((document) => {
                // Get index of document in the collection
                var index = this.documents.indexOf(document);
                // If index is not -1 (means it wasn't found in the array)
                if (~index) {
                    //  Merge currently record with update object
                    this.documents[index] = new Document(Utils.merge(this.documents[index], doc));
                }
            });
        }
    },

    /**
     * Removes documents which satisfy the query given
     *
     * @example
     * var Examples = Store.addCollection('example');
     * Examples.insert({ _id: '394', forename: 'Foo', surname: 'Bar' });
     * console.log(Examples.length) // 1
     * Examples.remove({ _id: '394' });
     * console.log(Examples.length) // 0
     *
     * @example
     * var Examples = Store.addCollection('example');
     * Examples.insert({ _id: '394', forename: 'Foo', surname: 'Bar' });
     * console.log(Examples.length) // 1
     * Examples.remove({ forename: 'Foo' });
     * console.log(Examples.length) // 0
     *
     * @param {object|number|string} [query] Query which tests for valid documents
     * @param {Function} [callback] Async callback
     * @return {Collection}
     */
    remove: function (query) {
        var documents = this.find(Query.format(query));
        // Iterate through query results
        documents.forEach((document) => {
            // Get index of document in the collection
            var index = this.documents.indexOf(document);
            // If index is not -1 (means it wasn't found in the array)
            if (index !== -1) {
                // If found in the array, remove it
                this.documents.splice(index, 1);
                // Update the length of the collection
                this.length--;
            }
        });
    },

    /**
     * Stores the collection into local storage
     *
     * @return {Collection}
     */
    commit: function () {
        return this.db.set(this);
    },

    /**
     * Returns the size of the collection
     * @returns {Number} size of collection
     */
    size: function () {
        return this.documents.length;
    },

    /**
     * Delete collection contents
     */
    destroy: function () {
        var _this = this;
        _this.remove();
        _this.documents = _this.options = _this.name = null;
    }
};

module.exports = Collection;