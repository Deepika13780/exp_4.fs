import { memo, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { selectPostsByDay } from "../store/selectors";
import { EMPTY } from "../utils/constants";
import { trackRender } from "../utils/perfStats";
import { PostChip, PostChipMemo } from "./PostChip";

const MAX_VISIBLE = 3;

/**
 * One cell of the month grid.
 * - Subscribes ONLY to its own day's posts (shallowEqual) so unrelated store
 *   updates never re-render it.
 * - All props are primitives or stable functions, so React.memo works.
 */
export function DayCell({ dateKey, inMonth, isToday, memoEnabled, onCreate, onEdit, onDrop, onShowDay }) {
  trackRender("DayCell");
  const posts = useSelector((s) => selectPostsByDay(s)[dateKey] ?? EMPTY, shallowEqual);
  const [isOver, setIsOver] = useState(false);
  const Chip = memoEnabled ? PostChipMemo : PostChip;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDrop(id, dateKey);
  };

  const classes = ["day-cell", !inMonth && "outside", isToday && "today", isOver && "drag-over"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      data-testid={`day-${dateKey}`}
      onClick={() => onCreate(dateKey)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
      }}
      onDrop={handleDrop}
    >
      <button
        type="button"
        className="day-num"
        aria-label={`Open day ${dateKey}`}
        onClick={(e) => {
          e.stopPropagation();
          onShowDay(dateKey);
        }}
      >
        {Number(dateKey.slice(8))}
      </button>

      {posts.slice(0, MAX_VISIBLE).map((p) => (
        <Chip key={p.id} post={p} onEdit={onEdit} />
      ))}

      {posts.length > MAX_VISIBLE && (
        <button
          type="button"
          className="more"
          onClick={(e) => {
            e.stopPropagation();
            onShowDay(dateKey);
          }}
        >
          +{posts.length - MAX_VISIBLE} more
        </button>
      )}
    </div>
  );
}

export const DayCellMemo = memo(DayCell);
