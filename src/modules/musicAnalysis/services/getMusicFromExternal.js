import axios from "axios";
import * as env from "dotenv";
env.config();


export async function getAnalysisResponse(requestId) {
    try {
        const response = await axios.get(
            `${process.env.BASE_URL}${process.env.ANALYSE_RES}/${requestId}`,
            { timeout: 5000 }
        );
        return response.data.data;
    } catch (error) {
        console.error('Request ID error:', error);

    }
}
