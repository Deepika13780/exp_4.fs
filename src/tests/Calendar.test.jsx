import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeDataTransfer, renderApp } from "./testUtils";

const dragAndDrop = (source, target) => {
  const dataTransfer = makeDataTransfer();
  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
};

describe("Calendar interface", () => {
  it("renders the month title and maps posts to their days", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: "November 2026" })).toBeInTheDocument();
    const day10 = screen.getByTestId("day-2026-11-10");
    expect(within(day10).getByText("Launch teaser")).toBeInTheDocument();
    expect(within(day10).getByText("Blog announcement")).toBeInTheDocument();
    expect(within(screen.getByTestId("day-2026-11-18")).getByText("Poll tweet")).toBeInTheDocument();
  });

  it("navigates to the next month", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "December 2026" })).toBeInTheDocument();
  });

  it("opens the edit dialog when a post is clicked", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: /Launch teaser at 09:00/ }));
    const dialog = screen.getByRole("dialog", { name: "Edit post" });
    expect(within(dialog).getByLabelText("Title")).toHaveValue("Launch teaser");
    expect(within(dialog).getByLabelText("Time")).toHaveValue("09:00");
  });

  it("creates a post by clicking an empty day", async () => {
    const user = userEvent.setup();
    const { store } = renderApp();
    await user.click(screen.getByTestId("day-2026-11-20"));

    const dialog = screen.getByRole("dialog", { name: "New post" });
    expect(within(dialog).getByLabelText("Date")).toHaveValue("2026-11-20");
    await user.type(within(dialog).getByLabelText("Title"), "New idea");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(store.getState().posts.items.some((p) => p.title === "New idea" && p.start === "2026-11-20T09:00")).toBe(true);
    expect(within(screen.getByTestId("day-2026-11-20")).getByText("New idea")).toBeInTheDocument();
  });

  it("deletes a post from the edit dialog", async () => {
    const user = userEvent.setup();
    const { store } = renderApp();
    await user.click(screen.getByRole("button", { name: /Poll tweet/ }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(store.getState().posts.items.find((p) => p.id === "p3")).toBeUndefined();
    expect(screen.queryByText("Poll tweet")).not.toBeInTheDocument();
  });

  it("filters posts by platform", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.selectOptions(screen.getByLabelText("Filter by platform"), "linkedin");
    expect(screen.queryByText("Launch teaser")).not.toBeInTheDocument();
    expect(screen.getByText("Blog announcement")).toBeInTheDocument();
  });

  it("drag & drop moves a post to another day (month view)", () => {
    const { store } = renderApp();
    dragAndDrop(
      screen.getByRole("button", { name: /Launch teaser/ }),
      screen.getByTestId("day-2026-11-20")
    );
    expect(store.getState().posts.items.find((p) => p.id === "p1").start).toBe("2026-11-20T09:00");
    expect(within(screen.getByTestId("day-2026-11-20")).getByText("Launch teaser")).toBeInTheDocument();
    expect(within(screen.getByTestId("day-2026-11-10")).queryByText("Launch teaser")).not.toBeInTheDocument();
  });

  it("shows '+N more' when a day has more than 3 posts and opens day view", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 5 }, (_, i) => ({
      id: `m${i}`, title: `Busy ${i}`, content: "", platform: "twitter", status: "scheduled",
      start: `2026-11-05T0${i + 1}:00`, durationMin: 30,
    }));
    renderApp({ posts: many });
    await user.click(screen.getByRole("button", { name: "+2 more" }));
    expect(screen.getByRole("heading", { name: "Thursday, Nov 5, 2026" })).toBeInTheDocument();
    expect(screen.getByText("Busy 4")).toBeInTheDocument();
  });
});

describe("Week and day views", () => {
  it("maps posts to hourly time slots in the week view", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("heading", { name: "Nov 15 – 21, 2026" })).toBeInTheDocument();
    expect(within(screen.getByTestId("slot-2026-11-18-11")).getByText("Poll tweet")).toBeInTheDocument();
  });

  it("drag & drop to a time slot changes the day and hour", async () => {
    const user = userEvent.setup();
    const { store } = renderApp();
    await user.click(screen.getByRole("button", { name: "Week" }));
    dragAndDrop(
      screen.getByRole("button", { name: /Poll tweet/ }),
      screen.getByTestId("slot-2026-11-19-16")
    );
    expect(store.getState().posts.items.find((p) => p.id === "p3").start).toBe("2026-11-19T16:00");
  });

  it("creates a post from an empty slot with the hour prefilled", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Week" }));
    await user.click(screen.getByTestId("slot-2026-11-17-15"));
    const dialog = screen.getByRole("dialog", { name: "New post" });
    expect(within(dialog).getByLabelText("Date")).toHaveValue("2026-11-17");
    expect(within(dialog).getByLabelText("Time")).toHaveValue("15:00");
  });

  it("day view shows a single column for the cursor date", async () => {
    const user = userEvent.setup();
    renderApp({ ui: { cursor: "2026-11-18" } });
    await user.click(screen.getByRole("button", { name: "Day" }));
    expect(screen.getByRole("heading", { name: "Wednesday, Nov 18, 2026" })).toBeInTheDocument();
    expect(screen.getAllByTestId(/^slot-/)).toHaveLength(24);
  });
});
