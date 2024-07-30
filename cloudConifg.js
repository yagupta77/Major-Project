const cloudinary = require('cloudinary').v2;
const{ClodirnaryStorage} =  require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    
})