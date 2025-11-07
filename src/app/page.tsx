"use client";

import { useEffect, useState } from "react";

// 通知登録を行う関数
async function subscribePushNotifications() {
  // サービスワーカーの登録
  await navigator.serviceWorker.register("/sw.js");

  // プッシュ通知の許可をリクエスト
  const permission = await Notification.requestPermission();

  // 許可が得られた場合の処理
  if (permission === "granted") {
    const registration = await navigator.serviceWorker.ready;

    // プッシュマネージャーにサブスクライブ
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    });

    // サーバーにサブスクリプション情報を送信
    await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });
  } else {
    // 拒否された場合
    throw new Error("プッシュ通知の許可が拒否されました。");
  }
}

export default function Home() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // プッシュ通知のサポート状況を確認
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);

      // 既にサブスクライブされているか確認
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.pushManager.getSubscription().then(subscription => {
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
    {/* サポートしている場合 */}
    {isSupported === true ? (
      // サブスクライブされていない場合のみボタンを表示
      !isSubscribed ? (
        <button onClick={subscribePushNotifications}>
          通知を登録する
        </button>
      ) : (
        <p>プッシュ通知に登録済みです。</p>
      )
    ) : null}
    
    {/* サポートしていない場合 */}
    {isSupported === false ? (
      <p>このブラウザはプッシュ通知に対応していません。</p>
    ) : null}

    {/* ロード中 */}
    {isSupported === null ? (
      <p>Loading...</p>
    ) : null}
    </>
  );
}