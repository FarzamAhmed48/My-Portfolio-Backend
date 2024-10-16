import mongoose from "mongoose";

const dbConnection=()=>{
    mongoose.connect(`${process.env.MONGO_URI}`)
    .then(()=>{
        console.log("MongoDB Connected ")
    }).catch((error)=>{
        console.log(`Some Error Occured:${error}`)
    })
}

export default dbConnection;