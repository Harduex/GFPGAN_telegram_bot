import { logger } from "../helpers/general";
import { Context } from "telegraf";
import { execSync } from "child_process";
import * as fs from "fs";
import axios from "axios";

export const upscaleImage = async (ctx: Context) => {
  await logger(`Started processing.. Please wait.`, ctx);

  const upsamplingScale: number = 2;
  const dataPath = process.env.DATA_PATH;
  execSync(
    `cd ${process.env.GFPGAN_PROJECT_PATH} \
     && python3 inference_gfpgan.py -i ${dataPath}/inputs/whole_imgs -o ${dataPath}/results -v 1.3 -s ${upsamplingScale.toString()}`
  );

  await logger(`Upscale process succeeded!`, ctx);
};

export const uploadImageFromTelegram = async (ctx, imageFileId, imagePath) => {
  await logger(`Uploading image to server`, ctx);
  const url = await ctx.telegram.getFileLink(imageFileId);
  return downloadImage(url, imagePath);
};

export const downloadImage = async (url: string, path) => {
  const writer = fs.createWriteStream(path);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

export const sendUpscaledImage = async (ctx, imagePath) => {
  await logger(`Upscaled image result:`, ctx);
  return ctx.replyWithPhoto({ source: imagePath });
};
