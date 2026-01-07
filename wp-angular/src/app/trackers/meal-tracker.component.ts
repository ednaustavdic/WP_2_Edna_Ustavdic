import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { TrackerService } from '../services/tracker.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-meal-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './meal-tracker.component.html',
  styleUrls: ['./meal-tracker.component.css']
})
export class MealTrackerComponent {
  days = Array.from({ length: 7 }, () => ({ count: 0 }));
  saved = false;
  edit = true;

  constructor(private firestore: Firestore, private authService: AuthService, private trackerService: TrackerService, private router: Router) {
    this.loadWeek();
  }

  logout(event?: Event) {
    event?.preventDefault();
    this.authService.logout().finally(() => {
      localStorage.removeItem('loggedIn');
      this.router.navigate(['/login']);
    });
  }

  private async loadWeek() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const weekId = this.trackerService.getWeekId();
    this.trackerService.trackerWeekData$(user.uid, 'meals', weekId).subscribe((doc: any) => {
      const w = doc?.days;
      if (Array.isArray(w)) this.days = w.map((d: any) => ({ count: d?.count || 0 }));
      this.saved = false;
    });
  }

  inc(dayIdx: number) {
  }

  setCount(dayIdx: number, v: number) {
    this.days[dayIdx].count = v;
    this.saved = false;
  }

  async saveDay(dayIdx: number) {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      await this.saveWeek();
    } catch (err) {
      console.error(err);
    }
  }

  async saveWeek() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      const weekId = this.trackerService.getWeekId();
      await this.trackerService.saveTrackerWeekCollection(user.uid, 'meals', weekId, { days: this.days });
      this.saved = true;
      this.edit = false;
    } catch (err) { console.error(err); }
  }

  async deleteWeek() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.days = Array.from({ length: 7 }, () => ({ count: 0 }));
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.saveTrackerWeekCollection(user.uid, 'meals', weekId, { days: this.days });
    this.saved = true;
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.deleteTrackerDayCollection(user.uid, 'meals', weekId, dayIdx);
    this.days[dayIdx] = { count: 0 };
  }

}
