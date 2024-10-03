import { app } from "../../../app";
import supertest from "supertest";

export const apiClient = supertest(app);
