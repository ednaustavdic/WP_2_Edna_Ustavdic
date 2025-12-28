import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { TrackersComponent } from './trackers/trackers.component';
import { WaterComponent } from './water/water.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'trackers', component: TrackersComponent },
  { path: 'water', component: WaterComponent }
];
