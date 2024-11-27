import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-apply',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './apply.component.html',
    styleUrl: './apply.component.scss'
})
export class ApplyComponent {}