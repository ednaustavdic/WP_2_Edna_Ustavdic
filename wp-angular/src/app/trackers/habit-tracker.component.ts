import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TrackerService } from '../services/tracker.service';

@Component({
  selector: 'app-habit-tracker',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.css']
})
export class HabitTrackerComponent {
  days = Array.from({ length: 7 }, () => ({ completed: 0 }));
  saved = false;
  edit = true;

  constructor(
    private authService: AuthService,
    private trackerService: TrackerService,
    private router: Router
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
    this.trackerService.trackerWeekData$(user.uid, 'habits', weekId).subscribe((doc: any) => {
      const w = doc?.days;
      if (Array.isArray(w)) this.days = w.map((d: any) => ({ completed: d?.completed || 0 }));
      this.saved = false;
    });
  }

  inc(dayIdx: number) {
    this.days[dayIdx].completed = (this.days[dayIdx].completed || 0) + 1;
    this.saved = false;
  }

  dec(dayIdx: number) {
    this.days[dayIdx].completed = Math.max(0, (this.days[dayIdx].completed || 0) - 1);
    this.saved = false;
  }

  setCompleted(dayIdx: number, v: number) {
    this.days[dayIdx].completed = v;
    this.saved = false;
  }

  async saveWeek() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      const weekId = this.trackerService.getWeekId();
      await this.trackerService.saveTrackerWeekCollection(user.uid, 'habits', weekId, { days: this.days });
      this.saved = true;
      this.edit = false;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteWeek() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.days = Array.from({ length: 7 }, () => ({ completed: 0 }));
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.saveTrackerWeekCollection(user.uid, 'habits', weekId, { days: this.days });
    this.saved = true;
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const weekId = this.trackerService.getWeekId();
    await this.trackerService.deleteTrackerDayCollection(user.uid, 'habits', weekId, dayIdx);
    this.days[dayIdx] = { completed: 0 };
  }

}
