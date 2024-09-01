import moment from 'moment';

export function formatTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return 'Invalid Date';
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return moment(date).format('h:mm:ss a, MMMM Do YYYY');
}
