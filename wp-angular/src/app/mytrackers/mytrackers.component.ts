import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

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
    { title: 'Habit Tracker', route: '/trackers/habit', icon: '🔄' }, 
    { title: 'Water Tracker', route: '/trackers/water', icon: '💧' },
    { title: 'Study Tracker', route: '/trackers/study', icon: '📚' } 
  ];
  constructor(private router: Router, private authService: AuthService) {}

  logout(event?: Event) {
    event?.preventDefault();
    this.authService.logout().finally(() => {
      localStorage.removeItem('loggedIn');
      this.router.navigate(['/login']);
    });
  }
}
