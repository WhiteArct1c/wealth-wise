export type SortConfig = {
  column: string;
  order: "asc" | "desc";
};

export type FilterConfig = {
  search?: string;
  [key: string]: string | undefined;
};

// Tipo genérico para queries do Supabase que suportam filtros
type SupabaseQuery = {
  ilike: (column: string, pattern: string) => any;
  eq: (column: string, value: any) => any;
  order: (column: string, options?: { ascending?: boolean }) => any;
  [key: string]: any;
};

/**
 * Aplica ordenação a uma query do Supabase
 */
export function applySort(
  query: SupabaseQuery,
  sortColumn: string | null,
  sortOrder: "asc" | "desc" | null,
  defaultSort: { column: string; order: "asc" | "desc" }
) {
  const column = sortColumn || defaultSort.column;
  const order = sortOrder || defaultSort.order;
  return query.order(column, { ascending: order === "asc" });
}

/**
 * Aplica filtro de busca (texto) em uma coluna específica
 */
export function applySearchFilter(
  query: SupabaseQuery,
  search: string | null,
  searchColumn: string
) {
  if (!search || !search.trim()) {
    return query;
  }
  return query.ilike(searchColumn, `%${search.trim()}%`);
}

/**
 * Aplica filtro de igualdade em uma coluna
 */
export function applyEqualFilter(
  query: SupabaseQuery,
  value: string | null,
  column: string
) {
  if (!value || !value.trim()) {
    return query;
  }
  return query.eq(column, value);
}

/**
 * Aplica múltiplos filtros de igualdade
 */
export function applyFilters(
  query: SupabaseQuery,
  filters: FilterConfig,
  filterMap: Record<string, string> // Mapeia chave do filtro para coluna do banco
) {
  let filteredQuery = query;
  
  Object.entries(filters).forEach(([key, value]) => {
    if (key === "search" || !value) return; // search é tratado separadamente
    const column = filterMap[key];
    if (column) {
      filteredQuery = filteredQuery.eq(column, value);
    }
  });
  
  return filteredQuery;
}

