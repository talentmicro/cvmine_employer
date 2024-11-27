import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-pricing',
    standalone: true,
    imports: [RouterLink, NgClass, NgIf],
    templateUrl: './pricing.component.html',
    styleUrl: './pricing.component.scss'
})
export class PricingComponent {

    // Pricing Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}