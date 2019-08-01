const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
/*  
 fieldname: "file"
 mimetype: "image/jpeg"
 originalname: "Abstract Shapes.jpg" 
 */

const upload = (destinationPath => multer({
  dest: destinationPath,
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, destinationPath),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
  })
}))(path.resolve(__dirname, "../public/upload"));

// const cors = require("cors");
/* GET home page. */
// router.use(cors());

router.get("/", (req, res, next) => {
  res.render("index", {
    title: "Express"
  });
});

router.post("/profile", upload.single("file"), async (req, res) => {
  let {
    file,
    params,
    query,
    body
  } = req;
  console.log(params);
  res.json({
    params,
    query,
    file,
    body,
    msg: "success"
  });
});

router.post("photos/upload", upload.array("photos", 12), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
});

var cpUpload = upload.fields([{
  name: "avatar",
  maxCount: 1
}, {
  name: "gallery",
  maxCount: 8
}]);

router.post("/cool-profile", cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array

  // req.body will contain the text fields, if there were any
});

module.exports = router;