/** Returns an object of field -> error message. Empty object = valid. */
export function validatePost({ title, date, time, durationMin }) {
  const errors = {};
  if (!title || !title.trim()) errors.title = "Title is required";
  else if (title.length > 120) errors.title = "Title must be 120 characters or fewer";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) errors.date = "A valid date is required";
  if (!/^\d{2}:\d{2}$/.test(time || "")) errors.time = "A valid time is required";

  const d = Number(durationMin);
  if (!Number.isInteger(d) || d < 15 || d > 480)
    errors.durationMin = "Duration must be between 15 and 480 minutes";

  return errors;
}
