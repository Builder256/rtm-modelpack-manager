type CIUBrowsers =
  | 'ie'
  | 'edge'
  | 'firefox'
  | 'chrome'
  | 'safari'
  | 'opera'
  | 'ios_saf'
  | 'op_mini'
  | 'android'
  | 'bb'
  | 'op_mob'
  | 'and_chr'
  | 'and_ff'
  | 'ie_mob'
  | 'and_uc'
  | 'samsung'
  | 'and_qq'
  | 'baidu'
  | 'kaios';

const browserTable: Record<CIUBrowsers, string> = {
  ie: 'Internet Explorer',
  edge: 'Microsoft Edge',
  firefox: 'Mozilla Firefox',
  chrome: 'Google Chrome',
  safari: 'Apple Safari',
  opera: 'Opera',
  ios_saf: 'iOS Safari',
  op_mini: 'Opera Mini',
  android: 'Android',
  bb: 'BlackBerry',
  op_mob: 'Opera Mobile',
  and_chr: 'Android Chrome',
  and_ff: 'Android Firefox',
  ie_mob: 'Internet Explorer Mobile',
  and_uc: 'UC Browser',
  samsung: 'Samsung Browser',
  and_qq: 'QQ Browser',
  baidu: 'Baidu Browser',
  kaios: 'KaiOS Browser'
};

interface CIUData {
  title: string;
  description: string;
  stats: Record<CIUBrowsers, Record<number, string>>;
}

const canIUseAPITable = {
  fileSystemAccessAPI:
    'https://raw.githubusercontent.com/Fyrd/caniuse/fedfb067aceccb2a5edadcc8143a8c5be509a006/features-json/native-filesystem-api.json' // Can I Useの元データ
};

export async function getBrowsersWhichSupportFeature(feature: keyof typeof canIUseAPITable) {
  const API_URL = canIUseAPITable[feature];
  const response = await fetch(API_URL);
  const data: CIUData = await response.json();
  const browsers = data.stats;
  const availableBrowsers: CIUBrowsers[] = Object.entries(browsers)
    .filter(([, versions]) => Object.values(versions).some((status) => status === 'y'))
    .map(([browserName]) => browserName as CIUBrowsers); // TSは`(Object.entries(obj))[0]`を必ず`string`に推論する 元のオブジェクト`obj`の型は無視される
  return availableBrowsers.map((browser) => browserTable[browser]);
}
