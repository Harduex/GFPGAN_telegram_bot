import "dotenv/config";
import { Telegraf } from "telegraf";
import { removeDir } from "./helpers/general";
import {
  sendMultipleImages,
  sendUpscaledImage,
  uploadImageFromTelegram,
  upscaleImage,
} from "./services/imagesService";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
  handlerTimeout: 900000,
});
bot.start((ctx) => ctx.reply("Welcome"));
bot.help(async (ctx) => {
  await ctx.reply("Send image to upscale");
  await ctx.reply("/cropped_faces - get cropped faces");
  await ctx.reply("/restored_faces - get restored faces");
  await ctx.reply("/cmp - get compared faces");
});

const dataPath = process.env.DATA_PATH;

bot.on("photo", async (ctx) => {
  // Remove data dir before new processing
  removeDir(dataPath);

  const imageFileId = ctx.message.photo.pop();
  const inputImagePath = `${dataPath}/inputs/whole_imgs/sample_image.png`;
  const outputImagePath = `${dataPath}/results/restored_imgs/sample_image.png`;

  await uploadImageFromTelegram(ctx, imageFileId, inputImagePath);
  await upscaleImage(ctx);
  await sendUpscaledImage(ctx, outputImagePath);
});

bot.command("cropped_faces", async (ctx) => {
  const croppedFacesPath = `${dataPath}/results/cropped_faces`;
  await sendMultipleImages(ctx, croppedFacesPath);
});

bot.command("restored_faces", async (ctx) => {
  const restoredFacesPath = `${dataPath}/results/restored_faces`;
  await sendMultipleImages(ctx, restoredFacesPath);
});

bot.command("cmp", async (ctx) => {
  const comparedFacesPath = `${dataPath}/results/cmp`;
  await sendMultipleImages(ctx, comparedFacesPath);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Start bot server
(async () => {
  bot.launch().then(() => {
    console.log(
      "Image Upscaler started. Send /help from your telegram bot for help."
    );
  });
})();
