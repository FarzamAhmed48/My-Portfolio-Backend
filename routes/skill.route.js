import express from "express"
import {addNewSkill,deleteSkill,getAllSkills,updateSkill} from "../controllers/skill.controller.js"
import isAuthenticated from "../middlewares/isAuthenticated.js"
const router=express.Router()

router.post("/add",isAuthenticated,addNewSkill)
router.delete("/delete/:id",isAuthenticated,deleteSkill)
router.put("/update/:id",isAuthenticated,updateSkill)
router.get("/getAll",getAllSkills)

export default router