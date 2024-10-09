import { status } from "modules/_shared/utils";
import type { IAuthService } from "../service";
import type { Request } from "express";
import type { AutheticatedResponse } from "../types";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: AutheticatedResponse) => {
    const token = await this.authService.login(req.body);

    return res.status(status.HTTP_200_OK).json({ access_token: token });
  };
}
