export function formatTimeAgo(timestamp: number) {
  const diff = Date.now() / 1000 - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 60 / 60);
  if (hours < 24) {
    return `${hours} ${hours != 1 ? "hours" : "hour"} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${days != 1 ? "days" : "day"} ago`;
}
