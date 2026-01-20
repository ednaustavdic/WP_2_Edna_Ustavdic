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
  days = Array.from({ length: 31 }, () => ({ completed: 0 }));
  saved = false;
  edit = true;
  selectedDate: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private authService: AuthService,
    private trackerService: TrackerService,
    private router: Router
  ) {
    this.loadMonth();
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) this.calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) this.calendarDays.push(i);
  }

  selectDate(day: number) {
    this.selectedDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  getSelectedDayIndex(): number {
    return this.selectedDate.getDate() - 1;
  }

  logout(event?: Event) {
    event?.preventDefault();
    this.authService.logout().finally(() => {
      localStorage.removeItem('loggedIn');
      this.router.navigate(['/login']);
    });
  }

  private async loadMonth() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const monthId = this.trackerService.getMonthId();
    this.trackerService.trackerMonthData$(user.uid, 'habits', monthId).subscribe((doc: any) => {
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

  toggleCompleted(dayIdx: number) {
    this.days[dayIdx].completed = this.days[dayIdx].completed ? 0 : 1;
    this.saved = false;
  }

  getTotalCompletions(): number {
    return this.days.reduce((sum, day) => sum + (day?.completed || 0), 0);
  }

  async saveMonth() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      const monthId = this.trackerService.getMonthId();
      await this.trackerService.saveTrackerMonthCollection(user.uid, 'habits', monthId, { days: this.days });
      this.saved = true;
      this.edit = false;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteMonth() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.days = Array.from({ length: 31 }, () => ({ completed: 0 }));
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.saveTrackerMonthCollection(user.uid, 'habits', monthId, { days: this.days });
    this.saved = true;
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.deleteTrackerDayMonthCollection(user.uid, 'habits', monthId, dayIdx);
    this.days[dayIdx] = { completed: 0 };
  }

}
