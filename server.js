const express = require("express");
const BodyParser = require("body-parser");
const dotenv = require('dotenv');

const path = require("path");
const multer = require("multer");

dotenv.config();
var app = express();
app.use(BodyParser.json({limit:'100mb'}));
app.use(BodyParser.urlencoded({ extended: true }));

app.set("view engine",'ejs');
app.set('view',path.join(__dirname,'views'));

var logger = (req,res,next)=>{
    console.log(req.originalUrl);
    next();
  }

app.use(logger);

app.use('/postimages', express.static(__dirname + '/postimages'));
app.use('/postvideos', express.static(__dirname + '/postvideos'));

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      
      const ext = file.mimetype.split("/")[1];
      if(ext==='mp4'){
        cb(null, "postvideos");
        return;
      }
      cb(null, "postimages");
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `post-${Date.now()}.${ext}`);
    },
  });
const multerFilter = (req, file, cb) => {
  
  cb(null, true);
    // if (file.mimetype.split("/")[1] === "png") {
    //   cb(null, true);
    // } else {
    //   cb("not a file", false);
    // }
  };
    
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  }).array('photo'); 
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("listening on hello :: " + PORT);
});


app.post('/uploadpostimage',async(req,res)=>{
    upload(req,res,(err)=>{
        if(!err){
            var imageUrls = [];
            var videoUrls = [];
            req.files.forEach(element => {
              const ext = element.mimetype.split("/")[1];
              if(ext==='mp4'){
                videoUrls.push(process.env.POST_VIDEOS_URL+element.filename);
              }
              else{
                imageUrls.push(process.env.POST_IMAGES_URL+element.filename);
              }
            });
            res.status(200).json({images:imageUrls,videos:videoUrls});
        }
        else{
            res.status(409).json(err);
        }
    })
});