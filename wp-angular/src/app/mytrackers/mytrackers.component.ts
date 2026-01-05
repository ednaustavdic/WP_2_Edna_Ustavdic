import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mytrackers',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './mytrackers.component.html',
  styleUrls: ['./mytrackers.component.css']
})
export class MyTrackersComponent {
  trackers = [
    { title: 'Sleep Tracker', route: '/trackers/sleep', icon: '🛌' },
    { title: 'Meal Tracker', route: '/trackers/meal', icon: '🍽️' },
    { title: 'Screen Time Tracker', route: '/trackers/screentime', icon: '📱' },
    { title: 'Habit Tracker', route: '/trackers/habit', icon: '🔄' }, /* find bet ico*/
    { title: 'Water Tracker', route: '/trackers/water', icon: '💧' },
    { title: 'Study Tracker', route: '/trackers/study', icon: '📚' } /* find the red one to go w rand theme */
  ];
}
