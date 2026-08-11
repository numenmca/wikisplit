<script lang="ts">
  const props: {
    nav: (page: string) => Promise<void>;
    content: string;
    navigation: boolean;
  } = $props();

  let showWarning = $state(false);

  function showWarningOnce() {
    showWarning = true;
    setTimeout(() => showWarning = false, 1000);
  }

  function handleWikiClick(event: MouseEvent) {
    if (!props.navigation) {
      event.preventDefault();
      showWarningOnce();
      return;
    }

    const target = event.target as HTMLElement;
    const link = target.closest("a");

    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (href.startsWith("#")) return;

    if (!href.startsWith("./") && !href.startsWith("/wiki/")) {
      event.preventDefault();

      showWarningOnce();
      return;
    }

    if (href.startsWith("/wiki/")) {
      const page = href.slice("/wiki/".length);

      if (
        page.startsWith("Special:") ||
        page.startsWith("Talk:") ||
        page.startsWith("User:") ||
        page.startsWith("Wikipedia:") ||
        page.startsWith("File:") ||
        page.startsWith("Template:") ||
        page.startsWith("Category:") ||
        page.startsWith("Help:") ||
        page.startsWith("Portal:") ||
        page.startsWith("Module:")
      ) {
        event.preventDefault();

        showWarningOnce();
        return;
      }
    }

    event.preventDefault();

    const page = href.replace(/^\.\/|^\/wiki\//, "").split("#")[0];

    if (!page) return;

    props.nav(decodeURIComponent(page));
  }

  let cursorTooltipWarning: HTMLDivElement;

  function handleMouseMove(event: MouseEvent) {
    cursorTooltipWarning.style.left = `${event.clientX + 12}px`;
    cursorTooltipWarning.style.top = `${event.clientY + 12}px`;
  }
</script>

<svelte:window onmousemove={handleMouseMove} />

<div
  bind:this={cursorTooltipWarning}
  class="fixed pointer-events-none z-100000 bg-red-200 px-2 py-1 ring ring-red-300 text-red-600"
  style:opacity={showWarning ? 1 : 0}
  style:transition="opacity 300ms ease"
>
  {props.navigation ? "Link disabled" : "You've finished this run"}
</div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="mt-5 wiki-inject" onclick={handleWikiClick}>
  <div>{@html props.content}</div>
</div>
