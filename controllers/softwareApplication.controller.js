import {SoftwareApplication} from "../models/softwareApplication.model.js"
import { v2 as cloudinary } from "cloudinary"

export const addNewApplication=async(req,res)=>{
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(404).json({
                success:false,
                message:"Application Icon/SVG is required!"})
        }

        const { svg} = req.files
        const {name}=req.body
        if(!name){
            return res.status(404).json({
                success:false,
                message:"Application name is required"
            })
        }
        const cloudinaryResponse = await cloudinary.uploader.upload(svg.tempFilePath, { folder: "AppSVG" })
        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error("Cloudinary Error", cloudinaryResponse.error || "Unknown Cloudinary error")
        }

        const softwareApplication=await SoftwareApplication.create({
            name,
            svg:{
                public_id:cloudinaryResponse.public_id,
                url:cloudinaryResponse.secure_url
            }
        })

        return res.status(200).json({
            success:true,
            message:"New Software Application Added!",
            softwareApplication
        })
    } catch (error) {
        console.log(error)
    }
}

export const deleteApplication=async(req,res)=>{
    try {
        const {id}=req.params
        const softwareApplication=await SoftwareApplication.findById(id)
        if(!softwareApplication){
            return res.status(400).json({
                success:false,
                message:"Software Applcation not found!"
            })
        }
        const softwareApplicationSvgId=softwareApplication.svg.public_id
        await cloudinary.uploader.destroy(softwareApplicationSvgId)
        await softwareApplication.deleteOne()
        return res.status(200).json({
            success:true,
            message:"Software Application deleted successfully"
        })
    } catch (error) {
        console.log(error)
    }
}

export const getAllApplications=async(req,res)=>{
    try {
        const softwareApplications=await SoftwareApplication.find()
        return res.status(200).json({
            success:true,
            softwareApplications
        })
    } catch (error) {
        console.log(error)
    }
}