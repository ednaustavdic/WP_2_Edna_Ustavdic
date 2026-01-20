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
  monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  sleepData = this.monthDays.map(() => ({ hours: 0, quality: 0 }));
  saved = false;
  edit = true;
  selectedDate: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router,
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
      this.router.navigate(['/login']);
    });
  }

  private async loadMonth() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const monthId = this.trackerService.getMonthId();
    this.trackerService.trackerMonthData$(user.uid, 'sleep', monthId).subscribe((doc: any) => {
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
    await this.saveMonth();
  }

  async saveMonth() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return;
      const monthId = this.trackerService.getMonthId();
      await this.trackerService.saveTrackerMonthCollection(user.uid, 'sleep', monthId, { days: this.sleepData });
      this.saved = true;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteDay(dayIdx: number) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.deleteTrackerDayMonthCollection(user.uid, 'sleep', monthId, dayIdx);
    this.sleepData[dayIdx] = { hours: 0, quality: 0 };
  }

  async deleteMonth() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;
    this.sleepData = this.monthDays.map(() => ({ hours: 0, quality: 0 }));
    const monthId = this.trackerService.getMonthId();
    await this.trackerService.saveTrackerMonthCollection(user.uid, 'sleep', monthId, { days: this.sleepData });
    this.saved = true;
  }

  inc(dayIdx: number) {
  }
}
