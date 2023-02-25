import { Request, Response } from "express";

const handleRoom = async (req: Request, res: Response) => {
  try {
    res.send(`room, user id: ${(req.session as any).user.id}`);
  } catch (error) {
    return error;
  }
};

export default {
  handleRoom,
};
