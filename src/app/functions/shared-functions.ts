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