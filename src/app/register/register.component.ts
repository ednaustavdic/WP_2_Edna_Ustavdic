import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  selectedTheme = 'light';
  showErrors = false;
  error = '';

  constructor(
    private router: Router,
    private auth: Auth,
    private themeService: ThemeService
  ) {}

  onRegister() {
    this.showErrors = true;
    if (!this.isFormValid()) return;

    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then(async () => {
        try {
          if (this.selectedTheme === 'surprise') {
            const color = this.themeService.randomColor();
            this.themeService.applyTheme('surprise', color);
            await this.themeService.setThemeForUser('surprise');
            await this.themeService.setPrimaryColorForUser(color);
          } else {
            const existingColor = localStorage.getItem('primaryColor') || undefined;
            this.themeService.applyTheme(this.selectedTheme, existingColor);
            await this.themeService.setThemeForUser(this.selectedTheme);
            if (existingColor) await this.themeService.setPrimaryColorForUser(existingColor);
          }
        } catch (e) {
        }
        localStorage.setItem('loggedIn', '1');
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        this.error = err?.message || 'Registracija nije uspjela';
      });
  }

  onThemeChange(theme: string) {
    this.selectedTheme = theme;
    if (theme === 'surprise') {
      this.themeService.surpriseMe();
    } else {
      this.applyTheme(theme);
      this.themeService.applyTheme(theme, localStorage.getItem('primaryColor') || undefined);
    }
    localStorage.setItem('theme', theme);
  }

  private applyTheme(theme: string) {
    const link = document.getElementById('theme-style') as HTMLLinkElement | null;
    if (link) {
      const fileTheme = theme === 'surprise' ? 'light' : theme;
      link.href = `assets/themes/theme-${fileTheme}.css`;
    }
  }

  isNameValid() {
    return this.name.trim().length > 0 && !/\d/.test(this.name);
  }

  isEmailValid() {
    return this.email.includes('@');
  }

  isPasswordValid() {
    return this.password.length > 0;
  }

  isFormValid() {
    return this.isNameValid() && this.isEmailValid() && this.isPasswordValid();
  }
}
