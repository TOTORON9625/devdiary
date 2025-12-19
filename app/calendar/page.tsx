'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'ja': ja };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: ja }),
    getDay,
    locales,
});

interface Entry {
    id: number;
    title: string;
    content: string;
    created_at: string;
    category_name?: string;
    category_color?: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    resource: Entry;
}

const messages = {
    today: '今日',
    previous: '前へ',
    next: '次へ',
    month: '月',
    week: '週',
    day: '日',
    agenda: '予定',
    date: '日付',
    time: '時間',
    event: 'イベント',
    noEventsInRange: 'この期間にイベントはありません',
    showMore: (total: number) => `+${total} 件`,
};

export default function CalendarPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);

    useEffect(() => {
        async function fetchEntries() {
            try {
                const response = await fetch('/api/entries');
                const data = await response.json();
                setEntries(data);
            } catch (error) {
                console.error('Error fetching entries:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEntries();
    }, []);

    const events: CalendarEvent[] = entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        start: new Date(entry.created_at),
        end: new Date(entry.created_at),
        resource: entry,
    }));

    const handleSelectEvent = (event: CalendarEvent) => {
        router.push(`/entries/${event.id}`);
    };

    const handleSelectSlot = ({ start }: { start: Date }) => {
        // 選択した日付で新規日記作成ページへ遷移
        router.push('/entries/new');
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const color = event.resource.category_color || '#6366f1';
        return {
            style: {
                backgroundColor: color,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
            },
        };
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">カレンダー</h1>
                <div className="page-actions">
                    <Link href="/entries/new" className="btn btn-primary">
                        <PlusCircle size={18} />
                        新規作成
                    </Link>
                </div>
            </div>

            <div className="calendar-container">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 650 }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    view={view}
                    onView={(newView) => setView(newView)}
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    messages={messages}
                    eventPropGetter={eventStyleGetter}
                    popup
                    culture="ja"
                />
            </div>
        </div>
    );
}
