import { supabase } from "@/libs/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";

// clerk導入後にuser_idをuser.idに変更してsupabaseのuser_idをuuidに変更


export async function POST(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }){
    try{
        const userId = "test_user"
        const { id } = await context.params;
        const postId = Number(id)

        // const user = await currentUser();
        // if(!user){
        //     return NextResponse.json({ error: "Unauthorized"}, { status: 401 })
        // }

        const { data: existingLike, error: likeFetchError } = await supabase
            .from("like")
            .select("*")
            .eq("post_id", postId)
            .eq("user_id", userId)
        if(likeFetchError) throw new Error(likeFetchError.message)

        // 既存のいいね数を取得
    const { data: postData, error: fetchError } = await supabase
        .from("posts")
        .select("like")
        .eq("id", Number(postId))
        .single();
    if(fetchError) throw new Error(fetchError.message)
    
    const currentLike: number = postData.like ?? 0;
        
        // 既にいいねをしていたら取り消し処理
        if(existingLike && existingLike.length > 0){
            const { error: deleteError } = await supabase
                .from('like')
                .delete()
                .eq("user_id", userId)
                .eq("post_id", postId)
            if(deleteError) throw new Error(deleteError.message);

            // いいね数を減らす
            const { error: updateError } = await supabase
                .from("posts")
                .update({like: currentLike - 1})
                .eq("id", postId)
                .select()
            if(updateError) throw new Error(updateError.message);
            return NextResponse.json(
                { message: "success delete", newLikeCount: currentLike - 1 },
                { status: 200 }
            )
        }

        // 新規like追加
        const { error: insertError } = await supabase
            .from("like")
            .insert([{
                post_id: postId,
                user_id: userId
            }])
        if(insertError) throw new Error(insertError.message)


        // いいね数を1増やす
        const { error: updateError } = await supabase
            .from("posts")
            .update({like: currentLike + 1})
            .eq("id", postId)
            .select()
        if(updateError) throw new Error(updateError.message);

        return NextResponse.json(
            { message: "Liked", newLikeCount: currentLike + 1 },
            { status:200 }
        );

    }catch(error){
        console.error(error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}