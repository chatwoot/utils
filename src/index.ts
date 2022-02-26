import isToday from 'date-fns/isToday';
import isYesterday from 'date-fns/isYesterday';

/**
 * @name Get contrasting text color
 * @description Get contrasting text color from a text color
 * @param bgColor  Background color of text.
 * @returns contrasting text color
 */
export const getContrastingTextColor = (bgColor: string): string => {
  const color = bgColor.replace('#', '');
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  // http://stackoverflow.com/a/3943023/112731
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
};
/**
 * @name Get formatted date
 * @description Get date in today, yesterday or any other date format
 * @param date  date
 * @param todayText  Today text
 * @param yesterdayText  Yesterday text
 * @returns formatted date
 */
export const formatDate = ({
  date,
  todayText,
  yesterdayText,
}: {
  date: string;
  todayText: string;
  yesterdayText: string;
}) => {
  const dateValue = new Date(date);
  if (isToday(dateValue)) return todayText;
  if (isYesterday(dateValue)) return yesterdayText;
  return date;
};

export const formatTime = (time_in_seconds: number) => {

  let formattedTime = '';
  if (time_in_seconds >= 60 && time_in_seconds < 3600) {
    return `${Math.round(time_in_seconds/60)} Min`
  }
  if(time_in_seconds >= 3600 && time_in_seconds < 86400) {
    const hours = Math.round(time_in_seconds/3600);
    formattedTime = `${hours} Hr`;
    const minutes = time_in_seconds%3600 < 60 || hours === 24 ? 0 : Math.round((time_in_seconds%3600)/60);
    return formattedTime + `${minutes > 0 ? ' ' + minutes + ' Min' : ''}`;
  }
  if(time_in_seconds >= 86400) {
    const days = Math.round(time_in_seconds/86400);
    formattedTime = `${days} Day`
    const hours = time_in_seconds%86400 < 3600 || days >= 364 ? 0 : Math.round((time_in_seconds%86400)/3600);
    return formattedTime + `${hours > 0 ? ' ' + hours + ' Hr' : ''}`;
  }
  return `${Math.round(time_in_seconds)} Sec`
}