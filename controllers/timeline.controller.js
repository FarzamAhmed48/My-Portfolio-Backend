import {Timeline} from "../models/timeline.model.js"
export const postTimeline=async(req,res)=>{
    try {
        const {title,description,from,to}=req.body
        if (!title || !description ){
            return res.status(404).json({
                success:false,
                message:"Title and description required"
            })
        }
        const newTimeline=await Timeline.create({
            title,description,
            timeline:{from,to}
        })
        return res.status(200).json({
            success:true,
            message:"Timeline Added!",
            newTimeline
        })
    } catch (error) {
        res.send(error)
    }
}

export const deleteTimeline=async(req,res)=>{
    try {
        const {id}=req.params
        const timeline=await Timeline.findById(id)
        if (!timeline){
            return res.status(404).json({
                success:false,
                message:"Timeline not found"
            })
        }
        await timeline.deleteOne()
        return res.status(200).json({
            success:true,
            message:"Timeline deleted Successfully!",

        })
    } catch (error) {
        console.log(error)
    }
}


export const getAllTimelines=async(req,res)=>{
    try {
        const timelines=await Timeline.find()
        return res.status(200).json({
            success:true,
            timelines
        })
    } catch (error) {
        console.log(error)
    }
}