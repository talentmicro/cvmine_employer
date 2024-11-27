import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
    selector: 'app-download-app',
    standalone: true,
    imports: [RouterLink, NgClass],
    templateUrl: './download-app.component.html',
    styleUrl: './download-app.component.scss'
})
export class DownloadAppComponent {

    constructor (
        public router: Router
    ) {}

}