export const uuid = new URLSearchParams(location.search).get("uuid") ?? "";


export const infoPromise = fetch("/api/info?uuid=" + encodeURIComponent(uuid))
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
