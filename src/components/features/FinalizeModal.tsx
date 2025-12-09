import React, { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface FinalizeModalProps {
    date: string; // YYYY-MM-DD
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (details: {
        timeRange: string;
        meetingPlace: string;
        place: string;
        url: string;
        notes: string;
    }) => void;
}

export const FinalizeModal: React.FC<FinalizeModalProps> = ({ date, isOpen, onClose, onConfirm }) => {
    const formattedDate = date ? format(new Date(date), 'yyyy年M月d日 (EEE)', { locale: ja }) : '';

    const [timeRange, setTimeRange] = useState('');
    const [meetingPlace, setMeetingPlace] = useState('');
    const [place, setPlace] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onConfirm({
            timeRange,
            meetingPlace,
            place,
            url,
            notes
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl">
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                            日程を決定しますか？
                        </h2>
                        <p className="text-slate-500 mt-2 font-bold text-lg">
                            {formattedDate}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            以下の詳細情報を入力して、参加者に完了報告を送れます。
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="開始時間・時間帯 (必須)"
                            placeholder="例: 19:00〜21:00"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            required
                        />
                        <Input
                            label="集合場所 (任意)"
                            placeholder="例: 改札前"
                            value={meetingPlace}
                            onChange={(e) => setMeetingPlace(e.target.value)}
                        />
                        <Input
                            label="会場・店名 (任意)"
                            placeholder="例: 〇〇居酒屋"
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                        />
                        <Input
                            label="会場URL (任意)"
                            placeholder="https://..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                その他・案内 (任意)
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400 bg-slate-50/50 min-h-[100px]"
                                placeholder="持ち物や注意事項など..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={onClose}
                        >
                            キャンセル
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/30"
                            onClick={handleSubmit}
                            disabled={!timeRange}
                        >
                            決定する
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
