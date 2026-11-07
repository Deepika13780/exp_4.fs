import { createSelector } from "@reduxjs/toolkit";

export const selectPosts = (state) => state.posts.items;
export const selectPlatformFilter = (state) => state.ui.platformFilter;

export const selectPostById = (state, id) => state.posts.items.find((p) => p.id === id);

/** Memoized: only recomputes when posts or the filter change (NOT on navigation / modal changes). */
export const selectFilteredPosts = createSelector(
  [selectPosts, selectPlatformFilter],
  (posts, filter) => (filter === "all" ? posts : posts.filter((p) => p.platform === filter))
);

const groupBy = (posts, keyFn) => {
  const map = {};
  for (const p of posts) {
    const k = keyFn(p);
    (map[k] ||= []).push(p);
  }
  for (const k in map) map[k].sort((a, b) => a.start.localeCompare(b.start));
  return map;
};

/** { "2026-11-10": [post, ...] }  -> used by the month view */
export const selectPostsByDay = createSelector([selectFilteredPosts], (posts) =>
  groupBy(posts, (p) => p.start.slice(0, 10))
);

/** { "2026-11-10T09": [post, ...] } -> used by the week / day views */
export const selectPostsBySlot = createSelector([selectFilteredPosts], (posts) =>
  groupBy(posts, (p) => p.start.slice(0, 13))
);
