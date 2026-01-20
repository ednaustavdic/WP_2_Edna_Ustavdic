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
  selector: 'app-screentime-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './screentime-tracker.component.html',
  styleUrls: ['./screentime-tracker.component.css']
})
export class ScreenTimeTrackerComponent {
  days = Array.from({ length: 31 }, () => ({ hours: 0 }));
  saved = false;
  edit = true;
  selectedDate: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private firestore: Firestore, private authService: AuthService, private trackerService: TrackerService, private router: Router) {
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
    this.trackerService.trackerMonthData$(user.uid, 'screentime', monthId).subscribe((doc: any) => {
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
    await this.saveMonth();
  }

  async saveMonth() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      const monthId = this.trackerService.getMonthId();
      await this.trackerService.saveTrackerMonthCollection(user.uid, 'screentime', monthId, { days: this.days });
      this.saved = true;
      this.edit = false;
    } catch (err) { console.error(err); }
  }

  async deleteMonth() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.days = Array.from({ length: 31 }, () => ({ hours: 0 }));
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.saveTrackerMonthCollection(user.uid, 'screentime', monthId, { days: this.days });
    this.saved = true;
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.deleteTrackerDayMonthCollection(user.uid, 'screentime', monthId, dayIdx);
    this.days[dayIdx] = { hours: 0 };
  }

  dec(dayIdx: number) {
  }
}
