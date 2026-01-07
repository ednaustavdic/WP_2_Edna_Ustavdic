import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TrackerService } from '../services/tracker.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-migrate-trackers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:20px; max-width:900px; margin:0 auto;">
      <h2>Tracker migration</h2>
      <p *ngIf="!running">Migration</p>
      <p *ngIf="running">Running... {{progress}}</p>
      <button (click)="migrate()" [disabled]="running">Migrate</button>
      <pre style="white-space:pre-wrap; background:#f7f7f7; padding:12px; border-radius:8px; margin-top:12px">{{log}}</pre>
    </div>
  `
})
export class MigrateTrackersComponent implements OnInit {
  running = false;
  log = '';
  progress = '';

  constructor(private auth: AuthService, private tracker: TrackerService) {}

  ngOnInit(): void {}

  async migrate() {
    this.running = true;
    this.log = '';
    try {
      const user = await firstValueFrom(this.auth.user$);
      if (!user) {
        this.log = 'Not logged in.';
        this.running = false;
        return;
      }
      const uid = user.uid;
      this.append('Fetching user doc...');
      const userDoc = await firstValueFrom(this.tracker.userDocData(uid));
      const keys = ['water','sleep','meals','screentime','habits','study'];
      for (const k of keys) {
        const weeks = userDoc?.[k] || {};
        const weekIds = Object.keys(weeks);
        this.append(`${k}: found ${weekIds.length} weeks`);
        for (const wid of weekIds) {
          const data = weeks[wid];
          this.append(`  -> writing ${k}/${wid}`);
          await this.tracker.saveTrackerWeekCollection(uid, k, wid, data);
          this.append(`  -> written ${k}/${wid}`);
        }
      }
      this.append('Migration complete.');
    } catch (e: any) {
      this.append('Error: ' + (e?.message || e));
    } finally {
      this.running = false;
    }
  }

  append(s: string) {
    this.log = this.log + s + '\n';
    this.progress = s;
  }
}
