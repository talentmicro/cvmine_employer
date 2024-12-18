import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink, NgClass, DividerModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {

    constructor (
        public router: Router
    ) {}

}