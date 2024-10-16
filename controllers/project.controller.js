import {Project} from "../models/project.model.js"
import { v2 as cloudinary } from "cloudinary"
export const addNewProject=async(req,res)=>{
    try {
        if(!req.files || Object.keys(req.files).length === 0 ){
            return res.status(400).json({
                success:false,
                message:"Project Banner Image Required!"
            })
        }

        const {projectBanner}=req.files
        const {title,description,gitRepoLink,projectLink,technologies,stack,deployed}=req.body
         if(!title || !description || !gitRepoLink || !projectLink || !technologies || !stack || !deployed){
            return res.status(400).json({
                success:false,
                message:"Fill all the fields to create a project"
            })
         }

         const cloudinaryResponse=await cloudinary.uploader.upload(projectBanner.tempFilePath,{folder:"PORTFOLIO_PROJECT_BANNERS"})
         if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error("Cloudinary Error", cloudinaryResponse.error || "Unknown Cloudinary error")
            return res.status(500).json({
                success:false,
                message:"Failed to upload project banner!"
            })
        }
        

        const project=await Project.create({
            title,
            description,
            gitRepoLink,
            projectLink,
            technologies,
            stack,
            deployed,
            projectBanner:{
                public_id:cloudinaryResponse.public_id,
                url:cloudinaryResponse.secure_url
            }
        })


        return res.status(200).json({
            success:true,
            message:"Project Added Successfully!",
            project
        })
    } catch (error) {
        console.log(error)
    }
}

export const updateProject=async(req,res)=>{
    try {
        const newProjectData={
            title :req.body.title,
            description :req.body.description,
            gitRepoLink :req.body.gitRepoLink,
            projectLink :req.body.projectLink,
            technologies :req.body.technologies,
            stack :req.body.stack,
            deployed :req.body.deployed,
        }

        if(req.files && req.files.projectBanner){
            const projectBanner=req.files.projectBanner
            const project=await Project.findById(req.params.id)
            const projectBannerURL=project.projectBanner.public_id
            await cloudinary.uploader.destroy(projectBannerURL)
            const cloudinaryResponse = await cloudinary.uploader.upload(projectBanner.tempFilePath, { folder: "PORTFOLIO_PROJECT_BANNERS" })
    
    
            newProjectData.projectBanner={
                public_id:cloudinaryResponse.public_id,
                url:cloudinaryResponse.url
            }
        }

        const project=await Project.findByIdAndUpdate(req.params.id,newProjectData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })

        return res.status(200).json({
            success:true,
            message:"Project Updated Successfully!",
            project
        })
    } catch (error) {
        console.log(error)
    }
}


export const deleteProject=async(req,res)=>{
    try {
        const {id}=req.params
        const project=await Project.findById(id)
        if(!project){
            return res.status(400).json({
                success:false,
                message:"Project not found!"
            })
        }
        await project.deleteOne()
        return res.status(200).json({
            success:true,
            message:"Project deleted successfully!"
        })
    } catch (error) {
        console.log(error)
    }
}


export const getAllProjects=async(req,res)=>{
    try {
        const projects=await Project.find()
        return res.status(200).json({
            success:true,
            projects
        })
    } catch (error) {
        console.log(error)
    }
}

export const getSingleProject=async(req,res)=>{
    try {
        const {id}=req.params
        const project=await Project.findById(id)
        if(!project){
            return res.status(400).json({
                success:false,
                message:"Project not found!"
            })
        }
        return res.status(200).json({
            success:true,
            project
        })
    } catch (error) {
        console.log(error)
    }
}