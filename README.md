# Post Scheduler Calendar (React + Redux Toolkit)

Combined implementation of:

- **Experiment 3 – Interactive calendar interface** (month / week / day views, posts mapped to date & time, click to view/edit, drag-and-drop scheduling, state synced with Redux)
- **Experiment 4 – Performance optimisation & testing** (`React.memo`, `useMemo`, `useCallback`, memoized Redux selectors, render counters, React Profiler, unit + interaction tests)

The calendar is a **custom** implementation (no FullCalendar), so every mapping from data to time slots is visible in the code.

## Run in VS Code

```bash
npm install
npm run dev        # http://localhost:5174
npm test           # run all tests once
npm run test:watch # re-run on save
npm run test:coverage
```
Node.js 18+ required.

## Using the app
| Action | How |
|---|---|
| Switch view | Month / Week / Day buttons |
| Navigate | Today, ‹ and › |
| Create a post | Click an empty day (month) or an hour slot (week/day), or "+ New post" |
| View / edit / delete | Click a post chip |
| Reschedule | Drag a chip onto another day, or onto another hour slot in week/day view |
| Filter | "All platforms" dropdown |
| Open a busy day | Click the day number or "+N more" |
| Performance monitor | "⚡ Performance" button |

Posts are saved in `localStorage` automatically.

## Project structure
```
src/
  store/
    postsSlice.js      add / update / delete / movePost reducers
    uiSlice.js         view, cursor date, filter, modal, memo flag
    selectors.js       memoized selectors (group posts by day / hour slot)
    index.js           createAppStore() factory (also used by tests)
  utils/
    dateUtils.js       month grid, week days, add months, formatting
    useCalendarActions.js  handlers with stable identities (useCallback)
    perfStats.js       render counters + Profiler stats
    validation.js, sampleData.js, constants.js, storage.js
  components/
    CalendarView.jsx   picks month vs time grid  (React.memo)
    MonthView.jsx      42-day grid, useMemo for the grid
    DayCell.jsx        one day, subscribes only to its own posts (React.memo)
    TimeGrid.jsx / TimeSlot.jsx   week & day views (React.memo)
    PostChip.jsx       draggable post (React.memo)
    PostModal.jsx      create / edit form with validation
    Toolbar.jsx, PerfPanel.jsx
  tests/               Vitest + React Testing Library
```

## How data maps to the calendar (Experiment 3)
A post is `{ id, title, content, platform, status, start: "YYYY-MM-DDTHH:mm", durationMin }`.
Selectors group posts into `{ "2026-11-10": [...] }` (month) and `{ "2026-11-10T09": [...] }` (week/day).
Each cell looks up its own key, so mapping is O(1) per cell after one O(n) grouping pass.
Dropping a chip dispatches `movePost({ id, dateKey, hour? })`; the reducer rewrites `start` and keeps the minutes.

## Optimisation techniques (Experiment 4)
| Technique | Where | Effect |
|---|---|---|
| `React.memo` | CalendarView, DayCell, TimeSlot, PostChip, Toolbar, PostModal, PerfPanel | Skip re-render when props are unchanged |
| `useCallback` | `useCalendarActions` | Handlers keep the same identity, so memo'd children are not invalidated |
| `useMemo` | MonthView grid, TimeGrid days | 42-day grid / week array only recomputed when the month / view changes |
| Memoized selectors (`createSelector`) | `selectPostsByDay`, `selectPostsBySlot` | Grouping runs only when posts or the filter change |
| Per-cell subscription + `shallowEqual` | DayCell, TimeSlot | A cell re-renders only if its own posts changed |
| Immer structural sharing | Redux reducers | Unchanged posts keep the same object reference, so their chips are skipped |
| Primitive props | cells (`dateKey`, `isToday`, ...) | Makes `React.memo` comparisons effective |

### See it yourself
1. Click **⚡ Performance**, then **+ 300 posts**.
2. Click **Reset counters**, open a post and close it. With memoization **ON**, `DayCell` stays at 0 renders.
3. Untick **Memoization enabled**, reset counters, repeat: `DayCell` jumps to 42 per action and the Profiler commit time goes up.
4. Drag a post to another day (memo ON): only 2 `DayCell`s render.

Profiler timings are only collected in the dev server (`npm run dev`), not in production builds.

## Tests
- `dateUtils.test.js`, `validation.test.js` – pure logic (month grid, leap years, clamping, titles, validation)
- `postsSlice.test.js` – reducers, `movePost` keeps minutes, structural sharing, generators, ui navigation
- `selectors.test.js` – grouping, filtering, memoization (same reference, no recomputation)
- `Calendar.test.jsx` – render, navigate, click-to-edit, click-to-create, delete, filter, **drag & drop** (month and week), "+N more", week/day views
- `PostModal.test.jsx` – validation errors, update, cancel / Escape
- `performance.test.jsx` – asserts exact render counts with memoization ON vs OFF

The tests use **Vitest**, which has the same API as Jest (`describe`, `it`, `expect`, `vi`) and works with Vite out of the box, together with **React Testing Library** as required by the lab. To use plain Jest instead, replace `vi` with `jest` and add a Babel config.
