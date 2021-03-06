import { RequestHandler, Router } from "express";
import prisma from "../db";
import multer, { memoryStorage } from "multer";
import { pictureInputValidator, propertyIdValidator } from "./validators";
import authMiddleware from "../middlewares/auth.middleware";

export class PictureController {
  static upload = multer({ dest: "/uploads", storage: memoryStorage() }).single(
    "image"
  );

  static getPictureById: RequestHandler = async (req, res) => {
    let { pictureId } = req.body;
    let picture = await prisma.picture.findFirst({
      where: {
        id: pictureId,
      },
      select: {
        id: true,
        isMain: true,
        propertyId: true,
      },
    });
    res.send(picture);
  };

  static getPicturesByProperty: RequestHandler = async (req, res) => {
    let { propertyId } = req.body;
    let pictures = await prisma.picture.findMany({
      where: {
        propertyId,
      },
      select: {
        id: true,
        isMain: true,
        propertyId: true,
      },
    });
    res.send(pictures);
  };

  static createPicture: RequestHandler = async (req, res) => {
    let { propertyId, isMain } = req.body;

    let picture = await prisma.picture.create({
      data: {
        propertyId: parseInt(propertyId),
        isMain,
        data: Buffer.from(req.file?.buffer ?? ""),
      },
      select: {
        id: true,
        isMain: true,
        propertyId: true,
      },
    });

    res.send(picture);
  };

  static getPicture: RequestHandler = async (req, res) => {
    let { pictureId } = req.params;
    let picture = await prisma.picture.findFirst({
      where: {
        id: parseInt(pictureId),
      },
      select: {
        data: true,
      },
    });
    res.send(picture?.data);
  };

  static route = "/picture";

  static setup = () => {
    const router = Router();
    router.post(
      "/new",
      authMiddleware,
      this.upload,
      // pictureInputValidator,
      this.createPicture
    );
    router.post(
      "/byProperty",
      authMiddleware,
      propertyIdValidator,
      this.getPicturesByProperty
    );
    router.post("/single", propertyIdValidator, this.getPictureById);
    router.get("/get/:pictureId", this.getPicture);

    return router;
  };
}
