import { Fragment, useEffect, useMemo, useRef } from "react";
import {
  HOURS, WEEKDAY_SHORT, formatHour, fromDateKey, getWeekDays, todayKey,
} from "../utils/dateUtils";
import { trackRender } from "../utils/perfStats";
import { TimeSlot, TimeSlotMemo } from "./TimeSlot";

const SLOT_HEIGHT = 52;

/** Week view (7 columns) or Day view (1 column) with 24 hourly rows. */
export function TimeGrid({ view, cursor, memoEnabled, onCreate, onEdit, onDrop }) {
  trackRender("TimeGrid");
  const days = useMemo(() => (view === "week" ? getWeekDays(cursor) : [cursor]), [view, cursor]);
  const today = todayKey();
  const scrollRef = useRef(null);
  const Slot = memoEnabled ? TimeSlotMemo : TimeSlot;

  // Start scrolled to 08:00
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 8 * SLOT_HEIGHT;
  }, [view]);

  return (
    <div className="timegrid-wrap" ref={scrollRef}>
      <div
        className="timegrid"
        style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <div className="tg-corner" />
        {days.map((k) => {
          const d = fromDateKey(k);
          return (
            <div key={k} className={`tg-head${k === today ? " today" : ""}`}>
              {WEEKDAY_SHORT[d.getDay()]} <b>{d.getDate()}</b>
            </div>
          );
        })}

        {HOURS.map((h) => (
          <Fragment key={h}>
            <div className="tg-hour">{formatHour(h)}</div>
            {days.map((k) => (
              <Slot
                key={`${k}-${h}`}
                dateKey={k}
                hour={h}
                memoEnabled={memoEnabled}
                onCreate={onCreate}
                onEdit={onEdit}
                onDrop={onDrop}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
