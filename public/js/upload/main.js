import {
    appOptions
} from "./run-vue.js";

const {
    Vue,
    $
} = window;

$("#head-title").text("单图上传");
window.APP = new Vue(appOptions);