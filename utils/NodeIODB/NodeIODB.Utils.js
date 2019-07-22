module.exports = {
    /**
     * Checks a value if of type array
     * @param {*} arg
     * @returns {boolean}
     */
    isArray: function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    },

    /**
     * Checks a value if of type object
     * @param {*} arg
     * @returns {boolean}
     */
    isObject: function (arg) {
        return Object.prototype.toString.call(arg) === "[object Object]";
    },

    /**
     * Recursively merge two objects
     * @param obj1
     * @param obj2
     * @returns {*}
     */
    merge: function (obj1, obj2) {
        for (var p in obj2) {
            try {
                if (obj2[p].constructor == Object) {
                    obj1[p] = Utils.merge(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    },

    /**
     * Clone object
     */
    clone: function (arg) {
        return (JSON.parse(JSON.stringify(arg)));
    },

    /**
     * Resolve object field value passed on string path.
     * Thank you http://stackoverflow.com/a/22129960/5678694!
     * @param path
     * @param object
     * @returns {*}
     */
    resolve: function (path, object) {
        return path.split(".").reduce(function (prev, curr) {
            return prev ? prev[curr] : undefined;
        }, object || self);
    },

    /**
     * Generates an id with a extremely low chance of collision
     * @returns {string} ID
     */
    uuid: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == "x" ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    }
};