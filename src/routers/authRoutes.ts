import { Router } from "express";
import * as authControllers from "../contorllers/authoriseControllers"
const router = Router();

router.post("/authorizeClient", authControllers.verifyUser , authControllers.authorize)
router.post("/getToken", authControllers.getAuthToken)



export default router