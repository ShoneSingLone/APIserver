const Utils = require("./NodeIODB.Utils");

let Query = {
    /**
     * Formats a DB query
     * @param {object|string|number} [query] DB query to format
     */
    format: function (query) {
        if (!query) return {};
        if (typeof query === "string" || typeof query === "number") return {
            _id: query
        };
        return query;
    },

    /**
     * Finds documents which are valid based on a query
     *
     * @param document
     * @param query
     * @returns {boolean} valid
     */
    compare: function (document, query) {
        var keys = Object.keys(query),
            condition,
            operator;

        for (var i = 0; i < keys.length; i++) {
            condition = {
                name: keys[i],
                value: query[keys[i]]
            };

            // Actual field value
            var value = Utils.resolve(condition.name, document);

            if (typeof value === "undefined" && typeof Query.Operators[condition.name] !== "function") {
                return false;
            }

            if (typeof Query.Operators[condition.name] === "function") {
                return Query.Operators[condition.name](document, condition.value);
            } else if (typeof condition.value === "object") {
                operator = Object.keys(condition.value)[0];
                if (typeof Query.Operators[operator] === "function") {
                    return Query.Operators[operator](value, condition.value[operator]);
                } else {
                    throw new Error("Unrecognised operator '" + operator + "'");
                }
            } else {
                return Query.Operators.$eq(value, condition.value);
            }
        }

        return true;
    },

    /**
     * Comparison operators
     * @see https://docs.mongodb.org/manual/reference/operator/query-comparison/
     */
    Operators: {
        /**
         * Equality test
         *
         * @example
         * Examples.find({ forename: { $eq: 'Foo' } });
         *
         * @example
         * Examples.find({ forename: 'Foo' }); // Shorthand
         * Examples.find({ forename: { $eq: 'Foo' } });
         *
         * @param a
         * @param b
         * @return {boolean} result
         */
        "$eq": function (a, b) {
            return a === b;
        },

        /**
         * Inequality test
         *
         * @example
         * Examples.find({ forename: { $ne: 'Foo' } });
         *
         * @param a
         * @param b
         * @return {boolean} result
         */
        "$ne": function (a, b) {
            return a != b;
        },

        /**
         * Or test
         *
         * @example
         * Examples.find({ $or: [{ name:'Foo' },{ name:'Bar' }] });
         *
         * @param a
         * @param b
         */
        "$or": function (a, b) {
            // Throw an error if not passed an array of possibilities
            if (!Utils.isArray(b)) {
                throw new Error("$or Operator expects an Array");
            }

            var i;

            if (Utils.isObject(a)) {
                for (i = 0; i < b.length; i++) {
                    if (Query.compare(a, b[i])) {
                        return true;
                    }
                }
            } else {
                // Test each value from array of possibilities
                for (i = b.length; i >= 0; i--) {
                    if (this.$eq(a, b[i])) {
                        // Satisfied, return true
                        return true;
                    }
                }
            }

            // Failed to satisfy, return false
            return false;
        },

        /**
         * Greater than test
         *
         * @example
         * Examples.find({ age: { $gt: 17 } });
         *
         * @param a
         * @param b
         */
        "$gt": function (a, b) {
            return a > b;
        },

        /**
         * Greater than or equal test
         *
         * @example
         * Examples.find({ age: { $gte: 18 } });
         *
         * @param a
         * @param b
         */
        "$gte": function (a, b) {
            return a >= b;
        },

        /**
         * Less than test
         *
         * @example
         * Examples.find({ age: { $lt: 18 } });
         *
         * @param a
         * @param b
         */
        "$lt": function (a, b) {
            return a < b;
        },

        /**
         * Less than or equal test
         *
         * @example
         * Examples.find({ age: { $lte: 18 } });
         *
         * @param a
         * @param b
         */
        "$lte": function (a, b) {
            return a <= b;
        },

        /**
         * Contains test for strings
         *
         * @example
         * Examples.find({ name: { $contains: "foo" } });
         *
         * @param a
         * @param b
         */
        "$contains": function (a, b) {
            return a.indexOf(b) > -1;
        },

        /**
         * Check whether a key exists within an array
         *
         * @example
         * Examples.find({ age:{ $in: [16,17,18] } });
         *
         * @param a
         * @param b
         * @returns {boolean}
         */
        "$in": function (a, b) {
            // Throw an error if not passed an array of possibilities
            if (!Utils.isArray(b)) {
                throw new Error("$in Operator expects an Array");
            }
            return b.indexOf(a) > -1;
        },

        /**
         * Check whether a key does not exist within an array
         *
         * @example
         * Examples.find({ age:{ $nin: [16,17,18] } });
         *
         * @param a
         * @param b
         * @returns {boolean}
         */
        "$nin": function (a, b) {
            // Throw an error if not passed an array of possibilities
            if (!Utils.isArray(b)) {
                throw new Error("$nin Operator expects an Array");
            }
            return b.indexOf(a) === -1;
        },

        /**
         * Check whether key is data type. Uses standard javascript object types.
         *
         * @example
         * Examples.find({ age:{ $type: "number" } });
         *
         * @param a
         * @param b
         */
        "$type": function (a, b) {
            // Null
            if (b === "null") {
                return a === null;
            }

            // Arrays
            if (b === "array") {
                return Utils.isArray(a);
            }

            // All other supported types
            return typeof a === b;
        }
    }
};

module.exports = Query;