import * as env from "dotenv";
import fs from "fs";
import path from "path";
import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { CHUNKS_DIR, mergeChunks, MERGED_FILES_DIR } from "../service/mergeChunks.js";
import SendResponse from "../../../utils/SendResponse.js";
import { getRequestId, uploadChunkToExternalService } from "../service/externalUpload.js";
import UploadMusics from "../model/uploadMusics.model.js";
import { getMusicByReqId } from "../service/getMusicByRequestId.js";
env.config();

// Upload route to handle multiple chunks
// export const uploadMusic = catchAsync(async (req, res, next) => {
//     const { chunkNumber, totalChunks, originalname, uniqueId } = req.body;
//     const chunk = req.file.buffer;

//     // Validate chunkNumber starts at 1
//     if (
//       !chunk || 
//       isNaN(chunkNumber) || 
//       chunkNumber < 1 ||  // Ensure chunkNumber >= 1
//       isNaN(totalChunks) || 
//       !originalname || 
//       !uniqueId
//     ) {
//       throw new AppError('Invalid upload parameters', 400);
//     }

//     const uploadDir = `${CHUNKS_DIR}/${uniqueId}`;
//     await fs.promises.mkdir(uploadDir, { recursive: true });

//     // Save chunk with 1-based naming (NO UNDERSCORE)
//     const chunkPath = `${uploadDir}/${originalname}.part${chunkNumber}`;
//     await fs.promises.writeFile(chunkPath, chunk);

//     try {
//       const requestId = await getRequestId();
//       await uploadChunkToExternalService(
//         chunk,
//         originalname,
//         Number(chunkNumber),
//         Number(totalChunks),
//         requestId
//       );

//       // Check for LAST CHUNK (1-based)
//       if (Number(chunkNumber) === Number(totalChunks)) {
//         await fs.promises.mkdir(MERGED_FILES_DIR, { recursive: true });
//         const mergedFilePath = path.join(MERGED_FILES_DIR, originalname);

//         // Merge chunks from 1 to totalChunks
//         await mergeChunks(uploadDir, originalname, totalChunks, mergedFilePath);

//         // Verify merged file
//         await fs.promises.access(mergedFilePath, fs.constants.F_OK);

//         const music = await UploadMusics.create({
//           title: originalname,
//           music_file_path: mergedFilePath,
//           user_id: req.user.id,
//           request_id: requestId
//         });

//         // Cleanup
//         await fs.promises.rm(uploadDir, { recursive: true, force: true });
//         return res.status(201).json(
//           new SendResponse(201, "File merged successfully", music)
//         );
//       }

//       return res.status(200).json(
//         new SendResponse(200, "Chunk uploaded", { chunkNumber, totalChunks })
//       );
//     } catch (error) {
//       await fs.promises.unlink(chunkPath).catch(console.error);
//       throw error;
//     }
//   });
export const uploadMusic = catchAsync(async (req, res, next) => {
    const { originalname, uniqueId } = req.body;
    const fileBuffer = req.file.buffer;

    // Validate input
    if (!fileBuffer || !originalname || !uniqueId) {
        throw new AppError('Invalid upload parameters', 400);
    }

    // Ensure merged files directory exists
    await fs.promises.mkdir(MERGED_FILES_DIR, { recursive: true });
    const mergedFilePath = path.join(MERGED_FILES_DIR, originalname);

    try {
        // Write full file directly
        await fs.promises.writeFile(mergedFilePath, fileBuffer);
        await fs.promises.access(mergedFilePath, fs.constants.F_OK);

        const requestId = await getRequestId();
        await uploadChunkToExternalService(
            fileBuffer,
            originalname,
            1,
            1,
            requestId
        );
        const music = await UploadMusics.create({
            title: originalname,
            music_file_path: mergedFilePath,
            user_id: req.user.id,
            request_id: requestId
        });

        return res.status(201).json(
            new SendResponse(201, "File uploaded successfully", music)
        );

    } catch (error) {
        // Cleanup failed upload
        await fs.promises.unlink(mergedFilePath).catch(console.error);
        throw error;
    }
});

export const handleMusicUpload = catchAsync(async (req, res, next) => {
    const { body, files } = req;

    if (!body || (!files && !body.totalChunks)) {
        return res.status(400).json({ error: "Invalid request data" });
    }

    if (files && files.length) {
        // Save the chunk
        const { originalname, path: tempPath } = files[0];
        const chunkFilename = `${originalname}.${body.currentChunk}`;
        const chunkPath = path.join(CHUNKS_DIR, chunkFilename);

        fs.rename(tempPath, chunkPath, (err) => {
            if (err) {
                console.error("Error saving chunk:", err);
                return res.status(500).send("Error uploading chunk");
            }

            res.status(200).json({ message: "Chunk uploaded successfully" });
        });
    } else if (body.totalChunks && +body.currentChunk === +body.totalChunks) {
        // Assemble chunks into a single file
        const filename = body.filename;
        const totalChunks = body.totalChunks;
        const writer = fs.createWriteStream(path.join(UPLOAD_DIR, filename));

        try {
            for (let i = 1; i <= totalChunks; i++) {
                const chunkPath = path.join(CHUNKS_DIR, `${filename}.${i}`);
                const data = fs.readFileSync(chunkPath);
                writer.write(data);
                fs.unlinkSync(chunkPath); // Remove the chunk after writing
            }

            writer.end();

            // Optional: Save file metadata to the database
            const musicData = {
                title: filename,
                music_file_path: path.join(UPLOAD_DIR, filename),
                user_id: req.user.id,
            };
            const music = await UploadMusics.create(musicData);

            return res.status(201).json(new SendResponse(201, "Music uploaded and assembled successfully", music));
        } catch (err) {
            console.error("Error assembling chunks:", err);
            return res.status(500).send("Error assembling chunks");
        }
    } else {
        res.status(200).json({ message: "Waiting for more chunks" });
    }
});






export const getMusicByUserId = catchAsync(async (req, res, next) => {
    // Pagination parameters (default: page 1, limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: music } = await UploadMusics.findAndCountAll({
        where: { user_id: req.user.id },
        limit,
        offset,
        order: [['createdAt', 'DESC']] // Optional: add sorting
    });

    const totalPages = Math.ceil(count / limit);

    //check for unanalyzed music
    const unanalyzedMusic = await UploadMusics.findAll({
        where: {
            user_id: req.user.id,
            is_analyzed: false
        }
    });

    if (unanalyzedMusic.length > 0) {
        // Process each unanalyzed music
        const analysisPromises = unanalyzedMusic.map(music => {
            return getMusicByReqId({
                params: { requestId: music.request_id },
                user: req.user
            }, res, next);
        });

        // Wait for all analyses to complete
        await Promise.all(analysisPromises);
    }



    return res.status(200).json(new SendResponse(200, "Music found successfully", {
        data: music,
        pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    }));
});


export const getMusicCountByUserId = catchAsync(async (req, res, next) => {
    const musicCount = await UploadMusics.count({ where: { user_id: req.user.id } });
    return res.status(200).json(new SendResponse(200, "Music count found successfully", { count: musicCount }));
});
export const getMusicById = catchAsync(async (req, res, next) => {
    const music = await UploadMusics.findByPk(req.params.id);
    if (!music) {
        return next(res.status(404).json(new SendResponse(404, "Music not found", null)));
    }
    return res.status(200).json(new SendResponse(200, "Music found successfully", music));
});
export const deleteMusic = catchAsync(async (req, res, next) => {
    const music = await UploadMusics.findByPk(req.params.id);
    if (!music) {
        return next(res.status(404).json(new SendResponse(404, "Music not found", null)));
    }
    await music.destroy();
    return res.status(204).json(new SendResponse(204, "Music deleted successfully", null));
});