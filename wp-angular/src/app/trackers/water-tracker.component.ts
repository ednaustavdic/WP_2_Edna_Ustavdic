import { Component } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { TrackerService } from '../services/tracker.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-water-tracker',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './water-tracker.component.html',
  styleUrls: ['./water-tracker.component.css']
})
export class WaterTrackerComponent {
  days = Array.from({ length: 7 }, () => ({ count: 0 }));
  saved = false;
  edit = true;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private trackerService: TrackerService
  ) {
    this.loadWeek();
  }

  logout(event?: Event) {
    event?.preventDefault();
    this.authService.logout().finally(() => {
      localStorage.removeItem('loggedIn');
      window.location.href = '/login';
    });
  }

  private async loadWeek() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const weekId = this.trackerService.getWeekId();
    this.trackerService.trackerWeekData$(user.uid, 'water', weekId).subscribe((doc: any) => {
      const w = doc?.days;
      if (Array.isArray(w)) this.days = w.map((d: any) => ({ count: d?.count || 0 }));
      this.saved = false;
    });
  }

  inc(dayIdx: number) {}

  setCount(dayIdx: number, v: number) {
    this.days[dayIdx].count = v;
    this.saved = false;
  }

  async saveDay(dayIdx: number) {
    await this.saveWeek();
  }

  async saveWeek() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      const weekId = this.trackerService.getWeekId();
      await this.trackerService.saveTrackerWeekCollection(user.uid, 'water', weekId, { days: this.days });
      this.saved = true;
      this.edit = false;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteWeek() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.days = Array.from({ length: 7 }, () => ({ count: 0 }));
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.saveTrackerWeekCollection(user.uid, 'water', weekId, { days: this.days });
    this.saved = true;
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.deleteTrackerDayCollection(user.uid, 'water', weekId, dayIdx);
    this.days[dayIdx] = { count: 0 };
  }

}
