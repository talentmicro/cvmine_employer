import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-cd-my-profile',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './cd-my-profile.component.html',
    styleUrl: './cd-my-profile.component.scss'
})
export class CdMyProfileComponent {}