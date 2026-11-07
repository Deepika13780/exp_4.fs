import { nanoid } from "@reduxjs/toolkit";
import { makeStart } from "./dateUtils";

const TOPICS = [
  "Product teaser", "Behind the scenes", "Customer story", "Weekly tip", "Poll",
  "Team spotlight", "Blog announcement", "Flash sale", "Event reminder", "Q&A",
];
const PLATFORM_IDS = ["instagram", "twitter", "linkedin", "facebook"];
const STATUS_IDS = ["draft", "scheduled", "scheduled", "published"];

/** Small deterministic pseudo-random generator (same seed -> same output). */
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A handful of readable demo posts in the month of `baseKey`. */
export function makeSamplePosts(baseKey) {
  const ym = baseKey.slice(0, 8); // "2026-11-"
  const rows = [
    [3, 9, 0, "Product teaser", "instagram", "published", 60],
    [5, 14, 30, "Customer story", "linkedin", "scheduled", 45],
    [8, 11, 0, "Weekly tip", "twitter", "scheduled", 30],
    [8, 17, 0, "Behind the scenes", "instagram", "draft", 60],
    [12, 10, 0, "Blog announcement", "linkedin", "scheduled", 30],
    [15, 9, 30, "Poll", "twitter", "scheduled", 30],
    [15, 13, 0, "Team spotlight", "facebook", "draft", 60],
    [18, 16, 0, "Flash sale", "instagram", "scheduled", 90],
    [22, 12, 0, "Event reminder", "facebook", "scheduled", 30],
    [26, 8, 30, "Q&A session", "linkedin", "draft", 60],
  ];
  return rows.map(([day, h, m, title, platform, status, durationMin], i) => ({
    id: `sample-${i + 1}`,
    title,
    content: `Draft copy for "${title}".`,
    platform,
    status,
    start: makeStart(`${ym}${String(day).padStart(2, "0")}`, h, m),
    durationMin,
  }));
}

/** Many posts for the performance stress test. */
export function generatePosts(count, baseKey, seed = 42) {
  const ym = baseKey.slice(0, 8);
  const rand = lcg(seed);
  return Array.from({ length: count }, (_, i) => {
    const day = 1 + Math.floor(rand() * 28);
    const hour = 6 + Math.floor(rand() * 15);
    const minute = rand() < 0.5 ? 0 : 30;
    const topic = TOPICS[Math.floor(rand() * TOPICS.length)];
    return {
      id: nanoid(),
      title: `${topic} #${i + 1}`,
      content: "",
      platform: PLATFORM_IDS[Math.floor(rand() * PLATFORM_IDS.length)],
      status: STATUS_IDS[Math.floor(rand() * STATUS_IDS.length)],
      start: makeStart(`${ym}${String(day).padStart(2, "0")}`, hour, minute),
      durationMin: rand() < 0.5 ? 30 : 60,
    };
  });
}
