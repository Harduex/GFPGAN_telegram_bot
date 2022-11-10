import "dotenv/config";
import { Telegraf } from "telegraf";
import {
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
});

bot.hears("hi", (ctx) => ctx.reply("Hey there"));

bot.on("photo", async (ctx) => {
  const imageFileId = ctx.message.photo.pop();
  const dataPath = process.env.DATA_PATH;
  const inputImagePath = `${dataPath}/inputs/whole_imgs/sample_image.png`;
  const outputImagePath = `${dataPath}/results/restored_imgs/sample_image.png`;

  await uploadImageFromTelegram(ctx, imageFileId, inputImagePath);
  await upscaleImage(ctx);
  await sendUpscaledImage(ctx, outputImagePath);
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
