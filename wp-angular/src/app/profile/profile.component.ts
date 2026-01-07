import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TrackerService } from '../services/tracker.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  loading = true;

  trackers: any[] = [];
  weekId = '';
  waterWeek: any = null;
  sleepWeek: any = null;
  mealWeek: any = null;
  screentimeWeek: any = null;
  habitWeek: any = null;
  studyWeek: any = null;

  constructor(
    private authService: AuthService,
    private firestore: Firestore
    , private trackerService: TrackerService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      if (!user) {
        this.loading = false;
        return;
      }

      this.trackers = [];
      this.weekId = this.trackerService.getWeekId();

      
      try {
        const uid = user.uid;
        const [waterDoc, sleepDoc, mealsDoc, screenDoc, habitsDoc, studyDoc] = await Promise.all([
          firstValueFrom(this.trackerService.trackerWeekData$(uid, 'water', this.weekId)),
          firstValueFrom(this.trackerService.trackerWeekData$(uid, 'sleep', this.weekId)),
          firstValueFrom(this.trackerService.trackerWeekData$(uid, 'meals', this.weekId)),
          firstValueFrom(this.trackerService.trackerWeekData$(uid, 'screentime', this.weekId)),
          firstValueFrom(this.trackerService.trackerWeekData$(uid, 'habits', this.weekId)),
          firstValueFrom(this.trackerService.trackerWeekData$(uid, 'study', this.weekId)),
        ]).catch(() => [null, null, null, null, null, null]);

        this.waterWeek = (waterDoc && Object.keys(waterDoc).length) ? waterDoc : null;
        this.sleepWeek = (sleepDoc && Object.keys(sleepDoc).length) ? sleepDoc : null;
        this.mealWeek = (mealsDoc && Object.keys(mealsDoc).length) ? mealsDoc : null;
        this.screentimeWeek = (screenDoc && Object.keys(screenDoc).length) ? screenDoc : null;
        this.habitWeek = (habitsDoc && Object.keys(habitsDoc).length) ? habitsDoc : null;
        this.studyWeek = (studyDoc && Object.keys(studyDoc).length) ? studyDoc : null;
      } catch (e) {
        console.warn('Profile load error', e);
      } finally {
        this.loading = false;
      }
    });
  }

  saveAsPdf() {
    try {
      const el = document.createElement('div');
      el.style.padding = '18px';
      el.style.fontFamily = 'Segoe UI, Tahoma, sans-serif';
      el.innerHTML = `<h2>Statistika - sedmica ${this.weekId || ''}</h2>`;

      const sections: { title: string; content: string }[] = [];

      sections.push({ title: 'Voda', content: `<div>Ukupno: ${this.totalByProp(this.waterWeek?.days, 'count')} čaša</div>` });
      sections.push({ title: 'San', content: `<div>Ukupno sati: ${this.totalByProp(this.sleepWeek?.days, 'hours')}h</div>` });
      sections.push({ title: 'Obroci', content: `<div>Ukupno: ${this.totalCount(this.mealWeek?.days)} obroka</div>` });
      sections.push({ title: 'Vrijeme pred ekranom', content: `<div>Ukupno: ${this.totalMinutes(this.screentimeWeek?.days)} min</div>` });
      sections.push({ title: 'Navike', content: `<div>Ukupno odrađenih dana: ${this.totalDone(this.habitWeek?.days)}</div>` });
      sections.push({ title: 'Učenje', content: `<div>Ukupno: ${this.totalMinutes(this.studyWeek?.days)} min</div>` });

      sections.forEach(s => {
        el.innerHTML += `<h3 style="margin-top:12px">${s.title}</h3>` + s.content;
      });

      const winAny: any = window as any;
      const opt = { margin: 10, filename: 'tracker_stats.pdf', image: { type: 'png', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };

      if (winAny.html2pdf) {
        winAny.html2pdf().set(opt).from(el).save();
      } else {
        const w = window.open('', '_blank');
        if (!w) { alert('Nije moguće otvoriti prozor za ispis.'); return; }
        w.document.write('<html><head><title>Statistika</title></head><body>' + el.innerHTML + '</body></html>');
        w.document.close();
        w.focus();
        w.print();
        w.close();
      }
    } catch (e) {
      console.error('SaveAsPdf error', e);
      alert('Greška pri snimanju PDF-a');
    }
  }

  totalByProp(days: any[] | undefined, prop: string) {
    if (!Array.isArray(days)) return 0;
    return days.reduce((s: number, x: any) => s + (Number(x?.[prop]) || 0), 0);
  }

  totalMinutes(days: any[] | undefined) {
    if (!Array.isArray(days)) return 0;
    return days.reduce((s: number, x: any) => s + ((Number(x?.hours) || 0) * 60), 0);
  }

  totalCount(days: any[] | undefined) {
    if (!Array.isArray(days)) return 0;
    return days.reduce((s: number, x: any) => s + (Number(x?.count) || 0), 0);
  }

  totalDone(days: any[] | undefined, prop = 'done') {
    if (!Array.isArray(days)) return 0;
    return days.reduce((s: number, x: any) => s + (x?.[prop] ? 1 : 0), 0);
  }
}
