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
  days = Array.from({ length: 31 }, () => ({ count: 0 }));
  saved = false;
  edit = true;
  selectedDate: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private trackerService: TrackerService
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
      window.location.href = '/login';
    });
  }

  private async loadMonth() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const monthId = this.trackerService.getMonthId();
    this.trackerService.trackerMonthData$(user.uid, 'water', monthId).subscribe((doc: any) => {
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
    await this.saveMonth();
  }

  async saveMonth() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      const monthId = this.trackerService.getMonthId();
      await this.trackerService.saveTrackerMonthCollection(user.uid, 'water', monthId, { days: this.days });
      this.saved = true;
      this.edit = false;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteMonth() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.days = Array.from({ length: 31 }, () => ({ count: 0 }));
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.saveTrackerMonthCollection(user.uid, 'water', monthId, { days: this.days });
    this.saved = true;
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.deleteTrackerDayMonthCollection(user.uid, 'water', monthId, dayIdx);
    this.days[dayIdx] = { count: 0 };
  }

}
