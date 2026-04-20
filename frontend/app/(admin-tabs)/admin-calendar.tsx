import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import AdminTabBar from './AdminTabBar'; // Ensure this path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

type ViewType = 'daily' | 'weekly' | 'monthly';

type CalEvent = {
  id: string;
  date: string;     // 'YYYY-MM-DD'
  time: string;     // display '3:00 pm'
  timeHour: number; // 24h for sorting
  title: string;
  club?: string;
  description?: string;
  tags?: string[];
  color?: string;
};

const MOCK_EVENTS: CalEvent[] = [
  { id: 'e1', date: '2026-04-12', time: '3:00 pm', timeHour: 15, title: 'SWE Picnic Social', club: 'SWE', description: 'Food and games at the Plaza.', tags: ['Social'], color: COLORS.mutedSapphire },
  { id: 'e2', date: '2026-04-12', time: '3:00 pm', timeHour: 15, title: 'GatorAI Study', club: 'GatorAI', description: 'Neural network review.', tags: ['AI'], color: COLORS.softCobalt },
  { id: 'e3', date: '2026-04-13', time: '4:00 pm', timeHour: 16, title: 'AI Club Party', club: 'AI Club', description: 'End of semester celebration!', tags: ['Social'], color: COLORS.dustyTangerine },
  { id: 'e4', date: '2026-04-13', time: '4:30 pm', timeHour: 16, title: 'Quick Sync', club: 'Dev Team', description: 'Brief status update.', tags: ['Work'], color: COLORS.warmMelon },
  { id: 'e5', date: '2026-04-13', time: '1:00 pm', timeHour: 13, title: 'Team Standup', club: 'Dev Team', description: 'Weekly sync.', tags: ['Work'], color: COLORS.mutedSapphire },
  { id: 'e6', date: '2026-04-14', time: '9:00 am', timeHour: 9, title: 'Advising', club: 'UF', description: 'Course planning.', tags: ['Academic'], color: COLORS.softCobalt },
];

const TODAY = new Date();

// --- Helpers ---

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isPastEvent(dateStr: string, hour: number): boolean {
  const now = new Date();
  const eventDateParts = dateStr.split('-').map(Number);
  const eventDate = new Date(eventDateParts[0], eventDateParts[1] - 1, eventDateParts[2]);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (eventDate < today) return true;
  if (eventDate > today) return false;
  return hour < now.getHours();
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatMonthDay(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function weekStart(d: Date): Date {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  return s;
}

function hasConflict(events: CalEvent[]): boolean {
  const times = events.map(e => e.time);
  return times.length !== new Set(times).size;
}

function getTimeCounts(events: CalEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  events.forEach(e => { counts[e.time] = (counts[e.time] || 0) + 1; });
  return counts;
}

function convertDate(raw: string) {
  const parts = raw.split('/'); // MM/DD/YY
  return `20${parts[2]}-${parts[0]}-${parts[1]}`;
}

function parseHour(time: string) {
  const [h] = time.split(':');
  return parseInt(h);
}

// --- Main Screen ---

export default function CalendarScreen() {
  const [view, setView] = useState<ViewType>('daily');

  const [events, setEvents] =
    useState<CalEvent[]>([]);

  const [selectedEvent, setSelectedEvent] =
    useState<CalEvent | null>(null);

  useEffect(() => {
    const loadCalendar = async () => {
      const stored =
        await AsyncStorage.getItem(
          'adminEvents'
        );

      const custom = stored
        ? JSON.parse(stored)
        : [];

      const converted = custom.map(
        (event: any) => ({
          id: event.id,
          date: convertDate(event.date),
          time: event.time,
          timeHour: parseHour(event.time),
          title: event.title,
          club: event.club,
          description: event.description,
          tags: event.interests,
          color: COLORS.warmMelon,
        })
      );

      setEvents([
        ...MOCK_EVENTS,
        ...converted,
      ]);
    };

    loadCalendar();
  }, []);

  const getEventsForDate = (date: Date) => {
    return events.filter(e => e.date === toDateKey(date)).sort((a, b) => a.timeHour - b.timeHour);
  };

  const handleUnadd = (id: string) => {
    Alert.alert("Remove Event", "Delete this from your calendar?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Remove", 
        style: "destructive", 
        onPress: () => {
          setEvents(prev => prev.filter(e => e.id !== id));
          setSelectedEvent(null);
        } 
      }
    ]);
  };

  const todayLabel = `${MONTH_NAMES[TODAY.getMonth()]} ${TODAY.getDate()}, ${TODAY.getFullYear()}`;
  const monthLabel = `${MONTH_NAMES[TODAY.getMonth()]} ${TODAY.getFullYear()}`;
  const ws = weekStart(TODAY);
  const wEnd = new Date(ws);
  wEnd.setDate(ws.getDate() + 6);
  const weekLabel = `${formatMonthDay(ws)} – ${formatMonthDay(wEnd)}, ${wEnd.getFullYear()}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      <View style={styles.contentCard}>
        <View style={styles.dateDisplay}>
          <Text style={styles.viewTitle}>
            {view === 'daily'   && 'Daily View'}
            {view === 'weekly'  && 'Weekly View'}
            {view === 'monthly' && 'Monthly View'}
          </Text>
          <Text style={styles.dateSubtitle}>
            {view === 'daily'   && todayLabel}
            {view === 'weekly'  && weekLabel}
            {view === 'monthly' && monthLabel}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={view === 'monthly' ? styles.scrollCentered : undefined}
          showsVerticalScrollIndicator={false}
        >
          {view === 'daily'   && <DailyView date={TODAY} eventsFunc={getEventsForDate} onSelect={setSelectedEvent} />}
          {view === 'weekly'  && <WeeklyView date={TODAY} eventsFunc={getEventsForDate} onSelect={setSelectedEvent} />}
          {view === 'monthly' && <MonthlyView date={TODAY} eventsFunc={getEventsForDate} />}
        </ScrollView>

        <View style={styles.tabSwitcher}>
          {(['daily', 'weekly', 'monthly'] as ViewType[]).map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setView(v)}
              style={[styles.switchBtn, view === v && styles.switchBtnActive]}
            >
              <Text style={[styles.switchText, view === v && styles.switchTextActive]}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <EventDetailModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        onUnadd={handleUnadd} 
      />
      
      {/* RENDER THE TAB BAR LAST FOR PROPER Z-INDEX */}
      <AdminTabBar />
    </View>
  );
}

// --- Sub-Views ---

const DailyView = ({ date, eventsFunc, onSelect }: any) => {
  const events = eventsFunc(date);
  const conflict = hasConflict(events);
  const timeCounts = getTimeCounts(events);

  return (
    <View style={styles.viewPadding}>
      {events.length === 0 ? (
        <View style={styles.emptyBox}><Text style={styles.emptyText}>No events today</Text></View>
      ) : (
        events.map((item: any) => {
          const isPast = isPastEvent(item.date, item.timeHour);
          return (
            <TouchableOpacity key={item.id} style={styles.eventRow} onPress={() => onSelect(item)}>
              <Text style={styles.timeLabel}>{item.time}</Text>
              <View style={[
                styles.eventBox, 
                timeCounts[item.time] > 1 && styles.conflictBorder,
                isPast && styles.pastEventBox
              ]}>
                <Text style={[styles.eventText, isPast && styles.crossedOutText]}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
      {conflict && <Text style={styles.conflictTextRed}>* scheduling conflict *</Text>}
    </View>
  );
};

const WeeklyView = ({ date, eventsFunc, onSelect }: any) => {
  const start = weekStart(date);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <View style={styles.viewPadding}>
      {days.map((d) => {
        const events   = eventsFunc(d);
        const conflict = hasConflict(events);
        const isToday  = toDateKey(d) === toDateKey(date);
        const timeCounts = getTimeCounts(events);

        return (
          <View key={toDateKey(d)} style={styles.weekRow}>
            <View style={styles.weekLabelBox}>
              <Text style={[styles.weekDayText, isToday && styles.todayAccent]}>{DAY_SHORT[d.getDay()]}</Text>
              <Text style={[styles.weekDateText, isToday && styles.todayAccent]}>{formatMonthDay(d)}</Text>
            </View>
            <View style={styles.weekEventBox}>
              {events.length === 0 ? (
                <View style={styles.eventBoxSmall}><Text style={styles.eventTextSmall}>No Events</Text></View>
              ) : (
                <>
                  {events.map((ev: any) => {
                    const isPast = isPastEvent(ev.date, ev.timeHour);
                    return (
                      <TouchableOpacity
                        key={ev.id}
                        onPress={() => onSelect(ev)}
                        style={[
                          styles.eventBoxSmall, 
                          styles.eventBoxSmallSpaced, 
                          timeCounts[ev.time] > 1 && styles.conflictBorderSmall,
                          isPast && styles.pastEventBox
                        ]}
                      >
                        <Text style={[styles.eventTextSmall, isPast && styles.crossedOutText]}>
                          {ev.time}  {ev.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {conflict && <Text style={styles.conflictTextSmall}>* scheduling conflict *</Text>}
                </>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const MonthlyView = ({ date, eventsFunc }: any) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOffset }, (_, i) => i);

  const eventMap: Record<number, { count: number; conflict: boolean }> = {};
  days.forEach(d => {
    const evs = eventsFunc(new Date(year, month, d));
    if (evs.length > 0) {
      eventMap[d] = { count: evs.length, conflict: hasConflict(evs) };
    }
  });

  const anyConflict = Object.values(eventMap).some(v => v.conflict);
  const realToday = new Date();
  const todayDate = realToday.getMonth() === month && realToday.getFullYear() === year ? realToday.getDate() : -1;

  const allCells: any[] = [
    ...blanks.map((b) => ({ type: 'blank', key: `blank-${b}` })),
    ...days.map((d) => ({ type: 'day', d })),
  ];
  while (allCells.length % 7 !== 0) allCells.push({ type: 'blank', key: `pad-${allCells.length}` });
  const rows: any[][] = [];
  for (let i = 0; i < allCells.length; i += 7) rows.push(allCells.slice(i, i + 7));

  return (
    <View style={styles.monthlyBlueBox}>
      {/* FIXED: Changed <div> to <View> */}
      <View style={styles.gridHeader}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <Text key={`hdr-${i}`} style={styles.gridHeaderText}>{d}</Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={`row-${ri}`} style={styles.gridRow}>
          {row.map((cell) => {
            if (cell.type === 'blank') return <View key={cell.key} style={styles.gridItem} />;
            const info = eventMap[cell.d];
            const isToday = cell.d === todayDate;
            return (
              <View key={`day-${cell.d}`} style={styles.gridItem}>
                <View style={[styles.dayCircle, isToday && styles.dayCircleToday]}>
                  <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{cell.d}</Text>
                </View>
                {info && (
                  <View style={[styles.dayBadge, info.conflict && { backgroundColor: '#FF6B6B' }]}>
                    <Text style={styles.badgeText}>{info.count}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
      {anyConflict && <Text style={styles.monthlyConflictText}>* scheduling conflict *</Text>}
    </View>
  );
};

// --- Detail Modal ---

const EventDetailModal = ({ event, onClose, onUnadd }: { event: CalEvent | null, onClose: () => void, onUnadd: (id: string) => void }) => {
  if (!event) return null;
  return (
    <Modal visible={!!event} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.cardBack, { backgroundColor: event.color || COLORS.mutedSapphire }]}>
          <TouchableOpacity style={styles.cardBackInner} onPress={onClose} activeOpacity={0.95}>
            <Text style={styles.cardBackTitle}>{event.title}</Text>
            <Text style={styles.cardClub}>{event.club || 'General Event'}</Text>
            <View style={styles.cardDivider} />
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.cardDescription}>{event.description || "No description provided."}</Text>
              <View style={styles.tagsRow}>
                {(event.tags || []).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}># {tag}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.unaddButton} onPress={() => onUnadd(event.id)}>
              <Text style={styles.unaddText}>Remove from Calendar</Text>
            </TouchableOpacity>
            <Text style={styles.tapHint}>← Tap anywhere to close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.skyIris },
  header:         { paddingTop: 60, paddingBottom: 10, alignItems: 'center' },
  headerTitle:    { fontSize: 40, fontFamily: FONTS.heading, color: COLORS.dustyTangerine },
  contentCard:    { flex: 1, backgroundColor: COLORS.apricotBlush, marginHorizontal: 20, marginBottom: 100, marginTop: 20, borderRadius: 40, overflow: 'hidden' },
  scrollArea:     { flex: 1 }, 
  scrollCentered: { flexGrow: 1, justifyContent: 'center' },
  dateDisplay:  { backgroundColor: COLORS.ghostBlue, marginHorizontal: 30, marginTop: 20, borderRadius: 25, paddingVertical: 8, alignItems: 'center' },
  viewTitle:    { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.mutedSapphire },
  dateSubtitle: { fontSize: 12, fontFamily: FONTS.body,    color: COLORS.softCobalt },
  tabSwitcher:      { flexDirection: 'row', backgroundColor: COLORS.ghostBlue, marginHorizontal: 25, borderRadius: 25, padding: 4, marginBottom: 20 },
  switchBtn:        { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  switchBtnActive:  { backgroundColor: COLORS.mutedSapphire },
  switchText:       { fontSize: 12, fontFamily: FONTS.body, color: COLORS.mutedSapphire },
  switchTextActive: { fontFamily: FONTS.body, color: COLORS.ghostBlue },
  viewPadding: { padding: 20 },
  emptyBox:  { backgroundColor: COLORS.mutedSapphire, padding: 14, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 13 },
  eventRow:         { marginBottom: 12 },
  timeLabel:       { fontSize: 11, fontFamily: FONTS.body, color: COLORS.mutedSapphire, marginBottom: 2 },
  eventBox:        { backgroundColor: COLORS.mutedSapphire, padding: 12, borderRadius: 20 },
  eventText:       { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 12 },
  conflictBorder:  { borderWidth: 2, borderColor: '#FF6B6B' },
  conflictTextRed: { fontFamily: FONTS.body, color: '#FF6B6B', fontSize: 10, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  weekRow:             { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.periwinkleMist, paddingBottom: 8 },
  weekLabelBox:        { width: 68 },
  weekDayText:         { fontSize: 12, fontFamily: FONTS.body, color: COLORS.mutedSapphire },
  weekDateText:        { fontSize: 10, fontFamily: FONTS.body, color: COLORS.softCobalt },
  todayAccent:         { color: COLORS.dustyTangerine },
  weekEventBox:        { flex: 1 },
  eventBoxSmall:       { backgroundColor: COLORS.mutedSapphire, borderRadius: 12, padding: 8 },
  eventBoxSmallSpaced: { marginBottom: 4 },
  conflictBorderSmall: { borderWidth: 1.5, borderColor: '#FF6B6B' },
  eventTextSmall:      { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 10 },
  conflictTextSmall:   { fontFamily: FONTS.body, color: '#FF6B6B', fontSize: 9, fontStyle: 'italic', marginTop: 2 },
  monthlyBlueBox:      { backgroundColor: COLORS.mutedSapphire, marginHorizontal: 12, marginVertical: 12, borderRadius: 28, padding: 16, alignSelf: 'stretch' },
  gridHeader:          { flexDirection: 'row', marginBottom: 10 },
  gridHeaderText:      { flex: 1, fontFamily: FONTS.body, color: COLORS.ghostBlue, textAlign: 'center', fontSize: 13 },
  gridRow:             { flexDirection: 'row', marginBottom: 10 },
  gridItem:            { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' },
  dayCircle:           { width: 42, height: 42, backgroundColor: COLORS.ghostBlue, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  dayCircleToday:      { backgroundColor: COLORS.warmMelon },
  dayText:             { fontFamily: FONTS.body, color: COLORS.mutedSapphire, fontSize: 13 },
  dayTextToday:        { color: COLORS.ghostBlue },
  dayBadge:            { position: 'absolute', bottom: 0, right: '10%', backgroundColor: COLORS.warmMelon, width: 17, height: 17, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.ghostBlue },
  badgeText:           { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 9 },
  monthlyConflictText: { fontFamily: FONTS.body, color: '#FF6B6B', fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  cardBack: { height: '60%', borderRadius: 30, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  cardBackInner: { flex: 1 },
  cardBackTitle: { fontSize: 26, fontFamily: FONTS.heading, color: COLORS.ghostBlue, marginBottom: 4 },
  cardClub: { fontSize: 16, fontFamily: FONTS.body, color: COLORS.ghostBlue, opacity: 0.9 },
  cardDivider: { height: 1, backgroundColor: COLORS.ghostBlue, marginVertical: 15, opacity: 0.3 },
  cardDescription: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.ghostBlue, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagText: { color: COLORS.ghostBlue, fontSize: 11, fontFamily: FONTS.body },
  unaddButton: { backgroundColor: '#FF6B6B', paddingVertical: 14, borderRadius: 18, alignItems: 'center', marginTop: 10 },
  unaddText: { color: 'white', fontFamily: FONTS.heading, fontSize: 14 },
  tapHint: { textAlign: 'center', color: COLORS.ghostBlue, opacity: 0.5, fontSize: 10, marginTop: 15 },
  pastEventBox: { backgroundColor: '#D1D1D1', opacity: 0.7 },
  crossedOutText: { textDecorationLine: 'line-through', color: '#757575' },
});