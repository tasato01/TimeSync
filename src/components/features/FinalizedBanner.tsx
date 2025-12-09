import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EventData } from '@/types';

interface FinalizedBannerProps {
    event: EventData;
    isOrganizer: boolean;
    onCopyInfo: () => void;
    onUndo?: () => void;
}

export const FinalizedBanner: React.FC<FinalizedBannerProps> = ({ event, isOrganizer, onCopyInfo, onUndo }) => {
    if (event.status !== 'finalized' || !event.finalizedDate) return null;

    return (
        <div className="mb-8 animate-fade-in-up">
            <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200 shadow-teal-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="p-6 relative z-10">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                            🎉 開催日程が決定しました！
                        </h2>
                    </div>

                    <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-teal-100 max-w-2xl mx-auto space-y-4 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-teal-50 pb-4">
                            <div>
                                <div className="text-xs text-teal-600 font-bold mb-1">開催日時</div>
                                <div className="text-2xl font-bold text-slate-800">
                                    {format(new Date(event.finalizedDate.date), 'M月d日 (E)', { locale: ja })}
                                    <span className="ml-3 text-xl text-slate-600">
                                        {event.finalizedDate.timeRange}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {(event.finalizedMeetingPlace || event.finalizedPlace) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {event.finalizedMeetingPlace && (
                                    <div>
                                        <div className="text-xs text-teal-600 font-bold mb-1">集合場所</div>
                                        <div className="font-medium text-slate-700">{event.finalizedMeetingPlace}</div>
                                    </div>
                                )}
                                {event.finalizedPlace && (
                                    <div>
                                        <div className="text-xs text-teal-600 font-bold mb-1">会場</div>
                                        <div className="font-medium text-slate-700">
                                            {event.finalizedPlace}
                                            {event.finalizedUrl && (
                                                <a href={event.finalizedUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-500 hover:underline">
                                                    (マップ/URL)
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {event.finalizedNotes && (
                            <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100/50">
                                <div className="text-xs text-teal-600 font-bold mb-1">案内・メモ</div>
                                <div className="text-sm text-slate-600 whitespace-pre-wrap">{event.finalizedNotes}</div>
                            </div>
                        )}

                        <div className="flex justify-center gap-4 pt-2">
                            <Button onClick={onCopyInfo} className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 border-0">
                                📋 案内文をコピー
                            </Button>
                            {isOrganizer && onUndo && (
                                <Button variant="ghost" onClick={onUndo} className="text-slate-400 font-normal hover:text-slate-600 hover:bg-slate-100">
                                    決定を取り消す
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
