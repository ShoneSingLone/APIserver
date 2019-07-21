const axios = require("axios");

var http = axios.create({
    timeout: 1000 * 180,
    withCredentials: true
});

http.interceptors.request.use(function (config) {
    config.headers["Accept-Language"] = "zh-CN";
    return config;
}, function (error) {
    console.error(error);
    return Promise.reject(error);
});
// 响应拦截
http.interceptors.response.use(function (response) {
    if (response.data.code === 401) {
        console.log("无权限");
        return Promise.reject(response.data.msg);
    }
    return response;
}, function (error) {
    console.error(error);
    return Promise.reject(error);
});


exports.addAxios = function () {
    this.global.$axios = http;
    return this;
};