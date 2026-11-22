import express from "express";
import oniController from "../controllers/oni.controller.js";
// import authMiddleware from "../middlewares/auth.Middleware.js";
// import roleMiddleware from "../middlewares/role.Middleware.js";
// import  Role  from "../../1_Domain/entities/Role.js";

const router = express.Router();

router.get("/all", oniController.getAll);
router.get("/duplicatedData", oniController.findDuplicatedData);
router.get("/range", oniController.getByRange);


router.get("/latest", oniController.latest);



export default router;