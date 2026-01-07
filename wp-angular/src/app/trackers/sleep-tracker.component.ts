import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { firstValueFrom } from 'rxjs';
import { TrackerService } from '../services/tracker.service';

@Component({
  selector: 'app-sleep-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sleep-tracker.component.html',
  styleUrls: ['./sleep-tracker.component.css']
})
export class SleepTrackerComponent {
  days = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];
  sleepData = this.days.map(() => ({ hours: 0, quality: 0 }));
  saved = false;
  edit = true;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router,
    private trackerService: TrackerService
  ) {
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
    this.trackerService.trackerWeekData$(user.uid, 'sleep', weekId).subscribe((doc: any) => {
      const w = doc?.days;
      if (Array.isArray(w)) this.sleepData = w.map((d: any) => ({ hours: d?.hours || 0, quality: d?.quality || 0 }));
      this.saved = false;
    });
  }

  setHours(dayIdx: number, value: number) {
    this.sleepData[dayIdx].hours = value;
    this.saved = false;
  }

  setQuality(dayIdx: number, value: number) {
    this.sleepData[dayIdx].quality = value;
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
      await this.trackerService.saveTrackerWeekCollection(user.uid, 'sleep', weekId, { days: this.sleepData });
      this.saved = true;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.deleteTrackerDayCollection(user.uid, 'sleep', weekId, dayIdx);
    this.sleepData[dayIdx] = { hours: 0, quality: 0 };
  }

  async deleteWeek() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.sleepData = this.days.map(() => ({ hours: 0, quality: 0 }));
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.saveTrackerWeekCollection(user.uid, 'sleep', weekId, { days: this.sleepData });
    this.saved = true;
  }

  inc(dayIdx: number) {
  }
}
