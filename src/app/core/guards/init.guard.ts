import { map, of, switchMap } from 'rxjs';

import { inject } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, RedirectCommand, Router } from '@angular/router';
import { UserDbService } from '../services/database/user/user-db.service';
import { take } from 'rxjs/operators';

export function initGuard(route: ActivatedRouteSnapshot) {
  const router = inject(Router);
  const udb = inject(UserDbService);

  let childRoute = route;
  while (childRoute.firstChild) {
    childRoute = childRoute.firstChild;
  }

  const path = childRoute.url.map((segment) => segment.path).join('/');
  const isOnLogin = path.startsWith('login');
  const isOnSetup = path.startsWith('setup');

  return user(inject(Auth)).pipe(
    switchMap((user: User | null) => {
      const isLoggedIn = !!user;

      if (isLoggedIn) {
        return udb.userData$.pipe(
          take(1),
          map((userData) => {
            if (!userData?.team) {
              return isOnSetup ? of(true) : new RedirectCommand(router.createUrlTree(['setup']), { replaceUrl: true });
            } else {
              return isOnLogin || isOnSetup || path === ''
                ? new RedirectCommand(router.createUrlTree(['dashboard']), { replaceUrl: true })
                : of(true);
            }
          }),
        );
      } else {
        return isOnLogin ? of(true) : of(new RedirectCommand(router.createUrlTree(['login']), { replaceUrl: true }));
      }
    }),
  );
}
