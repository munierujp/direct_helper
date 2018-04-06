import zeroPadding from '@functions/zeroPadding';

const DAY_TEXTS = ['日', '月', '火', '水', '木', '金', '土'];

/**
* Dateオブジェクトを指定したパターンでフォーマットします。
* cf. https://docs.oracle.com/javase/jp/8/docs/api/java/time/format/DateTimeFormatter.html#patterns
* @param {Date} date Dateオブジェクト
* @param {String} pattern パターン
* @return {String} フォーマットした文字列
*/
export default function(date, pattern){
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return Replacer.of(
    [/yyyy/g, year],
    [/yy/g, year % 100],
    [/MM/g, zeroPadding(month, 2)],
    [/M/g, month],
    [/dd/g, zeroPadding(dayOfMonth, 2)],
    [/d/g, dayOfMonth],
    [/e/g, DAY_TEXTS[dayOfWeek]],
    [/HH/g, zeroPadding(hours, 2)],
    [/H/g, hours],
    [/mm/g, zeroPadding(minutes, 2)],
    [/m/g, minutes],
    [/ss/g, zeroPadding(seconds, 2)],
    [/s/g, seconds]
  ).exec(pattern);
}
