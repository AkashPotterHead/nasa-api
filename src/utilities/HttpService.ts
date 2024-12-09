import * as http from "http";
import * as https from "https";
import { stringify } from "querystring";

export interface HttpRequestOptions {
    method: string;
    hostname: string;
    path: string;
    queryParams?: Record<string, string | number | boolean>; // Decoupled query params
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
}

export interface HttpResponse<T = any> {
    status: number;
    headers: http.IncomingHttpHeaders;
    data: T;
}

export class HttpService {
    public static request<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
        return new Promise((resolve, reject) => {
            // Serialize query parameters
            const queryString = options.queryParams
                ? `?${stringify(options.queryParams)}`
                : "";
            const fullPath = `${options.path}${queryString}`;

            const requestOptions: http.RequestOptions = {
                method: options.method,
                hostname: options.hostname,
                path: fullPath,
                headers: options.headers,
                timeout: options.timeout,
            };

            const transport = https;

            const req = transport.request(requestOptions, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    resolve({
                        status: res.statusCode || 0,
                        headers: res.headers,
                        data: this.parseResponseData(data),
                    });
                });
            });

            req.on("error", (error) => {
                reject(error);
            });

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    private static parseResponseData(data: string): any {
        try {
            return JSON.parse(data);
        } catch {
            return data; // Return as-is if not JSON
        }
    }
}
