import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyTrackersComponent } from './mytrackers/mytrackers.component';
import { WaterTrackerComponent } from './trackers/water-tracker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'mytrackers', component: MyTrackersComponent },
  { path: 'trackers/water', component: WaterTrackerComponent },
  
];
