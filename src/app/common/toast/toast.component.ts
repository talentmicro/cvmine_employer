import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ToastService, ToastMessage } from './toast.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
    standalone: true,
    imports: [ToastModule],
    providers: [ToastService, MessageService],
})

export class ToastComponent implements OnInit {
    private subscription: Subscription | null = null;

    constructor(
        private toastService: ToastService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // this.subscription = this.toastService.toastMessages$.subscribe(
        //     (message: ToastMessage) => {
        //         console.log('Received message:', message);

        //         this.messageService.add({
        //             severity: message.severity,
        //             summary: message.summary,
        //             detail: message.detail,
        //         });
        //     }
        // );
        console.log('ToastComponent initialized'); // Debugging log
        this.toastService.toastMessages$.subscribe((message) => {
            console.log('ToastComponent: Received message', message); // Debugging log
        
            // Clear any previous messages to ensure the new message shows
            this.messageService.clear();
        
            // Add the new message
            setTimeout(() => {
              this.messageService.add({
                severity: message.severity,
                summary: message.summary,
                detail: message.detail,
              });
            });
          });
    }
    
    // ngOnDestroy(): void {
    //     if (this.subscription) {
    //         this.subscription.unsubscribe();
    //     }
    // }

}
