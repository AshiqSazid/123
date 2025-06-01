import axios from "axios";
import * as env from "dotenv";
import FormData from 'form-data';
import AppError from "../../../utils/AppError.js";
env.config();


export async function getRequestId() {
    try {
        const response = await axios.get(
            `${process.env.BASE_URL}${process.env.REQUEST_ID}`,
            { timeout: 5000 }
        );
        return response.data.data.httpXHeaderRequestId;
    } catch (error) {
        console.error('Request ID error:', error);

    }
}

export async function uploadChunkToExternalService(
    chunkBuffer,
    filename,
    chunkNumber,
    totalChunks,
    requestId
) {
    const formData = new FormData();

    // Append the chunk as a buffer
    formData.append('file', chunkBuffer, {
        filename: `${filename}.part${chunkNumber}`,
        contentType: 'application/octet-stream'
    });

    // Include chunk metadata
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('requestId', requestId);

    try {
        const response = await axios.post(
            `${process.env.BASE_URL}${process.env.MULTIPLE_FILE_UPLOAD}`,
            formData,
            {
                headers: formData.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 30000
            }
        );

        // console.log(`Uploaded chunk ${chunkNumber}/${totalChunks}`, {
        //     status: response.status,
        //     data: response.data
        // });

        return response.data;
    } catch (error) {
        console.log("🚀 ~ error:", error)
        console.error(`Failed to upload chunk ${chunkNumber}:`, {
            message: error.message,
            response: error.response?.data
        });
        throw new AppError(`Failed to upload chunk ${chunkNumber}`, 502);
    }
}