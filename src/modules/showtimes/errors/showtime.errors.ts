import { UnprocessableEntity } from "modules/_shared/errors";

export class DatetimeInThePastError extends UnprocessableEntity {
  constructor(readonly message: string = "Datetime must be in the future") {
    super(message);
  }
}
