import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    errorMessage: "404 - Not Found",
  });
});

export default router;
