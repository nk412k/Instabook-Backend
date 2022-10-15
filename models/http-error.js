class HttpError extends Error{
    constructor(errorMessage,code){
        super(errorMessage);
        this.code=code
    }
}

module.exports=HttpError;