import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HttpRequestOptions, HttpService } from './utilities/HttpService';
import { Request } from 'express';

const app = express();
app.use(cors())
app.use(express.json())
const PORT = 3001;
dotenv.config({path:__dirname+'/../.env'});

// Create an instance of HttpService with NASA API base URL
let options: HttpRequestOptions;
function createHttpPayload(request:Request): HttpRequestOptions {

    if (!process.env.api_key) {
        throw new Error("API key is not defined in environment variables");
      }


    return options = {
        method: "GET",
        hostname: "api.nasa.gov",
        path: "/planetary/apod",
        queryParams: {
            api_key: process.env.api_key,
            date: String(request.query.date ?? '')
        },
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000,

    }
}



// Route to get NASA's Photo of the Day
app.get('/photo-metadata', async (req, res) => {
    try {
        const response = await HttpService.request(createHttpPayload(req));
        res.status(response.status).json(response.data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
