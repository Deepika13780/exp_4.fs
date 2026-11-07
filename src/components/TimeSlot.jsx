import { memo, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { selectPostsBySlot } from "../store/selectors";
import { EMPTY } from "../utils/constants";
import { slotKey } from "../utils/dateUtils";
import { trackRender } from "../utils/perfStats";
import { PostChip, PostChipMemo } from "./PostChip";

/** One hourly cell in the week / day grid. */
export function TimeSlot({ dateKey, hour, memoEnabled, onCreate, onEdit, onDrop }) {
  trackRender("TimeSlot");
  const key = slotKey(dateKey, hour);
  const posts = useSelector((s) => selectPostsBySlot(s)[key] ?? EMPTY, shallowEqual);
  const [isOver, setIsOver] = useState(false);
  const Chip = memoEnabled ? PostChipMemo : PostChip;

  return (
    <div
      className={`slot${isOver ? " drag-over" : ""}`}
      data-testid={`slot-${dateKey}-${hour}`}
      onClick={() => onCreate(dateKey, hour)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id, dateKey, hour);
      }}
    >
      {posts.map((p) => (
        <Chip key={p.id} post={p} onEdit={onEdit} showDuration />
      ))}
    </div>
  );
}

export const TimeSlotMemo = memo(TimeSlot);
