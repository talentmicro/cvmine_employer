import { HttpInterceptorFn } from '@angular/common/http';

export const httpRequestInterceptor: HttpInterceptorFn = (req, next) => {        
    const modifiedParams = req.params.set('window', '1');
    const modifiedHeaders = req.headers
        // .set('Content-Type', 'application/json')
        // .set('Accept', 'application/json, text/plain, */*')
        .set('iswindows', '1')
        // .set('origin', 'https://www.tallite.com')
        .set('xes', '1');

    const clonedRequest = req.clone({
        params: modifiedParams,
        headers: modifiedHeaders
    });
    
    return next(clonedRequest);
}