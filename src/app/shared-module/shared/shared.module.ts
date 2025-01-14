import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalDatePipe, LocalDateTimePipe } from '../../functions/shared-functions';



@NgModule({
  declarations: [
    LocalDateTimePipe,
    LocalDatePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LocalDateTimePipe,
    LocalDatePipe
  ]
})
export class SharedModule { }
