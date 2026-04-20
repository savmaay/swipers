import React, { useRef, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH      = SCREEN_WIDTH * 0.82;
const CARD_HEIGHT     = SCREEN_HEIGHT * 0.52;
const SWIPE_THRESHOLD = 90;

// Types 
type Event = {
  id: string;
  title: string;
  club: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
  color: string;
};

// Sample Events 
const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'SWE Picnic Social!',
    club: 'Society of Women Engineers',
    date: 'April 25th',
    time: '5:00 pm',
    location: 'Plaza of Americas',
    description: 'This event welcomes all students for a fun spring picnic to relieve stress and allow students to network. You do not have to be a member of the club to attend, everyone is welcome!',
    tags: ['Social', 'Networking', 'Engineering'],
    color: COLORS.apricotBlush,
  },
  {
    id: '2',
    title: 'Gator Club Study Session!',
    club: 'Gator Club',
    date: 'April 22th',
    time: '6:30 pm',
    location: 'Marston Library',
    description: 'Join fellow students for a group study session. All majors welcome. Snacks provided!',
    tags: ['Academic', 'Study'],
    color: COLORS.periwinkleMist,
  },
  {
    id: '3',
    title: 'AI Club Info Session!',
    club: 'AI Club',
    date: 'April 21st',
    time: '1:00 pm',
    location: 'Malachowsky Hall',
    description: 'Learn about what AI Club does, upcoming projects, and how to get involved. Open to all students interested in artificial intelligence.',
    tags: ['Technology', 'AI', 'Academic'],
    color: COLORS.peachyCream,
  },
  {
    id: '4',
    title: 'CS Club Semester Party!',
    club: 'CS Club',
    date: 'April 20th',
    time: '7:00 pm',
    location: 'Little Hall',
    description: 'End of semester celebration! Games, food, and fun. Come hang out with fellow CS students.',
    tags: ['Social', 'Technology'],
    color: COLORS.lilacHaze,
  },
  {
    id: '5',
    title: 'Photography Walk',
    club: 'UF Photography Club',
    date: 'April 25th',
    time: '4:00 pm',
    location: 'Gainesville Downtown',
    description: 'Explore Gainesville through a lens! Bring your camera or phone. All skill levels welcome.',
    tags: ['Photography', 'Art & Design'],
    color: COLORS.warmMelon,
  },
];

// Animated arrow strip 
// Shows ‹‹‹ or ››› that animate in as user drags
function ArrowPulse({
  direction,
  progress,
}: {
  direction: 'left' | 'right';
  progress: Animated.AnimatedInterpolation<number>;
}) {
  const char = direction === 'left' ? '‹' : '›';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => {
        const opacity = progress.interpolate({
          inputRange: [0, 0.2 + i * 0.25, 1],
          outputRange: [0.15, 0.15 + i * 0.3, 1],
          extrapolate: 'clamp',
        });
        return (
          <Animated.Text
            key={i}
            style={{ opacity, color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 32 }}
          >
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
}

// Toast notification 
function Toast({
  message,
  color,
  onUndo,
  undoLabel,
}: {
  message: string;
  color: string;
  onUndo?: () => void;
  undoLabel?: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.toast, { backgroundColor: color, opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
      {onUndo && (
        <TouchableOpacity onPress={onUndo}>
          <Text style={styles.toastUndo}>{undoLabel ?? 'UNDO'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// Flip Card (main swipe screen) 
function FlipCard({
  event,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  index,
  triggerSwipe,
}: {
  event: Event;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  index: number;
  triggerSwipe: 'left' | 'right' | null;
}) {
  const position       = useRef(new Animated.ValueXY()).current;
  const swipeIndicator = useRef(new Animated.Value(0)).current;
  const flipAnim       = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);
  const hasSwipedRef   = useRef(false);
  const isTopRef       = useRef(isTop);
  useEffect(() => { isTopRef.current = isTop; }, [isTop]);

  const onSwipeLeftRef  = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  useEffect(() => { onSwipeLeftRef.current  = onSwipeLeft;  }, [onSwipeLeft]);
  useEffect(() => { onSwipeRightRef.current = onSwipeRight; }, [onSwipeRight]);

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
    swipeIndicator.setValue(0);
    flipAnim.setValue(0);
    setFlipped(false);
    hasSwipedRef.current = false;
  }, [event.id]);

  useEffect(() => {
    if (!isTop || !triggerSwipe) return;
    if (hasSwipedRef.current) return;
    hasSwipedRef.current = true;
    const toX = triggerSwipe === 'left' ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      triggerSwipe === 'left' ? onSwipeLeftRef.current() : onSwipeRightRef.current();
    });
  }, [triggerSwipe]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, g) => isTopRef.current && Math.abs(g.dx) > 2,
      onMoveShouldSetPanResponder:  (_, g) => isTopRef.current && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        position.setOffset({ x: (position.x as any)._value, y: 0 });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, g) => {
        if (!isTopRef.current) return;
        position.setValue({ x: g.dx, y: g.dy * 0.2 });
        swipeIndicator.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (!isTopRef.current) return;
        position.flattenOffset();
        if (g.dx > SWIPE_THRESHOLD) {
          if (hasSwipedRef.current) return;
          hasSwipedRef.current = true;
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH * 1.5, y: g.dy },
            duration: 250, useNativeDriver: true,
          }).start(() => onSwipeRightRef.current());
        } else if (g.dx < -SWIPE_THRESHOLD) {
          if (hasSwipedRef.current) return;
          hasSwipedRef.current = true;
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH * 1.5, y: g.dy },
            duration: 250, useNativeDriver: true,
          }).start(() => onSwipeLeftRef.current());
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
          Animated.spring(swipeIndicator, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => {
        position.flattenOffset();
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    })
  ).current;

  const handleFlip = () => {
    if (!isTopRef.current) return;
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 350,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  const frontRotateY = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '90deg', '90deg'] });
  const backRotateY  = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['270deg', '270deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const rotate      = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], outputRange: ['-8deg', '0deg', '8deg'], extrapolate: 'clamp' });
  const likeOpacity = swipeIndicator.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = swipeIndicator.interpolate({ inputRange: [-60, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const scale     = isTop ? 1 : 1 - index * 0.04;
  const translateY = isTop ? 0 : index * 12;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: isTop
            ? [{ translateX: position.x }, { translateY: position.y }, { rotate }]
            : [{ scale }, { translateY }],
          zIndex: 10 - index,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {isTop && (
        <>
          <Animated.View style={[styles.yesStamp, { opacity: likeOpacity }]}>
            <Text style={styles.yesStampText}>💚 YES</Text>
          </Animated.View>
          <Animated.View style={[styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeStampText}>✕ NOPE</Text>
          </Animated.View>
        </>
      )}

      {/* Front */}
      <Animated.View
        style={[styles.card, { backgroundColor: event.color }, { transform: [{ rotateY: frontRotateY }], opacity: frontOpacity }]}
      >
        <TouchableOpacity style={styles.cardInner} onPress={handleFlip} activeOpacity={0.95}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <View style={styles.cardDivider} />
          <Text style={styles.cardDetail}>🗓️  {event.date}</Text>
          <Text style={styles.cardDetail}>⏰  {event.time}</Text>
          <Text style={styles.cardDetail}>📍  {event.location}</Text>
          <Text style={styles.tapHint}>Tap to see details →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[styles.card, styles.cardBack, { backgroundColor: event.color }, { transform: [{ rotateY: backRotateY }], opacity: backOpacity }]}
      >
        <TouchableOpacity style={styles.cardBackInner} onPress={handleFlip} activeOpacity={0.95}>
          <Text style={styles.cardBackTitle}>{event.title}</Text>
          <Text style={styles.cardClub}>{event.club}</Text>
          <View style={styles.cardDivider} />
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={styles.cardDescription}>{event.description}</Text>
            <View style={styles.tagsRow}>
              {event.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}># {tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.tapHint}>← Tap to go back</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

//  Summary row 
function SwipeRow({
  event,
  onRemove,
  onAddedToCalendar,
  onPress,
}: {
  event: Event;
  onRemove: () => void;
  onAddedToCalendar: () => void;
  onPress: () => void;
}) {
  const pan      = useRef(new Animated.ValueXY()).current;
  const hasActed = useRef(false);

  const leftProgress  = pan.x.interpolate({ inputRange: [-100, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const rightProgress = pan.x.interpolate({ inputRange: [0, 100],  outputRange: [0, 1], extrapolate: 'clamp' });
  const redScale      = pan.x.interpolate({ inputRange: [-80, 0],  outputRange: [1.1, 1], extrapolate: 'clamp' });
  const greenScale    = pan.x.interpolate({ inputRange: [0, 80],   outputRange: [1, 1.1], extrapolate: 'clamp' });

  const doLeft = () => {
    if (hasActed.current) return;
    hasActed.current = true;
    Animated.timing(pan, {
      toValue: { x: -SCREEN_WIDTH * 1.4, y: 0 },
      duration: 200, useNativeDriver: true,
    }).start(onRemove);
  };

  const doRight = () => {
  if (hasActed.current) return;
  hasActed.current = true;
  Animated.timing(pan, {
    toValue: { x: SCREEN_WIDTH * 1.4, y: 0 },
    duration: 200, useNativeDriver: true,
  }).start(() => {
    onAddedToCalendar?.(); // toast / future calendar logic
  });
};

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.3,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: 0 });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        if (g.dx < -65) {
          doLeft();
        } else if (g.dx > 65) {
          doRight();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX: pan.x }] }}>
      <View style={styles.summaryRow}>
        {/* Red pill — press OR swipe left to remove */}
        <Animated.View style={[styles.redPill, { transform: [{ scale: redScale }] }]}>
          <TouchableOpacity style={styles.pillInner} onPress={doLeft} activeOpacity={0.85}>
            <Text style={styles.redPillX}>✕</Text>
            <ArrowPulse direction="left" progress={leftProgress} />
          </TouchableOpacity>
        </Animated.View>

        {/* Orange card — tap to see details */}
        <TouchableOpacity style={styles.summaryCard} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.summaryEventTitle}>{event.title}</Text>
          <Text style={styles.summaryEventDetail}>{event.date}</Text>
          <Text style={styles.summaryEventDetail}>{event.time}</Text>
          <Text style={styles.summaryEventDetail}>{event.location}</Text>
        </TouchableOpacity>

        {/* Green pill — press OR swipe right to add to calendar */}
        <Animated.View style={[styles.greenPill, { transform: [{ scale: greenScale }] }]}>
          <TouchableOpacity style={styles.pillInner} onPress={doRight} activeOpacity={0.85}>
            <Text style={styles.greenPillCheck}>✓</Text>
            <ArrowPulse direction="right" progress={rightProgress} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// Event detail popup 
function EventDetailModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  return (
    <Modal visible={!!event} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.detailOverlay} activeOpacity={1} onPress={onClose}>
        {event && (
          <View style={[styles.detailCard, { backgroundColor: event.color }]}>
            <TouchableOpacity style={styles.detailCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.mutedSapphire} />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{event.title}</Text>
            <Text style={styles.detailClub}>{event.club}</Text>
            <View style={styles.cardDivider} />
            <Text style={styles.detailInfo}>📅  {event.date}</Text>
            <Text style={styles.detailInfo}>⏰  {event.time}</Text>
            <Text style={styles.detailInfo}>📍  {event.location}</Text>
            <View style={styles.cardDivider} />
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 160 }}>
              <Text style={styles.detailDescription}>{event.description}</Text>
              <View style={styles.tagsRow}>
                {event.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}># {tag}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.tapHint, { marginTop: 12 }]}>Tap outside to close</Text>
          </View>
        )}
      </TouchableOpacity>
    </Modal>
  );
}

// Swipe Summary Modal
function SwipeSummary({
  visible,
  likedEvents,
  onClose,
  onRemove,
  onRestore,
}: {
  visible: boolean;
  likedEvents: Event[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onRestore: (event: Event) => void;
}) {
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [toasts, setToasts] = useState<
    { id: string; message: string; color: string; undoEvent?: Event }[]
  >([]);
useEffect(() => {
    if (likedEvents.length === 0 && visible) {
      onClose();
    }
  }, [likedEvents, visible, onClose]);

  const fontsLoaded = useAppFonts();
  if (!fontsLoaded) return null;

  const pushToast = (toastId: string, message: string, color: string, undoEvent?: Event) => {
    setToasts(prev => [...prev, { id: toastId, message, color, undoEvent }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 4500);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <LinearGradient colors={[COLORS.periwinkleMist, '#dce6fb']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Swipe Summary</Text>
          <TouchableOpacity onPress={onClose} style={styles.summaryClose}>
            <Ionicons name="close" size={28} color={COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        {likedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events saved yet!</Text>
            <Text style={styles.emptySubtext}>Swipe right on events you're interested in</Text>
          </View>
        ) : (
          <ScrollView 
            key={likedEvents.length}   
            contentContainerStyle={styles.summaryList}
            scrollEnabled={true}
            >
            {likedEvents.map((event) => (
              <SwipeRow
                key={event.id}
                event={event}
                onRemove={() => {
                  onRemove(event.id);
                  pushToast(`remove-${event.id}-${Date.now()}`, `Removed "${event.title}"`, COLORS.deepNavy, event);
                }}
                onAddedToCalendar={() => {
                  pushToast(`cal-${event.id}-${Date.now()}`, `Added "${event.title}" to calendar! 📅`, '#4CAF50');
                  onRemove(event.id); // Remove from summary when added to calendar
                }}
                onPress={() => setDetailEvent(event)}
              />
            ))}
          </ScrollView>
        )}

        {/* Toast stack */}
        <View style={styles.toastContainer} pointerEvents="box-none">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              message={t.message}
              color={t.undoEvent ? COLORS.deepNavy : '#4CAF50'}
              undoLabel={t.undoEvent ? 'UNDO' : undefined}
              onUndo={
                t.undoEvent
                  ? () => {
                      onRestore(t.undoEvent!);
                      setToasts(prev => prev.filter(x => x.id !== t.id));
                    }
                  : undefined
              }
            />
          ))}
        </View>

        {/* Detail popup */}
        <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />
      </LinearGradient>
    </Modal>
  );
}

// Main Swipe Screen
export default function SwipeScreen() {
  const fontsLoaded = useAppFonts();
  const [events, setEvents] = useState<Event[]>([]);
  const [likedEvents, setLikedEvents] = useState<Event[]>([]);
  const [triggerSwipe, setTriggerSwipe] = useState<'left' | 'right' | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  // Show summary automatically when all events are swiped
  
  const loadFeed = useCallback(async () => {
    const stored = await AsyncStorage.getItem('userInterests');
    console.log('RAW STORAGE:', stored);

    const interests = stored ? JSON.parse(stored) : [];
    console.log('PARSED INTERESTS:', interests);

    if (!interests.length) {
      setEvents(SAMPLE_EVENTS);
      return;
    }

    const unseen = SAMPLE_EVENTS.filter(
      event => !seenIds.includes(event.id)
    );

    const ranked = [...unseen]
      .map(event => {
        const score = event.tags.filter(tag =>
          interests.some(
            interest =>
              interest.toLowerCase() === tag.toLowerCase()
          )
        ).length;

        return { ...event, score };
      })
      .sort((a, b) => b.score - a.score);

    setEvents(ranked);
  }, [seenIds]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  useEffect(() => {
    if (events.length === 0 && likedEvents.length > 0) {
      setShowSummary(true);
    }
  }, [events.length, likedEvents.length]);

  const handleSwipeLeft = useCallback(() => {
    setTriggerSwipe(null);

    setEvents(prev => {
      const removed = prev[0];
      if (removed) {
        setSeenIds(ids => [...ids, removed.id]);
      }
      return prev.slice(1);
    });
  }, []);

  const parseTimeHour = (time: string) => {
    const [rawHour, minutePart] = time.split(':');
    let hour = parseInt(rawHour);
    const isPm = time.toLowerCase().includes('pm');

    if (isPm && hour !== 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;

    return hour;
  };

  const convertDate = (rawDate: string) => {
    const cleaned = rawDate.replace(/(st|nd|rd|th)/g, '');

    const parts = cleaned.split(' ');
    const month = parts[0];
    const day = parts[1];

    const months: Record<string, string> = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };

    return `2026-${months[month]}-${day.padStart(2, '0')}`;
  };

  const saveToCalendar = async (event: Event) => {
    try {
      const stored = await AsyncStorage.getItem('calendarEvents');
      const current = stored ? JSON.parse(stored) : [];

      const exists = current.some((e: any) => e.id === event.id);

      if (exists) return;

      const newEvent = {
        id: event.id,
        title: event.title,
        club: event.club,
        description: event.description,
        tags: event.tags,
        color: event.color,

        date: convertDate(event.date),
        time: event.time,
        timeHour: parseTimeHour(event.time),
      };

      await AsyncStorage.setItem(
        'calendarEvents',
        JSON.stringify([...current, newEvent])
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleSwipeRight = useCallback(() => {
    setTriggerSwipe(null);

    setEvents(prev => {
      const liked = prev[0];

      if (liked) {
        setLikedEvents(current => [...current, liked]);

        setSeenIds(ids => [...ids, liked.id]);

        saveToCalendar(liked);
      }

      return prev.slice(1);
    });
  }, []);

  const handleRemoveFromSummary = useCallback((id: string) => {
    setLikedEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleRestore = useCallback((event: Event) => {
    setLikedEvents(prev => {
      if (prev.find(e => e.id === event.id)) return prev;
      return [...prev, event];
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>New Events</Text>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons
            name="person-circle"
            size={40}
            color={COLORS.mutedSapphire}
          />
        </TouchableOpacity>
      </View>

      {events.length > 0 ? (
        <View style={styles.cardStack}>
          {events.slice(0, 3).map((event, index) => (
            <FlipCard
              key={event.id}
              event={event}
              isTop={index === 0}
              index={index}
              triggerSwipe={index === 0 ? triggerSwipe : null}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyStack}>
          <Text style={styles.emptyStackText}>You're all caught up!</Text>
          <Text style={styles.emptyStackSub}>No new events right now</Text>
          <TouchableOpacity 
            style={styles.viewSummaryButton} 
            onPress={() => setShowSummary(true)}
          >
            <Text style={styles.viewSummaryText}>Swipe Summary</Text>

            {likedEvents.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{likedEvents.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

     {events.length > 0 && (
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.nopeButton} onPress={() => setTriggerSwipe('left')} activeOpacity={0.8}>
          <Text style={styles.nopeButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={() => setTriggerSwipe('right')} activeOpacity={0.8}>
          <Text style={styles.likeButtonIcon}>♥</Text>
        </TouchableOpacity>
      </View>
    )}

      <SwipeSummary
        visible={showSummary}
        likedEvents={likedEvents}
        onClose={() => setShowSummary(false)}
        onRemove={handleRemoveFromSummary}
        onRestore={handleRestore}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.ghostBlue,
    paddingTop: SCREEN_HEIGHT * 0.07,
    paddingBottom: 20,
  },

  headerContainer: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  profileButton: {
    position: 'absolute',
    top: 0,
    right: 18,
    zIndex: 10,
  },
  screenTitle: {
    fontFamily: FONTS.heading, fontSize: 40,
    color: COLORS.mutedSapphire, marginBottom: 16,
  },

  // Card stack
  cardStack: {
    width: CARD_WIDTH, height: CARD_HEIGHT,
    position: 'relative', alignItems: 'center', marginBottom: 24,
  },
  cardContainer: { position: 'absolute', width: CARD_WIDTH, height: CARD_HEIGHT },
  card: {
    position: 'absolute', width: CARD_WIDTH, height: CARD_HEIGHT,
    borderRadius: 28, backfaceVisibility: 'hidden',
    shadowColor: COLORS.deepNavy, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 16, elevation: 8,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  cardBack: { position: 'absolute', top: 0, left: 0 },
  cardInner: { flex: 1, padding: 28, justifyContent: 'center' },
  cardBackInner: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  cardTitle: {
    fontFamily: FONTS.heading, fontSize: 28,
    color: COLORS.mutedSapphire, marginBottom: 14, textAlign: 'center',
  },
  cardBackTitle: {
    fontFamily: FONTS.heading, fontSize: 24,
    color: COLORS.mutedSapphire, textAlign: 'center', marginBottom: 4,
  },
  cardClub: {
    fontFamily: FONTS.body, fontSize: 14,
    color: COLORS.mutedSapphire, textAlign: 'center', marginBottom: 10, opacity: 0.8,
  },
  cardDivider: {
    width: 60, height: 2, backgroundColor: COLORS.softCobalt,
    borderRadius: 1, marginBottom: 14, opacity: 0.4, alignSelf: 'center',
  },
  cardDetail: {
    fontFamily: FONTS.body, fontSize: 17,
    color: COLORS.mutedSapphire, marginBottom: 8, textAlign: 'center',
  },
  cardDescription: {
    fontFamily: FONTS.body, fontSize: 17,
    color: COLORS.deepNavy, textAlign: 'center', lineHeight: 26, marginBottom: 16,
  },
  tapHint: {
    fontFamily: FONTS.body, fontSize: 12,
    color: COLORS.mutedSapphire, opacity: 0.6, textAlign: 'center', marginTop: 12,
  },
  tagsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 6, marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 20,
    paddingVertical: 5, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.mutedSapphire,
  },
  tagText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.mutedSapphire },

  // Stamps 
  yesStamp: {
    position: 'absolute', top: 24, left: 24, zIndex: 20,
    borderWidth: 3, borderColor: '#4CAF50', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, transform: [{ rotate: '-15deg' }],
  },
  yesStampText: { fontFamily: FONTS.heading, fontSize: 20, color: '#4CAF50' },
  nopeStamp: {
    position: 'absolute', top: 24, right: 24, zIndex: 20,
    borderWidth: 3, borderColor: '#F44336', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, transform: [{ rotate: '15deg' }],
  },
  nopeStampText: { fontFamily: FONTS.heading, fontSize: 20, color: '#F44336' },

  // Main buttons
  buttonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  nopeButton: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.deepNavy,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 5,
  },
  nopeButtonText: { fontSize: 28, color: '#fff', fontWeight: '700' },
  summaryButton: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.periwinkleMist,
  },
  badge: {
    position: 'absolute', 
    top: -6, 
    right: -6,
    minWidth: 20,
    height: 20, 
    borderRadius: 10,
    backgroundColor: COLORS.dustyTangerine,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  likeButton: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  likeButtonIcon: { fontSize: 32, color: COLORS.dustyTangerine },

  // Empty stack
  emptyStack: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 150,
    flex: 1,
  },
  emptyStackText: { fontFamily: FONTS.heading, fontSize: 26, color: COLORS.mutedSapphire, marginBottom: 8 },
  emptyStackSub: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.blueTonedSlate, marginBottom: 24 },
  viewSummaryButton: {
    backgroundColor: COLORS.mutedSapphire, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 28, position: 'relative',
  },
  viewSummaryText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.ghostBlue },

  // Summary modal 
  summaryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: SCREEN_HEIGHT * 0.07, paddingBottom: 16, paddingHorizontal: 24,
  },
  summaryTitle: {
    fontFamily: FONTS.heading, fontSize: 32, color: COLORS.dustyTangerine,
    flex: 1, textAlign: 'center',
  },
  summaryClose: { position: 'absolute', right: 20, top: SCREEN_HEIGHT * 0.07 },
  summaryList: { paddingHorizontal: 12, paddingBottom: 100, gap: 12 },

  // Summary row 
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  redPill: {
    width: 60, height: 114, borderRadius: 34,
    backgroundColor: '#F44336', overflow: 'hidden',
  },
  greenPill: {
    width: 60, height: 114, borderRadius: 34,
    backgroundColor: '#4CAF50', overflow: 'hidden',
  },
  pillInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  redPillX: { fontSize: 24, color: '#fff', fontWeight: '900' },
  greenPillCheck: { fontSize: 24, color: '#fff', fontWeight: '900' },

  summaryCard: {
    flex: 1, backgroundColor: COLORS.apricotBlush,
    borderRadius: 18, padding: 14,
    alignItems: 'center', justifyContent: 'center',
    minHeight: 114,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  summaryEventTitle: {
    fontFamily: FONTS.heading, fontSize: 15, color: COLORS.mutedSapphire,
    textAlign: 'center', marginBottom: 4,
  },
  summaryEventDetail: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.deepNavy, textAlign: 'center' },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.mutedSapphire },
  emptySubtext: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.blueTonedSlate },

  // Detail modal 
  detailOverlay: {
    flex: 1, backgroundColor: 'rgba(46,49,72,0.5)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  detailCard: {
    width: '100%', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  detailCloseBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10, padding: 4 },
  detailTitle: {
    fontFamily: FONTS.heading, fontSize: 24, color: COLORS.mutedSapphire,
    textAlign: 'center', marginBottom: 4, marginTop: 8,
  },
  detailClub: {
    fontFamily: FONTS.body, fontSize: 13, color: COLORS.blueTonedSlate,
    textAlign: 'center', marginBottom: 12,
  },
  detailInfo: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.deepNavy, textAlign: 'center', marginBottom: 6 },
  detailDescription: {
    fontFamily: FONTS.body, fontSize: 14, color: COLORS.deepNavy,
    textAlign: 'center', lineHeight: 22, marginTop: 12, marginBottom: 14,
  },

  // Toast
  toastContainer: { position: 'absolute', bottom: 30, left: 16, right: 16, gap: 8 },
  toast: {
    borderRadius: 16, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  toastText: { color: '#fff', fontFamily: FONTS.body, flex: 1 },
  toastUndo: { color: '#fff', fontWeight: '700', marginLeft: 12, fontSize: 14 },
});