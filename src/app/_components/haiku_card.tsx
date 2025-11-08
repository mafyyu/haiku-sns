import "./haiku_card.css";

interface Props {
    haiku: Array<string>;
}

function styleHaikuLine(line: string, index: number): string {
    // 文番号に応じて改行を追加
    const lineBreaks = "\n".repeat(index);

    return lineBreaks + line.split('').join('\n');
}

export default function HaikuCard({ haiku }: Props) {
    return (
        <div className="haiku-card">
            {haiku.map((line, index) => (
                <p className="haiku-sentence" key={index}>{
                    styleHaikuLine(line, index)
                }</p>
            ))}
        </div>
    )
}