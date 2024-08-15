import { Router } from "express";
import * as registerController from "../contorllers/client"
const router = Router();

router.post("/", registerController.registerApp)



export default router