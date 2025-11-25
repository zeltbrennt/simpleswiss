export const recursiveSearch = (
  pairings: string,
  choices: string,
  players: Player[],
): string | undefined => {
  // pairing='Albert+Berta$Carlo...'
  if (choices === "") return pairings;
  const currentName = choices.split("$")[0];
  if (!currentName) return pairings + "$" + choices;
  const currentPlayer = players.find((p) => p.name === currentName);
  const playerChoides = choices
    .split("$")
    .filter((c) => !currentPlayer?.opponents.includes(c) && c !== currentName);
  if (playerChoides.length === 0) return undefined;
  for (let p of playerChoides) {
    let newPairins: string | undefined =
      pairings === ""
        ? currentName + "+" + p
        : pairings + "$" + currentName + "+" + p;
    newPairins = recursiveSearch(
      newPairins,
      choices
        .split("$")
        .filter((c) => c !== currentName && c !== p)
        .join("$"),
      players,
    );
    if (newPairins) return newPairins;
  }
};

export const newPlayer = (name: string): Player => {
  return {
    name: name,
    win: 0,
    loss: 0,
    draw: 0,
    opponents: [],
    playedAsWhite: 0,
    bucholz: 0,
  };
};
export const rankPlayers = (players: Player[]) => {
  players.sort((p1, p2) => {
    const a = p1.win + p1.draw / 2;
    const b = p2.win + p2.draw / 2;
    if (b == a) return p1.bucholz - p2.bucholz;
    return b - a;
  });
};
export const calculateBucholz = (player: Player, players: Player[]): number => {
  if (player.opponents.length === 0) return 0;
  const opponents = player.opponents.map((o) =>
    players.find((p) => p.name === o),
  );
  const scores = opponents.map((o) => (o?.win || 0) + (o?.draw || 0) / 2);
  return scores.reduce((a, b) => a + b);
};
export const saveSession = (
  players: Player[],
  games: Game[],
  pairings: Pairing[],
  round: number,
) => {
  sessionStorage.setItem(
    "session",
    JSON.stringify({
      players: players,
      games: games,
      pairings: pairings,
      round: round,
    } as Session),
  );
};
