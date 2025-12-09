import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ParticipantResponse } from '@/types';

interface DateDetailsModalProps {
    date: Date;
    isOpen: boolean;
    onClose: () => void;
    responses: ParticipantResponse[];
}

export const DateDetailsModal: React.FC<DateDetailsModalProps> = ({ date, isOpen, onClose, responses }) => {
    if (!isOpen) return null;

    const dateStr = format(date, 'yyyy-MM-dd');
    const votes = responses.flatMap(r =>
        r.availabilities
            .filter(a => a.date === dateStr)
            .map(a => ({
                name: r.userName,
                status: a.status,
                comment: a.comment,
                timeRange: a.timeRange
            }))
    );

    const getStatusIcon = (s: number) => s === 2 ? '◎' : s === 1 ? '〇' : '△';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl">
                <div className="text-center mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">
                        {format(date, 'M月d日 (E)', { locale: ja })} の詳細
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 p-1">
                    {votes.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">まだ投票がありません</p>
                    ) : (
                        votes.map((vote, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold text-lg ${vote.status === 2 ? 'text-green-600' : vote.status === 1 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                            {getStatusIcon(vote.status)}
                                        </span>
                                        <span className="font-bold text-slate-700">{vote.name}</span>
                                    </div>
                                </div>
                                {(vote.timeRange && vote.timeRange !== '終日OK') && (
                                    <div className="text-xs text-sky-600 bg-sky-50 inline-block px-2 py-0.5 rounded mb-1">
                                        🕒 {vote.timeRange}
                                    </div>
                                )}
                                {vote.comment && (
                                    <p className="text-xs text-slate-500 bg-white p-2 rounded border border-slate-100 mt-1">
                                        {vote.comment}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                    <Button onClick={onClose} className="w-full" variant="secondary">
                        閉じる
                    </Button>
                </div>
            </Card>
        </div>
    );
};
