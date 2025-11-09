import "./haiku_card.css";

interface Props {
    haiku: Array<string>;
    isGold?: boolean;
}

function styleHaikuLine(line: string, index: number): string {
    // 文番号に応じて空白を追加
    const lineBreaks = "　".repeat(index);

    return lineBreaks + line;
}

export default function HaikuCard({ haiku, isGold }: Props) {
    return (
        <div className="haiku-card" data-gold={isGold}>
            {haiku.map((line, index) => (
                <p className="haiku-sentence" key={index}>{
                    styleHaikuLine(line, index)
                }</p>
            ))}
        </div>
    )
}