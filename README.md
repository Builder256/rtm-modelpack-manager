# RTM ModelPack Manager
RTM ModelPack Managerは、RTMのModelPackを管理するためのWebアプリ形式のツールです。

## 機能
modsディレクトリを選択してModelPackのZIPファイルを取得し、CSV形式のModリストと比較して不足分を表示します。

URLに直リンクが設定されている場合、その場で直接ダウンロードすることができます。

## Modリストの形式
CSVファイルの形式は以下の通りです。

| Name | URL | Author | Description | Dependencies |
| --- | --- | --- | --- | --- |
| ModelPackのファイル名<br>拡張子含め実際のファイル名と完全一致 | ダウンロードURL | 作者名 | 説明 | 前提のファイル名 |

この列の形式は必ずしも一致している必要はなく、セルの内容に応じて簡易的ながら自動判別が行われるため、ある程度の誤差は許容されます。

## 前提条件
このツールでは、ブラウザが[File System Access API](https://wicg.github.io/file-system-access/)[^1]をサポートしている必要があります。

File System Access APIは、Webアプリに端末内のディレクトリへのアクセスを可能にするWeb APIであり、Google ChromeやMicrosoft Edge、Operaなど、Chromiumベースのブラウザで主に対応しています。

<details>
<summary>非対応ブラウザ</summary>

File System Access APIは、その特性上、ユーザーが操作を誤って意図せずファイルが漏洩したり、書き込みを許可する場合にはマルウェアをダウンロードさせるなどの潜在的なリスクがあります。

そのため、Mozilla FirefoxやSafariなど、ユーザーの安全を重視するブラウザの場合には、File System Access APIに対応しない方針であったり、デフォルト設定で無効化されている場合があるため、対応ブラウザを使用するかブラウザの設定を変更する必要があります。
</details>

このツールでは、ユーザーのプライバシーを尊重し、File System Access APIやファイルのアップロードで取得した内容を含め、すべての処理はブラウザ内で実行され、**外部には一切送信されない**ため、安心して使うことができます。

## ロードマップ
以下の機能の実装を検討しています。

- 静的サイトとしてGitHub Pagesなどで公開する
- ModリストのCSVのヘッダーを手動で設定する
  - 設定内容をプリセットとして保存する
  - プリセットをJSON形式などで共有可能にする
- modリストの更新日時と実際のファイルの更新日時を比較して、実際のファイルの方が古い場合にそのモデルパックが更新された可能性があることを通知する
- 要展開のモデルパックを検知する

[^1]: [MDN Web DocsでのFile System Access APIの説明](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)