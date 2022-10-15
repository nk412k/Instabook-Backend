const jwt=require('jsonwebtoken');
const HttpError = require("../models/http-error");

const authCheck=(req,res,next)=>{
    if(req.method=='OPTIONS'){
        return next();
    }
    try{
        const token=req.headers.authorization.split(' ')[1];
        if(!token){
            console.log(token);
            throw new Error('Authotization failed');
        }
        const decodedToken=jwt.verify(token,'somesecret');
        console.log(decodedToken);
        req.userData={userId:decodedToken.userId};
        next(); 
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Authentication failed ',401));
    }
}

module.exports=authCheck;