import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CampusService } from '../../../../services/campus.service';

@Component({
  selector: 'app-campus-modal',
  templateUrl: './campus-modal.component.html',
})
export class CampusModalComponent implements OnInit {
  campus: any[] = [];
  sede: FormControl = this.fb.control('');

  constructor(
    private campusService: CampusService,
    private fb: FormBuilder,
    private bsModal: BsModalRef
  ) {}

  ngOnInit(): void {
    this.getCampus();
  }

  private getCampus() {
    this.campusService.getCampusPublic().subscribe((res: any) => {
      this.campus = res;
    });
  }

  public setCampus(event: any) {
    const campus = event.value;
    localStorage.setItem('campus', campus);
    this.bsModal.hide();
  }
}
