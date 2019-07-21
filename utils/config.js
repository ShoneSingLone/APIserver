const dotenv = require("dotenv");
const path = require("path");
dotenv.config({
    path: path.resolve(__dirname, "../../AAAConfigs/APIServer.configs")
});

exports.addEnvValue = function () {
    this.global.getEnv = (prop) => {
        let res = process.env[prop];
        if (res) {
            return res;
        } else {
            console.log(res);
            console.log("prop", prop);
            return false;
        }
    };
    return this;
};