const {
    addAxios
} = require("./http");
const {
    addEnvValue
} = require("./config");

module.exports = function (_global) {
    this.global = _global;
    this.addAxios = addAxios;
    this.addEnvValue = addEnvValue;
};