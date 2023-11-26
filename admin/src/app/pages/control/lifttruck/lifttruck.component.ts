import { Component, OnInit } from '@angular/core';
import { GeneralService } from '@helpers/general-service';
import { END_POINTS } from '@helpers/general-service/utils';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { AuthService } from 'src/app/auth/auth.service';
import { CommonService } from '../../../helpers/common';
import { LiftModalComponent } from '../lift-modal/lift-modal.component';
import { LifttruckFormComponent } from '../lifttruck-form/lifttruck-form.component';

const { control } = END_POINTS;

@Component({
  selector: 'app-lifttruck',
  templateUrl: './lifttruck.component.html',
})
export class LifttruckComponent implements OnInit {
  loading: boolean = false;
  lifts: any[] = [];

  constructor(
    private dialogService: NbDialogService,
    private generalService: GeneralService,
    private authService: AuthService,
    private toastr: NbToastrService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.all();
  }

  private all() {
    this.generalService
      .paramList$(`${control}/lift/list`, {
        campus: this.authService.user.campus,
      })
      .subscribe((res) => (this.lifts = res));
  }

  public openModal(data?: any) {
    const dialogConfig = {
      dialogClass: 'dialog-limited-height',
      context: { data },
      closeOnBackdropClick: true,
      closeOnEsc: true,
    };
    this.dialogService
      .open(LifttruckFormComponent, dialogConfig)
      .onClose.subscribe((load) => {
        if (load) {
          this.all();
        }
      });
  }

  public showLift(lift: any): void {
    const dialogConfig = {
      dialogClass: 'dialog-limited-height',
      context: { lift, lifts: this.lifts },
      closeOnBackdropClick: true,
      closeOnEsc: true,
    };
    this.dialogService
      .open(LiftModalComponent, dialogConfig)
      .onClose.subscribe(() => this.all());
  }

  public update(lift: any) {
    this.generalService
      .updateUrl$(`${control}/lift/${lift._id}/update`, lift)
      .subscribe((res) => {
        this.toastr.success(
          `Montacarga ${lift.name} actualizado correctamente!`,
          `¡Éxito!`
        );
        this.all();
      });
  }

  private deleteLift(lift: any) {
    this.generalService
      .delete$(`${control}/lift/${lift._id}/delete`)
      .subscribe(() => {
        this.toastr.success(
          `Montacarga ${lift.name} eliminado correctamente!`,
          `¡Éxito!`
        );
        this.all();
      });
  }

  public confirmDelete(lift: any) {
    const self = this;
    const msg = `Al eliminar ${lift.name}, podrías perder información que esté relacionada, si estás seguro continue por favor.`;
    this.common.showConfirm('¿Estás seguro?', msg, function (r: any) {
      if (r.isConfirmed) {
        self.deleteLift(lift);
      }
    });
  }
}
