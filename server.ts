import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import cookieParser from 'cookie-parser'; // Add cookie-parser
import { TransferState, makeStateKey } from '@angular/core';

// Define a TransferState key for auth
const AUTH_STATE_KEY = makeStateKey<boolean>('authState');

export function app(): express.Express {
    const server = express();
    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, '../browser');
    const indexHtml = join(serverDistFolder, 'index.server.html');

    const commonEngine = new CommonEngine();

    server.use(cookieParser()); // Parse cookies from incoming requests

    server.set('view engine', 'html');
    server.set('views', browserDistFolder);

    // Serve static files from /browser
    server.get(
        '**',
        express.static(browserDistFolder, {
            maxAge: '1y',
            index: 'index.html',
        })
    );

    // All regular routes use the Angular engine
    server.get('**', (req, res, next) => {
        const { protocol, originalUrl, baseUrl, headers } = req;

        // Check for auth token in cookies
        const authToken = req.cookies['authToken'] || null;
        const isLoggedIn = !!authToken; // Determine login status based on the presence of the token

        const transferState = new TransferState();
        transferState.set(AUTH_STATE_KEY, isLoggedIn); // Add auth state to TransferState

        commonEngine
            .render({
                bootstrap,
                documentFilePath: indexHtml,
                url: `${protocol}://${headers.host}${originalUrl}`,
                publicPath: browserDistFolder,
                providers: [
                    { provide: APP_BASE_HREF, useValue: baseUrl },
                    { provide: TransferState, useValue: transferState }, // Provide TransferState to the Angular engine
                ],
            })
            .then((html) => res.send(html))
            .catch((err) => next(err));
    });

    return server;
}

function run(): void {
    const port = process.env['PORT'] || 15020;

    // Start up the Node server
    const server = app();
    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();
