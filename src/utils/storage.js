const KEY = "scheduler_posts_v1";

export function loadPosts() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePosts(posts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(posts));
  } catch {
    /* storage full or unavailable: ignore */
  }
}
