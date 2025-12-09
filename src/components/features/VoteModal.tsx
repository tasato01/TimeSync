import React, { useState } from 'react';
import { format, isBefore, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateAvailability } from '@/types';

interface VoteModalProps {
    date: Date;
    onClose: () => void;
    onSave: (data: { status: 0 | 1 | 2; comment: string; timeRange: string; userName: string; startTime?: string; endTime?: string }) => void;
    isOrganizer: boolean;
    initialName: string;
    existingVote?: DateAvailability;
    scheduleLimit?: string;
    votingDeadline?: string;
}

export const VoteModal: React.FC<VoteModalProps> = ({ date, onClose, onSave, isOrganizer, initialName, existingVote, scheduleLimit }) => {
    const [status, setStatus] = useState<0 | 1 | 2>(existingVote?.status ?? 1);
    const [comment, setComment] = useState(existingVote?.comment || '');
    const [startTime, setStartTime] = useState(existingVote?.startTime || '');
    const [endTime, setEndTime] = useState(existingVote?.endTime || '');
    const [userName, setUserName] = useState(initialName);

    // Date Constraints Check
    const today = startOfDay(new Date());
    const isPast = isBefore(startOfDay(date), today);
    const isOverLimit = scheduleLimit ? isBefore(endOfDay(new Date(scheduleLimit)), date) : false;
    const isBlocked = (isPast || isOverLimit) && !isOrganizer;

    const handleSave = () => {
        if (!userName.trim()) {
            alert('名前を入力してください');
            return;
        }

        let finalTime = '終日OK';
        if (startTime || endTime) {
            finalTime = `${startTime || ''}〜${endTime || ''}`;
        }

        onSave({
            status,
            comment,
            timeRange: finalTime,
            userName,
            startTime,
            endTime
        });
    };

    if (isBlocked) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-slate-800">
                <Card className="w-full max-w-sm">
                    <h3 className="text-lg font-bold text-center mb-4 text-slate-800">
                        {isPast ? '過去の日付です' : '期限外の日程です'}
                    </h3>
                    <p className="text-center text-gray-500 mb-6">
                        {isPast ? '過去の日程には投票できません。' : '候補日の範囲外のため投票できません。'}
                    </p>
                    <Button onClick={onClose} className="w-full" variant="secondary">閉じる</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                        {format(date, 'M月d日 (E)', { locale: ja })}
                    </h3>
                    <p className="text-slate-500 text-sm">あなたの予定を教えてください</p>
                </div>

                <div className="space-y-6">
                    {/* Name Input */}
                    <Input
                        label="お名前"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="入力してください"
                        required
                    />

                    {/* Status Selection */}
                    <div className="flex justify-between gap-2">
                        {[
                            { val: 2, label: '◎ 参加', color: 'bg-green-100 text-green-700 border-green-200 ring-green-500' },
                            { val: 1, label: '〇 OK', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 ring-yellow-500' },
                            { val: 0, label: '△ 調整', color: 'bg-gray-100 text-gray-700 border-gray-200 ring-gray-400' }
                        ].map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => setStatus(opt.val as any)}
                                className={`flex-1 py-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center ${status === opt.val
                                    ? `${opt.color} ring-2 ring-offset-2`
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                <span className="text-lg font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Time Selection */}
                    {status !== 0 && (
                        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <label className="text-sm font-medium text-slate-600 ml-1">時間指定 (ある場合-1点)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="time"
                                    className="flex-1 p-2 border rounded-lg text-center text-slate-700 bg-white"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                                <span className="text-slate-400">～</span>
                                <input
                                    type="time"
                                    className="flex-1 p-2 border rounded-lg text-center text-slate-700 bg-white"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-slate-400 text-center">※指定なしの場合は「終日OK」となります</p>
                        </div>
                    )}

                    {/* Comment */}
                    <Input
                        label="コメント（任意）"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="特記事項があれば"
                    />

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose} className="flex-1">
                            キャンセル
                        </Button>
                        <Button onClick={handleSave} className="flex-1">
                            保存する
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
