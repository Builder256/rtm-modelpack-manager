<script lang="ts">
  import { type Snippet } from 'svelte';

  import { SquareArrowOutUpRight } from '@lucide/svelte';

  interface Props {
    children: Snippet;
    href: string;
    target?: HTMLAnchorElement['target'];
    rel?: HTMLAnchorElement['rel'];
    class?: string;
    [key: string]: unknown;
  }

  let {
    children,
    href,
    target = undefined,
    rel = undefined,
    class: className = undefined,
    ...attrs
  }: Props = $props();

  const initializeProps = () => {
    if (URL.canParse(href)) {
      target = '_blank';
      rel = 'noopener';
    }

    className = 'underline underline-offset-2';
  };

  initializeProps();
</script>

<a
  {href}
  {target}
  {rel}
  class={[className, 'underline underline-offset-2 hover:no-underline']}
  {...attrs}
>
  {@render children()}{#if target === '_blank'}
    <SquareArrowOutUpRight class="ms-1 inline-block size-4" />
  {/if}
</a>
