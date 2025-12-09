import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { EventData, ParticipantResponse } from '@/types';

interface CalendarViewProps {
    event: EventData;
    responses: ParticipantResponse[];
    currentMonth: Date;
    onDateClick: (date: Date) => void;
    onDateLongPress: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ event, responses, currentMonth, onDateClick, onDateLongPress }) => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;
            const dateStr = format(day, 'yyyy-MM-dd');

            // Find votes for this day
            const dayVotes = responses.flatMap(r =>
                r.availabilities
                    .filter(a => a.date === dateStr)
                    .map(a => ({ ...a, userName: r.userName }))
            );
            const score = dayVotes.reduce((acc, curr) => {
                let val = 0;
                if (curr.status === 2) val = 4;
                else if (curr.status === 1) val = 3;
                else if (curr.status === 0) val = 2;
                if (curr.timeRange && curr.timeRange !== '終日OK') val -= 1;
                return acc + val;
            }, 0);

            // Is Impossible?
            const isImpossible = event.impossibleDates.includes(dateStr);
            const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
            const isScheduleLimit = event.scheduleLimit ? isBefore(endOfDay(new Date(event.scheduleLimit)), day) : false;

            // Highest status for color
            const hasHope = dayVotes.some(v => v.status === 2);
            const hasOk = dayVotes.some(v => v.status === 1);

            let bgClass = "bg-white";
            if (isImpossible) bgClass = "bg-red-50 text-red-300";
            else if (hasHope) bgClass = "bg-green-50";
            else if (hasOk) bgClass = "bg-yellow-50";

            days.push(
                <div
                    className={`relative h-24 border border-slate-100 p-1 flex flex-col justify-between transition-colors
                        ${!isSameMonth(day, monthStart) ? "text-slate-300 bg-slate-50/50" : "text-slate-700"}
                        ${isImpossible ? "bg-red-50 opacity-80" : ""}
                        ${isSameDay(day, new Date()) ? "ring-2 ring-sky-300 ring-inset" : ""}
                        hover:bg-sky-50 cursor-pointer
                    `}
                    key={day.toString()}
                    onClick={() => onDateClick(cloneDay)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        onDateLongPress(cloneDay);
                    }}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold ${format(day, 'E') === 'Sat' ? 'text-blue-400' : format(day, 'E') === 'Sun' ? 'text-red-400' : ''}`}>
                            {formattedDate}
                        </span>
                        {score > 0 && !isImpossible && (
                            <span className="text-xs font-bold bg-sky-100 text-sky-700 px-1.5 rounded-full">
                                {score}pt
                            </span>
                        )}
                    </div>

                    {/* Voters Preview */}
                    <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                        {dayVotes.slice(0, 3).map((v, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-[10px] leading-tight text-slate-600 truncate">
                                <span className={v.status === 2 ? 'text-green-500' : v.status === 1 ? 'text-yellow-500' : 'text-gray-400'}>
                                    {v.status === 2 ? '◎' : v.status === 1 ? '〇' : '△'}
                                </span>
                                <span className="truncate">{v.userName}</span>
                            </div>
                        ))}
                        {dayVotes.length > 3 && (
                            <div className="text-[10px] text-slate-400 text-center">
                                +{dayVotes.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-slate-400 bg-slate-50 py-2 rounded-t-lg">
                <div className="text-red-400">Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div className="text-blue-400">Sat</div>
            </div>
            {rows}
        </div>
    );
};
