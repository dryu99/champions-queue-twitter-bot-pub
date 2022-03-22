import logger from "../utils/logger";
import puppeteer from "puppeteer";

const savePng = async (
  html: string,
  savePath: string,
  dimensions: { width: number; height: number } = { width: 706, height: 394 }
): Promise<void> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: dimensions.width,
    height: dimensions.height,
    deviceScaleFactor: 3, // higher means more hd images
  });
  await page.setContent(html, { waitUntil: ["networkidle0"] });

  logger.info("Saving png");
  await page.screenshot({ path: savePath });
  await browser.close();
};

const ImageService = {
  savePng,
};

export default ImageService;
