import { Router } from "express";
import * as authControllers from "../contorllers/authoriseControllers"
import { verifyAdminToken } from "../middleware/tokenVerification";
const router = Router();

router.post("/authorizeClient",
    verifyAdminToken,   
    authControllers.verifyUser,
    authControllers.authorize)
router.post("/getToken", authControllers.getAuthToken)



export default router