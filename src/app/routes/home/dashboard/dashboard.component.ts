import { take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import ical, { ICalCalendarMethod } from 'ical-generator';

import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';

import { TeamsStorageService } from '../../../core/services/database/core/storage/teams/teams-storage.service';
import { UserDbService } from '../../../core/services/database/user/user-db.service';
import { MatchesStorageService } from '../../../core/services/database/core/storage/matches/matches-storage.service';
import { MatchScoreComponent } from '../../../shared/components/match-score/match-score.component';
import { MatchHeaderComponent } from '../../../shared/components/match-header/match-header.component';
import { LeagueRankingComponent } from '../../../shared/components/league-ranking/league-ranking.component';
import { MatchLast5Component } from '../../../shared/components/match-last-5/match-last-5.component';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'f-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    MatDialogModule,
    MatSnackBarModule,
    MatCard,
    MatCardTitle,
    MatCardHeader,
    AsyncPipe,
    MatCardSubtitle,
    MatCardContent,
    MatchScoreComponent,
    MatIcon,
    MatchHeaderComponent,
    LeagueRankingComponent,
    MatchLast5Component,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
  ],
})
export class DashboardComponent {
  readonly uds = inject(UserDbService);
  readonly tds = inject(TeamsStorageService);
  readonly mds = inject(MatchesStorageService);

  onEditTeam(): void {}

  onDownloadCalendar(): void {
    combineLatest([this.mds.upcomingTeamMatches$, this.tds.teams$])
      .pipe(take(1))
      .subscribe(([matches, teams]) => {
        if (matches?.length) {
          const calendar = ical({
            method: ICalCalendarMethod.ADD,
            events: matches.map((match) => {
              return {
                id: `footie-match-${match.id}`,
                start: new Date(match.time),
                end: new Date(match.time + 3.6e6),
                summary: `Zaalvoetbal wedstrijd ${teams.find((team) => team.id === match.homeTeam)?.name || match.homeTeam} tegen ${teams.find((team) => team.id === match.awayTeam)?.name || match.awayTeam}`,
                location: match.location,
              };
            }),
          });

          const a = document.createElement('a');
          const blob = new Blob([calendar.toString()], { type: 'text/calendar' });
          const url = URL.createObjectURL(blob);
          a.setAttribute('href', url);
          a.setAttribute('download', 'footie-calendar.ics');
          a.click();
        }
      });
  }
}
