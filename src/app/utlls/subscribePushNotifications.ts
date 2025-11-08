
export async function subscribePushNotifications() {
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