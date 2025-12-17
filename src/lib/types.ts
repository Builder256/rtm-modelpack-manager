export interface ModelPackInfo {
  /** ファイルの更新日時 */
  dateModified: Date | 'unknown';
  /** ファイル名 */
  name: string;
  /** URL */
  url?: URL;
  /** 説明 */
  description?: string;
  /** 前提モデルパックの名前 */
  dependencies?: string[];
  /** ダウンロード後に展開する必要があるかどうか */
  isUnzipRequired?: boolean;
}

export interface PackCSV {
  /** ヘッダー情報 */
  header: {
    /** ヘッダー情報とデータの列の対応 */
    index: {
      datemodified: number;
      name: number;
      url: number;
      description: number;
      dependencies: number;
      isUnzipRequired: number;
    };
    /** ヘッダー行の数 */
    headerLine: number;
  };
  /** データ */
  body: any[]; // とりあえず
}
