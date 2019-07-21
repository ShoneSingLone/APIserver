var express = require("express");
var router = express.Router();
/* GET users listing. */

router.get("/", (req, res, next) => {
  let targetURL = new URL(global.getEnv("GITHUB_URL_ARTICLES"));
  targetURL.search = new URLSearchParams([
    ["access_token", global.getEnv("GITHUB_ACCESS_TOKEN")]
  ]);

  global
    .$axios(targetURL.href)
    .then(async content => {
      res.json({
        isSuccess: true,
        data: content.data.filter(file => file.type === "file"),
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        isSuccess: false,
        msg: "error"
      });
    });

});

module.exports = router;