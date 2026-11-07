import { createAppStore } from "../store";
import { updatePost } from "../store/postsSlice";
import { navigate, setPlatformFilter, setView } from "../store/uiSlice";
import { selectFilteredPosts, selectPostsByDay, selectPostsBySlot } from "../store/selectors";
import { fixturePosts } from "./testUtils";

const makeStore = () => createAppStore({ posts: fixturePosts, ui: { cursor: "2026-11-15" } });

describe("selectors", () => {
  it("groups posts by day, sorted by time", () => {
    const byDay = selectPostsByDay(makeStore().getState());
    expect(byDay["2026-11-10"].map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(byDay["2026-11-18"].map((p) => p.id)).toEqual(["p3"]);
  });

  it("groups posts by hourly slot", () => {
    const bySlot = selectPostsBySlot(makeStore().getState());
    expect(bySlot["2026-11-10T09"]).toHaveLength(1);
    expect(bySlot["2026-11-10T14"]).toHaveLength(1);
  });

  it("filters by platform", () => {
    const store = makeStore();
    store.dispatch(setPlatformFilter("linkedin"));
    expect(selectFilteredPosts(store.getState()).map((p) => p.id)).toEqual(["p2"]);
  });

  it("is memoized: unrelated UI changes do not recompute or change the reference", () => {
    const store = makeStore();
    const first = selectPostsByDay(store.getState());
    const runs = selectPostsByDay.recomputations();

    store.dispatch(navigate("next"));
    store.dispatch(setView("week"));
    const second = selectPostsByDay(store.getState());

    expect(second).toBe(first);
    expect(selectPostsByDay.recomputations()).toBe(runs);
  });

  it("recomputes when a post changes", () => {
    const store = makeStore();
    const first = selectPostsByDay(store.getState());
    store.dispatch(updatePost({ id: "p1", title: "Edited" }));
    expect(selectPostsByDay(store.getState())).not.toBe(first);
  });
});
