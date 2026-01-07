import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentFunZoneRedirectComponent } from './student-fun-zone-redirect.component';
import { StudentFunZoneComponent } from './student-fun-zone/student-fun-zone.component';
import { MyTrackersComponent } from './mytrackers/mytrackers.component';
import { ProfileComponent } from './profile/profile.component';
import { WaterTrackerComponent } from './trackers/water-tracker.component';
import { SleepTrackerComponent } from './trackers/sleep-tracker.component';
import { MealTrackerComponent } from './trackers/meal-tracker.component';
import { ScreenTimeTrackerComponent } from './trackers/screentime-tracker.component';
import { HabitTrackerComponent } from './trackers/habit-tracker.component';
import { StudyTrackerComponent } from './trackers/study-tracker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, children: [
    { path: 'profile', component: ProfileComponent },
    { path: 'student-fun-zone', component: StudentFunZoneComponent }
  ] },
  { path: 'mytrackers', component: MyTrackersComponent },
  { path: 'trackers/water', component: WaterTrackerComponent },
  { path: 'trackers/sleep', component: SleepTrackerComponent },
  { path: 'trackers/meal', component: MealTrackerComponent },
  { path: 'trackers/screentime', component: ScreenTimeTrackerComponent },
  { path: 'trackers/habit', component: HabitTrackerComponent },
  { path: 'trackers/study', component: StudyTrackerComponent },
];
