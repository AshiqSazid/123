import catchAsync from "../../../utils/catchAsync.js";
import SendResponse from "../../../utils/SendResponse.js";
import FeatureSettings from "../model/featureSettings.model.js";
import { validationResult } from "express-validator";

export const getFeatureSettings = catchAsync(async (req, res) => {
    const settings = await FeatureSettings.findOne();

    if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await FeatureSettings.create({});
        return res.status(200).json({
            success: true,
            data: defaultSettings.settings
        });
    }
    return res.status(200).json(new SendResponse(200, "Feature settings found", settings.settings));
});


// Update feature settings
export const updateFeatureSettings = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(new SendResponse(400, "Validation error", errors.array(), false));
    }
    const { settings } = req.body;

    // Find the first record
    let featureSettings = await FeatureSettings.findOne();

    if (!featureSettings) {
        // Create new record if none exists
        featureSettings = await FeatureSettings.create({ settings });
    } else {
        // Merge existing settings with new updates
        const updatedSettings = {
            ...featureSettings.settings,
            ...settings
        };

        // Update the record
        featureSettings.settings = updatedSettings;
        await featureSettings.save();
    }
    res.status(200).json(new SendResponse(200, "Feature settings updated successfully", featureSettings.settings));
};