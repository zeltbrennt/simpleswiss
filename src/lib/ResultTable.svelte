<script lang="ts">
  interface TablePrrops {
    players: Player[];
  }
  const { players }: TablePrrops = $props();
</script>

<table class="table table-fixed mb-0">
  <thead>
    <tr class="text-center">
      <th class="px-1 text-left">Name</th>
      <th class="px-1">Points</th>
      <th class="px-1">Win</th>
      <th class="px-1">Draw</th>
      <th class="px-1">Loss</th>
      <th class="px-1">Bucholz</th>
    </tr>
  </thead>
  <tbody>
    {#each players as player}
      <tr class="text-center">
        <th class="px-1 text-left"><b>{player.name}</b></th>
        <th class="px-1">{player.win + player.draw / 2}</th>
        <th class="px-1">{player.win}</th>
        <th class="px-1">{player.draw}</th>
        <th class="px-1">{player.loss}</th>
        <th class="px-1">{player.bucholz}</th>
      </tr>
    {/each}
  </tbody>
</table>
