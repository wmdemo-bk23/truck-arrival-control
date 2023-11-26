import { Component, OnInit } from '@angular/core';
import { WebsocketService } from './shared/services/websocket.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="layout">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
