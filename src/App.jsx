import { Profiler } from "react";
import { useSelector } from "react-redux";
import { CalendarView, CalendarViewMemo } from "./components/CalendarView";
import PerfPanel from "./components/PerfPanel";
import PostModal from "./components/PostModal";
import Toolbar from "./components/Toolbar";
import { recordCommit, trackRender } from "./utils/perfStats";

export default function App() {
  trackRender("App");
  // Deliberately subscribes to the whole `ui` slice (a common "lifted state" pattern):
  // App re-renders on every UI change, e.g. when the modal opens.
  // React.memo on CalendarView is what keeps the heavy calendar from re-rendering.
  const ui = useSelector((s) => s.ui);
  const View = ui.memoEnabled ? CalendarViewMemo : CalendarView;

  return (
    <div className="app">
      <Toolbar />
      <div className="layout">
        <main className="calendar">
          <Profiler id="calendar" onRender={recordCommit}>
            <View view={ui.view} cursor={ui.cursor} memoEnabled={ui.memoEnabled} />
          </Profiler>
        </main>
        {ui.perfPanel && <PerfPanel />}
      </div>
      <PostModal />
    </div>
  );
}
