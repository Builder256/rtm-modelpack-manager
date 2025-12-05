// Geminiに書かせた！内容は妥当に見える

export interface CsvMapping {
  dateModified: number;
  name: number;
  url: number;
  author: number;
  description: number;
  dependencies: number;
}

/**
 * CSVのデータから各列の役割を推測する
 * @param data CSVのデータ (行 x 列)
 * @returns 推測された列のインデックスのマッピング
 */
export function inferCsvColumns(data: string[][]): CsvMapping {
  const mapping: CsvMapping = {
    dateModified: -1,
    name: -1,
    url: -1,
    author: -1,
    description: -1,
    dependencies: -1
  };

  if (data.length === 0) return mapping;

  const numColumns = data[0].length;
  const scores: { [key in keyof CsvMapping]: number[] } = {
    dateModified: new Array(numColumns).fill(0),
    name: new Array(numColumns).fill(0),
    url: new Array(numColumns).fill(0),
    author: new Array(numColumns).fill(0),
    description: new Array(numColumns).fill(0),
    dependencies: new Array(numColumns).fill(0)
  };

  // ヘッダー行の検出 (1行目のみ)
  const headerRow = data[0];
  const hasHeader = headerRow.some((cell) => /name|date|url|link|author|desc|dep/i.test(cell));

  const startRow = hasHeader ? 1 : 0;
  // サンプル数を制限 (パフォーマンスのため)
  const sampleRows = data.slice(startRow, Math.min(data.length, 100));

  // ヘッダーによるスコアリング
  if (hasHeader) {
    headerRow.forEach((cell, colIndex) => {
      const lower = cell.toLowerCase();
      if (lower.includes('date') || lower.includes('time') || lower.includes('更新'))
        scores.dateModified[colIndex] += 100;
      if (lower.includes('name') || lower.includes('file') || lower.includes('名前'))
        scores.name[colIndex] += 100;
      if (lower.includes('url') || lower.includes('link') || lower.includes('http'))
        scores.url[colIndex] += 100;
      if (lower.includes('author') || lower.includes('creator') || lower.includes('作者'))
        scores.author[colIndex] += 100;
      if (lower.includes('desc') || lower.includes('説明')) scores.description[colIndex] += 100;
      if (lower.includes('dep') || lower.includes('req') || lower.includes('前提'))
        scores.dependencies[colIndex] += 100;
    });
  }

  // 内容によるスコアリング
  for (const row of sampleRows) {
    row.forEach((cell, colIndex) => {
      if (!cell) return;

      // Date
      if (!isNaN(Date.parse(cell)) && cell.length > 5 && /\d/.test(cell)) {
        scores.dateModified[colIndex]++;
      }

      // URL
      if (cell.startsWith('http://') || cell.startsWith('https://')) {
        scores.url[colIndex]++;
      }

      // Name (ends with .zip or looks like a filename)
      if (cell.endsWith('.zip')) {
        scores.name[colIndex] += 2;
      } else if (/^[a-zA-Z0-9_-]+$/.test(cell) && cell.length > 3) {
        // 英数字のみは名前っぽい
        scores.name[colIndex] += 0.5;
      }

      // Dependencies (comma separated values often indicate lists)
      if (cell.includes(',')) {
        scores.dependencies[colIndex]++;
      }

      // Description (long text)
      if (cell.length > 50) {
        scores.description[colIndex]++;
      }
    });
  }

  // 各役割について、最もスコアが高い列を割り当てる
  // ただし、重複しないように貪欲法で決める (スコアが高い順に埋めるのが理想だが、簡易的に順番に決める)
  // ここでは単純にMaxをとる

  const assignedColumns = new Set<number>();

  const assign = (key: keyof CsvMapping) => {
    let maxScore = -1;
    let bestCol = -1;
    for (let i = 0; i < numColumns; i++) {
      if (assignedColumns.has(i)) continue;
      if (scores[key][i] > maxScore) {
        maxScore = scores[key][i];
        bestCol = i;
      }
    }
    if (bestCol !== -1 && maxScore > 0) {
      mapping[key] = bestCol;
      assignedColumns.add(bestCol);
    }
  };

  // 優先順位をつけて割り当て
  assign('url');
  assign('dateModified');
  assign('name');
  assign('dependencies');
  assign('description');
  assign('author');

  return mapping;
}
