import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/services/auth.service';
import { CampusService } from '../../../services/campus.service';
import { CampusModalComponent } from './campus-modal/campus-modal.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  name: string = '';
  user: any = {};
  campus: any = [];
  sede: any;

  bsModalRef?: BsModalRef;

  constructor(
    private authService: AuthService,
    private campusService: CampusService,
    private fb: FormBuilder,
    private modalService: BsModalService
  ) {
    this.name = this.authService.getFullName;
  }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.getCampus();
  }

  private getCampus() {
    this.campusService.getCampus().subscribe((res: any) => {
      this.campus = res;
      this.sede = this.campus.find(
        (c: any) => c.code === this.authService.user.campus
      );
      if (!this.sede) {
        this.openModalWithComponent();
      }
    });
  }

  public openModalWithComponent() {
    const initialState: ModalOptions = {
      class: 'modal-dialog-centered modal-md',
      keyboard: false,
      backdrop: 'static',
      initialState: { campus: this.campus },
    };
    this.bsModalRef = this.modalService.show(
      CampusModalComponent,
      initialState
    );
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  public logout() {
    this.authService.logout();
  }
}
