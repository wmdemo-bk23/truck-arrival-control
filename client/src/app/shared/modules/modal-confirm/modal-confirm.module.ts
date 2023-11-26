import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalConfirmComponent } from './modal-confirm.component';

@NgModule({
  declarations: [ModalConfirmComponent],
  imports: [
    CommonModule,
    ModalModule.forRoot(),
    FontAwesomeModule,
    RouterModule,
  ],
  exports: [ModalConfirmComponent],
})
export class ModalConfirmModule {}
