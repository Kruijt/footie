import { inject, Injectable } from '@angular/core';
import { AuthFirestoreService } from '../core/firestore/auth-firestore.service';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { Team, TeamPlayer } from '../../../../shared/models/teams.models';
import { TeamsStorageService } from '../core/storage/teams/teams-storage.service';
import { lastValue } from '../../../operators/last-value.operator';

@Injectable({
  providedIn: 'root',
})
export class TeamDbService extends AuthFirestoreService {
  readonly ts = inject(TeamsStorageService);

  readonly team$: Observable<Team | undefined> = this.ts.userTeam$.pipe(
    switchMap((team) =>
      team?.id
        ? this.getDoc<Team>(`teams/${team.id}`).pipe(
            map((dbTeam) => {
              return {
                ...team,
                ...dbTeam?.data(),
              };
            }),
            switchMap((dbTeam) =>
              this.getCollection<TeamPlayer>(`teams/${dbTeam.id}/players`).pipe(
                map((players) => {
                  return {
                    ...dbTeam,
                    players: players
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((player) => ({
                        ...player,
                        goals: player.goals || 0,
                      })),
                  };
                }),
              ),
            ),
            catchError(() => {
              return of(team);
            }),
          )
        : of(team),
    ),
    shareReplay(1),
  );

  readonly topScorers$ = this.team$.pipe(
    map((team) => (team?.players || []).sort((a, b) => (b.goals || 0) - (a.goals || 0))),
    shareReplay(1),
  );

  setGoals(player: TeamPlayer, goals: number): void {
    const team = lastValue(this.ts.userTeam$);

    if (team?.id) {
      this.updateDoc(`teams/${team.id}/players/${player.id}`, { goals });
    }
  }

  updateTeam(update: Partial<Team>): void {
    const team = lastValue(this.ts.userTeam$);

    if (team?.id) {
      this.updateDoc(`teams/${team.id}`, update);
    }
  }

  updatePlayers(players: TeamPlayer[]): void {
    const team = lastValue(this.ts.userTeam$);

    console.log({ players });

    if (team?.id && players?.length) {
      forkJoin(
        players.map((player) => {
          const update = {
            ...player,
            id: null,
          };

          return this.updateDoc(`teams/${team.id}/players/${player.id}`, update, player.id.startsWith('0.')).pipe(
            catchError((e) => {
              console.log({ player, e });
              return throwError(e);
            }),
          );
        }),
      ).subscribe();
    }
  }
}
