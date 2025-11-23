<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";

  let newPlayerName = $state("");
  let showTipp = $state(true);
  let newRoundError = $state(false);
  const gamesStored = JSON.parse(sessionStorage.getItem("games"));
  const playersStored = JSON.parse(sessionStorage.getItem("players"));
  const turnamentStartStored = sessionStorage.getItem("started");
  const pairingsStored = JSON.parse(sessionStorage.getItem("pairings"));
  const roundStored = sessionStorage.getItem("round");
  let round = $state(roundStored ? parseInt(roundStored) : 0);
  let inputError = $state(false);
  let games = $state<Game[]>(gamesStored ? gamesStored : []);
  $inspect(turnamentStartStored);
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
  };
  type Pairing = {
    id: string;
    white: Player;
    black: Player;
  };
  const newPlayer = (name: string): Player => {
    return {
      name: name,
      win: 0,
      loss: 0,
      draw: 0,
      opponents: [],
      playedAsWhite: 0,
    };
  };

  let players = $state<Player[]>(
    playersStored
      ? playersStored
      : [
          newPlayer("Albert"),
          newPlayer("Berta"),
          newPlayer("Caroline"),
          newPlayer("David"),
          newPlayer("Elenore"),
          newPlayer("Ferdinand"),
        ],
  );

  let pairings = $state<Pairing[]>(pairingsStored ? pairingsStored : []);

  let turnamentStart = $state(pairings.length > 0 ? true : false);
  const addPlayer = () => {
    if (players.find((player) => player.name === newPlayerName)) {
      inputError = true;
    } else {
      inputError = false;
      players.push(newPlayer(newPlayerName));
    }
    newPlayerName = "";
  };

  const rankPlayers = () => {
    players.sort((p1, p2) => {
      const a = p1.win + p1.draw / 2;
      const b = p2.win + p2.draw / 2;
      if (b === a) return calculateBucholz(p2) - calculateBucholz(p1);
      return b - a;
    });
  };
  const newRound = () => {
    // vermutlich lieber als baumsuche, da nicht immer alle paarungen gefunden werden :(
    pairings.length = 0;
    rankPlayers();
    const nextRound =
      recursiveSearch("", players.map((p) => p.name).join("$"))?.split("$") ||
      [];
    for (let pair of nextRound) {
      const pairSplit = pair.split("+");
      const p1 = players.find((p) => p.name === pairSplit[0]);
      const p2 = players.find((p) => p.name === pairSplit[1]);

      if (!p1 || !p2) {
        console.error("something went wrong while calculating the next round");
        return;
      }
      if (p1.playedAsWhite >= p2.playedAsWhite) {
        pairings.push({ id: `${p2.name} vs ${p1.name}`, white: p2, black: p1 });
      } else
        pairings.push({ id: `${p1.name} vs ${p2.name}`, white: p1, black: p2 });
      p1.opponents.push(p2.name);
      p2.opponents.push(p1.name);
    }
    sessionStorage.setItem("players", JSON.stringify(players));
    sessionStorage.setItem("games", JSON.stringify(games));
    round++;
    sessionStorage.setItem("round", round.toString());
    sessionStorage.setItem("pairings", JSON.stringify(pairings));
    Array.from(document.getElementsByClassName("centerButton")).forEach(
      (element) => {
        element.ariaLabel = "vs";
      },
    );
  };

  const recursiveSearch = (
    pairings: string,
    choices: string,
  ): string | undefined => {
    // pairing='Albert$Berta$Carlo...'
    if (choices === "") return pairings;
    const currentName = choices.split("$")[0];
    if (!currentName) return pairings + "$" + choices;
    const currentPlayer = players.find((p) => p.name === currentName);
    const playerChoides = choices
      .split("$")
      .filter(
        (c) => !currentPlayer?.opponents.includes(c) && c !== currentName,
      );
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
      );
      if (newPairins) return newPairins;
    }
  };

  const handleResultSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    newRoundError = false;
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const matches = Array.from(formData.entries());
    if (matches.length * 2 !== players.length) {
      newRoundError = true;
      return;
    }
    for (let match of matches) {
      const pairing = pairings.find((p) => p.id === match[0]);
      if (!pairing) continue;
      let game: Game = {
        white: pairing.white.name,
        black: pairing.black.name,
        result: "",
        round: round,
      };
      pairing.white.playedAsWhite++;
      if (pairing.white.name === match[1]) {
        pairing.white.win++;
        pairing.black.loss++;
        game.result = "1-0";
      } else if (pairing.black.name === match[1]) {
        pairing.white.loss++;
        pairing.black.win++;
        game.result = "0-1";
      } else {
        pairing.black.draw++;
        pairing.white.draw++;
        game.result = "½-½";
      }
      games.push(game);
    }
    newRound();
    form.reset();
  };

  const calculateBucholz = (player: Player): number => {
    if (player.opponents.length === 0) return 0;
    const opponents = player.opponents.map((o) =>
      players.find((p) => p.name === o),
    );
    const scores = opponents.map((o) => (o?.win || 0) + (o?.draw || 0) / 2);
    return scores.reduce((a, b) => a + b);
  };
  const handlePlayerSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    addPlayer();
  };
  const handleClick = (event: MouseEvent) => {
    const element = event.target as HTMLInputElement;
    if (element.value === "draw") {
      element.ariaLabel = "draw";
    } else {
      const centerButton = Array.from(
        document.getElementsByName(element.name),
      ).find((e) => e.value === "draw");
      centerButton!.ariaLabel = "vs";
    }
  };
</script>

<main class="m-5 h-screen">
  <h1 class="text text-center text-3xl text-primary font-bold">
    Simple Swiss Tournament Creator
  </h1>
  {#if !turnamentStart}
    <div>
      <form class="flex gap-2 my-10" onsubmit={handlePlayerSubmit}>
        <input
          type="text"
          class="grow input"
          class:input-error={inputError}
          bind:value={newPlayerName}
        />
        <button class="btn">Add</button>
      </form>
      <button
        disabled={players.length < 2 || players.length % 2 == 1}
        class="btn btn-primary w-full p-5"
        onclick={() => {
          turnamentStart = true;
          newRound();
          sessionStorage.setItem("stared", "true");
        }}>Start</button
      >
      <ul class="list">
        {#each players as player}
          <li class="list-row w-full">
            {player.name}
            <div class="grow"></div>
            <button
              aria-label="delete"
              class="btn btn-square btn-error btn-xs"
              onclick={() =>
                (players = players.filter((p) => p.name !== player.name))}
              >X
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {:else}
    <h1 class="text text-3xl text-center my-5">Round {round}</h1>
    {#if pairings.length === 0}
      <p class="text p-5">No new pairings possible</p>
    {/if}

    <dialog class="modal" id="help-modal">
      <div class="modal-box">
        <h1 class="text-lg font-bold">Tipp</h1>
        <p class="text text-center">
          Click the names to indiciate who won the game
        </p>
        <p class="text text-center">Click the 'vs' button to indicate a draw</p>
        <p class="text text-center">
          When you are ready, click 'Next Round' to calculate the table and the
          next pairings
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost">OK</button>
        </div>
      </div>
    </dialog>
    <form onsubmit={handleResultSubmit}>
      {#each pairings as pairing}
        <div class="grid grid-cols-3 gap-2 my-2">
          <input
            type="radio"
            name={pairing.id}
            value={pairing.white.name}
            aria-label={pairing.white.name}
            class="btn"
            onclick={handleClick}
          />
          <input
            type="radio"
            class="btn btn-ghost btn-secondary btn-circle m-auto centerButton"
            name={pairing.id}
            value="draw"
            aria-label="vs"
            onclick={handleClick}
          />
          <input
            type="radio"
            name={pairing.id}
            value={pairing.black.name}
            aria-label={pairing.black.name}
            class="btn"
            onclick={handleClick}
          />
        </div>
      {/each}
      <button class="btn btn-secondary btn-block">Next Round</button>
    </form>
    <div class="my-10">
      <h2 class="text-3xl text-center">Table</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Points</th>
            <th>Win</th>
            <th>Draw</th>
            <th>Loss</th>
            <th>Bucholz</th>
          </tr>
        </thead>
        <tbody>
          {#each players as player}
            <tr>
              <th><b>{player.name}</b></th>
              <th>{player.win + player.draw / 2}</th>
              <th>{player.win}</th>
              <th>{player.draw}</th>
              <th>{player.loss}</th>
              <th>{calculateBucholz(player)}</th>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if games.length > 0}
      <div>
        <h2 class="text text-3xl text-center">Games</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Result</th>
              <th>Round</th>
            </tr>
          </thead>
          <tbody>
            {#each games as game}
              <tr>
                <th>{game.white} : {game.black}</th>
                <th>{game.result}</th>
                <th>{game.round}</th>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
  {#if newRoundError}
    <div class="toast toast-top toast-center">
      <button class="alert alert-error" onclick={() => (newRoundError = false)}>
        Not all matches are decided
      </button>
    </div>
  {/if}
  <button
    class="btn btn-error w-full my-5"
    onclick={() => {
      sessionStorage.clear();
      games = [];
      pairings = [];
      players = [];
      turnamentStart = false;
      round = 0;
    }}>Reset</button
  >
</main>
