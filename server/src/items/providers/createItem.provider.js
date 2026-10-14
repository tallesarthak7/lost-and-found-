const Item = require("../items.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const logger = require("../../helpers/winston.helper.js");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function createItemProvider(req, res) {
  console.log(req.user.sub);
  console.log(req.body);
  const validData = matchedData(req);

  try {
    const { lat, lng, keywords,imageURL, ...rest } = validData;

    const fullPath = req.file ? req.file.path : null;
    const imagepath = fullPath
      ? fullPath.substring(fullPath.indexOf("uploads"))
      : null;

    // Build the item payload
    const payload = {
      ...rest,
      postedBy: req.user.sub,

      // keywords comes in as a comma-separated string from FormData
      // the validator's customSanitizer converts it to an array,
      // but if it's still a string here, handle both cases safely
      keywords: Array.isArray(keywords)
        ? keywords
        : keywords
        ? String(keywords).split(",").map((k) => k.trim()).filter(Boolean)
        : [],

      // map flat lat/lng → nested coordinates (only if both are present)
      ...(lat && lng && {
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
      }),

      
      imageURL: imagepath,
    };

    const item = new Item(payload);
    await item.save();

    logger.info("Item created successfully", {
      userId: req.user.sub,
      itemId: item._id,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Item created successfully",
      data: item,
    });

  } catch (error) {
    console.log(error);
    errorLogger("Error while creating item: ", req, error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      reason: "Unable to process your request at the moment, please try later.",
    });
  }
}

module.exports = createItemProvider;