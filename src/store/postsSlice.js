import { createSlice, nanoid } from "@reduxjs/toolkit";
import { makeStart, splitStart } from "../utils/dateUtils";

const postsSlice = createSlice({
  name: "posts",
  initialState: { items: [] },
  reducers: {
    addPost: {
      reducer(state, { payload }) {
        state.items.push(payload);
      },
      prepare(data) {
        return {
          payload: { id: nanoid(), content: "", status: "scheduled", durationMin: 60, ...data },
        };
      },
    },
    addMany(state, { payload }) {
      state.items.push(...payload);
    },
    updatePost(state, { payload }) {
      const i = state.items.findIndex((p) => p.id === payload.id);
      if (i >= 0) state.items[i] = { ...state.items[i], ...payload };
    },
    deletePost(state, { payload: id }) {
      state.items = state.items.filter((p) => p.id !== id);
    },
    /** Drag & drop: change date (and hour when dropped on a time slot). Minutes are preserved. */
    movePost(state, { payload: { id, dateKey, hour } }) {
      const post = state.items.find((p) => p.id === id);
      if (!post) return;
      const current = splitStart(post.start);
      post.start = makeStart(dateKey, hour ?? current.hour, current.minute);
    },
    clearPosts(state) {
      state.items = [];
    },
    resetPosts(state, { payload }) {
      state.items = payload;
    },
  },
});

export const { addPost, addMany, updatePost, deletePost, movePost, clearPosts, resetPosts } =
  postsSlice.actions;
export default postsSlice.reducer;
