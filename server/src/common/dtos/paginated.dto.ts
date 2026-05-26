export class PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
