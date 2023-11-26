import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { RegistryService } from '../../../../services/registry.service';

@Component({
  selector: 'app-exits',
  templateUrl: './exits.component.html',
})
export class ExitsComponent implements OnInit {
  registry: any;
  modalRef: any;
  collection: any = [];
  byCedule = '';

  constructor(
    private modalService: BsModalService,
    private registryService: RegistryService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRegistries();
  }

  public loadRegistries() {
    this.registryService.getArrivals().subscribe((r) => (this.collection = r));
  }

  public openConfirmModal(template: TemplateRef<any>, d: any) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
    this.registry = d;
  }

  public saveExit() {
    this.registryService
      .update(this.registry._id, { state: 'SALIDA', exit: new Date().toJSON() })
      .subscribe((r) => {
        this.toast.success('Registro de salida guardado correctamente');
        this.modalRef.hide();
        this.loadRegistries;
      });
  }

  public filterCol() {
    return this.collection.filter((reg: any) => {
      return (
        reg.driver.document
          .toLowerCase()
          .indexOf(this.byCedule.toLowerCase()) !== -1
      );
    });
  }
}
