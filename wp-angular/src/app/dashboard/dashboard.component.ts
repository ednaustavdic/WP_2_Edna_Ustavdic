import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.body.className = theme;
    }
  }

  logout() {
    localStorage.removeItem('loggedIn');
    this.router.navigate(['/']);
  }
}
