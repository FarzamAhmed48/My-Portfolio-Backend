import {Skill} from "../models/skill.model.js"
import { v2 as cloudinary } from "cloudinary"
export const addNewSkill=async(req,res)=>{
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(404).json({
                success:false,
                message:"Skill Icon/SVG is required!"})
        }

        const { svg} = req.files
        const {title,proficiency}=req.body
        if(!title || !proficiency){
            return res.status(404).json({
                success:false,
                message:"Skill title/Proficiency is required"
            })
        }
        const cloudinaryResponse = await cloudinary.uploader.upload(svg.tempFilePath, { folder: "PORTFOLIO_SKILLS" })
        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error("Cloudinary Error", cloudinaryResponse.error || "Unknown Cloudinary error")
        }

        const skill=await Skill.create({
            title,
            proficiency,
            svg:{
                public_id:cloudinaryResponse.public_id,
                url:cloudinaryResponse.secure_url
            }
        })

        return res.status(200).json({
            success:true,
            message:"New Skill Added!",
            skill
        })
    } catch (error) {
        console.log(error)
    }
}

export const deleteSkill=async(req,res)=>{
    try {
        const {id}=req.params
        const skill=await Skill.findById(id)
        if(!skill){
            return res.status(400).json({
                success:false,
                message:"Skill not found!"
            })
        }
        const skillSvgId=skill.svg.public_id
        await cloudinary.uploader.destroy(skillSvgId)
        await skill.deleteOne()
        return res.status(200).json({
            success:true,
            message:"Skill deleted successfully"
        })
    } catch (error) {
        console.log(error)
    }
}

export const updateSkill=async(req,res)=>{
    try {
        const {id}=req.params
        let skill=await Skill.findById(id)
        if(!skill){
            return res.status(400).json({
                success:false,
                message:"Skill not found!"
            })
        }
        const {proficiency}=req.body
        if(!proficiency){
            return res.status(400).json({
                success:false,
                message:"Please enter proficiency to update!"
            })
        }
        skill=await Skill.findByIdAndUpdate(id,{proficiency},{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })

        return res.status(200).json({
            success:true,
            message:"Skill Updated Successfully!",
            skill
        })
    } catch (error) {
        console.log(error)
    }
}

export const getAllSkills=async(req,res)=>{
    try {
        const skills=await Skill.find()
        return res.status(200).json({
            success:true,
            skills
        })
    } catch (error) {
        console.log(error)
    }
}