const fs = require("fs-extra");
const Collection = require("./NodeIODB.Collection");
const {
    resolve
} = require("path");

/**
 * @example
 * let nodeIODB = new NodeIODB();
 * @returns {NodeIODB}
 */
function NodeIODB(dbname) {
    this.version = "2.2.0";
    this.basePath = resolve(__dirname, "./db", dbname);
    this.collections = {};
}

NodeIODB.prototype = {
    set: async function (collection) {
        let targetPath = resolve(this.basePath, collection.name);
        let {
            name,
            documents,
            options,
            length
        } = collection;

        await fs.outputJSON(targetPath, {
            name,
            documents,
            options,
            length
        });
    },
    get: function () {

    },

    /**
     * Retrieve a collection from the store.
     * If the collection does not exist, one will be created
     * using the name passed to the function
     *
     * @example
     * var Examples = Store.collection('example');
     *
     * @param {string} name Collection name
     * @param {object} [options] Options when creating a new collection
     * @returns {Collection}
     */
    collection: async function (name, options) {
        if (!name) {
            throw new Error("Invalid argument. Expected a collection name.");
        }
        let collection = this.collections[name];
        if (collection) {
            return collection;
        }

        let targetPath = resolve(this.basePath, name);

        const exists = await fs.exists(targetPath);
        if (exists) {
            collection = await fs.readJSON(targetPath);
        }
        /* 有insert方法 */
        let _collection = new Collection(name);

        if (collection) {
            let {
                documents,
                length
            } = collection;

            _collection.documents = documents;
            _collection.length = length;
        }
        _collection.options = options;
        _collection.db = this;

        this.collections[name] = _collection;
        return _collection;
    },
    /**
     * Removes a collection from the store
     *
     * @example
     * Store.removeCollection('example');
     *
     * @param {string} name Collection name
     * @returns {NodeIODB}
     */
    removeCollection: function (name) {
        if (!name)
            return this;
        var collection = this.collections[name];
        if (collection) {
            collection.destroy();
            delete this.collections[name];
        }
        return this;
    },

    /**
     * Stores a collection into local storage
     *
     * @param {Collection} [name] Collection name to store into local storage
     * @param {Function} [callback] Async callback
     */
    commit: function (name, callback) {
        if (!name)
            throw new Error("Invalid arguments. Expected collection name");
        var collection = this.collections[name];
        if (collection) {
            collection.commit(callback);
        }
        return this;
    },

    restore: async function () {
        let resArray = [];
        for (var collection in this.collections) {
            if (this.collections.hasOwnProperty(collection)) {
                if (collection instanceof Collection) {
                    resArray.push(this.collection(collection.name));
                }
            }
        }
        this.collections = await Promise.all(resArray);
    },

    /**
     * Clean-up after ourselves
     */
    destroy: function () {
        for (var collection in this.collections) {
            if (this.collections.hasOwnProperty(collection)) {
                if (collection instanceof Collection) {
                    collection.destroy();
                    delete this.collections[collection];
                }
            }
        }
        this.collections = [];
    }
};

module.exports = NodeIODB;