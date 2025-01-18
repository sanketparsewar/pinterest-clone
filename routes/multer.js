const multer = require("multer");
const path = require("path");

// console.log(path.extname('help.txt'))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images/uploads");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });
module.exports = upload;

