import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost, deletePost, updatePost } from "../store/postsSlice";
import { selectPostById } from "../store/selectors";
import { closeModal } from "../store/uiSlice";
import { PLATFORMS, STATUSES } from "../utils/constants";
import { pad, splitStart } from "../utils/dateUtils";
import { trackRender } from "../utils/perfStats";
import { validatePost } from "../utils/validation";

function PostForm({ mode, post, defaults }) {
  const dispatch = useDispatch();
  const initial =
    mode === "edit"
      ? {
          title: post.title,
          content: post.content ?? "",
          platform: post.platform,
          status: post.status,
          date: splitStart(post.start).dateKey,
          time: splitStart(post.start).time,
          durationMin: String(post.durationMin),
        }
      : {
          title: "",
          content: "",
          platform: "instagram",
          status: "scheduled",
          date: defaults.dateKey,
          time: defaults.hour != null ? `${pad(defaults.hour)}:00` : "09:00",
          durationMin: "60",
        };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const close = () => dispatch(closeModal());

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const submit = (e) => {
    e.preventDefault();
    const errs = validatePost(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const data = {
      title: form.title.trim(),
      content: form.content,
      platform: form.platform,
      status: form.status,
      start: `${form.date}T${form.time}`,
      durationMin: Number(form.durationMin),
    };
    dispatch(mode === "edit" ? updatePost({ id: post.id, ...data }) : addPost(data));
    close();
  };

  const remove = () => {
    dispatch(deletePost(post.id));
    close();
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <form className="modal" role="dialog" aria-modal="true" aria-label={mode === "edit" ? "Edit post" : "New post"} onSubmit={submit} noValidate>
        <h3>{mode === "edit" ? "Edit post" : "New post"}</h3>

        <label htmlFor="f-title">Title</label>
        <input id="f-title" value={form.title} onChange={set("title")} autoFocus />
        {errors.title && <p className="err" role="alert">{errors.title}</p>}

        <label htmlFor="f-content">Content</label>
        <textarea id="f-content" rows={3} value={form.content} onChange={set("content")} />

        <div className="two">
          <div>
            <label htmlFor="f-platform">Platform</label>
            <select id="f-platform" value={form.platform} onChange={set("platform")}>
              {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-status">Status</label>
            <select id="f-status" value={form.status} onChange={set("status")}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="three">
          <div>
            <label htmlFor="f-date">Date</label>
            <input id="f-date" type="date" value={form.date} onChange={set("date")} />
            {errors.date && <p className="err" role="alert">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="f-time">Time</label>
            <input id="f-time" type="time" value={form.time} onChange={set("time")} />
            {errors.time && <p className="err" role="alert">{errors.time}</p>}
          </div>
          <div>
            <label htmlFor="f-dur">Duration (minutes)</label>
            <input id="f-dur" type="number" step="15" value={form.durationMin} onChange={set("durationMin")} />
            {errors.durationMin && <p className="err" role="alert">{errors.durationMin}</p>}
          </div>
        </div>

        <div className="actions">
          {mode === "edit" && (
            <button type="button" className="btn danger" onClick={remove}>Delete</button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button type="submit" className="btn primary">Save</button>
        </div>
      </form>
    </div>
  );
}

function PostModal() {
  trackRender("PostModal");
  const modal = useSelector((s) => s.ui.modal);
  const post = useSelector((s) => (modal?.mode === "edit" ? selectPostById(s, modal.postId) : null));

  if (!modal) return null;
  if (modal.mode === "edit" && !post) return null;

  return (
    <PostForm
      key={modal.mode === "edit" ? post.id : `new-${modal.dateKey}-${modal.hour}`}
      mode={modal.mode}
      post={post}
      defaults={modal}
    />
  );
}

export default memo(PostModal);
