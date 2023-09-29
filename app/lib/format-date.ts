import { format } from 'date-fns';

export const formatDate = (date: Date) => {
  const midnightToday = new Date().setHours(0, 0, 0, 0);
  const yesterday = new Date().setDate(new Date().getDate() - 1);
  const midnightYesterday = new Date(yesterday).setHours(0, 0, 0, 0);

  const receivedToday = date.getTime() > midnightToday;
  const receivedYesterday = date.getTime() > midnightYesterday;
  const receivedThisYear = date.getFullYear() === new Date().getFullYear();

  let formatString: string;
  if (receivedToday) {
    formatString = 'HH:mm';
  } else if (receivedYesterday) {
    formatString = "'Yesterday' @ HH:mm";
  } else if (receivedThisYear) {
    formatString = 'do MMM @ HH:mm';
  } else {
    formatString = 'dd/MM/yyyy @ HH:mm';
  }
  return format(date, formatString);
};
