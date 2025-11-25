<script lang="ts">
  type PairingProps = {
    pairing: Pairing;
    handleClick: (e: MouseEvent) => void;
  };
  let { pairing, handleClick }: PairingProps = $props();
</script>

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
