"use client";

import { subscribePushNotifications } from "@/app/utlls/subscribePushNotifications";
import { useState } from "react";

export default function page() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const sendNotification = async () => {
        await fetch("/api/sendNotification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, message }),
        });
    }

    return (
        <>
        <button onClick={subscribePushNotifications}>
          通知を登録する
        </button>
        <input type="text" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        <br />
        <input type="text" placeholder="メッセージ" value={message} onChange={(e) => setMessage(e.target.value)} />
        <br />
        <button onClick={sendNotification}>
            通知を送信する
        </button>
        </>
    )
}