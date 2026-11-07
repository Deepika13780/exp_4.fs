import { useMemo } from "react";
import { getMonthGrid, isSameMonth, todayKey, WEEKDAY_SHORT } from "../utils/dateUtils";
import { trackRender } from "../utils/perfStats";
import { DayCell, DayCellMemo } from "./DayCell";

export function MonthView({ cursor, memoEnabled, onCreate, onEdit, onDrop, onShowDay }) {
  trackRender("MonthView");
  // useMemo: the 42-day grid only needs recomputing when the month changes
  const grid = useMemo(() => getMonthGrid(cursor), [cursor]);
  const today = todayKey();
  const Cell = memoEnabled ? DayCellMemo : DayCell;

  return (
    <div className="month" role="grid" aria-label="Month view">
      {WEEKDAY_SHORT.map((d) => (
        <div key={d} className="weekday" role="columnheader">{d}</div>
      ))}
      {grid.map((key) => (
        <Cell
          key={key}
          dateKey={key}
          inMonth={isSameMonth(key, cursor)}
          isToday={key === today}
          memoEnabled={memoEnabled}
          onCreate={onCreate}
          onEdit={onEdit}
          onDrop={onDrop}
          onShowDay={onShowDay}
        />
      ))}
    </div>
  );
}
