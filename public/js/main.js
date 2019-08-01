// let path = "./js/other.js";

let getJSON = function () { };

export function getUsefulContents(url, callback) {
    getJSON(url, data => callback(JSON.parse(data)));}
