import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";
import webpush from "web-push";

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(request: Request) {
    const { title, message } = await request.json();

    try {
        // 全ての購読者に通知を送信
        const { data: subscribers, error } = await supabase
            .from('notification_subscribers')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        if (subscribers) {
            // 通知ペイロードの作成
            const notificationPayload = JSON.stringify(
                {
                    title : title,
                    body  : message,
                }
            );

            // 全ての購読者に通知を送信
            const sendNotifications = subscribers.map((sub: any) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                return webpush.sendNotification(pushSubscription, notificationPayload)
                    .catch(err => {
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            // 購読が無効になっている場合、データベースから削除
                            return supabase
                                .from('notification_subscribers')
                                .delete()
                                .eq('endpoint', sub.endpoint);
                        }
                    });
            });

            await Promise.all(sendNotifications);

            // 通知時間をdbに追加
            const { error } = await supabase
                .from("cron_log")
                .insert({})
            if(error) throw new Error(error.message)
        }

    } catch (error) {

    }

    return NextResponse.json(
        {
            status: 200,
        }
    )
}