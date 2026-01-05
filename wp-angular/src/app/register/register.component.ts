import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

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
    private auth: Auth
  ) {}

  onRegister() {
    this.showErrors = true;
    if (!this.isFormValid()) return;

    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then(() => {
        localStorage.setItem('theme', 'theme-' + this.selectedTheme);
        this.applyTheme(this.selectedTheme);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        this.error = err?.message || 'Registracija nije uspjela';
      });
  }

  onThemeChange(theme: string) {
    this.selectedTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('theme', 'theme-' + theme);
  }

  private applyTheme(theme: string) {
    const link = document.getElementById('theme-style') as HTMLLinkElement | null;
    if (link) {
      link.href = `assets/themes/theme-${theme}.css`;
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
