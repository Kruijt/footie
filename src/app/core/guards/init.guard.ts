import { map } from 'rxjs';

import { inject } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, RedirectCommand, Router } from '@angular/router';

export function initGuard(route: ActivatedRouteSnapshot) {
  const router = inject(Router);

  let childRoute = route;
  while (childRoute.firstChild) {
    childRoute = childRoute.firstChild;
  }

  const path = childRoute.url.map((segment) => segment.path).join('/');

  return user(inject(Auth)).pipe(
    map((user: User) => {
      const isLoggedIn = !!user;
      const isOnLogin = path.startsWith('login');

      if ((isLoggedIn && isOnLogin) || path === '') {
        return new RedirectCommand(router.createUrlTree(['search']), { replaceUrl: true });
      } else if (!isLoggedIn && !isOnLogin) {
        return new RedirectCommand(router.createUrlTree(['login']), { replaceUrl: true });
      } else {
        return true;
      }
    }),
  );
}
