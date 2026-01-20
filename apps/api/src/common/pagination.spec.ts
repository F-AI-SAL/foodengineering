import { normalizePagination, buildPaginatedResult } from "./pagination";

describe("pagination helpers", () => {
  it("normalizes page and size", () => {
    const { page, pageSize, skip, take } = normalizePagination({ page: 0, pageSize: 500 });
    expect(page).toBe(1);
    expect(pageSize).toBe(100);
    expect(skip).toBe(0);
    expect(take).toBe(100);
  });

  it("builds result metadata", () => {
    const result = buildPaginatedResult([{ id: "1" }], 21, 2, 10);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
  });
});
