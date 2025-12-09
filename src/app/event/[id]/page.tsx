'use client';

import { VoteModal } from '@/components/features/VoteModal';
import { RankingList } from '@/components/features/RankingList';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EventData, ParticipantResponse, DateAvailability } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarView } from '@/components/features/CalendarView';
import { EventEditModal } from '@/components/features/EventEditModal';

import { DateDetailsModal } from '@/components/features/DateDetailsModal';

export default function EventPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [event, setEvent] = useState<EventData | null>(null);
    const [responses, setResponses] = useState<ParticipantResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [detailsDate, setDetailsDate] = useState<Date | null>(null);
    const [isOrganizerMode, setIsOrganizerMode] = useState(false); // Toggle for organizer to block dates
    const [myDeviceId, setMyDeviceId] = useState('');

    const isOrganizer = !!(event && token === event.ownerToken);

    // Initialize Device ID
    useEffect(() => {
        let storedId = localStorage.getItem('timesync_device_id');
        if (!storedId) {
            storedId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('timesync_device_id', storedId);
        }
        setMyDeviceId(storedId);
    }, []);

    // Fetch Event & Responses
    useEffect(() => {
        if (!id) return;

        // Event Listener
        const unsubEvent = onSnapshot(doc(db, 'events', id as string), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setEvent({ id: docSnapshot.id, ...docSnapshot.data() } as EventData);
            } else {
                setError('イベントが見つかりませんでした。');
            }
            setLoading(false);
        }, (err) => {
            console.error("Event Fetch Error", err);
            setError('読み込みエラー');
            setLoading(false);
        });

        // Responses Listener
        const unsubResponses = onSnapshot(collection(db, 'events', id as string, 'responses'), (snapshot) => {
            const resList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ParticipantResponse));
            setResponses(resList);
        }, (err) => console.error("Responses Fetch Error", err));

        return () => {
            unsubEvent();
            unsubResponses();
        };
    }, [id]);

    // Handle Date Click
    const handleDateClick = async (date: Date) => {
        if (isOrganizer && isOrganizerMode) {
            // Toggle Impossible Date
            const dateStr = format(date, 'yyyy-MM-dd');
            if (!event) return;

            const newImpossible = event.impossibleDates.includes(dateStr)
                ? event.impossibleDates.filter(d => d !== dateStr)
                : [...event.impossibleDates, dateStr];

            await updateDoc(doc(db, 'events', event.id!), { impossibleDates: newImpossible });
            return;
        }

        // Open Vote Modal
        setSelectedDate(date);
    };

    // Save Vote
    const handleSaveVote = async (data: { status: 0 | 1 | 2, comment: string, timeRange: string, userName: string, startTime?: string, endTime?: string }) => {
        if (!event || !selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        // Find my existing response or create new
        let myRes = responses.find(r => r.deviceId === myDeviceId);

        // Create new availability object
        const newAvail: DateAvailability = {
            date: dateStr,
            status: data.status,
            comment: data.comment,
            timeRange: data.timeRange
        };
        if (data.startTime) newAvail.startTime = data.startTime;
        if (data.endTime) newAvail.endTime = data.endTime;

        try {
            if (myRes) {
                // Update existing
                // Filter out old vote for this date if exists
                const otherAvails = myRes.availabilities.filter(a => a.date !== dateStr);
                const updatedAvails = [...otherAvails, newAvail];

                await updateDoc(doc(db, 'events', event.id!, 'responses', myRes.id!), {
                    userName: data.userName, // Update name just in case
                    availabilities: updatedAvails
                });
            } else {
                // Create new
                await addDoc(collection(db, 'events', event.id!, 'responses'), {
                    userName: data.userName,
                    deviceId: myDeviceId,
                    availabilities: [newAvail],
                    createdAt: serverTimestamp()
                });
            }
            setSelectedDate(null);
        } catch (e) {
            console.error(e);
            alert('保存に失敗しました');
        }
    };

    // Finalize Event (Organizer Only)
    const handleFinalize = async (dateStr: string) => {
        if (!event) return;

        // Warnings Check
        const dateResponses = responses.flatMap(r => r.availabilities).filter(a => a.date === dateStr);
        const adjustCount = dateResponses.filter(a => a.status === 0).length;
        const totalVotes = responses.length;
        const target = event.targetCount || 0;

        let warningMsg = '';
        if (target > 0 && totalVotes < target) {
            warningMsg = warningMsg + '・目標人数(' + target + '人)に達していません(現在' + totalVotes + '人)\n';
        }
        if (adjustCount > 0) {
            warningMsg = warningMsg + '・「△調整」の人が' + adjustCount + '人います\n';
        }

        if (warningMsg) {
            if (!confirm('【注意】\n' + warningMsg + '\nそれでも決定しますか？')) return;
        }

        if (!confirm(dateStr + ' でイベントを決定しますか？')) return;

        try {
            await updateDoc(doc(db, 'events', event.id!), {
                status: 'finalized',
                finalizedDate: {
                    date: dateStr,
                    timeRange: '時間未定'
                }
            });
        } catch (e) {
            console.error(e);
            alert('決定に失敗しました');
        }
    };

    // Organizer Actions
    const handleUndoFinalize = async () => {
        if (!event || !confirm('決定を取り消して調整中に戻しますか？')) return;
        if (!event.id) return;
        await updateDoc(doc(db, 'events', event.id), {
            status: 'planning',
            finalizedDate: null
        });
    };

    const handleDeleteEvent = async () => {
        const confirmText = prompt('イベントを削除すると復元できません。\n削除する場合は「削除」と入力してください。');
        if (confirmText !== '削除') return;

        if (!event?.id) return;
        await updateDoc(doc(db, 'events', event.id), { title: '削除されたイベント', status: 'deleted' });
        alert('イベントを削除しました');
        window.location.href = '/';
    };

    const copyLink = (forOrganizer: boolean) => {
        const url = new URL(window.location.href);
        if (!forOrganizer) url.searchParams.delete('token');
        navigator.clipboard.writeText(url.toString());
        alert(forOrganizer ? '管理者用リンクをコピーしました' : '参加者用リンクをコピーしました！\nLINEなどで送ってあげてください。');
    };

    const copyInfo = () => {
        if (!event?.finalizedDate) return;
        const text = `
【${event.title}】
開催日時がきまりました！
📅 ${format(new Date(event.finalizedDate.date), 'M月d日 (E)', { locale: ja })}
🔗 ${window.location.href.split('?')[0]}

回答ありがとうございました！
`.trim();
        navigator.clipboard.writeText(text);
        alert('案内文をコピーしました！');
    };

    // Event Edit Handling
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const handleUpdateEvent = async (data: Partial<EventData>) => {
        if (!event?.id) return;
        try {
            await updateDoc(doc(db, 'events', event.id), data);
            setIsEditModalOpen(false);
            alert('イベント設定を更新しました');
        } catch (e) {
            console.error(e);
            alert('更新に失敗しました');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    const isVotingClosed = event?.votingDeadline ? new Date(event.votingDeadline) < new Date() : false;

    return (
        <div className="min-h-screen p-4 pb-20 max-w-5xl mx-auto">
            {/* Header */}
            <header className="mb-8 bg-white/50 backdrop-blur rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-slate-800">{event?.title}</h1>
                            {event?.status === 'deleted' && <span className="text-red-500 border border-red-500 text-xs px-2 py-0.5 rounded">削除済</span>}
                            {isVotingClosed && <span className="text-orange-500 border border-orange-500 text-xs px-2 py-0.5 rounded">投票締切</span>}
                        </div>
                        {event?.description && <p className="text-slate-500 mb-4 whitespace-pre-wrap">{event.description}</p>}

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span>👑 主催: {event?.organizerName}</span>
                            {event?.targetCount ? <span>👥 目標: {event.targetCount}人</span> : null}
                            <span>🗓 候補日上限: {event?.scheduleLimit || 'なし'}</span>
                            {event?.votingDeadline && <span>⏰ 投票期限: {event.votingDeadline}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        {isOrganizer ? (
                            <>
                                <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold text-center">
                                    管理者モード
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" onClick={() => copyLink(false)} className="text-xs py-1 px-3">
                                        招待URL
                                    </Button>
                                    <Button variant="secondary" onClick={() => copyLink(true)} className="text-xs py-1 px-3">
                                        管理URL
                                    </Button>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="text-xs py-1 px-3 w-full"
                                >
                                    ✏️ 設定変更 (期限・詳細など)
                                </Button>
                                <Button
                                    variant={isOrganizerMode ? 'danger' : 'secondary'}
                                    onClick={() => setIsOrganizerMode(!isOrganizerMode)}
                                    className="text-xs py-1 px-3 w-full"
                                >
                                    {isOrganizerMode ? 'NG設定終了' : '🚫 NG日程を設定'}
                                </Button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => copyLink(false)} className="text-xs py-1 px-3 w-full">
                                🔗 ページをシェア
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Finalized Banner */}
            {event?.status === 'finalized' && (
                <div className="mb-8 animate-in zoom-in duration-300">
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <div className="text-center py-6">
                            <h2 className="text-sm font-bold text-green-600 mb-2 tracking-widest uppercase">DECIDED</h2>
                            <div className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
                                {format(new Date(event.finalizedDate!.date), 'M月d日 (E)', { locale: ja })}
                            </div>
                            <p className="text-slate-500 mb-6">
                                予定が決定しました！参加者に知らせましょう。
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button onClick={copyInfo}>📋 案内文をコピー</Button>
                                {isOrganizer && (
                                    <Button variant="ghost" onClick={handleUndoFinalize} className="text-slate-400 font-normal">
                                        決定を取り消す
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Calendar Area */}
                <div className="md:col-span-8 space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-2xl font-bold text-slate-700">
                            {format(currentMonth, 'yyyy年 M月', { locale: ja })}
                        </h2>
                        <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="px-3 py-1 hover:bg-slate-50 text-slate-600 rounded">←</button>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-3 py-1 hover:bg-slate-50 text-slate-600 rounded">→</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <CalendarView
                            event={event!}
                            responses={responses}
                            currentMonth={currentMonth}
                            onDateClick={handleDateClick}
                            onDateLongPress={(d) => setDetailsDate(d)}
                        />
                    </div>

                    <div className="text-center py-2">
                        {isOrganizerMode ? (
                            <span className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-full">
                                🚫 NGにしたい日付をタップしてください
                            </span>
                        ) : (
                            isVotingClosed ? (
                                <span className="text-orange-500 font-bold bg-orange-50 px-4 py-2 rounded-full">
                                    ⏰ 投票期限が過ぎています
                                </span>
                            ) : (
                                <span className="text-slate-500 text-sm">
                                    日付をタップして予定を入力・編集できます
                                </span>
                            )
                        )}
                    </div>
                </div>

                {/* Sidebar (Ranking) */}
                <div className="md:col-span-4 space-y-4">
                    <Card>
                        <h3 className="font-bold text-slate-700 mb-3 flex items-center">
                            <span className="text-xl mr-2">🏆</span> 人気ランキング
                        </h3>
                        <RankingList
                            responses={responses}
                            event={event!}
                            onDecide={isOrganizer ? handleFinalize : undefined}
                        />
                    </Card>
                </div>
            </div>

            {/* Vote Modal */}
            {selectedDate && (
                <VoteModal
                    key={selectedDate.toISOString()}
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onSave={handleSaveVote}
                    existingVote={responses.find(r => r.deviceId === myDeviceId)?.availabilities.find(a => a.date === format(selectedDate, 'yyyy-MM-dd'))}
                    isOrganizer={isOrganizer}
                    scheduleLimit={event?.scheduleLimit}
                    votingDeadline={event?.votingDeadline}
                    initialName={responses.find(r => r.deviceId === myDeviceId)?.userName || ''}
                />
            )}

            {/* Date Details Modal */}
            {detailsDate && (
                <DateDetailsModal
                    date={detailsDate}
                    isOpen={!!detailsDate}
                    onClose={() => setDetailsDate(null)}
                    responses={responses}
                />
            )}

            {/* Edit Modal */}
            {event && (
                <EventEditModal
                    event={event}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                />
            )}
        </div>
    );
}
