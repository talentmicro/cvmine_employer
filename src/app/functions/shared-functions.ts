import { isPlatformBrowser } from "@angular/common";

export function jsonParse(str: string) {
    try {
        if (typeof str == 'string')
            return JSON.parse(str);
        else
            return str;
    } catch (e) {

        if (typeof str == 'object')
            return str;
        else
            return str;
    }
}


export function jsonDeepParse(str: any) {
    try {
        if (str) {
            str = jsonParse(str);
            if (str && str.length && typeof str == 'object') {
                str.forEach((element: any) => {
                    element = jsonDeepParse(element);
                });
            }
            else if (str && typeof str == 'object') {
                let keys = Object.keys(str);
                if (keys && keys.length) {
                    keys.forEach(key => {
                        str[key] = jsonDeepParse(str[key]);
                    });
                }
            }
            return str;
        }
        else {
            return str;
        }
    }
    catch (e) {
        return str;
    }
}

export function getIP(PLATFORM_ID: Object) {
    if (isPlatformBrowser(PLATFORM_ID)) {
        if (localStorage.getItem('ipobject')) {
            let item: any = localStorage.getItem('ipobject')
            return JSON.parse(item);
        }
        else {
            return {
                "ip": "182.68.26.203",
                "hostname": "abts-north-dynamic-203.26.68.182.airtelbroadband.in",
                "city": "Jaipur",
                "region": "Rajasthan",
                "country": "IN",
                "loc": "26.9196,75.7878",
                "org": "AS24560 Bharti Airtel Ltd., Telemedia Services",
                "postal": "302001",
                "timezone": "Asia/Kolkata"
            }
        }
    }
    else {
        return {}
    }
}

export const emailRegEx = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
export const onlyNumbersRegX = "^[0-9]*$";


export function formatTextareaContent(str: string) {
    if (str) {
        try {
            return str.replace(/\\n/g, "\r\n")
        }
        catch (err) {
            return str;
        }

    }
    else {
        return ''
    }
}

import { PipeTransform, Pipe, Injector } from '@angular/core';
import * as moment from "moment";
import { DatePipe } from '@angular/common';


@Pipe({
    name: 'UtcToLocalTime'
})
export class UTCtoLocalPipe {
    transform(val: any): any {
        if (val && val != '') {
            try {
                const date = moment.utc(val).format();
                const local = moment.utc(date).local().format();
                return local.toString();
            }
            catch (e) {
                return val;
            }
        }
    }
}



@Pipe({
    name: 'LocalDateTimePipe'
})
export class LocalDateTimePipe implements PipeTransform {
    private datePipe: DatePipe;

    constructor() {
        this.datePipe = new DatePipe('en-US');
    }


    transform(val: any, format?: string, timezone?: string, locale?: string): any {
        if (val && val != '') {
            format = format || 'dd-MMM-yyyy hh:mm a';

            try {
                format = sessionStorage.getItem('defaultDateTimeFormatUI') || '';
                if (!format || format == 'null') {
                    format = format || 'dd-MMM-yyyy hh:mm a';
                }
            }
            catch (err) {
                console.log(err)
                format = format || 'dd-MMM-yyyy hh:mm a';
            }

            try {
                const date = moment.utc(val).format();
                val = moment.utc(date).local().format();
            }
            catch (e) {
            }
        }
        // Set the default format if not provided

        // Convert UTC to local time

        // Use the DatePipe instance to format the date
        return this.datePipe.transform(val, format, timezone, locale);
    }
}

@Pipe({
    name: 'LocalDatePipe'
})
export class LocalDatePipe implements PipeTransform {
    private datePipe: DatePipe;

    constructor() {
        this.datePipe = new DatePipe('en-US');
    }


    transform(val: any, format?: string, timezone?: string, locale?: string): any {
        if (val && val != '') {
            format = format || 'dd-MMM-yyyy';
            try {
                format = sessionStorage.getItem('defaultDateFormatUI') || ''
                if (!format || format == 'null') {
                    format = format || 'dd-MMM-yyyy';
                }
            }
            catch (err) {
                console.log(err)
                format = format || 'dd-MMM-yyyy';
            }
            try {
                const date = moment.utc(val).format();
                val = moment.utc(date).local().format();
            }
            catch (e) {
            }
        }
        // Set the default format if not provided

        // Convert UTC to local time

        // Use the DatePipe instance to format the date
        return this.datePipe.transform(val, format, timezone, locale);
    }
}