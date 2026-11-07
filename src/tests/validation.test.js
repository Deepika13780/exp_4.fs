import { validatePost } from "../utils/validation";

const valid = { title: "Hello", date: "2026-11-10", time: "09:00", durationMin: "60" };

describe("validatePost", () => {
  it("accepts valid data", () => {
    expect(validatePost(valid)).toEqual({});
  });
  it("requires a non-blank title", () => {
    expect(validatePost({ ...valid, title: "   " }).title).toBe("Title is required");
  });
  it("rejects very long titles", () => {
    expect(validatePost({ ...valid, title: "x".repeat(121) }).title).toMatch(/120/);
  });
  it("rejects bad date, time and duration", () => {
    const errs = validatePost({ title: "a", date: "", time: "", durationMin: "5" });
    expect(Object.keys(errs).sort()).toEqual(["date", "durationMin", "time"]);
  });
});
