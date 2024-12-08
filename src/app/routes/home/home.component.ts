import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { Auth, user, User } from '@angular/fire/auth';
import { map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
    selector: 'f-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterOutlet,
        MatSidenavContainer,
        MatSidenav,
        MatSidenavContent,
        MatToolbar,
        MatIconButton,
        MatIcon,
        MatNavList,
        MatListItemIcon,
        MatListItemTitle,
        RouterLinkActive,
        MatDivider,
        MatListItem,
        RouterLink,
        MatDivider,
        AsyncPipe,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
    ]
})
export class HomeComponent {
  private auth: Auth = inject(Auth);

  readonly user$: Observable<User> = user(this.auth);

  readonly avatar$ = this.user$.pipe(map((user) => user?.photoURL));

  protected sidenavOpen = false;

  constructor(private router: Router) {}

  onLogout(): void {
    this.auth.signOut().then(() => this.router.navigate(['login']));
  }
}
