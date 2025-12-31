import { Router } from "express";
import { createLoginMiddleware } from "../middleware/auth/login";
import { createRegisterMiddleware } from "../middleware/auth/register";

const router = Router();

router.post("/register", createRegisterMiddleware());
router.post("/login", createLoginMiddleware());

export default router;
