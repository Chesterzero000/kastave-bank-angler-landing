const PAGES_ORIGIN = "https://v1-c9l.pages.dev";

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, PAGES_ORIGIN);
    const originResponse = await fetch(new Request(targetUrl, request));
    const headers = new Headers(originResponse.headers);

    headers.delete("x-robots-tag");
    headers.set("x-kastave-origin", "v1-c9l.pages.dev");

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers,
    });
  },
};
