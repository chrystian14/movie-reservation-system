import { clearDatabase } from "configs/jest-setup.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import {
  ShowtimeRepository,
  type IShowtimeRepository,
} from "modules/showtimes/repository";
import { type ShowtimeCreateInput } from "modules/showtimes/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: ShowtimeControler.create - POST /api/v1/showtimes", () => {
  const showtimeEndpoint = "/api/v1/showtimes";

  let showtimeBuilder: ShowtimeBuilder;
  let showtimeCreateInput: ShowtimeCreateInput;

  let regularUserToken: string;
  let adminUserToken: string;

  let showtimeRepository: IShowtimeRepository;

  beforeEach(async () => {
    await clearDatabase();

    showtimeRepository = new ShowtimeRepository();

    showtimeBuilder = new ShowtimeBuilder();
    showtimeCreateInput = showtimeBuilder.requiredForCreation();

    const userRepository = new UserRepository();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userRepository);
    adminUserToken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .send(showtimeCreateInput);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeRepository.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(showtimeCreateInput);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeRepository.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return an error when creating a showtime with admin user but without required fields", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["datetime"],
          message: "Required",
        },
        {
          field: ["movieId"],
          message: "Required",
        },
        {
          field: ["roomId"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeRepository.count();
    expect(showtimeCount).toBe(0);
  });
});
