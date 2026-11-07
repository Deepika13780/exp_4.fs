import {
  addDays, addMonths, formatTitle, getMonthGrid, getWeekDays,
  isSameMonth, makeStart, slotKey, splitStart, startOfWeek,
} from "../utils/dateUtils";

describe("dateUtils", () => {
  it("builds a 42-day month grid starting on the Sunday on/before the 1st", () => {
    const grid = getMonthGrid("2026-11-15");
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe("2026-11-01");
    expect(grid[41]).toBe("2026-12-12");
  });

  it("includes leading days from the previous month when needed", () => {
    const grid = getMonthGrid("2026-12-10"); // Dec 1 2026 is a Tuesday
    expect(grid[0]).toBe("2026-11-29");
  });

  it("finds the start of a week and its 7 days", () => {
    expect(startOfWeek("2026-11-18")).toBe("2026-11-15");
    expect(getWeekDays("2026-11-18")).toEqual([
      "2026-11-15", "2026-11-16", "2026-11-17", "2026-11-18",
      "2026-11-19", "2026-11-20", "2026-11-21",
    ]);
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("adds months and clamps the day of month", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29"); // leap year
    expect(addMonths("2026-01-15", -1)).toBe("2025-12-15");
  });

  it("compares months", () => {
    expect(isSameMonth("2026-11-01", "2026-11-30")).toBe(true);
    expect(isSameMonth("2026-11-30", "2026-12-01")).toBe(false);
  });

  it("builds and splits start strings", () => {
    expect(makeStart("2026-11-20", 9, 5)).toBe("2026-11-20T09:05");
    expect(splitStart("2026-11-20T09:30")).toEqual({ dateKey: "2026-11-20", hour: 9, minute: 30, time: "09:30" });
    expect(slotKey("2026-11-18", 9)).toBe("2026-11-18T09");
  });

  it("formats titles for each view", () => {
    expect(formatTitle("month", "2026-11-15")).toBe("November 2026");
    expect(formatTitle("day", "2026-11-15")).toBe("Sunday, Nov 15, 2026");
    expect(formatTitle("week", "2026-11-15")).toBe("Nov 15 – 21, 2026");
    expect(formatTitle("week", "2026-11-30")).toBe("Nov 29 – Dec 5, 2026");
    expect(formatTitle("week", "2026-12-30")).toBe("Dec 27, 2026 – Jan 2, 2027");
  });
});
