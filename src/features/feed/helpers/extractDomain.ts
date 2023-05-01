export function extractDomain(url: string) {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.startsWith("www.")
    ? parsedUrl.hostname.slice(4)
    : parsedUrl.hostname;
}
