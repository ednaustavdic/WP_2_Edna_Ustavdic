import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../services/theme.service';

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

  constructor(private router: Router, private themeService: ThemeService) {
    this.currentUrl = router.url;
    this.sub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) this.currentUrl = e.urlAfterRedirects;
    });
  }

  toggleDark(ev?: Event) {
    ev?.preventDefault();
    console.log('[Header] toggleDark clicked');
    this.themeService.toggleDark();
  
    const saved = localStorage.getItem('theme') || 'light';
    this.theme = saved.startsWith('theme-') ? saved.substring(6) : saved;
  }

  surpriseMe(ev?: Event) {
    ev?.preventDefault();
    this.themeService.surpriseMe();
  }

  _toggleFallback(surprise = false) {
    if (surprise) {
      const color = '#'+Math.floor(Math.random()*16777215).toString(16);
      document.documentElement.style.setProperty('--primary', color);
    } else {
      document.documentElement.classList.toggle('theme-dark');
    }
  }

  ngOnInit(): void {
    const raw = localStorage.getItem('theme') || 'light';
    this.theme = raw.startsWith('theme-') ? raw.substring(6) : raw;
    localStorage.setItem('theme', this.theme);
  }

  get isDashboard() {
    return this.currentUrl.startsWith('/dashboard') || this.currentUrl.startsWith('/mytrackers') || this.currentUrl.startsWith('/trackers');
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
