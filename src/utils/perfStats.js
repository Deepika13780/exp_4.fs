// Tiny instrumentation used to PROVE the effect of memoization.
// Components call trackRender("Name") in their body; the Performance panel
// and the tests read the counters.

const counts = {};
const commits = { count: 0, totalMs: 0, lastMs: 0 };

export const trackRender = (name) => {
  counts[name] = (counts[name] || 0) + 1;
};

export const getRenderCounts = () => ({ ...counts });

export const resetStats = () => {
  Object.keys(counts).forEach((k) => delete counts[k]);
  commits.count = 0;
  commits.totalMs = 0;
  commits.lastMs = 0;
};

/** Passed to <Profiler onRender>. */
export const recordCommit = (_id, _phase, actualDuration) => {
  commits.count += 1;
  commits.totalMs += actualDuration;
  commits.lastMs = actualDuration;
};

export const getCommitStats = () => ({ ...commits });
