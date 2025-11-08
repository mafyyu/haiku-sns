"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type Post = {
  id: number;
  user_id: string;
  content: string;
  like: number | null;
  created_at: string;
};

export default function SendPage() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 投稿
  const [posts, setPosts] = useState<Post[]>([]);
  // カーソルの管理
  const [cursor, setCursor] = useState<{ cursor_created_at: string; cursor_id: number } | null>(null);
  // まだ投稿があるかどうか
  const [hasMore, setHasMore] = useState(true);
  const [likingId, setLikingId] = useState<number | null>(null);

  const [needFetchMore, setNeedFetchMore] = useState(false)
  const [loading, setLoading] = useState<boolean>(true);

  let bottomBoundaryRef = useRef(null)

  // 初回ロード
  useEffect(() => {
    fetchPost();
    setLoading(false);
  }, []);

const observerRef = useRef<IntersectionObserver | null>(null);

const scrollObserver = useCallback(
  (node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect(); // 既存の監視を解除
    }
    if (!node)return;

    observerRef.current = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setNeedFetchMore(true);
      }
    });

    observerRef.current.observe(node);
  },[]);

  useEffect(() => {
    if (posts.length===0) return;
    // ref に値が与えられたら監視開始
    if (bottomBoundaryRef.current) {
      scrollObserver(bottomBoundaryRef.current);
    }
  }, [scrollObserver, bottomBoundaryRef, posts]);

  
  useEffect(() => {
    if (needFetchMore && hasMore) {
      fetchPost().then(() => {
        setNeedFetchMore(false);
        if (bottomBoundaryRef.current) {
          scrollObserver(bottomBoundaryRef.current);
        }
      });
    }
  }, [needFetchMore, hasMore]);
  

  async function fetchPost() {
    console.log("fetchPost")
    if(!hasMore) return ;
    const params = new URLSearchParams();
    params.set("limit", "10");
    if (cursor) {
      params.set("cursor_created_at", cursor.cursor_created_at);
      params.set("cursor_id", String(cursor.cursor_id));
    }

    const res = await fetch(`/api/posts?${params}`);
    if (!res.ok) {
      console.error("GET /api/posts failed:", res.status);
      return;
    }
    const { posts: newPosts, nextCursor, hasMore: more } = await res.json();

    setPosts((prev)=>([ ...prev,...newPosts]))
    setCursor(nextCursor ?? null);
    setHasMore(Boolean(more));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        console.error("POST /api/posts error:", j);
        return;
      }
      // 新規投稿を先頭に足す（APIは配列で返す想定）
      const created: Post[] = await res.json();
      setPosts((prev) => [...created, ...prev]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(id: number) {
    if (likingId !== null) return;
    setLikingId(id);
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        console.error("POST /api/posts/[id]/like error:", j);
        return;
      }
      const data = await res.json()
      console.log("likepostres",data.newLikeCount)

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, like: (data.newLikeCount ?? 0)} : p))
      );
    } finally {
      setLikingId(null);
    }
  }

  return (
    <>
      <h1>投稿テスト</h1>

      {/* 送信フォーム */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="いまどうしてる？"
          rows={3}
        />
        <div>
          <button type="submit" disabled={submitting || !text.trim()}>
            {submitting ? "送信中..." : "送信"}
          </button>
        </div>
      </form>

      {/* 投稿一覧 */}
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <div>{p.id}</div>
            <div>{p.content}</div>
            <div>{p.like}</div>
            <div>{p.created_at}</div>
            <div>
              <button onClick={() => handleLike(p.id)} disabled={likingId === p.id}>
                いいね ({p.like ?? 0})
              </button>
            </div>
            <hr />
          </li>
        ))}
      </ul>
      <div ref={bottomBoundaryRef} style={{minHeight: "200px"}}></div>
      <div>{loading ? "読み込み中": "読み込み完了！"}</div>
    </>
  );
}
