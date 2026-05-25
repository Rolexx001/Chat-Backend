export const validate=(schema)=>(req,res,next)=>{
    const result=schema.safeParse(req.body);
    if(!result.success){
        const errors = result.error.errors.map(err => ({
            field: err.path[0],
            message: err.message,
        }));
        return res.status(400).json({
            success: false,
            errors,
        });
    }
    req.body=result.data;
    next();

}