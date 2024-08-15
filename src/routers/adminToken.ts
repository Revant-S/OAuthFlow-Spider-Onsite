import { Router } from "express";
import * as adminTokenHandlers from "../contorllers/adminToken"

const router = Router()

router.post("/getAdminToken", adminTokenHandlers.getAdminToken)


export default router