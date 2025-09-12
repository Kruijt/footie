import { JSDOM } from 'jsdom';
import axios from 'axios';

(async () => {
  const matchPageData = new JSDOM((await axios.get('https://www.zvvdebevelanden.nl/speelschema/')).data);
  const matchPage = matchPageData.window.document;
  const teams = Array.from(matchPage.getElementById('filter_team')?.querySelectorAll('option') || [])
    .map((option) => option.getAttribute('value'))
    .filter((value) => !!value)
    .sort((a, b) => a.localeCompare(b, 'nl', { sensitivity: 'base' }))
    .map((team) => ({ name: team }));

  const matches = [
    ...Array.from(matchPage.querySelectorAll('.round_table .even_row:not(.mobile_row)') || []),
    ...Array.from(matchPage.querySelectorAll('.round_table .odd_row:not(.mobile_row)') || []),
  ].map((row) => {
    const [id, date, time, location, homeTeam, awayTeam, score, referee, notes] = Array.from(
      row.querySelectorAll('td') || [],
    ).map((td) => td.textContent?.trim() || '');

    const [day, month, year] =
      date
        ?.split(' ')?.[1]
        .split('-')
        .map((value) => parseInt(value)) || [];
    const [hour, minute] = time?.split(':').map((value) => parseInt(value)) || [];
    const [scoreHomeTeam, scoreAwayTeam] = score?.split('-').map((value) => (value ? parseInt(value) : null)) || [
      null,
      null,
    ];

    return {
      id,
      time: new Date(parseInt(`20${year}`), month - 1, day, hour, minute),
      location,
      homeTeam,
      awayTeam,
      scoreHomeTeam,
      scoreAwayTeam,
      referee,
      notes,
    };
  });

  const classes = matches
    .reduce((classes, match) => {
      const [matchClass] = match.id.split('-');

      const cl = classes.find((c) => c.id === matchClass) || { id: matchClass, teams: [] };

      if (!cl.teams.includes(match.awayTeam)) {
        cl.teams.push(match.awayTeam);
      }

      if (!cl.teams.includes(match.homeTeam)) {
        cl.teams.push(match.homeTeam);
      }

      if (!classes.includes(cl)) {
        classes.push(cl);
      }

      return classes;
    }, [])
    .sort((a, b) => a.id.localeCompare(b.id));
})();
