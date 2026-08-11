<script lang="ts">
  import NewGame from "./components/newGame.svelte";
  import PageView from "./components/pageView.svelte";
  import { TimeController } from "./components/timings/timeController.svelte";
  import Timer from "./components/timings/timer.svelte";
  import { getPage } from "./wpapi";

  const controller = new TimeController();

  let currentRace: {
    from: string;
    to: string;
  } | null = null;

  let currentPage = "Wikisplit:Loading first page";
  let currentPageContent = "";

  function startRace(from: string, to: string) {
    currentRace = {
      from,
      to,
    };

    currentPage = from;
    controller.start();
    nav(from);
  }

  async function nav(page: string) {
    controller.pauseLRT();
    const data = await getPage(page);

    if (!data) {
      currentRace = null;
      currentPage = "Wikisplit:Loading first page";
      currentPageContent = "";
      return;
    }

    currentPage = data[0];
    currentPageContent = data[1];

    window.scrollTo({
      top: 0,
    });

    if (currentPage != currentRace?.to) {
      controller.split(currentPage);
      controller.resumeLRT();
    } else {
      controller.resumeLRT();
      controller.end();
    }
  }
</script>

<div class="w-screen h-7.5 border-b bg-neutral-200 border-neutral-300 flex">
  <button
    class="px-3 border-r border-neutral-300 hover:bg-neutral-300 cursor-pointer"
    onclick={() => {
      controller.reset();
      currentRace = null;
      currentPage = "Wikisplit:Loading first page";
      currentPageContent = "";
    }}
  >
    {currentRace && !controller.isEnded() ? "Forfeit" : "Reset"}
  </button>
</div>

<main class="w-screen h-[calc(100vh-30px)] grid grid-cols-[auto_350px]">
  <div class="p-12 font-system-sans text-[11pt]">
    <div class="font-title text-4xl border-b border-neutral-600 pb-2">
      {currentRace ? currentPage : "Wikisplit:No active run"}
    </div>
    <div>from Wikipedia, the free encyclopedia</div>

    {#if !currentRace}
      <div class="mt-5">
        <NewGame onStart={startRace} />
      </div>
    {:else}
      <PageView {nav} content={currentPageContent} navigation={!controller.isEnded()} />
    {/if}
  </div>
</main>

{#if (!controller.isRunning() && !controller.isEnded()) && currentRace}
  <div
    class="z-9999 fixed top-0 left-0 w-full h-full bg-black/20 flex justify-center items-center"
  >
    <div
      class="py-5 px-10 font-system-sans tracking-wide font-bold bg-black/50 text-white rounded-lg"
    >
      <div>LOADING</div>
    </div>
  </div>
{/if}

<div
  class="h-[75vh] w-87.5 min-h-0 flex flex-col fixed bottom-[50%] translate-y-[50%] right-4 z-10000"
>
  <Timer
    {controller}
    to={currentRace?.to ?? null}
    from={currentRace?.from ?? null}
  />
</div>
