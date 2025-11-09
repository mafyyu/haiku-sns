import "@/app/_components/haiku_card"
import HaikuCard from "@/app/_components/haiku_card";
import Image from "next/image";
import LikeIcon from "../../../public/icons/like.svg";

import "@/app/_components/post_card.css"

interface PostCardProps {
    icon_id: number;
    name: string;
    haiku: Array<string>;
    like: number;
    isGold?: boolean;
}

export default function PostCard(
    { icon_id, name, haiku, like=0, isGold }: PostCardProps
) {
    return (
        <>
        <div className="post-card">
            <div className="user-info">
                <Image src={`/user_icons/${icon_id}.png`} alt={name} width={48} height={48} />
                <div>{name}</div>
            </div>
            <HaikuCard haiku={haiku} isGold={isGold} />
            <div className="like-counter">
                <LikeIcon width={30} height={28} className="like-icon" />
                <span>{like}</span>
            </div>
        </div>
        </>
    );
}