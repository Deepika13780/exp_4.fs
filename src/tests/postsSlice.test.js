import reducer, {
  addMany, addPost, clearPosts, deletePost, movePost, updatePost,
} from "../store/postsSlice";
import uiReducer, { navigate, openCreate, openEdit, closeModal, setView, showDay } from "../store/uiSlice";
import { fixturePosts } from "./testUtils";
import { generatePosts, makeSamplePosts } from "../utils/sampleData";

const base = { items: fixturePosts };

describe("postsSlice", () => {
  it("adds a post with defaults and a generated id", () => {
    const state = reducer({ items: [] }, addPost({ title: "New", platform: "twitter", start: "2026-11-01T08:00" }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ title: "New", status: "scheduled", durationMin: 60 });
    expect(state.items[0].id).toBeTruthy();
  });

  it("updates only the targeted post", () => {
    const state = reducer(base, updatePost({ id: "p1", title: "Changed" }));
    expect(state.items.find((p) => p.id === "p1").title).toBe("Changed");
    expect(state.items.find((p) => p.id === "p2").title).toBe("Blog announcement");
  });

  it("deletes a post", () => {
    const state = reducer(base, deletePost("p2"));
    expect(state.items.map((p) => p.id)).toEqual(["p1", "p3"]);
  });

  it("moves a post to another day and keeps its time (month drop)", () => {
    const state = reducer(base, movePost({ id: "p2", dateKey: "2026-11-25" }));
    expect(state.items.find((p) => p.id === "p2").start).toBe("2026-11-25T14:30");
  });

  it("moves a post to another hour and keeps its minutes (time-slot drop)", () => {
    const state = reducer(base, movePost({ id: "p2", dateKey: "2026-11-11", hour: 16 }));
    expect(state.items.find((p) => p.id === "p2").start).toBe("2026-11-11T16:30");
  });

  it("ignores moves for unknown ids", () => {
    expect(reducer(base, movePost({ id: "nope", dateKey: "2026-11-25" }))).toEqual(base);
  });

  it("keeps unchanged post objects referentially equal (structural sharing)", () => {
    const state = reducer(base, movePost({ id: "p1", dateKey: "2026-11-12" }));
    expect(state.items.find((p) => p.id === "p2")).toBe(base.items.find((p) => p.id === "p2"));
  });

  it("adds many and clears", () => {
    const added = reducer({ items: [] }, addMany(generatePosts(50, "2026-11-01")));
    expect(added.items).toHaveLength(50);
    expect(reducer(added, clearPosts()).items).toEqual([]);
  });
});

describe("sample data generators", () => {
  it("makeSamplePosts produces posts inside the requested month", () => {
    const posts = makeSamplePosts("2026-11-15");
    expect(posts.length).toBeGreaterThan(5);
    expect(posts.every((p) => p.start.startsWith("2026-11-"))).toBe(true);
  });
  it("generatePosts is deterministic for the same seed (ignoring ids)", () => {
    const strip = (arr) => arr.map(({ id, ...rest }) => rest);
    expect(strip(generatePosts(20, "2026-11-01", 7))).toEqual(strip(generatePosts(20, "2026-11-01", 7)));
  });
});

describe("uiSlice", () => {
  const init = uiReducer(undefined, { type: "init" });
  const ui = { ...init, cursor: "2026-11-15", view: "month" };

  it("navigates by month / week / day depending on the view", () => {
    expect(uiReducer(ui, navigate("next")).cursor).toBe("2026-12-15");
    expect(uiReducer({ ...ui, view: "week" }, navigate("prev")).cursor).toBe("2026-11-08");
    expect(uiReducer({ ...ui, view: "day" }, navigate("next")).cursor).toBe("2026-11-16");
  });

  it("switches view and drills into a day", () => {
    expect(uiReducer(ui, setView("week")).view).toBe("week");
    const s = uiReducer(ui, showDay("2026-11-20"));
    expect(s).toMatchObject({ view: "day", cursor: "2026-11-20" });
  });

  it("opens and closes the modal", () => {
    expect(uiReducer(ui, openCreate({ dateKey: "2026-11-12", hour: 15 })).modal).toEqual({ mode: "create", dateKey: "2026-11-12", hour: 15 });
    expect(uiReducer(ui, openEdit("p1")).modal).toEqual({ mode: "edit", postId: "p1" });
    expect(uiReducer(uiReducer(ui, openEdit("p1")), closeModal()).modal).toBeNull();
  });
});
