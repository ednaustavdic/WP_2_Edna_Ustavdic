import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUrl = '';
  sub: Subscription;
  theme = 'light';

  constructor(private router: Router) {
    this.currentUrl = router.url;
    this.sub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) this.currentUrl = e.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('theme') || 'light';
    this.theme = saved.startsWith('theme-') ? saved.substring(6) : saved;
  }

  get isDashboard() {
    return this.currentUrl.startsWith('/dashboard') || this.currentUrl.startsWith('/mytrackers') || this.currentUrl.startsWith('/trackers/water');
  }

  goExternal(url: string, ev?: Event) {
    if (ev) ev.preventDefault();
    window.location.href = url;
  }

  goToLogin(ev?: Event) {
    if (ev) ev.preventDefault();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
