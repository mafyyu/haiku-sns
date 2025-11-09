"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import PostCard from "./_components/post_card";
import { useRouter } from "next/navigation";

type Post = {
  id: number;
  user_id: string;
  content: string[];
  like: number | null;
  created_at: string;
  is_new: boolean
};

export default function Home() {
    const { isSignedIn, user } = useUser();
    const router = useRouter();

  // 投稿関連のstate
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<{ cursor_created_at: string; cursor_id: number } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [likedPost, setLiked] = useState<number[]>([]);
  

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

    setPosts((prev) =>
      Array.from(new Map([...prev, ...newPosts].map(p => [p.id, p])).values())
    );

    setCursor(nextCursor ?? null);
    setHasMore(Boolean(more));
  }

  // いいね
  async function handleLike(id: number) {
    if(!isSignedIn || null){
      router.push("/sign-in")
    }else{
      if (likingId !== null) return;
      setLikingId(id)
      setLoading(true)
      setLiked((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
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
  }

  // 初回ロード
  useEffect(() => {
    setPosts([]) // ページロード時にリセット
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


  return (
    <>
      <div >
        {posts.map((p) => (
          <div key={p.id}>
            <PostCard
              icon_id={1}
              name={String(user?.firstName)}
              haiku={p.content}
              like={Number(p.like)}
              isGold={p.is_new}
              handleLike={() => handleLike(p.id)}
              style={likedPost.includes(p.id) ? { fill: "#FF3D3D" } : {}}
            />
          </div>
        ))}
      </div>
      <div ref={bottomBoundaryRef} style={{ minHeight: "200px" }}></div>
      <div>{isSignedIn ? "" : "ここから先はアカウント登録が必要です"}</div>
      <div>{loading ? "読み込み中" : "読み込み完了！"}</div>
    </>
  );
}