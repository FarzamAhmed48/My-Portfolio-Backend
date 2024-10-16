import express from "express"
import {addNewProject,deleteProject,getAllProjects,updateProject,getSingleProject} from "../controllers/project.controller.js"
import isAuthenticated from "../middlewares/isAuthenticated.js"
const router=express.Router()

router.post("/add",isAuthenticated,addNewProject)
router.delete("/delete/:id",isAuthenticated,deleteProject)
router.put("/update/:id",isAuthenticated,updateProject)
router.get("/getAll",getAllProjects)
router.get("/get/:id",getSingleProject)

export default router