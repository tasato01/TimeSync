export type EventStatus = 'planning' | 'finalized' | 'deleted';

export interface TimeRange {
    start: string; // "19:00"
    end: string;   // "21:00"
}

export interface DateAvailability {
    date: string; // "2024-01-01" YYYY-MM-DD
    status: 0 | 1 | 2; // 0: Adjust(△), 1: OK(〇), 2: Hope(◎/Happy)
    timeRange: string; // Optional text like "19:00~"
    comment: string;
    startTime?: string;
    endTime?: string;
}

export interface ParticipantResponse {
    id?: string; // Firestore Doc ID
    userName: string;
    availabilities: DateAvailability[];
    comment?: string; // Global comment for the response
    deviceId?: string; // To allow simple re-editing
    createdAt: any; // Timestamp
}

export interface EventData {
    id?: string; // Firestore Doc ID
    title: string;
    description: string;
    organizerName: string;
    ownerToken: string; // Secret token to manage the event
    impossibleDates: string[]; // List of YYYY-MM-DD
    status: EventStatus;
    finalizedDate?: {
        date: string;
        timeRange?: string;
    } | null;
    targetCount?: number;
    scheduleLimit?: string;
    votingDeadline?: string;
    createdAt: any; // Timestamp
}
