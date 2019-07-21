var express = require("express");
var router = express.Router();

function QueueForCommit() {
  this.queue = [];
  this.isWorking = false;
}

QueueForCommit.prototype.push = function (target) {

  this.queue.push({
    res: target.res,
    href: target.href
  });
  this.next();
};
QueueForCommit.prototype.next = function () {
  let _this = this;
  if (!_this.isWorking) {
    _this.isWorking = true;
    let target = _this.queue.shift();
    if (target) {
      let {
        res,
        href
      } = target;
      global
        .$axios(href)
        .then(async content => {
          res.json({
            isSuccess: true,
            data: content.data,
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


router.get("/", (req, res, next) => {
  let targetURL = new URL(global.getEnv("GITHUB_URL_ARTICLES"));
  targetURL.search = new URLSearchParams([
    ["access_token", global.getEnv("GITHUB_ACCESS_TOKEN")],
  ]);
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
    });

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
    href: targetURL.href
  });
});

module.exports = router;