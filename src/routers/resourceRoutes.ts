import { Router } from "express";
import * as resourceController from "../contorllers/resourcesController"
const router = Router();


router.post("/getUser" , resourceController.getUserInfo)

export default router