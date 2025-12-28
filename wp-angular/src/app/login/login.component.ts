import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  role = '';

  constructor(private router: Router) {}

  login() {
    if (this.username && this.password) {
      this.router.navigate(['/home']);
    }
  }
}
