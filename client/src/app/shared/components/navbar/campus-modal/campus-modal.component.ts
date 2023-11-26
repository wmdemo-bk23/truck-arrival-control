import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../../services/auth.service';
import { CampusService } from '../../../../services/campus.service';

@Component({
  selector: 'app-campus-modal',
  templateUrl: './campus-modal.component.html',
})
export class CampusModalComponent implements OnInit {
  @Input() campus: any = [];
  sede: FormControl = this.fb.control('');

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private authService: AuthService,
    private campusService: CampusService
  ) {}

  ngOnInit() {}

  public changeCampus(event: any) {
    const { uid } = this.authService.user;
    const campus = event.value;
    this.campusService
      .updateCampus(uid, { campus })
      .subscribe(() => this.refresh());
  }

  private refresh(): void {
    window.location.reload();
  }
}
