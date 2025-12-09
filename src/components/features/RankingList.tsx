import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ParticipantResponse, EventData } from '@/types';

interface RankingListProps {
    responses: ParticipantResponse[];
    event: EventData;
    onDecide?: (date: string) => void;
    isOrganizer: boolean;
}

export const RankingList: React.FC<RankingListProps> = ({ responses, event, onDecide, isOrganizer }) => {
    // 1. Flatten all availabilities
    const scores: Record<string, {
        score: number,
        count: number,
        ok: number,
        hope: number,
        details: { name: string, status: number, time?: string, comment?: string }[]
    }> = {};

    responses.forEach(r => {
        r.availabilities.forEach(a => {
            if (event.impossibleDates.includes(a.date)) return; // Skip impossible dates

            if (!scores[a.date]) {
                scores[a.date] = { score: 0, count: 0, ok: 0, hope: 0, details: [] };
            }

            let val = 0;
            if (a.status === 2) val = 4;      // ◎ Hope
            else if (a.status === 1) val = 3; // 〇 OK
            else if (a.status === 0) val = 2; // △ Adjust

            // Time constraint penalty
            if (a.timeRange && a.timeRange !== '終日OK') {
                val -= 1;
            }

            scores[a.date].score += val;
            scores[a.date].count += 1;

            if (a.status === 2) scores[a.date].hope++;
            if (a.status === 1) scores[a.date].ok++;

            scores[a.date].details.push({
                name: r.userName,
                status: a.status,
                time: a.timeRange,
                comment: a.comment
            });
        });
    });

    // 2. Sort by Score
    const sortedDates = Object.keys(scores).sort((a, b) => {
        return scores[b].score - scores[a].score;
    }).slice(0, 5); // Top 5

    if (sortedDates.length === 0) {
        return <div className="text-gray-500 text-sm">投票はまだありません</div>;
    }

    const getStatusIcon = (s: number) => s === 2 ? '◎' : s === 1 ? '〇' : '△';

    return (
        <div className="space-y-3">
            {sortedDates.map((dateStr, index) => {
                const data = scores[dateStr];
                const rank = index + 1;
                const isTop = rank === 1;

                return (
                    <div key={dateStr} className={`p-3 rounded-lg border ${isTop ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${isTop ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {rank}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">
                                        {format(new Date(dateStr), 'M/d (EEE)', { locale: ja })}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {isOrganizer && <span className="mr-1 font-bold text-teal-600">{data.score}pt</span>}
                                        (◎{data.hope} / 〇{data.ok})
                                    </div>
                                </div>
                            </div>
                            {onDecide && (
                                <button
                                    onClick={() => onDecide(dateStr)}
                                    className="ml-2 bg-blue-500 hover:bg-blue-400 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                                >
                                    決定
                                </button>
                            )}
                        </div>

                        {/* Vote Details */}
                        <div className="mt-2 space-y-1 bg-white/50 p-2 rounded text-xs text-slate-600">
                            {data.details.map((d, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-2 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                                    <span className={`font-bold ${d.status === 2 ? 'text-green-600' : d.status === 1 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                        {getStatusIcon(d.status)}
                                    </span>
                                    <span className="font-medium">{d.name}</span>
                                    {d.time && d.time !== '終日OK' && <span className="bg-slate-100 px-1 rounded text-slate-500">{d.time}</span>}
                                    {d.comment && <span className="text-slate-400">"{d.comment}"</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
