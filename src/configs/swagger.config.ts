import { Router } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Sistema de Reserva de Cinema",
      version: "1.0.0",
    },
  },
  apis: ["./src/modules/**/docs/*.swagger.yaml"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const swaggerRouter = Router();
swaggerRouter.use("", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
