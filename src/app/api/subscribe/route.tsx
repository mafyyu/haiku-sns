import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";

export async function POST(request: Request) {
    try {
        const subscription = await request.json();

        // 購読情報が存在するか確認
        if (subscription) {
            // supabaseに保存
            const { data, error } = await supabase
                .from('notification_subscribers')
                .upsert(
                    {
                        endpoint: subscription.endpoint,
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    }
                )
            
            // エラーが発生したら例外スロー
            if (error) {
                throw new Error(error.message);
            }
        } else {
            return NextResponse.json(
                {
                    status: 400,
                    error: "Bad Request: Missing subscription data"
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Error : ", error);
        return NextResponse.json(
            {
                status: 500,
                error: "Internal Server Error"
            }
        )
    }
}