export function formatTimeAgo(timestamp: number) {
  const diff = Date.now() / 1000 - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes != 1 ? "minutes" : "minute"} ago`;
  }
  const hours = Math.floor(diff / 3600);
  if (hours < 24) {
    return `${hours} ${hours != 1 ? "hours" : "hour"} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${days != 1 ? "days" : "day"} ago`;
}
