import { status } from "modules/_shared/utils";
import type { IAuthService } from "../service";
import type { Request, Response } from "express";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response) => {
    const token = await this.authService.login(req.body);

    return res.status(status.HTTP_200_OK).json({ token });
  };
}
