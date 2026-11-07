import { memo } from "react";
import { platformColor } from "../utils/constants";
import { trackRender } from "../utils/perfStats";

/** A single post rendered inside a day cell / time slot. Draggable. */
export function PostChip({ post, onEdit, showDuration = false }) {
  trackRender("PostChip");
  const time = post.start.slice(11, 16);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", post.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const open = (e) => {
    e.stopPropagation(); // don't trigger "create post" on the cell underneath
    onEdit(post.id);
  };

  return (
    <div
      className={`chip status-${post.status}`}
      style={{ "--c": platformColor(post.platform) }}
      role="button"
      tabIndex={0}
      draggable
      aria-label={`${post.title} at ${time}`}
      onDragStart={handleDragStart}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(e);
        }
      }}
    >
      <span className="chip-time">{time}</span>
      <span className="chip-title">{post.title}</span>
      {showDuration && <span className="chip-dur">{post.durationMin} min</span>}
    </div>
  );
}

export const PostChipMemo = memo(PostChip);
