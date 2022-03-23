import logger from "../utils/logger";
import puppeteer from "puppeteer";
import Config from "../utils/config";

const savePng = async (
  html: string,
  dimensions: { width: number; height: number },
  savePath?: string
): Promise<Buffer> => {
  logger.info("Saving PNG");

  const launchOptions =
    Config.NODE_ENV === "production"
      ? {
          // needed for vultr server
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath: "/usr/bin/chromium-browser",
        }
      : {};
  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  await page.setViewport({
    width: dimensions.width,
    height: dimensions.height,
    deviceScaleFactor: 3, // higher means more hd images
  });
  await page.setContent(html, { waitUntil: ["networkidle0"] });

  const buffer = await page.screenshot({
    type: "png",
    encoding: "binary",
    path: savePath,
  });

  await browser.close();
  logger.info("Done Saving PNG");
  return buffer as Buffer;
};

const ImageService = {
  savePng,
};

export default ImageService;
