import { useState } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { awsCategories, topicMap } from "../data/services";

export default function Sidebar({ selectedId, onSelect }) {
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState(() => {
    const init = {};
    awsCategories.forEach((c) => (init[c.id] = true));
    return init;
  });

  const toggle = (id) => setOpenCats((p) => ({ ...p, [id]: !p[id] }));

  const filtered = search.trim().toLowerCase();
  const matchingTopicIds = filtered
    ? Object.values(topicMap)
        .filter(
          (t) =>
            t.title.toLowerCase().includes(filtered) ||
            t.shortDesc.toLowerCase().includes(filtered) ||
            t.categoryLabel.toLowerCase().includes(filtered)
        )
        .map((t) => t.id)
    : null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">☁️</span>
          <div>
            <div className="logo-title">AWS Learn</div>
            <div className="logo-sub">Interactive Study Guide</div>
          </div>
        </div>

        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {matchingTopicIds && matchingTopicIds.length === 0 && (
          <div className="sidebar-empty">
            No services match “{search}”.
          </div>
        )}
        {awsCategories.map((cat) => {
          const visibleTopics = matchingTopicIds
            ? cat.topics.filter((t) => matchingTopicIds.includes(t.id))
            : cat.topics;

          if (matchingTopicIds && visibleTopics.length === 0) return null;

          const isOpen = openCats[cat.id] || !!matchingTopicIds;

          return (
            <div key={cat.id} className="cat-group">
              <button
                className="cat-header"
                onClick={() => toggle(cat.id)}
                style={{ "--cat-color": cat.color }}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
                <span className="cat-count">{cat.topics.length}</span>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isOpen && (
                <ul className="topic-list">
                  {visibleTopics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        className={`topic-item ${selectedId === topic.id ? "active" : ""}`}
                        onClick={() => onSelect(topic.id)}
                        style={
                          selectedId === topic.id
                            ? { "--active-color": cat.color }
                            : {}
                        }
                      >
                        <span className="topic-title">{topic.title}</span>
                        <span className="topic-desc">{topic.shortDesc}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {awsCategories.reduce((a, c) => a + c.topics.length, 0)} topics across{" "}
        {awsCategories.length} categories
      </div>
    </aside>
  );
}
