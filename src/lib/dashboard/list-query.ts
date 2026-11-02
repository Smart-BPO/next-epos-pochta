/**
 * Shared URL/search helpers for dashboard server-paginated lists.
 */

export type DashListQuery = {
  q: string;
  page: number;
  pageSize: number;
  sort: string | null;
  dir: "asc" | "desc";
  filters: Record<string, string>;
};

const PAGE_SIZES = new Set([10, 25, 50, 100]);

export function parseDashListQuery(
  searchParams: Record<string, string | string[] | undefined>,
  opts?: {
    defaultPageSize?: number;
    defaultSort?: string;
    defaultDir?: "asc" | "desc";
    filterKeys?: string[];
  },
): DashListQuery {
  const pick = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const rawPage = Number(pick("page") ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const rawSize = Number(pick("pageSize") ?? opts?.defaultPageSize ?? 25);
  const pageSize = PAGE_SIZES.has(rawSize) ? rawSize : (opts?.defaultPageSize ?? 25);

  const dirRaw = pick("dir");
  const dir: "asc" | "desc" =
    dirRaw === "asc" || dirRaw === "desc"
      ? dirRaw
      : (opts?.defaultDir ?? "desc");

  const filters: Record<string, string> = {};
  for (const key of opts?.filterKeys ?? []) {
    const v = pick(key)?.trim();
    if (v) filters[key] = v;
  }

  return {
    q: (pick("q") ?? "").trim(),
    page,
    pageSize,
    sort: pick("sort")?.trim() || opts?.defaultSort || null,
    dir,
    filters,
  };
}

export function dashListRange(query: DashListQuery) {
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;
  return { from, to };
}
