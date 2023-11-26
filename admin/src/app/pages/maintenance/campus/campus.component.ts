import { Component, OnInit } from '@angular/core';
import { GeneralService } from '@helpers/general-service';
import { END_POINTS } from '@helpers/general-service/utils';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { CommonService } from '../../../helpers/common';
import { CampusFormComponent } from '../campus-form/campus-form.component';

const { account } = END_POINTS;

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
})
export class CampusComponent implements OnInit {
  loading: boolean = false;
  campus: any[] = [];

  constructor(
    private dialogService: NbDialogService,
    private generalService: GeneralService,
    private toastr: NbToastrService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.all();
  }

  private all() {
    this.generalService
      .filtersList$(`${account}/campus`)
      .subscribe((res) => (this.campus = res));
  }

  public openModal(data?: any) {
    const dialogConfig = {
      dialogClass: 'dialog-limited-height',
      context: { data },
      closeOnBackdropClick: true,
      closeOnEsc: true,
    };
    this.dialogService
      .open(CampusFormComponent, dialogConfig)
      .onClose.subscribe((load) => {
        if (load) this.all();
      });
  }

  private deleteSede(sede: any) {
    this.generalService
      .delete$(`${account}/${sede._id}/campus/delete`)
      .subscribe(() => {
        this.toastr.success(
          `Sede ${sede.name} eliminado correctamente!`,
          `¡Éxito!`
        );
        this.all();
      });
  }

  public confirmDelete(sede: any) {
    const self = this;
    const msg = `Al eliminar ${sede.name}, podrías perder información que esté relacionada, si estás seguro continue por favor.`;
    this.common.showConfirm('¿Estás seguro?', msg, function (r: any) {
      if (r.isConfirmed) {
        self.deleteSede(sede);
      }
    });
  }
}
