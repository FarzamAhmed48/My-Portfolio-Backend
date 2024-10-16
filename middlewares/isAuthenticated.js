import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const isAuthenticated=(req,res,next)=>{
    try {
        const token=req.cookies.token
        console.log(token)
        if(!token){
            return res.status(200).json({
                success:false,
                message:"You need to login first"
            })
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
        if(!decoded){
            res.send("Something went wrong")
        }
        req.user=decoded.id
        next()
    } catch (error) {
        console.log(error)
    }
}
export default isAuthenticated