import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription, map } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LiftService } from 'src/app/services/lift.service';
import { RegistryService } from 'src/app/services/registry.service';
import { WebsocketService } from 'src/app/shared/services/websocket.service';
import { BayService } from '../../../../services/bay.service';
import { GlobalMethodsService } from '../../../../services/global-methods.service';
import { TruckTypeService } from '../../../../services/truck-type.service';
import { UserService } from '../../../../services/user.service';
import { SelectModalComponent } from '../modals/select-modal/select-modal.component';

@Component({
  selector: 'app-assigned',
  templateUrl: './assigned.component.html',
})
export class AssignedComponent implements OnInit {
  date = new Date();
  modalRef?: BsModalRef;
  registry: any;
  myLift: any;
  title = 'Montacarga';
  _start: boolean = false;
  suscription$!: Subscription;
  userId: string;
  unloadUserInfo: any;
  loadUserInfo: any;
  maxTimeLoad!: number;
  maxTimeUnload!: number;
  arrivals: any[] = [];
  typesOfArrivals: any[] = [];
  bahias: any = [];
  formBays: any[] = [];
  lifts: any = [];
  selectedBahia: any;
  selectedLift: any;
  unloadGap: number = 0;
  unloadCurrentTime: string = '00:00:00';
  loadGap: number = 0;
  loadCurrentTime: string = '00:00:00';

  loadForm = this.fb.group({
    loadBay: ['', Validators.required],
  });

  constructor(
    private modalService: BsModalService,
    private liftService: LiftService,
    private bayService: BayService,
    private registryService: RegistryService,
    private toast: ToastrService,
    private authService: AuthService,
    private wsService: WebsocketService,
    private userService: UserService,
    private truckTypeService: TruckTypeService,
    private fb: FormBuilder,
    public gm: GlobalMethodsService
  ) {
    this.userId = this.authService.userId;
    setInterval(() => {
      this.calculateUnloadTimeByRegistry();
      this.calculateLoadTimeByRegistry();
    }, 1000);
  }

  ngOnInit(): void {
    this.wsService.emit('work-lift');
    this.suscription$ = this.wsService.listen('to-work').subscribe(() => {
      this.loadMyLift();
      this.verifyBahiaLift();
      this.getArrivals();
      this.loadBays();
    });
  }

  ngOnDestroy(): void {
    this.suscription$.unsubscribe();
  }

  private verifyBahiaLift() {
    this.selectedBahia =
      JSON.parse(localStorage.getItem('bahia') as string) || '';
    this.loadForm.get('loadBay')!.setValue(this.selectedBahia);
  }

  private loadBays() {
    this.bayService.getBays().subscribe((res: any) => {
      this.loadLifts();
      this.bahias = res.map((bay: any) => {
        bay.isFree = bay.unload ? false : true;
        if (bay.unload && bay.unload.state === 'DESCARGADO') {
          bay.isFree = true;
        }
        if (bay.isFree) {
          bay.isFree = bay.load ? false : true;
          if (bay.load && bay.load.state === 'CARGADO') {
            bay.isFree = true;
          }
        }
        if (!bay.isFree) {
          if (bay.unload) {
            bay.registry = bay.unload;
            bay.startTime = bay.unload.unloadStartTime;
          } else {
            bay.registry = bay.load;
            bay.startTime = bay.load.loadStartTime;
          }
          bay.registry.lift = bay.unload?.unloadLift
            ? bay.unload.unloadLift
            : bay.load.loadLift;
        }
        return bay;
      });
      this.formBays = res.filter((value: any) => value.isFree == true);
    });
  }

  private loadLifts() {
    this.liftService.list().subscribe((res: any) => (this.lifts = res));
  }

  public setBahia(bahia: any) {
    this.selectedBahia = bahia.value;
    localStorage.setItem('bahia', JSON.stringify(this.selectedBahia));
  }

  public getUnloadUserInfo(id: any) {
    this.userService.retrieve(id).subscribe((res: any) => {
      const user = {
        name: res.firstName,
        lastName: res.lastName,
      };
      this.unloadUserInfo = user;
    });
  }

  public getLoadUserInfo(id: any) {
    this.userService.retrieve(id).subscribe((res: any) => {
      const user = {
        name: res.firstName,
        lastName: res.lastName,
      };
      this.loadUserInfo = user;
    });
  }

  public getTimeLoad(type: string) {
    this.truckTypeService.retrieve(type).subscribe((res: any) => {
      this.maxTimeLoad = res.maxTimeLoad;
    });
  }

  public getTimeUnload(type: string) {
    this.truckTypeService.retrieve(type).subscribe((res: any) => {
      this.maxTimeUnload = res.maxTimeUnload;
    });
  }

  public loadMyLift() {
    this.liftService.getMyLift().subscribe((r: any) => {
      this.myLift = r;
      this.selectedLift = this.myLift ? this.myLift._id : '';
      if (!r) {
        this.toast.warning(
          'No tienes un montacarga asignado gooooo',
          'Lo siento'
        );
        return this.authService.logout();
      }
      if (r.isActive && !r.isFree) {
        this.getUnloadTruck();
      }
      if (this.myLift.isFree && this.selectedBahia === '' && !this.registry) {
        this.openModalWithComponent();
      }
    });
  }

  public getUnloadTruck() {
    this.registryService.getUnloadTruck().subscribe((res: any) => {
      if (res) {
        this._start = true;
        this.registry = { ...res, bay: res.unloadBay, lift: res.unloadLift };
        if (this.registry.unloadUser) {
          this.getUnloadUserInfo(this.registry.unloadUser);
        }
        this.getTimeUnload(this.registry.truck.type);
        this.title = this.registry.lift.name;
      } else {
        this.getLoadTruck();
      }
    });
  }

  public getLoadTruck() {
    this.registryService.getLoadTruck().subscribe((res: any) => {
      if (res) {
        this._start = true;
        this.registry = { ...res, bay: res.loadBay, lift: res.loadLift };
        if (this.registry.loadUser) {
          this.getLoadUserInfo(this.registry.loadUser);
        }
        this.getTimeLoad(this.registry.truck.type);
        this.title = this.registry.lift.name;
      }
    });
  }

  public confirmModal(template: TemplateRef<any>, unload = true) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
    this.modalService.onHide.subscribe((res: any) => {
      this.verifyBahiaLift();
    });
  }

  public unloadTruck(): void {
    const data = {
      unloadStartTime: new Date().toJSON(),
      state: 'DESCARGANDO',
      occupied: true,
      unloadUser: this.userId,
    };
    this._start = true;
    this.registryService.update(this.registry._id, data).subscribe((r) => {
      this.registry = { ...this.registry, ...data };
      this.wsService.emit('hello');
      this.wsService.emit('work-lift');
    });
  }

  public unloadEndTruck(): void {
    const data = {
      unloadEndTime: new Date().toJSON(),
      state: 'DESCARGADO',
      occupied: false,
    };
    this.modalRef?.hide();
    this.registryService.update(this.registry._id, data).subscribe((r: any) => {
      this.registry = { ...this.registry, ...data };
      this.liftService
        .update(this.myLift._id, { isFree: true })
        .subscribe((r) => {
          this._start = false;
          this.wsService.emit('hello');
          this.wsService.emit('work-lift');
          this.myLift = r;
        });
      if (this.selectedBahia === '') {
        window.location.reload();
      }
    });
  }

  public loadTruck(): void {
    const data = {
      loadStartTime: new Date().toJSON(),
      state: 'CARGANDO',
      occupied: true,
      loadUser: this.userId,
    };
    this._start = true;
    this.registryService.update(this.registry._id, data).subscribe((r: any) => {
      this.registry = { ...this.registry, ...data };
      this.wsService.emit('hello');
      this.wsService.emit('work-lift');
    });
  }

  public loadEndTruck(): void {
    const data = {
      loadEndTime: new Date().toJSON(),
      state: 'CARGADO',
      occupied: false,
    };
    this.modalRef?.hide();
    this.registryService.update(this.registry._id, data).subscribe((r) => {
      this.registry = { ...this.registry, ...data };
      this.liftService
        .update(this.myLift._id, { isFree: true })
        .subscribe((r) => {
          this._start = false;
          this.myLift = r;
          this.wsService.emit('hello');
          this.wsService.emit('work-lift');
        });
      if (this.selectedBahia === '') {
        window.location.reload();
      }
    });
  }

  public getArrivals() {
    this.registryService.getArrivals().subscribe((res: any) => {
      this.arrivals = res.filter((reg: any) => reg.state !== 'SALIDA');
      this.typesOfArrivals = [];
      this.arrivals.map((item: any) => {
        this.typesOfArrivals.push(item.truck.type);
        this.getTimeByTrucktype(item);
        this.calculateTime(item);
      });
      const interval = setInterval(() => {
        this.arrivals.map((item: any) => {
          this.calculateTime(item);
        });
      }, 1000);
      if (
        this.arrivals.every(
          (item: any) => item.unloadEndTime && item.loadEndTime
        )
      ) {
        clearInterval(interval);
      }
      this.typesOfArrivals = [...new Set(this.typesOfArrivals)];
    });
  }

  public arrivalsByType(type: string) {
    return this.arrivals.filter((item: any) => {
      return item.truck.type === type;
    });
  }

  public openModalWithComponent() {
    const initialState: ModalOptions = {
      class: 'modal-dialog-centered modal-md',
      keyboard: false,
      backdrop: 'static',
      initialState: {},
    };
    this.modalService.show(SelectModalComponent, initialState);
    this.modalService.onHide.subscribe((res) => {
      this.verifyBahiaLift();
      this.getArrivals();
      this.loadBays();
    });
  }

  public setUnloadBay(truck: any) {
    this.registry = truck;
    if (this.formBays.some((item: any) => item._id === this.selectedBahia)) {
      this.onSubmitUnload();
      this.modalRef?.hide();
    } else {
      this.openModalWithComponent();
    }
  }

  public setLoadBay(truck: any) {
    this.registry = truck;
    if (this.formBays.some((item: any) => item._id === this.selectedBahia)) {
      this.onSubmitLoad();
      this.modalRef?.hide();
    } else {
      this.openModalWithComponent();
    }
  }

  public onSubmitUnload() {
    const data = {
      unloadBay: this.selectedBahia,
      unloadLift: this.selectedLift,
      state: 'DESCARGA',
      checkInTime: new Date().toJSON(),
      checkInControl: this.userId,
    };
    this.registryService.update(this.registry._id, data).subscribe((res) => {
      this.toast.success('Se asignó la bahía y el montacarga correctamente!!!');
      this.updateLift(data.unloadLift, { isFree: false });
      this.wsService.emit('hello');
      this.wsService.emit('work-lift');
    });
  }

  public onSubmitLoad() {
    const data = this.loadForm.getRawValue();
    data['loadLift'] = this.selectedLift;
    data['state'] = 'CARGA'; // setBayAndLift
    data['checkInTime'] = new Date().toJSON();
    data['checkInControl'] = this.userId;
    this.registryService.update(this.registry._id, data).subscribe((res) => {
      this.updateLift(data.loadLift, { isFree: false });
      this.toast.success('Se asignó la bahía y el montacarga correctamente!!!');
      this.wsService.emit('hello');
      this.wsService.emit('work-lift');
    });
  }

  private updateLift(id: string, data: any) {
    this.liftService.update(id, data).subscribe((res: any) => this.loadLifts());
  }

  public calculateTime(arrival: any) {
    const unloadStart = new Date(arrival.unloadStartTime).getTime();
    const unloadEnd =
      new Date(arrival.unloadEndTime).getTime() || new Date().getTime();
    const loadStart = new Date(arrival.loadStartTime).getTime();
    const loadEnd =
      new Date(arrival.loadEndTime).getTime() || new Date().getTime();
    arrival.unloadGap = unloadEnd - unloadStart || 0;
    arrival.loadGap = loadEnd - loadStart || 0;
    arrival.currentUnloadTime = this.gm.convertMsToTime(arrival.unloadGap);
    arrival.currentLoadTime = this.gm.convertMsToTime(arrival.loadGap);
  }

  public calculateUnloadTimeByRegistry() {
    if (this.registry && this.registry.unloadStartTime) {
      const unloadStart = new Date(this.registry.unloadStartTime).getTime();
      const unloadEnd = new Date().getTime();
      this.unloadGap = unloadEnd - unloadStart;
      this.unloadCurrentTime = this.gm.convertMsToTime(this.unloadGap);
    }
  }

  public calculateLoadTimeByRegistry() {
    if (this.registry && this.registry.loadStartTime) {
      const loadStart = new Date(this.registry.loadStartTime).getTime();
      const loadEnd = new Date().getTime();
      this.loadGap = loadEnd - loadStart;
      this.loadCurrentTime = this.gm.convertMsToTime(this.loadGap);
    }
  }

  public getTimeByTrucktype(arrival: any) {
    this.truckTypeService.retrieve(arrival.truck.type).subscribe((res: any) => {
      arrival.timeUnload = res.maxTimeUnload;
      arrival.timeLoad = res.maxTimeLoad;
      this.convertHoursToMs(arrival);
    });
  }

  public convertHoursToMs(arrival: any) {
    if (!arrival.timeUnload) {
      arrival.msTimeUnload = 0;
    } else if (!arrival.timeLoad) {
      arrival.msTimeLoad = 0;
    }
    arrival.msTimeLoad = this.gm.convertMinutesToMs(arrival.timeLoad);
    arrival.msTimeLoadGreen = Math.round((90 / 100) * arrival.msTimeLoad);
    arrival.msTimeUnload = this.gm.convertMinutesToMs(arrival.timeUnload);
    arrival.msTimeUnloadGreen = Math.round((90 / 100) * arrival.msTimeUnload);
  }

  public colorizeUnload(arrival: any) {
    if (
      arrival.unloadGap > 0 &&
      arrival.unloadGap < arrival.msTimeUnloadGreen
    ) {
      return { 'background-color': '#00b050', color: '#fff' };
    } else if (
      arrival.unloadGap >= arrival.msTimeUnloadGreen &&
      arrival.unloadGap < arrival.msTimeUnload
    ) {
      return { 'background-color': '#ffd700', color: '#000' };
    } else if (arrival.unloadGap >= arrival.msTimeUnload) {
      return { 'background-color': '#ff0000', color: '#fff' };
    } else {
      return { 'background-color': '#fff', color: '#000' };
    }
  }

  public colorizeLoad(arrival: any) {
    if (arrival.loadGap > 0 && arrival.loadGap < arrival.msTimeLoadGreen) {
      return { 'background-color': '#00b050', color: '#fff' };
    } else if (
      arrival.loadGap >= arrival.msTimeLoadGreen &&
      arrival.loadGap < arrival.msTimeLoad
    ) {
      return { 'background-color': '#ffd700', color: '#000' };
    } else if (arrival.loadGap >= arrival.msTimeLoad) {
      return { 'background-color': '#ff0000', color: '#fff' };
    } else {
      return { 'background-color': '#fff', color: '#000' };
    }
  }

  public styleUnloadTruck() {
    const msMaxTimeUnload = this.gm.convertMinutesToMs(this.maxTimeUnload);
    const msGreen = Math.round((90 / 100) * msMaxTimeUnload);
    if (this.unloadGap > 0 && this.unloadGap < msGreen) {
      return { 'background-color': '#c9f1c6', color: '#000' };
    } else if (this.unloadGap >= msGreen && this.unloadGap < msMaxTimeUnload) {
      return { 'background-color': '#f2f2b1', color: '#000' };
    } else if (this.unloadGap >= msMaxTimeUnload) {
      return { 'background-color': '#ffb3c8', color: '#000' };
    } else {
      return { 'background-color': '#fff', color: '#000' };
    }
  }

  public styleLoadTruck() {
    const msMaxTimeLoad = this.gm.convertMinutesToMs(this.maxTimeLoad);
    const msGreen = Math.round((90 / 100) * msMaxTimeLoad);
    if (this.loadGap > 0 && this.loadGap < msGreen) {
      return { 'background-color': '#c9f1c6', color: '#000' };
    } else if (this.loadGap >= msGreen && this.loadGap < msMaxTimeLoad) {
      return { 'background-color': '#f2f2b1', color: '#000' };
    } else if (this.loadGap >= msMaxTimeLoad) {
      return { 'background-color': '#ffb3c8', color: '#000' };
    } else {
      return { 'background-color': '#fff', color: '#000' };
    }
  }
}
