'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizerName, setOrganizerName] = useState(''); // Changed from organizer
  const [targetCount, setTargetCount] = useState(''); // New: Target number of participants
  const [scheduleLimit, setScheduleLimit] = useState(''); // New: Max Schedule Date

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => { // Renamed from createEvent
    e.preventDefault();
    if (!title || !organizerName) { // Updated condition
      alert('イベント名と主催者名は必須です'); // New alert
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a simple random token for the owner
      const ownerToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2); // Updated token generation

      const docRef = await addDoc(collection(db, 'events'), {
        title,
        description,
        organizerName, // Updated to use new state variable
        targetCount: targetCount ? parseInt(targetCount) : 0, // Save count
        scheduleLimit: scheduleLimit || null, // Save limit
        ownerToken,
        impossibleDates: [],
        status: 'planning',
        createdAt: serverTimestamp(),
      });

      // Redirect to the event page with the admin token
      router.push(`/event/${docRef.id}?token=${ownerToken}`);
    } catch (error: any) {
      console.error('Error adding document: ', error);
      // Alert is often blocked or unnoticed, showing in UI instead
      let msg = 'イベントの作成に失敗しました。';
      if (error.code === 'permission-denied') msg += ' (権限エラー: Firestoreルールを確認してください)';
      if (error.code === 'unavailable') msg += ' (ネットワークエラー: オフラインか接続不良です)';
      if (error.message && error.message.includes('API key')) msg += ' (設定エラー: APIキーが見つかりません。.env.localを確認してください)';

      alert(msg + "\n" + (error.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[100px]" />

      <div className="max-w-4xl w-full text-center mb-12 z-10">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200 mb-6 drop-shadow-sm">
          TimeSync
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          みんなの予定を、もっとスマートに。<br />
          面倒な日程調整を、美しくシンプルな体験に変えましょう。
        </p>
      </div>

      <Card className="w-full max-w-md z-10 relative backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">新しいイベントを作成</h2>
            <p className="text-sm text-gray-400 mt-2">必要な情報を入力してスタート</p>
          </div>

          <Input
            label="イベント名"
            placeholder="例：週末の飲み会、プロジェクトMTG"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="詳細（オプション）"
            placeholder="場所や候補日のメモなど"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="主催者名"
            placeholder="あなたの名前"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="目標参加人数 (任意)"
              type="number"
              placeholder="例: 5"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
            />
            <Input
              label="日程の候補期限 (任意)"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={scheduleLimit}
              onChange={(e) => setScheduleLimit(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={!title || !organizerName}
            >
              イベント作成画面へ
            </Button>
          </div>
        </form>
      </Card>

      <footer className="absolute bottom-4 text-center text-gray-500 text-sm">
        Premium Scheduling Experience
      </footer>
    </div>
  );
}
