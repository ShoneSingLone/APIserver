/* addComponents */
(function ($) {
    var isDev = (window.isDev = Boolean(localStorage.isDev));
    /**
     *
     * 处理静态资源链接
     * @param {any} subPath "resources/"后面的部分
     * @returns
     */

    function resolvePath(subPath) {
        var mainPathArray = (localStorage.requestContextPath || "")
            .split("/")
            .filter(function (content) {
                return content;
            });
        mainPathArray = (isDev ?
            "main/resources/".split("/") :
            mainPathArray
        ).filter(function (content) {
            return content;
        });
        var res = [" "]
            .concat(mainPathArray)
            .concat([subPath])
            .join("/")
            .trim();
        return res;
    }

    window.Vue.resolvePath = resolvePath;
    /**
     * 过滤导航树
     *
     * @param {any} arr
     * @param {any} selectedKey
     * @param {any} options
     * @returns
     */

    function arrayTreeFilter(arr, selectedKey, options) {
        var itemValueName = (options && options.itemValueName) || "name";

        var _arr = JSON.parse(JSON.stringify(arr));

        var targetArray = [];

        _arr.forEach(function (item) {
            if (~item[itemValueName].indexOf(selectedKey)) {
                return targetArray.push(item);
            } else {
                var resArray = [];

                if (item.children) {
                    resArray = arrayTreeFilter(item.children, selectedKey);

                    if (resArray.length > 0) {
                        item.children = resArray;
                        return targetArray.push(item);
                    }
                }
            }
        });

        return targetArray;
    }

    window.Vue.arrayTreeFilter = arrayTreeFilter;
    /**
     * 过滤导航树
     *
     * @param {any} arr
     * @param {any} selectedKey
     * @param {any} options
     * @returns
     */

    function convertDict(row, property, dictType, value) {
        function getName(collection) {
            var res = value;

            for (var index = 0; index < collection.length; index++) {
                var element = collection[index];

                if (element.dictValue === String(value)) {
                    res = element.dictName;
                    break;
                }
            }

            return res;
        }

        if (!window.sysDict || !window.sysDict[dictType]) {
            /* F12 application 本地是否有数据；字段是否与数据匹配 */
            console.log(dictType);
            return console.warn("数据资料未加载");
        }

        return getName(window.sysDict[dictType]);
    }

    window.Vue.convertDict = convertDict;
    /**
     * 获取嵌套对象
     *
     * @param {any} object
     * @param {any} prop
     * @returns
     */

    function getValueByPath(object, prop) {
        prop = prop || "";
        var paths = prop.split(".");
        var current = object;
        var result = null;

        for (var i = 0, j = paths.length; i < j; i++) {
            var path = paths[i];
            if (!current) break;

            if (i === j - 1) {
                result = current[path];
                break;
            }

            current = current[path];
        }

        return result;
    }

    window.Vue.getValueByPath = getValueByPath;

    function setValueByPath(object, prop, value) {
        prop = prop || "";
        var paths = prop.split(".");
        var current = object;

        for (var i = 0, j = paths.length; i < j; i++) {
            var path = paths[i];

            if (!current) {
                alert([prop, " ", path, " 对象或对象属性不存在"].join());
                break;
            }

            if (i === j - 1) {
                current[path] = value;
            }

            current = current[path];
        }
    }

    window.Vue.setValueByPath = setValueByPath;

    window.Vue.log = function () {
        try {
            throw new Error();
        } catch (error) {
            var optionString = error.stack.split("\n")[2];
            var regexMatch = optionString.match(/\((.*)\)/gi);

            for (
                var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++
            ) {
                args[_key] = arguments[_key];
            }

            console.log.apply(console, [regexMatch[0], "\n"].concat(args));
        }
    };
    /* addComponents */

    window.Vue.componentList = window.Vue.componentList || {};
    window.Vue.JSList = window.Vue.JSList || {};
    window.Vue.CSSList = window.Vue.CSSList || {};
    /**
     * @param {any} component 必须有name属性与文件名相同
     */

    window.Vue.addC = function (component) {
        if (!component.name) console.error(component, "component no name");
        window.Vue.componentList[component.name] = Promise.resolve(component);
    };
    /**
     *
     *
     * @param {any} componentNameArray 组件名字组成的数组
     * @param {any} baseUrl 这一组组件的路径前缀
     * @returns Promise
     */

    window.Vue.loadComponent = function (componentNameArray, baseUrl) {
        return Promise.all(
            componentNameArray.map(function (componentName) {
                /* try {
                    if (window.parent && window.parent.Vue.componentList) {
                        var object = window.parent.Vue.componentList;
                        for (var key in object) {
                            if (object.hasOwnProperty(key)) {
                                window.Vue.componentList[key] = object[key];
                            }
                        }
                        window.parent.Vue.componentList = window.Vue.componentList;
                    }
                } catch (error) {
                    console.log(error);
                } */
                var _targetComponent = window.Vue.componentList[componentName];

                if (_targetComponent) {
                    /* 已被添加，不需要重复添加 */
                    return Promise.resolve(_targetComponent);
                }
                return new Promise(function (resolve, reject) {
                    if (!baseUrl) {
                        return alert("未设置 loadComponent baseUrl");
                    }

                    var scriptID = "component-" + componentName;
                    var $script = $("#" + scriptID);

                    if ($script.length === 0) {
                        var script = document.createElement("script");
                        script.id = scriptID;
                        script.src = [baseUrl, componentName, componentName].join("/") + ".js";
                        script.onload = function () {
                            script.onload = script.onerror = null;
                            var res = window.Vue.componentList[componentName];

                            if (!res) {
                                debugger;
                            }

                            resolve(res);
                        };

                        script.onerror = function (event) {
                            console.warn(event);
                            script.onload = script.onerror = null;
                            reject(event);
                        };
                        document.getElementsByTagName("head")[0].appendChild(script);
                    }
                }).then(function (targetNeedTemplate) {
                    return new Promise(function (resolve, reject) {
                        $.ajax({
                                url: [baseUrl, componentName, componentName].join("/") + ".html",
                                type: "GET",
                                dataType: "html"
                            })
                            .done(function success(templateString) {
                                if (targetNeedTemplate) {
                                    targetNeedTemplate.template = templateString;
                                    window.Vue.componentList[componentName] = targetNeedTemplate;
                                    resolve(window.Vue.componentList[componentName]);
                                } else {
                                    reject(console.warn(componentName + "加载错误"));
                                }
                            })
                            .fail(function (error) {
                                console.warn(error);
                                reject(error);
                            });
                    });
                });
            })
        );
    };

    window.Vue.loadCSS = function (CSSArray) {
        var cssPromiseArray = CSSArray.map(function (cssObjArray) {
            var cssId = cssObjArray[0];
            var cssPath = cssObjArray[1];
            return new Promise(function (resolve, reject) {
                if (window.Vue.CSSList[cssId]) {
                    /* 已被添加，不需要重复添加 */
                    resolve(window.Vue.CSSList[cssId]);
                } else {
                    if (!cssPath) {
                        return alert("未设置 loadCSS cssPath");
                    }

                    var linkID = "link-" + cssId;
                    var $link = $("#" + linkID);

                    if ($link.length === 0) {
                        var linkEle = document.createElement("link");
                        linkEle.id = linkID;
                        linkEle.href = cssPath;
                        linkEle.rel = "stylesheet";

                        linkEle.onload = linkEle.onreadystatechange = function (event) {
                            linkEle.onload = linkEle.onreadystatechange = linkEle.onerror = null;
                            resolve(event);
                        };

                        linkEle.onerror = function (event) {
                            console.warn(event);
                            linkEle.onload = linkEle.onerror = null;
                            reject(event);
                        };

                        document.getElementsByTagName("head")[0].appendChild(linkEle);
                    }
                }
            });
        });
        return Promise.all(cssPromiseArray);
    };
    /**
     *
     *
     * @param {any} JSArray
     * [
     *  [jsId,jsPath]
     * ]
     * @returns
     */

    window.Vue.loadJS = function (JSArray) {
        var componentsPromiseArray = JSArray.map(function (jsObjArray) {
            var jsId = jsObjArray[0];
            var jsPath = jsObjArray[1];
            return new Promise(function (resolve, reject) {
                if (window.Vue.JSList[jsId]) {
                    /* 已被添加，不需要重复添加 */
                    resolve(window.Vue.JSList[jsId]);
                } else {
                    if (!jsPath) {
                        return alert("未设置 " + jsId + " loadJS jsPath");
                    }

                    var scriptID = "script-" + jsId;
                    var $script = $("#" + scriptID);

                    if ($script.length === 0) {
                        var scriptEle = document.createElement("script");
                        scriptEle.id = scriptID;
                        scriptEle.src = jsPath;
                        scriptEle.defer = true;

                        scriptEle.onload = function (event) {
                            scriptEle.onload = scriptEle.onerror = null;
                            window.Vue.JSList[jsId] = true;
                            resolve(event);
                        };

                        scriptEle.onerror = function (event) {
                            console.warn(event.type);
                            console.log(scriptEle.src);
                            scriptEle.onload = scriptEle.onerror = null;
                            reject(event);
                        };

                        var $scriptGroup = $("#script-group");

                        if ($scriptGroup.length === 0) {
                            $scriptGroup = $("<div></div>")
                                .attr("id", "script-group")
                                .appendTo($("body"));
                        }

                        $scriptGroup[0].appendChild(scriptEle);
                    }
                }
            });
        });
        return Promise.all(componentsPromiseArray);
    };
    /* addComponents */

    /* mixinList */

    window.Vue.mixinList = window.Vue.mixinList || {};
    window.Vue.mixinList.methodsGoTo = {
        methods: {
            goTo: function goTo(item) {
                if (item && item.gotoURL) {
                    var target = item.target || "_blank";
                    window.open(item.gotoURL, target);
                } else {
                    alert("正在开发中,敬请期待!");
                }
            }
        }
    };
    window.Vue.mixinList.filterDate = {
        filters: {
            dateFilter: function dateFilter(value) {
                if (!value) {
                    console.warn("date missing");
                    return "";
                }

                var res = "";

                try {
                    res = dayjs(value).format("YYYY-MM-DD");
                } catch (error) {
                    console.warn("news date error");
                }

                return res;
            }
            /* mixinList */
        }
    };
})(window.jQuery);
/**
 * 不允许使用IE浏览器 *
 */

function forbidIE() {
    if (window.isBrowserOutdated) {
        window
            .confirm("此浏览器已过时,请更换现代浏览器！", "提示", {
                confirmButtonText: "立即下载火狐浏览器",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
            .then(function () {
                window.open("http://www.firefox.com.cn/download/", "_self");
            })
            .catch(function () {});
        throw new Error("浏览器过时");
    }
}