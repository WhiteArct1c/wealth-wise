export type SortConfig = {
  column: string;
  order: "asc" | "desc";
};

/**
 * Guards against obviously malformed column names (e.g. names with spaces,
 * injection characters, or SQL keywords disguised as identifiers).
 * Column names must be valid SQL identifiers: start with a letter or
 * underscore and contain only letters, digits, and underscores.
 */
function isValidColumnName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export type FilterConfig = {
  search?: string;
  [key: string]: string | undefined;
};

// Tipo genérico para queries do Supabase que suportam filtros
type SupabaseQuery = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ilike: (column: string, pattern: string) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eq: (column: string, value: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: (column: string, options?: { ascending?: boolean }) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  if (!isValidColumnName(searchColumn)) {
    console.error(`[table-utils] applySearchFilter: invalid column name "${searchColumn}"`);
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
  if (!isValidColumnName(column)) {
    console.error(`[table-utils] applyEqualFilter: invalid column name "${column}"`);
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
      if (!isValidColumnName(column)) {
        console.error(`[table-utils] applyFilters: invalid column name "${column}"`);
        return;
      }
      filteredQuery = filteredQuery.eq(column, value);
    }
  });
  
  return filteredQuery;
}

