import { act } from "@testing-library/react";
import { movePost } from "../store/postsSlice";
import { openCreate } from "../store/uiSlice";
import { getRenderCounts, resetStats } from "../utils/perfStats";
import { renderApp } from "./testUtils";

const count = (name) => getRenderCounts()[name] ?? 0;

describe("Rendering performance (memoization)", () => {
  it("memo ON: opening the modal does not re-render any day cell or chip", () => {
    const { store } = renderApp({ ui: { memoEnabled: true } });
    resetStats();

    act(() => { store.dispatch(openCreate({ dateKey: "2026-11-12" })); });

    expect(count("App")).toBe(1); // App itself re-renders (it reads the ui slice)...
    expect(count("CalendarView")).toBe(0); // ...but memo stops it there
    expect(count("DayCell")).toBe(0);
    expect(count("PostChip")).toBe(0);
  });

  it("memo OFF: the same action re-renders all 42 day cells", () => {
    const { store } = renderApp({ ui: { memoEnabled: false } });
    resetStats();

    act(() => { store.dispatch(openCreate({ dateKey: "2026-11-12" })); });

    expect(count("DayCell")).toBe(42);
  });

  it("memo ON: moving a post re-renders only the source and target cells", () => {
    const { store } = renderApp({ ui: { memoEnabled: true } });
    resetStats();

    act(() => { store.dispatch(movePost({ id: "p1", dateKey: "2026-11-20" })); });

    expect(count("DayCell")).toBe(2); // 2026-11-10 (lost a post) and 2026-11-20 (gained one)
    expect(count("PostChip")).toBe(1); // only the moved post's chip is rendered; its neighbour is skipped
  });

  it("memo ON: a post change in week view re-renders only the affected slots", () => {
    const { store } = renderApp({ ui: { memoEnabled: true, view: "week" } });
    resetStats();

    act(() => { store.dispatch(movePost({ id: "p3", dateKey: "2026-11-19", hour: 16 })); });

    expect(count("TimeSlot")).toBe(2); // 11-18 @ 11:00 and 11-19 @ 16:00 (out of 168 slots)
  });
});
