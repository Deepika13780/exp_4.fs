import { memo } from "react";
import { trackRender } from "../utils/perfStats";
import { useCalendarActions } from "../utils/useCalendarActions";
import { MonthView } from "./MonthView";
import { TimeGrid } from "./TimeGrid";

/**
 * Chooses the active view. Receives only primitive props (view, cursor,
 * memoEnabled) so React.memo can skip it when the parent re-renders for
 * unrelated reasons (e.g. the modal opening).
 */
export function CalendarView({ view, cursor, memoEnabled }) {
  trackRender("CalendarView");
  const actions = useCalendarActions();

  if (view === "month") {
    return <MonthView cursor={cursor} memoEnabled={memoEnabled} {...actions} />;
  }
  return <TimeGrid view={view} cursor={cursor} memoEnabled={memoEnabled} {...actions} />;
}

export const CalendarViewMemo = memo(CalendarView);
