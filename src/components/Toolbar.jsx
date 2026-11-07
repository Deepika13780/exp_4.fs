import { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigate, openCreate, setPlatformFilter, setView, togglePerfPanel } from "../store/uiSlice";
import { PLATFORMS } from "../utils/constants";
import { formatTitle, todayKey } from "../utils/dateUtils";
import { trackRender } from "../utils/perfStats";

const VIEWS = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
];

function Toolbar() {
  trackRender("Toolbar");
  const dispatch = useDispatch();
  const view = useSelector((s) => s.ui.view);
  const cursor = useSelector((s) => s.ui.cursor);
  const filter = useSelector((s) => s.ui.platformFilter);
  const perfPanel = useSelector((s) => s.ui.perfPanel);

  return (
    <header className="toolbar">
      <div className="tb-group">
        <button className="btn" onClick={() => dispatch(navigate("today"))}>Today</button>
        <button className="btn icon" aria-label="Previous" onClick={() => dispatch(navigate("prev"))}>‹</button>
        <button className="btn icon" aria-label="Next" onClick={() => dispatch(navigate("next"))}>›</button>
        <h2 className="tb-title" aria-live="polite">{formatTitle(view, cursor)}</h2>
      </div>

      <div className="tb-group">
        <select
          aria-label="Filter by platform"
          value={filter}
          onChange={(e) => dispatch(setPlatformFilter(e.target.value))}
        >
          <option value="all">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        <div className="segmented">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={view === v.id ? "active" : ""}
              aria-pressed={view === v.id}
              onClick={() => dispatch(setView(v.id))}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button className="btn primary" onClick={() => dispatch(openCreate({ dateKey: todayKey() }))}>
          + New post
        </button>
        <button className={`btn${perfPanel ? " active" : ""}`} onClick={() => dispatch(togglePerfPanel())}>
          ⚡ Performance
        </button>
      </div>
    </header>
  );
}

export default memo(Toolbar);
