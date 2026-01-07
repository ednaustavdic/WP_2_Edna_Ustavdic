import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.body.className = theme;
    }
  }

  logout() {
    this.authService.logout().finally(() => {
      localStorage.removeItem('loggedIn');
      this.router.navigate(['/login']);
    });
  }
}
