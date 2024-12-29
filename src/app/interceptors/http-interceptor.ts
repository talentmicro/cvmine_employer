import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { LoginService } from '../pages/services/auth/login.service';
import forge from 'node-forge';
import * as pako from 'pako';
import * as CryptoJS from 'crypto-js';
import { tap } from 'rxjs/operators';
import { jsonDeepParse } from '../functions/shared-functions';
import { inject } from '@angular/core';
const aKey = 'T@MiCr097124!iCR';
const iv: any = "1234567891234567";
const algorithm = 'aes-256-cbc';

export const requestInterceptors: HttpInterceptorFn = (req, next) => {
    const loginService = inject(LoginService); // Inject the LoginService

    // Retrieve and parse IP object and session info from storage
    const ipObj = jsonDeepParse(localStorage.getItem('ipObj')) || {};

    const session = jsonDeepParse(loginService.decrypt(sessionStorage.getItem('userDetails')!)) || null;
    const token = session?.token || null;
    const language = '1';
    const timestamp = Date.now().toString();
    const ip = ipObj?.ip || '1.1.1.1';
    const region = ipObj?.country || '';

    // Generate hash with token or a default key
    const dataToHash = timestamp + ip + region + (token || aKey);
    const hash = CryptoJS.SHA512(dataToHash).toString(CryptoJS.enc.Hex);

    // Define headers
    const headers: Record<string, string> = {
        ip,
        region,
        hash,
        lngId: language,
        timestamp,
        ishm: '0',
        portalType: '2'
    };

    // Conditionally add token if present
    if (token) headers['token'] = token;

    // Clone request with the new headers
    req = req.clone({ setHeaders: headers });

    // Conditionally encrypt data if body is not FormData
    if (req.body && !(req.body instanceof FormData)) {
        const encryptionKey = session?.secretKey || aKey;
        req = req.clone({
            body: encryptData(encryptionKey, req.body)
        });
    }

    // Send the request and handle the response
    return next(req).pipe(
        tap({
            next: (event: any) => {
                // Check if response is of HttpResponse type
                if (event instanceof HttpResponse) {
                    const encryptionKey = session?.secretKey || aKey;

                    // Decrypt 'data' field if it is a string
                    if (event.body?.['data'] && typeof event.body?.['data'] === 'string') {
                        event.body['data'] = decryptData(encryptionKey, event.body?.['data']);
                    }

                    // Error notification handling (mocked function example)
                    if (event.body?.['message'] && !event.body?.['status']) {
                        showErrorNotification(event.body?.['message']);
                    }

                    // Handle Unauthorized (401) responses
                    if (event.status === 401 || event.body?.['code'] === 401) {
                        handleUnauthorized();
                    }
                }
            },
            error: (error) => {
                console.error("HTTP Request Error:", error);
                handleError(error);
            }
        })
    );
};


export function encryptData(keys: string, value: any) {
    try {
        let textEncoder = new TextEncoder(); //similar to buffer in node js
        let iv = '1234567891234567';
        let md = forge.md.sha256.create(); //create sha 256 hash
        md.update(keys);
        let key = md.digest();
        let encodedData = textEncoder.encode(JSON.stringify(value)); //stringify to json and convert to buffer
        let gzippedData = pako.gzip(encodedData); //compress
        let cipher = forge.cipher.createCipher('AES-CBC', key);//pad7 by default :)
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(gzippedData));
        cipher.finish();
        let encrypted = cipher.output;
        return { data: forge.util.encode64(encrypted.data) }
    }
    catch (err) {
        console.log(err)
        return value

    }
}

// Helper function for decryption
export function decryptData(keys: string, value: string) {
    try {
        let textDecoder = new TextDecoder();
        let iv = '1234567891234567'; // Ensure this is the correct IV

        // Generate the key
        let md = forge.md.sha256.create();
        md.update(keys);
        let key = md.digest();

        // Decode the base64 encrypted value
        let encryptedBytes = forge.util.decode64(value);

        // Create the decipher
        let decipher = forge.cipher.createDecipher('AES-CBC', key);
        decipher.start({ iv: iv });

        // Decrypt in chunks
        let length = encryptedBytes.length;
        let chunkSize = 1024 * 64;
        let index = 0;
        let decrypted = '';
        do {
            let buf = forge.util.createBuffer(encryptedBytes.substr(index, chunkSize));
            decipher.update(buf);
            index += chunkSize;
        } while (index < length);

        let result = decipher.finish();
        if (result) {
            decrypted = decipher.output.getBytes();
        } else {
            throw new Error('Decryption failed');
        }

        // Convert decrypted bytes to Uint8Array for pako.ungzip
        let decryptedUint8Array = new Uint8Array(forge.util.binary.raw.decode(decrypted));

        // Decompress and decode the data
        let decodedData = pako.ungzip(decryptedUint8Array);
        let dataObject = JSON.parse(textDecoder.decode(decodedData));
        return dataObject;
    }
    catch (err) {
        console.log(err);
        return value;
    }
}

export function showErrorNotification(message: string): void {
    console.log("Notification Error:", message);
}

export function handleUnauthorized(): void {
    console.log("Unauthorized access detected. Logging out...");
}

export function handleError(error: any): void {
    console.log("Error Handling:", error);
}
