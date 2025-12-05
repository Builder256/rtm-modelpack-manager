<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { buttonVariants } from '$lib/components/ui/button/index';
  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="darkreader-lock" />
</svelte:head>

<Toaster
  theme="dark"
  toastOptions={{
    unstyled: true,
    classes: {
      toast:
        'bg-neutral-800 text-neutral-200 ring-1 ring-neutral-700/50 p-3 rounded-lg shadow-lg flex items-center justify-between gap-4',
      title: 'text-white font-semibold',
      description: 'text-neutral-400 text-sm',
      actionButton: buttonVariants({ variant: 'default' })
    }
  }}
/>
{@render children()}
