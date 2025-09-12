import { Component, inject } from '@angular/core';
import { GoogleButtonComponent } from '../../shared/components/google-button/google-button.component';
import { MatDivider } from '@angular/material/divider';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'f-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    GoogleButtonComponent,
    MatDivider,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
    MatPrefix,
    MatButton,
    ReactiveFormsModule,
  ],
})
export class LoginComponent {
  readonly auth = inject(Auth);

  readonly router = inject(Router);

  readonly fb = inject(FormBuilder);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      if (email && password) {
        createUserWithEmailAndPassword(this.auth, email, password)
          .catch(() => signInWithEmailAndPassword(this.auth, email, password))
          .then(() => this.router.navigate(['dashboard']));
      }
    }
  }
}
