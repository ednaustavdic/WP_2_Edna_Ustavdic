import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'wp-angular';

  ngOnInit(): void {
    const theme = localStorage.getItem('theme') || 'light';
    this.loadTheme(theme);
  }

  loadTheme(theme: string) {
    const existing = document.getElementById('theme-style');
    if (existing) {
      existing.remove();
    }
    const link = document.createElement('link');
    link.id = 'theme-style';
    link.rel = 'stylesheet';
    link.href = `assets/themes/${theme}.css`;
    document.head.appendChild(link);
  }
}
