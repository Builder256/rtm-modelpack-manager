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
このツールでは、ブラウザがFile System Access APIをサポートしている必要があります。

File System Access APIは、Google ChromeやMicrosoft Edge、Operaなど、Chromiumベースのブラウザで主に対応しています。

Mozilla FirefoxやSafariなど、ユーザーの安全を重視するブラウザの場合には、File System Access APIは意図的に対応しない方針であったり、デフォルト設定で無効化されている場合があるため、対応ブラウザを使用するかブラウザの設定を変更する必要があります。