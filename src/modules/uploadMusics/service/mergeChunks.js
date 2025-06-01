
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { pipeline } from 'stream';
import { promisify } from 'util';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CHUNKS_DIR = path.join(__dirname, "../../../../assets/chunks");
export const MERGED_FILES_DIR = path.join(__dirname, "../../../../assets/upload");
// Ensure necessary directories exist
if (!fs.existsSync(CHUNKS_DIR)) fs.mkdirSync(CHUNKS_DIR, { recursive: true });
if (!fs.existsSync(MERGED_FILES_DIR)) fs.mkdirSync(MERGED_FILES_DIR, { recursive: true });



const pipelineAsync = promisify(pipeline);

export async function mergeChunks(chunksDir, originalname, totalChunks, outputPath) {
    const writeStream = fs.createWriteStream(outputPath);

    try {
        // Loop through ALL chunks (1-based index)
        for (let i = 1; i <= totalChunks; i++) {
            const chunkPath = path.join(chunksDir, `${originalname}.part${i}`); // Removed underscore
            const readStream = fs.createReadStream(chunkPath);

            // Use pipeline for proper backpressure handling
            await pipelineAsync(
                readStream,
                writeStream,
                { end: false } // Keep write stream open for subsequent chunks
            );
        }

        // Finalize the write stream
        writeStream.end();

        // Wait for completion
        return new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

    } catch (error) {
        // Cleanup resources
        writeStream.destroy();
        try {
            await fs.promises.unlink(outputPath);
        } catch (unlinkError) {
            console.error('Cleanup failed:', unlinkError);
        }
        throw error;
    }
}