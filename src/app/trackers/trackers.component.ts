import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trackers',
  standalone: true,
  templateUrl: './trackers.component.html'
})
export class TrackersComponent {
  constructor(private router: Router) {}

  goWater() {
    this.router.navigate(['/water']);
  }
}
