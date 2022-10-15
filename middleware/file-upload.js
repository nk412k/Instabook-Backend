const multer=require('multer');
const {v1:uuid}=require('uuid');

const MIME_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}

const fileUpload=multer({
    limits:50000,
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,'upload/images');
        },
        filename:(req,file,cb)=>{
            const ext=MIME_TYPE_MAP[file.mimetype]
            cb(null,uuid()+'.'+ext);
        }
    }),
    fileFilter:(req,file,cb)=>{
        const isValid=!!MIME_TYPE_MAP[file.mimetype];
        const error=isValid? null : new Error('invalid file type');
        cb(error,isValid);
    },
});

module.exports=fileUpload;
