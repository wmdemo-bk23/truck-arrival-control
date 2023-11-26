import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faExpand, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { PublicComponent } from 'src/app/layout/public/public.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CampusModalComponent } from './home/campus-modal/campus-modal.component';
import { HomeComponent } from './home/home.component';
import { PublicRoutingModule } from './public-routing.module';
import { TvComponent } from './tv/tv.component';

@NgModule({
  declarations: [
    TvComponent,
    PublicComponent,
    HomeComponent,
    CampusModalComponent,
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    SharedModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
})
export class PublicModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faExpand, faSyncAlt);
  }
}
