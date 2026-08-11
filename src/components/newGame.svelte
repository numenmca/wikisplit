<script lang="ts">
  import { getSearchResults } from "../wpapi";

  const props: {
    onStart: (from: string, to: string) => void;
  } = $props();

  let fromInput = $state("");
  let toInput = $state("");

  let fromSuggestions: string[] = $state([]);
  let toSuggestions: string[] = $state([]);

  let fromFocused = $state(false);
  let toFocused = $state(false);

  let fromDebounce: ReturnType<typeof setTimeout> | undefined;
  let toDebounce: ReturnType<typeof setTimeout> | undefined;

  function searchFrom() {
    clearTimeout(fromDebounce);

    fromDebounce = setTimeout(async () => {
      if (!fromInput.trim()) {
        fromSuggestions = [];
        return;
      }

      fromSuggestions = await getSearchResults(fromInput.trim());
    }, 300);
  }

  function searchTo() {
    clearTimeout(toDebounce);

    toDebounce = setTimeout(async () => {
      if (!toInput.trim()) {
        toSuggestions = [];
        return;
      }

      toSuggestions = await getSearchResults(toInput.trim());
    }, 300);
  }
</script>

<div class="flex justify-center">
  <div class="bg-neutral-100 p-4 flex flex-col gap-4 border-neutral-200 border">
    <div class="font-bold text-2xl">Start a run</div>
    <div class="flex items-center gap-4">
      <div class="relative">
        <input
          type="text"
          class="bg-neutral-200 px-4 py-2 ring-1 ring-neutral-300 outline-none"
          placeholder="Start article"
          bind:value={fromInput}
          oninput={searchFrom}
          onfocus={() => fromFocused = true}
          onblur={() => fromFocused = false}
        />

        {#if fromSuggestions.length > 0 && fromFocused}
          <div
            class="absolute -left-px -right-px top-full flex flex-col bg-neutral-200 border border-neutral-300"
          >
            {#each fromSuggestions as suggestion}
              <button class="text-start px-4 py-1 hover:bg-neutral-300 cursor-pointer" onmousedown={() => fromInput = suggestion}>
                {suggestion}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div>to</div>
      <div class="relative">
        <input
          type="text"
          class="bg-neutral-200 px-4 py-2 ring-1 ring-neutral-300 outline-none"
          placeholder="End article"
          bind:value={toInput}
          oninput={searchTo}
          onfocus={() => toFocused = true}
          onblur={() => toFocused = false}
        />

        {#if toSuggestions.length > 0 && toFocused}
          <div
            class="absolute -left-px -right-px top-full flex flex-col bg-neutral-200 border border-neutral-300"
          >
            {#each toSuggestions as suggestion}
              <button class="text-start px-4 py-1 hover:bg-neutral-300 cursor-pointer" onmousedown={() => toInput = suggestion}>
                {suggestion}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="flex justify-end">
      <button
        class="bg-neutral-200 ring-neutral-300 ring-1 py-2 px-4 cursor-pointer hover:bg-neutral-300" onclick={() => props.onStart(fromInput, toInput)}
        >Start</button
      >
    </div>
  </div>
</div>
