<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js';
  import { type ModelPackInfo } from '$lib/types';
  import Link from '$lib/components/link.svelte';
  interface Props {
    packInfos: ModelPackInfo[];
  }

  let { packInfos }: Props = $props();
</script>

<Table.Root>
  <Table.Caption>モデルパック総数: {packInfos.length}</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head>更新日時</Table.Head>
      <Table.Head>名前</Table.Head>
      <Table.Head>URL</Table.Head>
      <Table.Head>説明</Table.Head>
      <Table.Head>前提パック</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each packInfos as packInfo}
      <Table.Row>
        <Table.Cell>{packInfo.dateModified.toLocaleString()}</Table.Cell>
        <Table.Cell>{packInfo.name ?? '-'}</Table.Cell>
        <Table.Cell>
          {#if packInfo.url}
            <Link href={packInfo.url.toString()}>{packInfo.url.toString()}</Link>
          {:else}
            -
          {/if}
        </Table.Cell>
        <Table.Cell>{packInfo.description ?? '-'}</Table.Cell>
        <Table.Cell>{packInfo.dependencies ?? '-'}</Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
