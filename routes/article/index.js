var express = require("express");
var router = express.Router();

function QueueForCommit() {
    this.queue = [];
    this.isWorking = false;
}

QueueForCommit.prototype.push = function (target) {
    this.queue.push({
        res: target.res,
        href: target.href,
        name: target.name
    });
    setTimeout(() => {
        this.next();
    }, 1000);
};
QueueForCommit.prototype.next = function () {
    let _this = this;
    if (!_this.isWorking) {
        _this.isWorking = true;
        let target = _this.queue.shift();
        if (target) {
            let {
                res,
                href,
                name
            } = target;

            global
                .$axios(href)
                .then(async content => {
                    let {
                        data
                    } = content;

                    res.json({
                        isSuccess: true,
                        data
                    });
                    _this.isWorking = false;
                    _this.next();
                })
                .catch((error) => {
                    res.json({
                        code: 500,
                        msg: "error"
                    });
                    _this.isWorking = false;
                    _this.next();
                });
        } else {
            _this.isWorking = false;
        }
    }
};

let queue = new QueueForCommit();


router.get("/", async (req, res, next) => {
    let pageCurrent = (req.query.pageCurrent);
    console.log("pageCurrent", pageCurrent);
    let pageSize = (req.query.pageSize);
    console.log("pageSize", pageSize);
    const {
        iodb
    } = require("../../utils/NodeLibIODB.common");
    debugger;
    let articlesModel = await iodb.collection("articles");
    let allArticles = articlesModel.documents.filter(file => file.type === "file" && /(.*).md$/g.test(file.name));
    let data = allArticles.slice((pageCurrent - 1) * pageSize, (pageCurrent) * pageSize);

    res.json({
        isSuccess: true,
        data,
        articleTotal: allArticles.length
    });

    /*
        let targetURL = new URL(global.getEnv("GITHUB_URL_ARTICLES"));
    targetURL.search = new URLSearchParams([ ["access_token", global.getEnv("GITHUB_ACCESS_TOKEN")], ]);

    global
           .$axios(targetURL.href)
           .then(async content => {
               res.json({
                   isSuccess: true,
                   data: content.data.filter(file => {
                       return file.type === "file" && /(.*).md$/g.test(file.name);
                   }),
               });
           })
           .catch((error) => {
               console.log(error);
               res.json({
                   code: 500,
                   msg: "error"
               });
           }); */

});

router.get("/detail", (req, res, next) => {
    // console.log("req.params", req.params, "req.query", req.query, "req.body", req.body);
    let targetURL = new URL(global.getEnv("GITHUB_URL_COMMITS"));
    targetURL.search = new URLSearchParams([
        ["path", req.query.path],
        ["access_token", global.getEnv("GITHUB_ACCESS_TOKEN")]
    ]);
    queue.push({
        req,
        res,
        href: targetURL.href,
        name: req.query.name
    });
});

module.exports = router;