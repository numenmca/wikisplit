<script lang="ts">
  import type { TimeController } from "./timeController.svelte";

  const props: {
    controller: TimeController;
    to: string | null;
    from: string | null;
  } = $props();

  function extractTimesFromMs(millis: number): [number, number, number] {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    const hundredths = Math.floor((millis % 1000) / 10);

    return [minutes, seconds, hundredths];
  }

  function timerText(data: [number, number, number]) {
    let str = "";

    if (data[0] > 0) {
      str += data[0];
      str += ":";

      str += data[1].toString().padStart(2, "0");
    } else {
      str += data[1].toString();

      str += ".";
      str += data[2].toString().padStart(2, "0");
    }

    return str;
  }

  let now = $state(0);

  setInterval(() => {
    now++;
  }, 10);

  let lrtExtracted = $derived.by(() => {
    now;
    return extractTimesFromMs(props.controller.getLRT());
  });

  const runningState = $derived(
    props.controller.isRunning()
      ? "running"
      : props.controller.isEnded()
        ? "ended"
        : "stopped",
  );

  let splitsContainer: HTMLDivElement;

  $effect(() => {
    props.controller.splits.length;

    splitsContainer?.scrollTo({
      top: splitsContainer.scrollHeight,
      behavior: "smooth",
    });
  });

  const previousSplitTime = $derived.by(() => {
    const splits = props.controller.splits;
    const previous = splits[splits.length - 2];
    const beforePrevious = splits[splits.length - 3];

    if (previous?.lrtMillis == null) return null;

    return previous.lrtMillis - (beforePrevious?.lrtMillis ?? 0);
  });
</script>

<div
  class="bg-black flex-1 flex flex-col text-white font-split text-sm min-h-0"
>
  <div
    class="bg-linear-to-b from-[#181818] to-[#111111] flex flex-col items-center px-2 py-1 leading-4"
  >
    <div>Wikipedia</div>
    {#if props.from && props.to}
      <div>"{props.from}" to "{props.to}"</div>
    {:else}
      <div>No splits</div>
    {/if}
  </div>

  <div
    class="flex-1 min-h-0 overflow-y-scroll scrollbar-hidden"
    bind:this={splitsContainer}
  >
    {#each props.controller.splits as split}
      <div
        class="border-neutral-900 flex items-center px-3 h-9 text-[1.2em]"
        class:bg-linear-to-b={split.active}
        class:from-[#366ee9]={split.active}
        class:to-[#17336b]={split.active}
        class:border-b={!split.active}
      >
        <div class="max-w-[75%] truncate">{split.name}</div>
        <div class="flex-1"></div>
        {#if split.lrtMillis != null}
          <div class="font-bold">
            {timerText(extractTimesFromMs(split.lrtMillis))}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="bg-[#0f0f0f]">
    <div
      class="w-full h-full bg-linear-to-b flex justify-end items-end font-timer font-bold p-2"
      class:from-[#60e884]={runningState === "running"}
      class:to-[#129635]={runningState === "running"}
      class:from-[#aaaaaa]={runningState === "stopped"}
      class:to-[#888888]={runningState === "stopped"}
      class:from-[#68bbed]={runningState === "ended"}
      class:to-[#267eb6]={runningState === "ended"}
      style="-webkit-background-clip: text; -webkit-text-fill-color: transparent;"
    >
      {#if lrtExtracted[0] > 0}
        <div class="text-5xl">{lrtExtracted[0].toString()}</div>
        <div class="text-5xl">:</div>
      {/if}
      <div class="text-5xl">
        {lrtExtracted[0] > 0
          ? lrtExtracted[1].toString().padStart(2, "0")
          : lrtExtracted[1].toString()}
      </div>
      <div class="text-4xl">.</div>
      <div class="text-4xl">{lrtExtracted[2].toString().padStart(2, "0")}</div>
    </div>
  </div>

  <div
    class="bg-linear-to-b from-[#181818] to-[#111111] flex justify-between px-2 py-1.25"
  >
    <div>Previous split</div>
    <div class="font-bold">
      {previousSplitTime != null
        ? timerText(extractTimesFromMs(previousSplitTime))
        : "N/A"}
    </div>
  </div>
  <div
    class="bg-linear-to-b from-[#181818] to-[#111111] flex justify-between px-2 py-1.25"
  >
    <div>Clicks</div>
    <div class="font-bold">
      {Math.max(0, props.controller.splits.length - 1)}
    </div>
  </div>
</div>
