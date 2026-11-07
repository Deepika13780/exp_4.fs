import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "../App";
import { createAppStore } from "../store";

// Fixed fixture data so tests are deterministic (November 2026 starts on a Sunday).
export const fixturePosts = [
  { id: "p1", title: "Launch teaser", content: "", platform: "instagram", status: "scheduled", start: "2026-11-10T09:00", durationMin: 60 },
  { id: "p2", title: "Blog announcement", content: "", platform: "linkedin", status: "draft", start: "2026-11-10T14:30", durationMin: 30 },
  { id: "p3", title: "Poll tweet", content: "", platform: "twitter", status: "scheduled", start: "2026-11-18T11:00", durationMin: 30 },
];

export function renderApp({ posts = fixturePosts, ui = {} } = {}) {
  const store = createAppStore({ posts, ui: { cursor: "2026-11-15", ...ui } });
  const utils = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  return { store, ...utils };
}

/** Minimal DataTransfer mock (jsdom does not implement it). */
export function makeDataTransfer() {
  const data = {};
  return {
    setData: (k, v) => { data[k] = v; },
    getData: (k) => data[k],
    effectAllowed: "",
    dropEffect: "",
  };
}
