import mongoose from "mongoose";

const messageSchema=mongoose.Schema({
    senderName:{
        type:String,
        minLenght:[2,"Name must contain atleast 2 characters"]
    },
    subject:{
        type:String,
        minLength:[2,"Subject must contain atleast 2 characters"]
    },
    message:{
        type:String,
        minLength:[2,"Message must contain atleast 2 characters"]
    },
    createdt:{
        type:Date,
        default:Date.now()
    }
})

export const Message=mongoose.model("Message",messageSchema)

