import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { movePost } from "../store/postsSlice";
import { openCreate, openEdit, showDay } from "../store/uiSlice";

/**
 * Returns handler functions with STABLE identities (useCallback) so that
 * React.memo'd cells do not re-render just because a new function was created.
 */
export function useCalendarActions() {
  const dispatch = useDispatch();

  const onCreate = useCallback(
    (dateKey, hour) => dispatch(openCreate({ dateKey, hour: hour ?? null })),
    [dispatch]
  );
  const onEdit = useCallback((id) => dispatch(openEdit(id)), [dispatch]);
  const onDrop = useCallback(
    (id, dateKey, hour) => dispatch(movePost({ id, dateKey, hour })),
    [dispatch]
  );
  const onShowDay = useCallback((dateKey) => dispatch(showDay(dateKey)), [dispatch]);

  return useMemo(
    () => ({ onCreate, onEdit, onDrop, onShowDay }),
    [onCreate, onEdit, onDrop, onShowDay]
  );
}
