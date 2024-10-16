import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/message.model.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
    const { senderName, subject, message } = req.body
    if (!senderName || !subject || !message) {
        return next(new ErrorHandler("Please fill all fields", 400))
    }
    const data = await Message.create({
        senderName,
        subject,
        message
    })

    res.status(200).json({
        success: true,
        message: "Messaage Sent",
        data
    })
})

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
    const messages = await Message.find()
    res.status(200).json({
        success: true,
        messages
    })
})
export const deleteMessage = async(req, res) => {
    try {
        const { id } = req.params

        const message = await Message.findById({ _id:id })

        if (!message) {
            return res.status(400).json({
                success:false,
                message:"Message not found"
            })
        }
        await message.deleteOne()
        res.status(200).json({
            success: true,
            message: "Message Deleted Successfully"
        })
    } catch (error) {
        console.log(error)
    }
}

