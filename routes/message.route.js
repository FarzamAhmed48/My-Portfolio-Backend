import express from "express"
import { deleteMessage, getAllMessages, sendMessage } from "../controllers/message.controller.js"
import isAuthenticated from "../middlewares/isAuthenticated.js"
const router=express.Router()

router.post("/send",sendMessage)
router.get("/getAllMessages",getAllMessages)
router.delete("/delete/:id",isAuthenticated,deleteMessage)

export default router