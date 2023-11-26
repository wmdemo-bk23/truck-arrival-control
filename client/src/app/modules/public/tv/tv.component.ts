import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/shared/services/websocket.service';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
})
export class TvComponent implements OnInit, OnDestroy {
  arrivalSubscription$!: Subscription;
  unloadSubscription$!: Subscription;
  loadSubscription$!: Subscription;
  arrivalTrucks: any = [];
  trucksUnload: any = [];
  loadTrucks: any = [];

  constructor(public wsService: WebsocketService) {}

  ngOnInit(): void {
    this.arrivalSubscription$ = this.getArrivalTrucks();
    this.unloadSubscription$ = this.getTruckUnload();
    this.loadSubscription$ = this.getLoadTrucks();
    this.getData();
  }

  private getArrivalTrucks() {
    return this.wsService.listen('arrival-trucks').subscribe((res) => {
      this.arrivalTrucks = res;
    });
  }

  private getTruckUnload() {
    return this.wsService.listen('unload-trucks').subscribe((res) => {
      this.trucksUnload = res;
    });
  }

  private getLoadTrucks() {
    return this.wsService.listen('load-trucks').subscribe((res) => {
      this.loadTrucks = res;
    });
  }

  private getData() {
    this.wsService.emit('tv-arrival');
    this.wsService.emit('tv-unload');
    this.wsService.emit('tv-load');
  }

  ngOnDestroy(): void {
    this.arrivalSubscription$.unsubscribe();
    this.unloadSubscription$.unsubscribe();
    this.loadSubscription$.unsubscribe();
  }
}
