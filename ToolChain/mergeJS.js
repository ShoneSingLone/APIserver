const fs = require("fs");
const Path = require("path");
const getPath = (file = "") => Path.resolve(__dirname, "../public/js", file);
const DIST_PATH = getPath("main.js");

/* 获取目录下的文件列表 */
/* (async () => {
  let dirList = await fs.readdirSync(getPath());
  dirList.filter(dir => !(/.js$/.test(dir))).forEach((dir) => console.log('dir', getPath(dir)));
})(); */

/*  */
let main = async (targetFileList) => {
  let count = 0;
  let next = async (targetFileList) => {
    if (targetFileList.length > 0) {
      let targetPath = getPath(targetFileList.shift());
      let content = await fs.readFileSync(targetPath, "utf-8");
      if (count === 0) {
        await fs.writeFileSync(DIST_PATH, `/* Date:${new Date()} */\n`, {
          encoding: "utf-8"
        });
      }
      await fs.appendFileSync(DIST_PATH, content, {
        encoding: "utf-8"
      });
      console.log(count++);
      return next(targetFileList);
    } else {
      return DIST_PATH;
    }
  };
  return next(targetFileList);
};
exports.getPath = getPath;
let merge = (async () => await main([
  "lib/jquery.js",
  "lib/vue.js",
  "main.base.js"
]));
exports.merge = merge;
merge();