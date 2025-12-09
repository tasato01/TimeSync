import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EventData } from '@/types';

interface EventEditModalProps {
    event: EventData;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<EventData>) => void;
    onDelete: () => void;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({ event, isOpen, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        title: event.title,
        description: event.description,
        organizerName: event.organizerName,
        targetCount: event.targetCount || 0,
        scheduleLimit: event.scheduleLimit || '',
        votingDeadline: event.votingDeadline || ''
    });

    useEffect(() => {
        if (isOpen && event) {
            setFormData({
                title: event.title,
                description: event.description || '',
                organizerName: event.organizerName,
                targetCount: event.targetCount || 0,
                scheduleLimit: event.scheduleLimit || '',
                votingDeadline: event.votingDeadline || ''
            });
        }
    }, [isOpen, event]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            targetCount: Number(formData.targetCount)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-slate-100 mb-4 bg-sky-50/50">
                    <h2 className="text-xl font-bold text-slate-800">イベント設定の変更</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-1 flex-1">
                    <Input
                        label="イベント名"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="詳細・メモ"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <Input
                        label="主催者名"
                        name="organizerName"
                        value={formData.organizerName}
                        onChange={handleChange}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-slate-600">目標参加人数</label>
                            <input
                                type="number"
                                name="targetCount"
                                value={formData.targetCount}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-800"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-slate-600">候補日の上限</label>
                            <input
                                type="date"
                                name="scheduleLimit"
                                value={formData.scheduleLimit}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-slate-600">投票期限 (ここまでで投票締め切り)</label>
                        <input
                            type="date"
                            name="votingDeadline"
                            value={formData.votingDeadline}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-800"
                        />
                        <p className="text-xs text-slate-400">※この日付を過ぎると参加者は投票できなくなります</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="secondary" className="flex-1" onClick={onClose}>キャンセル</Button>
                        <Button className="flex-1" onClick={handleSubmit}>保存する</Button>
                    </div>

                    {onDelete && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-red-500 mb-2">危険な操作</h3>
                            <p className="text-xs text-slate-500 mb-3">
                                一度削除すると、元に戻すことはできません。全ての投票データが失われます。
                            </p>
                            <button
                                onClick={() => {
                                    if (confirm('本当にこのイベントを削除しますか？')) {
                                        onDelete();
                                    }
                                }}
                                className="w-full py-3 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 font-bold text-sm transition-colors"
                            >
                                このイベントを削除する
                            </button>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
};
