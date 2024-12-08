import { Auth, signInWithPopup } from '@angular/fire/auth';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { browserLocalPersistence, GoogleAuthProvider } from '@firebase/auth';

@Component({
  selector: 'f-google-button',
  templateUrl: './google-button.component.html',
  styleUrl: './google-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GoogleButtonComponent {
  readonly auth = inject(Auth);

  readonly router = inject(Router);

  constructor() {
    this.auth.setPersistence(browserLocalPersistence);
  }

  onClick(): void {
    signInWithPopup(this.auth, new GoogleAuthProvider()).then((user) => {
      console.log('User signed in with Google:', user);

      this.router.navigate(['search']);
    });
  }
}
