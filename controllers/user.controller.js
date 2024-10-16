import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary"
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt"
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"
export const register = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Avatar and Resume required!"), 400)
    }
    const { avatar, resume } = req.files
    const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, { folder: "AVATARS" })

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error", cloudinaryResponse.error || "Unknown Cloudinary error")
    }


    const cloudinaryResponseResume = await cloudinary.uploader.upload(resume.tempFilePath, { folder: "RESUME" })

    if (!cloudinaryResponseResume || cloudinaryResponseResume.error) {
        console.error("Cloudinary Error", cloudinaryResponseResume.error || "Unknown CloudinaryResume error")
    }


    const { fullName, email, phone, aboutMe, password, portfolioURL, githubURL, instagramURL, facebookURL, linkedInURL } = req.body

    const user = await User.create({
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        instagramURL,
        facebookURL,
        linkedInURL,
        avatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.url
        },
        resume: {
            public_id: cloudinaryResponseResume.public_id,
            url: cloudinaryResponseResume.url
        }
    })
    generateToken(user, "User registered Successfully", 200, res)
})




export const login = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token=req.cookies.token
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials",
                success: false
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid Credentials",
                success: false
            });
        }
        generateToken(user, "Logged in Successfully", 200, res)
    } catch (error) {
        console.log(error)
    }
})

export const logout=(req,res)=>{
    try {
        res.cookie("token", "", { httpOnly: true, expires: new Date(0)});
        return res.status(200).json({
            message:"Logged out Successfully",
            success:true,
            
        });
    } catch (error) {
        console.log(error)
    }
}

export const getUser=async(req,res)=>{
    const user=await User.findById(req.user)
    res.status(200).json({
        success:true,
        user
    })
}

export const updateProfile=async(req,res)=>{
    const updatedUserData={
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        password: req.body.password,
        portfolioURL: req.body.portfolioURL,
        githubURL: req.body.githubURL,
        instagramURL: req.body.instagramURL,
        facebookURL: req.body.facebookURL,
        linkedInURL: req.body.linkedInURL,
    }

    if(req.files && req.files.avatar){
        const avatar=req.files.avatar
        const user=await User.findById(req.user)
        const profileImageURL=user.avatar.public_id
        await cloudinary.uploader.destroy(profileImageURL)
        const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, { folder: "AVATARS" })


        updatedUserData.avatar={
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.url
        }
    }


    if(req.files && req.files.resume){
        const resume=req.files.resume
        const user=await User.findById(req.user)
        const resumeId=user.resume.public_id
        await cloudinary.uploader.destroy(resumeId)
        const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, { folder: "RESUME" })


        updatedUserData.resume={
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.url
        }
    }


    const user=await User.findByIdAndUpdate(req.user,updatedUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        message:"User Updated Successfully!",
        user
    })
}

export const updatePassword=async(req,res)=>{
    try {
        const {currentPassword,newPassword,confirmNewPassword}=req.body
        if(!currentPassword || !newPassword || !confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const user=await User.findById(req.user).select("+password")
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid Current Password",
                success: false
            });
        }
        if(newPassword !==confirmNewPassword){
            return res.status(400).json({
                message:"New and Confirm new passwords do not match",
                success:false
            })
        }
        user.password=newPassword
        await user.save()
        res.status(200).json({
            success:true,
            message:"Password Updated Successfully"
        })
    } catch (error) {
        console.log(error)
    }
}

export const getUserForPortfolio=async(req,res)=>{
    try {
        const id="670e71f7be241a36574dca1f"
        const user=await User.findById(id)
        res.status(200).json({
            success:true,
            user,
        })
    } catch (error) {
        console.log(error)
    }
}

export const forgotPassword=async(req,res)=>{
    try {
        const user=await User.findOne({email:req.body.email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        const resetToken=user.getResetPasswordToken();
        await user.save({ValidateBeforeSave:false})
        const resetPasswordURL=`${process.env.DASHBOARD_URL}/password/reset/${resetToken}`
        const message=`Your Reset Password Token is:- \n\n ${resetPasswordURL} \n\n If you have not requested for this, please ignore `

        try {
            await sendEmail({
                email:user.email,
                subject:"Portfolio Dashboard Password Recovery",
                message
            })
    
            res.status(200).json({
                success:true,
                message:`Email sent to ${user.email} successfully`
            })     
        } catch (error) {
            user.resetPasswordToken=undefined
            user.resetPasswordExpire=undefined
            await user.save()
        }
    } catch (error) {
        console.log(error)
    }
}



export const resetPassword=async(req,res)=>{
    try {
        const {token}=req.params
        const resetPasswordToken=crypto.createHash("sha256").update(token).digest('hex')

        const user=await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt:Date.now()}
        })

        if(!user){
            return res.status(400).json({
                success:false,
                message:"Reset token is invalid or has been expired!"
            })
        }
        if(!req.body.password){
            return res.status(400).json({
                success:false,
                message:"Please enter password or confirm password"
            })
        }
        if(req.body.password !== req.body.confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password do not match"
            })
        }
        user.password=req.body.password
        user.resetPasswordExpire=undefined
        user.resetPasswordToken=undefined
        await user.save()
        return generateToken(user,"Password Reset Successfully!",200,res)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}