type Game = {
  white: string;
  black: string;
  result: string;
  round: number;
};
type Player = {
  name: string;
  win: number;
  loss: number;
  draw: number;
  opponents: string[];
  playedAsWhite: number;
  bucholz: number;
};
type Pairing = {
  id: string;
  white: Player;
  black: Player;
};

type Session = {
  players: Player[];
  games: Game[];
  pairings: Pairin[];
  round: number;
};
