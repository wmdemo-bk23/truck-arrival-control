import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { AuthService } from '../../../auth/auth.service';
import { CommonService } from '../../../helpers/common';
import { GeneralService } from '../../../helpers/general-service';
import { END_POINTS } from '../../../helpers/general-service/utils';

const { control, account } = END_POINTS;

@Component({
  selector: 'app-truckstypes',
  templateUrl: './truckstypes.component.html',
})
export class TruckstypesComponent implements OnInit {
  loading: boolean = false;
  modalRef: any;
  campus: any[] = [];
  truckTypes: any[] = [];
  title: string = '';

  formHeader!: FormGroup;

  constructor(
    private dialogService: NbDialogService,
    private fb: FormBuilder,
    private generalService: GeneralService,
    private common: CommonService,
    private toastr: NbToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.reactiveFields();
  }

  private reactiveFields() {
    const controls = {
      _id: [''],
      name: ['', [Validators.required, Validators.maxLength(30)]],
      description: ['', [Validators.maxLength(40)]],
      maxTimeUnload: [0, [Validators.required]],
      maxTimeLoad: [0, [Validators.required]],
      campus: ['', [Validators.required]],
    };
    this.formHeader = this.fb.group(controls);
    this.getCampus();
    this.getTruckTypes();
  }

  private getCampus() {
    this.generalService
      .filtersList$(`${account}/campus`)
      .subscribe((res) => (this.campus = res));
  }

  private getTruckTypes() {
    const params = {
      campus: this.authService.user.campus,
    };
    this.generalService
      .paramList$(`${control}/truck-type/list`, params)
      .subscribe((res: any) => {
        this.truckTypes = res || [];
      });
  }

  public openModal(dialog: TemplateRef<any>, instance?: any) {
    this.title = 'Nuevo Tipo de camión';
    this.formHeader.reset();
    const { campus } = this.authService.user;
    this.formHeader.get('campus')?.patchValue(campus);
    if (instance) {
      this.title = 'Editar Tipo de camión';
      this.formHeader.patchValue(instance);
    }
    const dialogConfig = {
      dialogClass: 'dialog-limited-height',
      context: {},
      closeOnBackdropClick: true,
      closeOnEsc: true,
    };
    this.modalRef = this.dialogService.open(dialog, dialogConfig);
  }

  public insertTruckType() {
    const { value } = this.formHeader;
    if (value._id) {
      this.generalService
        .updateUrl$(`${control}/truck-type/${value._id}/update`, value)
        .subscribe(() => {
          this.toastr.success(
            `Tipo Camión fue actualizado correctamente!`,
            `¡Éxito!`
          );
          this.finalAction();
        });
    } else {
      delete value._id;
      this.generalService
        .addData$(`${control}/truck-type/create`, value)
        .subscribe(() => {
          this.toastr.success(
            `Tipo Camión fue creado correctamente!`,
            `¡Éxito!`
          );
          this.finalAction();
        });
    }
  }

  private deleteTruckType(tt: any) {
    this.generalService
      .delete$(`${control}/truck-type/${tt._id}/delete`)
      .subscribe(() => {
        this.toastr.success(
          `BK-Placa ${tt.name} eliminado correctamente!`,
          `¡Éxito!`
        );
        this.getTruckTypes();
      });
  }

  public confirmDelete(tt: any) {
    const self = this;
    const msg = `Al eliminar ${tt.name}, podrías perder información que esté relacionada, si estás seguro continue por favor.`;
    this.common.showConfirm('¿Estás seguro?', msg, function (r: any) {
      if (r.isConfirmed) {
        self.deleteTruckType(tt);
      }
    });
  }

  private finalAction() {
    this.modalRef.close();
    this.getTruckTypes();
  }
}
