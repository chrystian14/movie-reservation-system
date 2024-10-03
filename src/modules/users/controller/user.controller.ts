import { status } from "modules/_shared/utils";
import type { IUserService } from "../service";
import type { Request, Response } from "express";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  create = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    const user = await this.userService.create({
      firstName,
      lastName,
      email,
      password,
    });

    return res.status(status.HTTP_201_CREATED).json(user);
  };
}
