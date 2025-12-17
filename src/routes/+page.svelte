<script lang="ts">
  // Svelte
  import { type Snippet } from 'svelte';
  // shadcn-svelte components
  import { Button } from '$lib/components/ui/button/index';
  import { Input } from '$lib/components/ui/input/index.js';
  import { toast } from 'svelte-sonner';
  // Lucide Svelte icons
  import {
    FolderOpen,
    FileSpreadsheet,
    Package,
    Search,
    CircleCheckBig,
    FileQuestionMark
  } from '@lucide/svelte';
  // JavaScript Libraries
  import Papa from 'papaparse'; // CSVパーサー
  // Svelte Components
  import Dialog from './dialog.svelte';
  import Link from '$lib/components/link.svelte';
  import PackInfoTable from './PackInfoTable.svelte';
  // TypeScript Modules
  import { inferCsvColumns } from '$lib/CsvAnalyzer';
  import { type ModelPackInfo } from '$lib/types';

  // --------- State ---------

  // --- Mod List ---
  /** HTML Inputで選択されたCSVファイル */
  let modListFiles: FileList | undefined = $state();
  /** CSVファイルから読み込んだモデルパックのリスト */
  let listedPacks: ModelPackInfo[] = $state([]);

  // --- mods directory ---
  /** modsディレクトリの`DirectoryHandle` ディレクトリが入っていなければ`undefined` */
  let modsDirHandle: FileSystemDirectoryHandle | undefined = $state();
  /** 実際のmodsディレクトリの中身 */
  let installedPacks: ModelPackInfo[] = $state([]);

  // --- Verification ---
  /** 欠落しているモデルパックの名前 */
  let missingPacks: string[] = $state([]);
  /** 検証状態 idle: 未検証, success: 全て存在, missing: 欠落あり */
  let verificationResult: 'idle' | 'success' | 'missing' = $state('idle');

  // --------- UI ---------

  // --- dialog status ---
  /** File System Access APIのサポート状態を表示するダイアログ */
  let isFSAAPIDialogOpen = $state<boolean>(false);
  /** modsディレクトリの読み込み失敗の詳細を表示するダイアログ */
  let isModsDirLoadFailedDialogOpen = $state<boolean>(false);
  /** CSVファイルから読み込んだモデルパックの詳細を表示するダイアログ */
  let isListedPackDialogOpen = $state<boolean>(false);
  /** modsディレクトリにあるmodelpackの詳細を表示するダイアログ*/
  let isInstalledPackDialogOpen = $state<boolean>(false);
  /** Modリストの詳細を表示するダイアログ */
  let isModListDialogOpen = $state<boolean>(false);

  /**
   * mods選択ボタンをクリックしたときに呼ばれる
   * `installedPacks`を更新する
   */
  async function openModsDir() {
    // サポートしていないブラウザを弾く
    if (!('showDirectoryPicker' in window)) {
      toast('modsフォルダの選択に失敗しました。', {
        description: 'ブラウザがFile System Access APIをサポートしていません。',
        action: {
          label: '詳細',
          onClick: () => {
            isFSAAPIDialogOpen = true;
          }
        }
      });
      return;
    }

    // ディレクトリ選択
    try {
      modsDirHandle = await window.showDirectoryPicker({
        id: 'rtm-modelpack-manager',
        mode: 'read'
      });
    } catch (e) {
      // ブラウザ側で拒否されるシステムファイルへのアクセスができるディレクトリ（.minecraftなど）を選択した場合と、ユーザーによる選択のキャンセルを区別したかったが、どうも全く同じエラーが返され区別できないらしい
      console.error('mods directory selection cancelled or failed', e);
      toast('modsフォルダの選択に失敗しました。', {
        description: 'modsフォルダの選択が正常に完了しませんでした。',
        action: {
          label: '詳細',
          onClick: () => {
            isModsDirLoadFailedDialogOpen = true; // ダイアログを表示
          }
        }
      });
      return;
    }

    if (!modsDirHandle) return;

    const isFileHandle = (handle: FileSystemHandle): handle is FileSystemFileHandle =>
      handle.kind === 'file';
    const isZipFile = (file: File) => file.name.endsWith('.zip');

    const handles = await Array.fromAsync(modsDirHandle.values());
    const files = await Promise.all(handles.filter(isFileHandle).map((handle) => handle.getFile()));
    const packs: ModelPackInfo[] = files
      .filter((file) => isZipFile(file))
      .map((file) => {
        return {
          dateModified: file.lastModified ? new Date(file.lastModified) : 'unknown',
          name: file.name
        };
      });
    installedPacks = packs;
    // 未検証に更新
    verificationResult = 'idle';
  }

  /**
   * Modリストを選択したときに呼ばれる
   * `listedPacks`を更新する
   */
  async function openModsList() {
    if (!modListFiles || modListFiles.length < 1) return;

    const modListText = await modListFiles[0].text(); // Modリストをutf-8で読み込む
    const parsed = Papa.parse(modListText);
    if (parsed.errors.length > 0) return;
    const csv = parsed.data as string[][];

    console.log(csv);

    // 列の推測
    const mapping = inferCsvColumns(csv);
    console.log('Inferred Mapping:', mapping);

    // ヘッダー行があるかどうかの判定 (簡易的: name列が"name"とかだったらヘッダーとみなす)
    // CsvAnalyzer側でヘッダー判定してstartRowを返してもいいが、ここでは簡易的に
    // name列の値が "name" だったらスキップする
    let startIndex = 0;
    if (mapping.name !== -1 && csv.length > 0) {
      const firstCell = csv[0][mapping.name];
      if (firstCell && /name|名前|ファイル名/i.test(firstCell)) {
        startIndex = 1;
      }
    }

    const packs: ModelPackInfo[] = csv
      .slice(startIndex)
      .filter((line) => Array.isArray(line))
      .filter((line) => line.length >= 2) // 最低限の列数チェック (適当)
      .map((line) => ({
        dateModified:
          mapping.dateModified !== -1 && line[mapping.dateModified]
            ? new Date(line[mapping.dateModified])
            : ('unknown' as const), // そのままだとstring型の'unknown'に推論されるのでas constする
        name: mapping.name !== -1 ? line[mapping.name] : 'unknown', // nameがないと困るが...
        url: mapping.url !== -1 && line[mapping.url] ? new URL(line[mapping.url]) : undefined,
        description: mapping.description !== -1 ? line[mapping.description] : undefined
      }))
      .filter((p) => p.name !== 'unknown'); // 名前が取れなかった行は除外

    listedPacks = packs;
    verificationResult = 'idle';
  }

  function checkModelPacks() {
    if (listedPacks.length === 0 && installedPacks.length === 0) return;

    const listedPackNames = listedPacks.map((item) => item.name);
    const installedPackNames = installedPacks.map((item) => item.name);

    const isAllPackPresent = listedPackNames.every((name) => installedPackNames.includes(name));

    verificationResult = isAllPackPresent ? 'success' : 'missing';
    missingPacks = isAllPackPresent
      ? []
      : listedPackNames.filter((name) => !installedPackNames.includes(name));
  }
</script>

<div class="min-h-screen bg-neutral-900 p-8 font-sans text-neutral-100 selection:bg-rose-600/40">
  <main class="mx-auto max-w-6xl space-y-8">
    <!-- Header -->
    <header class="space-y-4 py-8 text-center">
      <h1
        class="bg-linear-to-r from-rose-400 to-rose-700 bg-clip-text text-5xl leading-normal font-bold tracking-tight text-transparent"
      >
        RTM ModelPack Manager
      </h1>
      <p class="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-400">
        RTMのModelPackを管理・検証するツールです。<br />
        modsフォルダとModリストを比較し、不足しているパックを特定します。
      </p>
    </header>

    <!-- Main Controls -->
    <div class="grid gap-6 md:grid-cols-2">
      {#snippet card(title: string, icon: Snippet, children: Snippet)}
        <div
          class="group relative overflow-hidden rounded-3xl bg-neutral-800/50 p-6 ring-1 ring-white/10 transition-all hover:bg-neutral-800/80 hover:ring-rose-500/50"
        >
          <div class="relative z-10 space-y-4">
            <div class="mb-2 flex items-center gap-3 text-rose-400">
              {@render icon()}
              <h2 class="text-xl font-semibold">{title}</h2>
            </div>
            {@render children()}
          </div>
        </div>
      {/snippet}
      <!-- mods入力 -->

      {#snippet folderOpenIcon()}
        <FolderOpen class="size-6" />
      {/snippet}

      {#snippet modsCardContent()}
        <div class="space-y-2">
          <p class="text-sm text-neutral-400">RTMのmodsフォルダを選択してください。</p>
          <div class="flex items-center gap-2">
            <Button
              onclick={openModsDir}
              variant="secondary"
              class="w-full border-0 bg-rose-600/20 text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-600/30"
            >
              {modsDirHandle ? 'フォルダを変更' : 'フォルダを選択'}
            </Button>
          </div>
        </div>

        {#if installedPacks.length > 0}
          <div
            class="flex items-center justify-between rounded-lg border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-400"
          >
            <div class="flex items-center gap-2">
              <CircleCheckBig class="size-4" />
              <span>{installedPacks.length} 個のzipファイルを検出</span>
            </div>
            <Button variant="outline" size="sm" onclick={() => (isInstalledPackDialogOpen = true)}
              >詳細</Button
            >
          </div>
        {:else}
          <div
            class="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/50 p-3 text-sm text-neutral-500"
          >
            <FileQuestionMark class="size-4" />
            <span>未選択</span>
          </div>
        {/if}
      {/snippet}

      {@render card('Mods Directory', folderOpenIcon, modsCardContent)}

      <!-- Modリスト入力 -->
      {#snippet fileSpreadsheetIcon()}
        <FileSpreadsheet class="size-6" />
      {/snippet}

      {#snippet csvCardContent()}
        <div class="space-y-2">
          <p class="text-sm text-neutral-400">ModリストのCSVファイルを読み込んでください。</p>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            bind:files={modListFiles}
            onchange={openModsList}
            class="cursor-pointer border-neutral-700 bg-neutral-900/50 text-neutral-300 file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-rose-500/20 file:px-2 file:text-rose-300 hover:file:bg-rose-500/30"
          />
        </div>

        {#if listedPacks.length > 0}
          <div
            class="flex items-center justify-between gap-2 rounded-lg border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-400"
          >
            <div class="flex items-center gap-2">
              <CircleCheckBig class="size-4" />
              <span>{listedPacks.length} 個のModelPackを検出</span>
            </div>
            <Button variant="outline" size="sm" onclick={() => (isListedPackDialogOpen = true)}
              >詳細</Button
            >
          </div>
        {:else}
          <div
            class="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/50 p-3 text-sm text-neutral-500"
          >
            <FileQuestionMark class="size-4" />
            <span>未読み込み</span>
          </div>
        {/if}
      {/snippet}

      {@render card('ModelPack List (CSV)', fileSpreadsheetIcon, csvCardContent)}
    </div>

    <!-- Action Area -->
    <div class="flex justify-center py-4">
      <Button
        onclick={checkModelPacks}
        disabled={listedPacks.length === 0 || installedPacks.length === 0}
        size="lg"
        class="rounded-full border-0 bg-linear-to-r from-rose-400 to-rose-700 px-12 py-6 text-lg font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105 hover:from-rose-300 hover:to-rose-600 disabled:opacity-50 disabled:hover:scale-100"
      >
        <Search class="mr-2 h-5 w-5" />
        Check
      </Button>
    </div>

    <!-- Results Area -->
    {#if verificationResult !== 'idle'}
      <div class="animate-in duration-500 fade-in slide-in-from-bottom-4">
        {#if verificationResult === 'success'}
          <div
            class="rounded-3xl border border-green-500/20 bg-green-500/10 p-8 text-center backdrop-blur-sm"
          >
            <div class="mb-4 inline-flex rounded-full bg-green-500/20 p-4 text-green-400">
              <CircleCheckBig class="h-12 w-12" />
            </div>
            <h3 class="mb-2 text-2xl font-bold text-green-400">All Clear!</h3>
            <p class="text-green-300/80">すべてのModelPackがmodsフォルダに存在します。</p>
          </div>
        {:else}
          <div class="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-8 backdrop-blur-sm">
            <div class="mb-8 flex flex-col items-center text-center">
              <h3 class="mb-2 text-2xl font-bold text-blue-400">Missing ModelPacks</h3>
              <p class="text-blue-300/80">以下のModelPackが見つかりませんでした。</p>
            </div>

            <div class="mx-auto grid max-w-3xl gap-3">
              {#each missingPacks as pack}
                {@const packInfo = listedPacks.find((p) => p.name === pack)}
                <div
                  class="flex items-center justify-between rounded-xl border border-blue-500/20 bg-gray-900/60 p-4 transition-colors hover:border-blue-500/40"
                >
                  <div class="flex items-center gap-3">
                    <Package class="h-5 w-5 text-blue-400" />
                    <span class="font-mono text-gray-200">{pack}</span>
                  </div>
                  {#if packInfo?.url}
                    <a
                      href={packInfo.url.toString()}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="rounded-full bg-rose-500/20 px-3 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-500/30"
                    >
                      ダウンロード
                    </a>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>
<!-- File System Access API 未サポート -->
<Dialog
  title="利用できないブラウザ機能"
  description="ブラウザが、File System Access APIをサポートしていません。"
  bind:isOpen={isFSAAPIDialogOpen}
>
  <article class="space-y-4">
    <h3 class="font-semibold">詳細</h3>
    <p class="text-sm text-neutral-400">
      このサイトでは、modsフォルダの内容を取得するために
      <Link href="https://wicg.github.io/file-system-access/" target="_blank" rel="noreferrer"
        >File System Access API</Link
      >
      を使用しています。
    </p>
    <h3 class="font-semibold">File System Access APIをサポートするブラウザ</h3>
    <ul class="my-2 ml-6 list-disc space-y-2 text-sm text-neutral-400">
      <li>Microsoft Edge</li>
      <li>Google Chrome</li>
      <li>Opera</li>
    </ul>
    <p class="text-sm text-neutral-400">
      これらのブラウザ、またはその系列ブラウザを使用しているにもかかわらず警告が表示された場合は、ブラウザの設定を確認してください。
    </p>
  </article>
</Dialog>
<!-- modsディレクトリ選択キャンセル or システムフォルダ -->
<Dialog
  title="modsフォルダの読み込みに失敗"
  description="modsフォルダの選択が正常に完了しませんでした。"
  bind:isOpen={isModsDirLoadFailedDialogOpen}
>
  <article class="space-y-4">
    <h3 class="font-semibold">詳細</h3>
    <p class="text-sm text-neutral-400">
      選択をキャンセルした、またはアクセスできないフォルダ（<code>.minecraft</code
      >内のフォルダなど）を選択した可能性があります。
    </p>
    <h3 class="font-semibold">アクセスできないフォルダについて</h3>
    <p class="text-sm text-neutral-400">
      modsフォルダを<code>.minecraft</code
      >以下に配置している場合など、ブラウザによって保護されているシステムフォルダ内に配置している場合、このサイトからmodsフォルダにアクセスすることができません。
    </p>
    <p class="text-sm text-neutral-400">
      ゲームの起動構成を変更して、アクセスできるフォルダ内にmodsフォルダを配置するようにしてください。
    </p>
  </article>
</Dialog>
<!-- modsフォルダ詳細 -->
<Dialog
  title="modsフォルダのモデルパック"
  description="modsフォルダにあるモデルパックの一覧"
  bind:isOpen={isInstalledPackDialogOpen}
>
  <PackInfoTable packInfos={installedPacks} />
</Dialog>
<!-- Modリスト詳細 -->
<Dialog title="Modリスト" description="Modリストの詳細" bind:isOpen={isListedPackDialogOpen}>
  <PackInfoTable packInfos={listedPacks} />
</Dialog>
