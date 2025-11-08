"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type Post = {
  id: number;
  user_id: string;
  content: string;
  like: number | null;
  created_at: string;
};

export default function Home() {
  const { isSignedIn } = useUser();

  // プッシュ通知関連のstate
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // フォーム関連のstate
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 投稿関連のstate
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<{ cursor_created_at: string; cursor_id: number } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [likingId, setLikingId] = useState<number | null>(null);

  // 無限スクロール関連のstate
  const [needFetchMore, setNeedFetchMore] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const bottomBoundaryRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 無限スクロールの監視設定
  const scrollObserver = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (!node) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setNeedFetchMore(true);
      }
    });

    observerRef.current.observe(node);
  }, []);

  // 投稿取得
  async function fetchPost() {
    if (!hasMore) return;
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

    setPosts((prev) => [...prev, ...newPosts]);
    setCursor(nextCursor ?? null);
    setHasMore(Boolean(more));
  }

  // 投稿送信
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
      const created: Post[] = await res.json();
      setPosts((prev) => [...created, ...prev]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  // いいね
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
      const data = await res.json();

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, like: data.newLikeCount ?? 0 } : p))
      );
    } finally {
      setLikingId(null);
    }
  }

  // 初回ロード
  useEffect(() => {
    fetchPost();
    setLoading(false);
  }, []);

  // 無限スクロール監視の開始
  useEffect(() => {
    if (posts.length === 0) return;
    if (bottomBoundaryRef.current) {
      scrollObserver(bottomBoundaryRef.current);
    }
  }, [scrollObserver, posts]);

  // 追加投稿の取得
  useEffect(() => {
    if (needFetchMore && hasMore && isSignedIn) {
      fetchPost().then(() => {
        setNeedFetchMore(false);
        if (bottomBoundaryRef.current) {
          scrollObserver(bottomBoundaryRef.current);
        }
      });
    }
  }, [needFetchMore, hasMore, isSignedIn, scrollObserver]);

  // プッシュ通知のサポート状況を確認
  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);

      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.pushManager.getSubscription().then((subscription) => {
            setIsSubscribed(!!subscription);
          });
        }
      });
    } else {
      setIsSupported(false);
      setIsSubscribed(false);
    }
  }, []);

  return (
    <>
      <h1>投稿テスト</h1>
      <div>サインインしてるか{isSignedIn}</div>

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

      <div ref={bottomBoundaryRef} style={{ minHeight: "200px" }}></div>
      <div>{isSignedIn ? "" : "ここから先はアカウント登録が必要です"}</div>
      <div>{loading ? "読み込み中" : "読み込み完了！"}</div>
    </>
  );
}