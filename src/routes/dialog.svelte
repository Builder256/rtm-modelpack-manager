<script lang="ts">
  // Svelte
  import { type Snippet } from 'svelte';
  // shadcn-svelte components
  import * as Dialog from '$lib/components/ui/dialog/index';

  interface Props {
    children: Snippet;
    title: string;
    description: string;
    isOpen: boolean;
  }

  let { children, title, description, isOpen = $bindable() }: Props = $props();
</script>

<Dialog.Root open={isOpen} onOpenChange={(open) => (isOpen = open)}>
  <Dialog.Content
    class="max-h-[calc(100svh-8rem)] w-auto !max-w-[calc(100vw-8rem)] overflow-y-auto bg-neutral-800/80 backdrop-blur-sm"
  >
    <Dialog.Header>
      <Dialog.Title><h2>{title}</h2></Dialog.Title>
      <Dialog.Description>
        {description}
      </Dialog.Description>
    </Dialog.Header>
    {@render children()}
  </Dialog.Content>
</Dialog.Root>
