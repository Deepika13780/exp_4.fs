import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./postsSlice";
import uiReducer, { initialUiState } from "./uiSlice";

/** Factory so tests can create an isolated store with preloaded data. */
export function createAppStore({ posts = [], ui = {} } = {}) {
  return configureStore({
    reducer: { posts: postsReducer, ui: uiReducer },
    preloadedState: {
      posts: { items: posts },
      ui: { ...initialUiState, ...ui },
    },
  });
}
