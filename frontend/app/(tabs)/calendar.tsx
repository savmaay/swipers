import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';

type ViewType = 'daily' | 'weekly' | 'monthly';

// Mock Data- delete whenever
type CalEvent = {
  id: string;
  date: string;     // 'YYYY-MM-DD'
  time: string;     // display '3:00 pm'
  timeHour: number; // 24h for sorting/conflict detection
  title: string;
};

const EVENTS: CalEvent[] = [
  { id: 'e1',  date: '2026-04-02', time: '3:00 pm',  timeHour: 15, title: 'SWE Picnic Social' },
  { id: 'e2',  date: '2026-04-02', time: '3:00 pm',  timeHour: 15, title: 'GatorAI Study Session' },
  { id: 'e3',  date: '2026-04-02', time: '4:00 pm',  timeHour: 16, title: 'AI Club End of Sem Party' },
  { id: 'e4',  date: '2026-04-07', time: '1:00 pm',  timeHour: 13, title: 'Team Standup' },
  { id: 'e5',  date: '2026-04-07', time: '3:30 pm',  timeHour: 15, title: 'Project Review' },
  { id: 'e6',  date: '2026-04-10', time: '11:00 am', timeHour: 11, title: 'Career Fair' },
  { id: 'e7',  date: '2026-04-14', time: '2:00 pm',  timeHour: 14, title: 'Club Meeting' },
  { id: 'e8',  date: '2026-04-14', time: '2:00 pm',  timeHour: 14, title: 'Study Group' },
  { id: 'e9',  date: '2026-04-14', time: '5:00 pm',  timeHour: 17, title: 'Gym Session' },
  { id: 'e10', date: '2026-04-25', time: '10:00 am', timeHour: 10, title: 'Hackathon Kickoff' },
  { id: 'e11', date: '2026-04-25', time: '10:00 am', timeHour: 10, title: 'Morning Lecture' },
  { id: 'e12', date: '2026-04-25', time: '2:00 pm',  timeHour: 14, title: 'Hackathon Sprint' },
  { id: 'e13', date: '2026-04-25', time: '6:00 pm',  timeHour: 18, title: 'Hackathon Demo' },
  { id: 'e14', date: '2026-04-25', time: '8:00 pm',  timeHour: 20, title: 'Awards Ceremony' },
  { id: 'e15', date: '2026-04-25', time: '9:00 pm',  timeHour: 21, title: 'After Party' },
  { id: 'e16', date: '2026-04-08', time: '9:00 am',  timeHour: 9,  title: 'Advising Appointment' },
];

// Uses the real current date
const TODAY = new Date();

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function eventsForDate(date: Date): CalEvent[] {
  return EVENTS.filter(e => e.date === toDateKey(date)).sort((a, b) => a.timeHour - b.timeHour);
}

function hasConflict(events: CalEvent[]): boolean {
  const hours = events.map(e => e.timeHour);
  return hours.length !== new Set(hours).size;
}

function weekStart(d: Date): Date {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  return s;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatMonthDay(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

// Screen 

export default function CalendarScreen() {
  const [view, setView] = useState<ViewType>('daily');

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
          {view === 'daily'   && <DailyView   date={TODAY} />}
          {view === 'weekly'  && <WeeklyView  date={TODAY} />}
          {view === 'monthly' && <MonthlyView date={TODAY} />}
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
      <View style={{ height: 90 }} />
    </View>
  );
}

// Daily View 

const DailyView = ({ date }: { date: Date }) => {
  const events = eventsForDate(date);
  const conflict = hasConflict(events);
  const timeCount: Record<number, number> = {};
  events.forEach(e => { timeCount[e.timeHour] = (timeCount[e.timeHour] || 0) + 1; });

  return (
    <View style={styles.viewPadding}>
      {events.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No events today</Text>
        </View>
      ) : (
        events.map((item) => (
          <View key={item.id} style={styles.eventRow}>
            <Text style={styles.timeLabel}>{item.time}</Text>
            <View style={[styles.eventBox, timeCount[item.timeHour] > 1 && styles.conflictBorder]}>
              <Text style={styles.eventText}>{item.title}</Text>
            </View>
          </View>
        ))
      )}
      {conflict && <Text style={styles.conflictTextRed}>* scheduling conflict *</Text>}
    </View>
  );
};

// Weekly View

const WeeklyView = ({ date }: { date: Date }) => {
  const start = weekStart(date);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <View style={styles.viewPadding}>
      {days.map((d) => {
        const events   = eventsForDate(d);
        const conflict = hasConflict(events);
        const isToday  = toDateKey(d) === toDateKey(date);
        const timeCount: Record<number, number> = {};
        events.forEach(e => { timeCount[e.timeHour] = (timeCount[e.timeHour] || 0) + 1; });

        return (
          <View key={toDateKey(d)} style={styles.weekRow}>
            <View style={styles.weekLabelBox}>
              <Text style={[styles.weekDayText, isToday && styles.todayAccent]}>
                {DAY_SHORT[d.getDay()]}
              </Text>
              <Text style={[styles.weekDateText, isToday && styles.todayAccent]}>
                {formatMonthDay(d)}
              </Text>
            </View>
            <View style={styles.weekEventBox}>
              {events.length === 0 ? (
                <View style={styles.eventBoxSmall}>
                  <Text style={styles.eventTextSmall}>No Events</Text>
                </View>
              ) : (
                <>
                  {events.map((ev) => (
                    <View
                      key={ev.id}
                      style={[
                        styles.eventBoxSmall,
                        styles.eventBoxSmallSpaced,
                        timeCount[ev.timeHour] > 1 && styles.conflictBorderSmall,
                      ]}
                    >
                      <Text style={styles.eventTextSmall}>{ev.time}  {ev.title}</Text>
                    </View>
                  ))}
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

// Monthly View 

const MonthlyView = ({ date }: { date: Date }) => {
  const year  = date.getFullYear();
  const month = date.getMonth();

  const firstDayOffset = new Date(year, month, 1).getDay();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDayOffset }, (_, i) => i);
  const days   = Array.from({ length: daysInMonth },    (_, i) => i + 1);

  const eventMap: Record<number, { count: number; conflict: boolean }> = {};
  days.forEach(d => {
    const evs = eventsForDate(new Date(year, month, d));
    if (evs.length > 0) {
      eventMap[d] = { count: evs.length, conflict: hasConflict(evs) };
    }
  });

  const anyConflict = Object.values(eventMap).some(v => v.conflict);
  const realToday   = new Date();
  const todayDate   = realToday.getMonth() === month && realToday.getFullYear() === year
    ? realToday.getDate()
    : -1;

  const allCells: Array<{ type: 'blank'; key: string } | { type: 'day'; d: number }> = [
    ...blanks.map((b) => ({ type: 'blank' as const, key: `blank-${b}` })),
    ...days.map((d) => ({ type: 'day' as const, d })),
  ];

  while (allCells.length % 7 !== 0) allCells.push({ type: 'blank', key: `pad-${allCells.length}` });
  const rows: typeof allCells[] = [];
  for (let i = 0; i < allCells.length; i += 7) rows.push(allCells.slice(i, i + 7));

  return (
    <View style={styles.monthlyBlueBox}>
      <View style={styles.gridHeader}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <Text key={`hdr-${i}`} style={styles.gridHeaderText}>{d}</Text>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={`row-${ri}`} style={styles.gridRow}>
          {row.map((cell) => {
            if (cell.type === 'blank') {
              return <View key={cell.key} style={styles.gridItem} />;
            }
            const { d } = cell;
            const info    = eventMap[d];
            const isToday = d === todayDate;
            return (
              <View key={`day-${d}`} style={styles.gridItem}>
                <View style={[styles.dayCircle, isToday && styles.dayCircleToday]}>
                  <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{d}</Text>
                </View>
                {info && (
                  <View style={[styles.dayBadge, info.conflict && { backgroundColor: COLORS.error }]}>
                    <Text style={styles.badgeText}>{info.count}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {anyConflict && (
        <Text style={styles.monthlyConflictText}>* scheduling conflict *</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.skyIris },
  header:         { paddingTop: 60, paddingBottom: 10, alignItems: 'center' },
  headerTitle:    {
                    fontSize: 40,
                    fontFamily: FONTS.heading,
                    color: COLORS.dustyTangerine,
                  },
  contentCard:    { flex: 1, backgroundColor: COLORS.apricotBlush, marginHorizontal: 20, marginBottom: 50, marginTop: 20, borderRadius: 40, overflow: 'hidden' },
  scrollArea:     { flex: 1 }, 
  scrollCentered: { flexGrow: 1, justifyContent: 'center' },

  // Date display 
  dateDisplay:  { backgroundColor: COLORS.ghostBlue, marginHorizontal: 30, marginTop: 20, borderRadius: 25, paddingVertical: 8, alignItems: 'center' },
  viewTitle:    { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.mutedSapphire },
  dateSubtitle: { fontSize: 12, fontFamily: FONTS.body,    color: COLORS.softCobalt },

  // Tab switcher
  tabSwitcher:      { flexDirection: 'row', backgroundColor: COLORS.ghostBlue, marginHorizontal: 25, borderRadius: 25, padding: 4, marginBottom: 20 },
  switchBtn:        { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  switchBtnActive:  { backgroundColor: COLORS.mutedSapphire },
  switchText:       { fontSize: 12, fontFamily: FONTS.body, color: COLORS.mutedSapphire },
  switchTextActive: { fontFamily: FONTS.body, color: COLORS.ghostBlue },

  viewPadding: { padding: 20 },

  // Empty state
  emptyBox:  { backgroundColor: COLORS.mutedSapphire, padding: 14, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 13 },

  // Daily
  eventRow:        { marginBottom: 12 },
  timeLabel:       { fontSize: 11, fontFamily: FONTS.body, color: COLORS.mutedSapphire, marginBottom: 2 },
  eventBox:        { backgroundColor: COLORS.mutedSapphire, padding: 12, borderRadius: 20 },
  eventText:       { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 12 },
  conflictBorder:  { borderWidth: 2, borderColor: COLORS.error },
  conflictTextRed: { fontFamily: FONTS.body, color: COLORS.error, fontSize: 10, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },

  // Weekly
  weekRow:             { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.periwinkleMist, paddingBottom: 8 },
  weekLabelBox:        { width: 68 },
  weekDayText:         { fontSize: 12, fontFamily: FONTS.body, color: COLORS.mutedSapphire },
  weekDateText:        { fontSize: 10, fontFamily: FONTS.body, color: COLORS.softCobalt },
  todayAccent:         { color: COLORS.dustyTangerine },
  weekEventBox:        { flex: 1 },
  eventBoxSmall:       { backgroundColor: COLORS.mutedSapphire, borderRadius: 12, padding: 8 },
  eventBoxSmallSpaced: { marginBottom: 4 },
  conflictBorderSmall: { borderWidth: 1.5, borderColor: COLORS.error },
  eventTextSmall:      { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 10 },
  conflictTextSmall:   { fontFamily: FONTS.body, color: COLORS.error, fontSize: 9, fontStyle: 'italic', marginTop: 2 },

  // Monthly
  monthlyBlueBox:      { backgroundColor: COLORS.mutedSapphire, marginHorizontal: 12, marginVertical: 12, borderRadius: 28, padding: 16, alignSelf: 'stretch' },
  gridHeader:          { flexDirection: 'row', marginBottom: 10 },
  gridHeaderText:      { flex: 1, fontFamily: FONTS.body, color: COLORS.ghostBlue, textAlign: 'center', fontSize: 13 },
  gridBody:            { flexDirection: 'row', flexWrap: 'wrap' },
  gridRow:             { flexDirection: 'row', marginBottom: 10 },
  gridItem:            { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' },
  dayCircle:           { width: 42, height: 42, backgroundColor: COLORS.ghostBlue, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  dayCircleToday:      { backgroundColor: COLORS.warmMelon },
  dayText:             { fontFamily: FONTS.body, color: COLORS.mutedSapphire, fontSize: 13 },
  dayTextToday:        { color: COLORS.ghostBlue },
  dayBadge:            { position: 'absolute', bottom: 0, right: '10%', backgroundColor: COLORS.warmMelon, width: 17, height: 17, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.ghostBlue },
  badgeText:           { fontFamily: FONTS.body, color: COLORS.ghostBlue, fontSize: 9 },
  monthlyConflictText: { fontFamily: FONTS.body, color: COLORS.error, fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
});
