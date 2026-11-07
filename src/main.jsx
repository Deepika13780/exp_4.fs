import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { createAppStore } from "./store";
import { todayKey } from "./utils/dateUtils";
import { makeSamplePosts } from "./utils/sampleData";
import { loadPosts, savePosts } from "./utils/storage";
import "./styles.css";

const store = createAppStore({ posts: loadPosts() ?? makeSamplePosts(todayKey()) });

// Persist posts whenever they change (only when the posts array reference changes)
let lastItems = store.getState().posts.items;
store.subscribe(() => {
  const items = store.getState().posts.items;
  if (items !== lastItems) {
    lastItems = items;
    savePosts(items);
  }
});

// NOTE: <React.StrictMode> is intentionally not used so that the render counters in the
// Performance panel are not doubled by StrictMode's development double-rendering.
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
