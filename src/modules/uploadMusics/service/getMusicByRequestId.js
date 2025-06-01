import catchAsync from "../../../utils/catchAsync.js";
import MusicAnalysis from "../../musicAnalysis/model/musicAnalysis.model.js";
import { getAnalysisResponse } from "../../musicAnalysis/services/getMusicFromExternal.js";
import UploadMusics from "../model/uploadMusics.model.js";

export const getMusicByReqId = catchAsync(async (req, res, next) => {
    const { requestId } = req.params;

        const music = await MusicAnalysis.findOne({
            where: { request_id: requestId }
        });

        if (!music) {
            const analysisResponse = await getAnalysisResponse(requestId);
            if (analysisResponse) {
                const newMusic = await MusicAnalysis.create({
                    request_id: requestId,
                    uplifting: analysisResponse.Uplifting,
                    distracting: analysisResponse.Distracting,
                    destressing: analysisResponse.Destressing,
                    reappraisal: analysisResponse.Reappraisal,
                    motivating: analysisResponse.Motivating,
                    relaxing: analysisResponse.Relaxing,
                    suppressing: analysisResponse.Suppressing,
                    user_id: req.user.id
                });

                // Update the upload music record
                await UploadMusics.update(
                    { is_analyzed: true },
                    { where: { request_id: requestId } }
                );

                return newMusic;
            }
            return null;
        }

        // Update the upload music record if it exists
        await UploadMusics.update(
            { is_analyzed: true },
            { where: { request_id: requestId } }
        );

        return music;
   
})