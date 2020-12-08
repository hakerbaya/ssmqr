const multer = require("multer");

// Disk Storage For Multer (File Uploads)
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/uploads/');
    },

    filename: function(req,file,cb){
        cb(null,file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 51200000},
    fileFilter: function(req,file,cb){
        let extension = path.extname(file.originalname);
        if(extension!== '.png' && extension!== '.jpg' && extension!== '.jpeg' && extension !==".xls" && extension !== ".csv"){
            return cb(new Error('Only Images are allowed'));
        }
        cb(null,true); 
    }
}).single('pic');

module.exports = multer;