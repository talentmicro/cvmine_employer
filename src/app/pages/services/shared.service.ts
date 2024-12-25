import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import * as forge from 'node-forge';

const SECRET_KEY = 'T@MiCr097124!iCR'; // Encryption key
const IV = '1234567891234567'; // Initialization vector

@Injectable({
    providedIn: 'root'
})

export class SharedService {
    private masterDropdowns = new BehaviorSubject<any>(null); // BehaviorSubject to store dropdown data
    public masterDropdowns$ = this.masterDropdowns.asObservable(); // Observable for components to subscribe to

    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) {}

    fetchAndSetDropdownData(body: any): void {
        this.apiService.getDropdownsData(body).subscribe((data) => {
            this.masterDropdowns.next(data);
        });
    }

    getMasterDropdowns() {
        return this.masterDropdowns.getValue();
    }

    encrypt(value: string): string {
        try {
            const cipher = forge.cipher.createCipher('AES-CBC', SECRET_KEY);
            cipher.start({ iv: IV });
            cipher.update(forge.util.createBuffer(value, 'utf8'));
            cipher.finish();
            return forge.util.encode64(cipher.output.getBytes());
        } catch (err) {
            console.error('Encryption error:', err);
            return value;
        }
    }
        
    decrypt(encryptedValue: string): string {
        try {
            const decipher = forge.cipher.createDecipher('AES-CBC', SECRET_KEY);
            decipher.start({ iv: IV });
            decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedValue)));
            decipher.finish();
            return decipher.output.toString();
        } catch (err) {
            console.error('Decryption error:', err);
            return encryptedValue;
        }
    }
}
