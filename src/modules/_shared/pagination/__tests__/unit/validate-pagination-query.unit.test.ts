import {
  MAX_PER_PAGE_NUMBER,
  validatePaginationQuery,
} from "../../pagination.middleware";

describe("UNIT: validatePaginationQuery", () => {
  test("should set perPage to the maximum value if queryPerPage exceeds the maximum limit", () => {
    const queryPage = 1;
    const queryPerPage = MAX_PER_PAGE_NUMBER + 1;
    const { perPage } = validatePaginationQuery(queryPage, queryPerPage);

    expect(perPage).toBe(MAX_PER_PAGE_NUMBER);
  });

  test("should return perPage equal to queryPerPage if queryPerPage is less than the maximum limit", () => {
    const queryPage = 1;
    const queryPerPage = MAX_PER_PAGE_NUMBER - 1;
    const { perPage } = validatePaginationQuery(queryPage, queryPerPage);

    expect(perPage).toBe(queryPerPage);
  });

  test("should set perPage to the maximum value if queryPerPage is not a valid number", () => {
    const queryPage = 1;
    const queryPerPage = Number(undefined);
    const { perPage } = validatePaginationQuery(queryPage, queryPerPage);

    expect(perPage).toBe(MAX_PER_PAGE_NUMBER);
  });

  test("should set page to 1 if queryPage is less than 1", () => {
    const queryPage = 0;
    const queryPerPage = MAX_PER_PAGE_NUMBER;
    const { page } = validatePaginationQuery(queryPage, queryPerPage);

    expect(page).toBe(1);
  });

  test("should default to page 1 if queryPage is not a valid number", () => {
    const queryPage = Number(undefined);
    const queryPerPage = MAX_PER_PAGE_NUMBER;
    const { page } = validatePaginationQuery(queryPage, queryPerPage);

    expect(page).toBe(1);
  });
});
