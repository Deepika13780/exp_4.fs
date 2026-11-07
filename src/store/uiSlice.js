import { createSlice } from "@reduxjs/toolkit";
import { addDays, addMonths, todayKey } from "../utils/dateUtils";

export const initialUiState = {
  view: "month", // "month" | "week" | "day"
  cursor: todayKey(), // date key the calendar is centred on
  platformFilter: "all",
  modal: null, // null | { mode: "create", dateKey, hour } | { mode: "edit", postId }
  memoEnabled: true, // lets you compare optimised vs un-optimised rendering
  perfPanel: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState: initialUiState,
  reducers: {
    setView(state, { payload }) {
      state.view = payload;
    },
    navigate(state, { payload: direction }) {
      if (direction === "today") {
        state.cursor = todayKey();
        return;
      }
      const step = direction === "next" ? 1 : -1;
      if (state.view === "month") state.cursor = addMonths(state.cursor, step);
      else if (state.view === "week") state.cursor = addDays(state.cursor, 7 * step);
      else state.cursor = addDays(state.cursor, step);
    },
    showDay(state, { payload: dateKey }) {
      state.view = "day";
      state.cursor = dateKey;
    },
    setPlatformFilter(state, { payload }) {
      state.platformFilter = payload;
    },
    openCreate(state, { payload }) {
      state.modal = { mode: "create", dateKey: payload.dateKey, hour: payload.hour ?? null };
    },
    openEdit(state, { payload: postId }) {
      state.modal = { mode: "edit", postId };
    },
    closeModal(state) {
      state.modal = null;
    },
    toggleMemo(state) {
      state.memoEnabled = !state.memoEnabled;
    },
    togglePerfPanel(state) {
      state.perfPanel = !state.perfPanel;
    },
  },
});

export const {
  setView, navigate, showDay, setPlatformFilter, openCreate, openEdit,
  closeModal, toggleMemo, togglePerfPanel,
} = uiSlice.actions;
export default uiSlice.reducer;
