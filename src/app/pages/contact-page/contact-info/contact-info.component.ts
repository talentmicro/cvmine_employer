import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-contact-info',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './contact-info.component.html',
    styleUrl: './contact-info.component.scss'
})
export class ContactInfoComponent {}