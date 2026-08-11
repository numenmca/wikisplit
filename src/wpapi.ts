export async function getSearchResults(searchTerm: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&format=json&formatversion=2&namespace=0&limit=6&redirects=resolve&search=${encodeURIComponent(searchTerm)}`,
    );

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return json[1] as string[];
  } catch {
    return [];
  }
}

export async function getPage(
  name: string,
): Promise<[string, string] | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?redirects=1&disableeditsection=true&format=json&origin=*&action=parse&prop=text&useskin=vector&page=${name}`,
    );

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()).parse;
    return [json.title, json.text["*"]];
  } catch {
    return null;
  }
}
