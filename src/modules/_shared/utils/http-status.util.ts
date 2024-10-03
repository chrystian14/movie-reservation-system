class HttpStatus {
  readonly HTTP_200_OK = 200;
  readonly HTTP_201_CREATED = 201;
  readonly HTTP_202_ACCEPTED = 202;
  readonly HTTP_204_NO_CONTENT = 204;

  readonly HTTP_400_BAD_REQUEST = 400;
  readonly HTTP_401_UNAUTHORIZED = 401;
  readonly HTTP_403_FORBIDDEN = 403;
  readonly HTTP_404_NOT_FOUND = 404;
  readonly HTTP_409_CONFLICT = 409;
  readonly HTTP_422_UNPROCESSABLE_ENTITY = 422;

  readonly HTTP_500_INTERNAL_SERVER_ERROR = 500;
}

export const status = new HttpStatus();
