export const generateToken=async(user,message,statusCode,res)=>{
    const token=await user.generateJsonWebToken()
    if (res.headersSent) {
        return;
    }
    res.status(statusCode).cookie("token",token,{
        httpOnly:true,
        sameSite:"None",
        secure:true,
    }).json({
        success:true,
        message,
        token,
        user
    })
}

