import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  onLogin() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch(() => {
        this.error = 'Korisnik ne postoji. Registrujte se.';
      });
  }
}
