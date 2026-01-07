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
  selector: 'app-study-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './study-tracker.component.html',
  styleUrls: ['./study-tracker.component.css']
})
export class StudyTrackerComponent {
  days = Array.from({ length: 7 }, () => ({ hours: 0 }));
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
    this.trackerService.trackerWeekData$(user.uid, 'study', weekId).subscribe((doc: any) => {
      const w = doc?.days;
      if (Array.isArray(w)) this.days = w.map((d: any) => ({ hours: d?.hours || 0 }));
      this.saved = false;
    });
  }

  setHours(dayIdx: number, v: number) {
    this.days[dayIdx].hours = v;
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
      await this.trackerService.saveTrackerWeekCollection(user.uid, 'study', weekId, { days: this.days });
      this.saved = true;
      this.edit = false;
    } catch (err) { console.error(err); }
  }

  async deleteWeek() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.days = Array.from({ length: 7 }, () => ({ hours: 0 }));
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.saveTrackerWeekCollection(user.uid, 'study', weekId, { days: this.days });
    this.saved = true;
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.deleteTrackerDayCollection(user.uid, 'study', weekId, dayIdx);
    this.days[dayIdx] = { hours: 0 };
  }

  dec(dayIdx: number) {
  }
}
