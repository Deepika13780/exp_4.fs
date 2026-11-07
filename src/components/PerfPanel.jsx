import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMany, clearPosts, resetPosts } from "../store/postsSlice";
import { toggleMemo } from "../store/uiSlice";
import { generatePosts, makeSamplePosts } from "../utils/sampleData";
import { getCommitStats, getRenderCounts, resetStats } from "../utils/perfStats";

/**
 * Live view of render counts + React Profiler commit times.
 * It polls the counters with its own timer, so it never re-renders the calendar.
 */
function PerfPanel() {
  const dispatch = useDispatch();
  const memoEnabled = useSelector((s) => s.ui.memoEnabled);
  const cursor = useSelector((s) => s.ui.cursor);
  const total = useSelector((s) => s.posts.items.length);
  const [snap, setSnap] = useState({ counts: {}, commits: getCommitStats() });

  useEffect(() => {
    const id = setInterval(
      () => setSnap({ counts: getRenderCounts(), commits: getCommitStats() }),
      500
    );
    return () => clearInterval(id);
  }, []);

  const names = Object.keys(snap.counts).sort();
  const { count, totalMs, lastMs } = snap.commits;

  return (
    <aside className="perf" aria-label="Performance panel">
      <h3>⚡ Performance monitor</h3>

      <label className="check">
        <input type="checkbox" checked={memoEnabled} onChange={() => dispatch(toggleMemo())} />
        Memoization enabled (React.memo)
      </label>

      <div className="perf-actions">
        <button className="btn small" onClick={() => dispatch(addMany(generatePosts(300, cursor)))}>
          + 300 posts
        </button>
        <button className="btn small" onClick={() => dispatch(resetPosts(makeSamplePosts(cursor)))}>
          Reset demo
        </button>
        <button className="btn small" onClick={() => dispatch(clearPosts())}>Clear all</button>
        <button className="btn small" onClick={resetStats}>Reset counters</button>
      </div>

      <p className="muted">Posts in store: <b>{total}</b></p>

      <table>
        <thead><tr><th>Component</th><th>Renders</th></tr></thead>
        <tbody>
          {names.length === 0 && <tr><td colSpan={2} className="muted">No renders recorded</td></tr>}
          {names.map((n) => (
            <tr key={n}><td>{n}</td><td>{snap.counts[n]}</td></tr>
          ))}
        </tbody>
      </table>

      <p className="muted">
        Profiler commits: <b>{count}</b><br />
        Last commit: <b>{lastMs.toFixed(1)} ms</b> · Total: <b>{totalMs.toFixed(1)} ms</b>
      </p>

      <p className="hint">
        Try: reset counters, open a post, then close it. With memoization ON the 42 DayCells do not
        re-render; switch it OFF and repeat.
      </p>
    </aside>
  );
}

export default memo(PerfPanel);
