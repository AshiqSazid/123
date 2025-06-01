import catchAsync from "../../../utils/catchAsync.js";
import SendResponse from "../../../utils/SendResponse.js";
import UploadMusics from "../../uploadMusics/model/uploadMusics.model.js";
import MusicAnalysis from "../model/musicAnalysis.model.js";
import { getAnalysisResponse } from "../services/getMusicFromExternal.js";

export const getMusicByRequestId = catchAsync(async (req, res, next) => {
    const { requestId } = req.params;
    // Validate requestId exists
    if (!requestId) {
        return res.status(400).json(new SendResponse(400, "Request ID is required", null, false));
    }

        const music = await MusicAnalysis.findOne({
            where: {
                request_id: requestId
            }
        });

        if (!music) {
            const analysisResponse = await getAnalysisResponse(requestId);
            if (analysisResponse) {
                const newMusic = await MusicAnalysis.create({
                    request_id: requestId,
                    uplifting: analysisResponse.Uplifting,
                    distracting: analysisResponse.Distracting,
                    reappraisal: analysisResponse.Reappraisal,
                    motivating: analysisResponse.Motivating,
                    relaxing: analysisResponse.Relaxing,
                    suppressing: analysisResponse.Suppressing,
                    user_id: req.user.id
                })
                return res.status(200).json(new SendResponse(200, "Music analysis found", newMusic));
            }
            return res.status(404).json(new SendResponse(200, "Music not found", null, false));
        }
        const uploadMusic = await UploadMusics.findOne({
            where: {
                request_id: requestId
            }
        });
        if (uploadMusic) {
            await uploadMusic.update({
                is_analyzed: true
            });
        }

        return res.status(200).json(new SendResponse(200, "Music found", music));

});

