"use client";

import HaikuCard from "../../_components/haiku_card";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Post() {
  const router = useRouter();
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [text3, setText3] = useState("");

  // 投稿送信
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const postText = [text1, text2, text3];
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postText }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        console.error("POST /api/posts error:", j);
        return;
      }

      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        padding: "2rem 1rem",
        gap: "2rem",
        backgroundColor: "#ffffff",
      }}
    >
      {/* 俳句カード */}
      <HaikuCard
        isGold={false}// 時間によって変更
        haiku={[
          text1 || "泣かぬなら",
          text2 || "泣かせて見せよう",
          text3 || "とほほぎす",
        ]}
      />

      {/* 入力フォーム */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <label
          htmlFor="haiku-input"
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            color: "#333333",
            marginBottom: "0.5rem",
          }}
        >
          句を入力
        </label>

        <textarea
          id="haiku-input"
          value={`${text1}\n${text2}\n${text3}`}
          onChange={(e) => {
            const lines = e.target.value.split("\n");
            setText1(lines[0] || "");
            setText2(lines[1] || "");
            setText3(lines[2] || "");
          }}
          
          placeholder={`泣かぬなら\n泣かせて見せよう\nとほほぎす`}
          rows={3}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#f5f5f5",
            border: "1px solid #808080",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            fontFamily: "inherit",
            resize: "none",
            lineHeight: "1.5",
            background: "#D9D9D90"
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!text1.trim() || !text2.trim() || !text3.trim()}
          style={{
            width: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            margin: "auto",
            borderRadius: "0.5rem",
            backgroundColor: "#e5e5e5",
            border: "none",
            color: "#000000",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.2s",
            opacity: !text1.trim() || !text2.trim() || !text3.trim() ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d5d5d5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#e5e5e5";
          }}
        >
            <img src="/pencil.png" alt="pencil icon" style={{width:"20px", height: "20px"}} />詠む
        </button>
      </div>
    </div>
  );
}
