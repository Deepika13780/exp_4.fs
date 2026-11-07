import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { openCreate, openEdit } from "../store/uiSlice";
import { renderApp } from "./testUtils";

describe("PostModal", () => {
  it("shows a validation error and does not save when the title is empty", async () => {
    const user = userEvent.setup();
    const { store } = renderApp();
    act(() => { store.dispatch(openCreate({ dateKey: "2026-11-12" })); });

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(store.getState().posts.items).toHaveLength(3);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("validates the duration range", async () => {
    const user = userEvent.setup();
    const { store } = renderApp();
    act(() => { store.dispatch(openCreate({ dateKey: "2026-11-12" })); });
    const dialog = screen.getByRole("dialog");

    await user.type(within(dialog).getByLabelText("Title"), "Valid title");
    await user.clear(within(dialog).getByLabelText("Duration (minutes)"));
    await user.type(within(dialog).getByLabelText("Duration (minutes)"), "5");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(screen.getByText(/between 15 and 480/)).toBeInTheDocument();
    expect(store.getState().posts.items).toHaveLength(3);
  });

  it("updates an existing post", async () => {
    const user = userEvent.setup();
    const { store } = renderApp();
    act(() => { store.dispatch(openEdit("p1")); });
    const dialog = screen.getByRole("dialog", { name: "Edit post" });

    const title = within(dialog).getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Updated title");
    await user.selectOptions(within(dialog).getByLabelText("Status"), "published");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(store.getState().posts.items.find((p) => p.id === "p1")).toMatchObject({
      title: "Updated title",
      status: "published",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes with Cancel and with the Escape key without saving", async () => {
    const user = userEvent.setup();
    const { store } = renderApp();
    act(() => { store.dispatch(openEdit("p1")); });
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => { store.dispatch(openEdit("p1")); });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
