import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; 
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const AVATAR_MAP = {
  cat: require('../../assets/images/avatar_cat.png'),
  dog: require('../../assets/images/avatar_dog.png'),
  owl: require('../../assets/images/avatar_owl.png'),
  fox: require('../../assets/images/avatar_fox.png'),
  bunny: require('../../assets/images/avatar_bunny.png'),
  gator: require('../../assets/images/avatar_gator.png'),
};

type AvatarKey = keyof typeof AVATAR_MAP;

const MOCK_USERS = {
  nicole: { id: 'nicole', name: 'Nicole', year: '2028', major: 'Computer Engineering', bio: 'I like dogs', avatar: 'fox' as AvatarKey },
  diya: { id: 'diya', name: 'Diya', year: '2028', major: 'Computer Engineering', bio: 'I like cats', avatar: 'dog' as AvatarKey },
};

export default function GroupChatScreen() {
  const fontsLoaded = useAppFonts();
  const [view, setView] = useState<'list' | 'room' | 'profile'>('list');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [chats, setChats] = useState([
    {
      id: '1',
      title: 'SWE Picnic Social',
      unread: 1,
      messages: [
        { id: 'm1', type: 'system', text: 'Nicole has joined the chat!', senderId: null },
        { id: 'm2', type: 'user', senderId: 'nicole', text: 'Hey!' },
      ],
    },
    { id: '2', title: 'Gator Club Study Session', unread: 0, messages: [] },
    { id: '3', title: 'AI Club AI info session', unread: 0, messages: [] },
    { id: '4', title: 'CS Club Semester Party', unread: 0, messages: [] },
  ]);

  // This resets the screen to the 'list' view whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      setView('list');
      setActiveChatId(null);
      setViewedUserId(null);
    }, [])
  );

  if (!fontsLoaded) return null;

  const activeChat = chats.find(c => c.id === activeChatId);
  const viewedUser = viewedUserId ? MOCK_USERS[viewedUserId as keyof typeof MOCK_USERS] : null;

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChatId) return;
    const newMsg = {
      id: Date.now().toString(),
      type: 'user',
      senderId: 'diya',
      text: inputText.trim(),
    };
    setChats(prev =>
      prev.map(c => (c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setInputText('');
  };

  // List of Group Chats
  if (view === 'list') {
    return (
      <View style={styles.container}>
        <Text style={styles.figmaHeaderTitle}>Group Chats</Text>
        <View style={styles.mainCard}>
          <ScrollView contentContainerStyle={styles.listPadding}>
            {chats.map(chat => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatListItem}
                onPress={() => {
                  setActiveChatId(chat.id);
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                  setView('room');
                }}
              >
                <Text style={styles.chatListItemText}>{chat.title}</Text>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>+{chat.unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  // Chat room 
  if (view === 'room' && activeChat) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color={COLORS.apricotBlush} />
          </TouchableOpacity>
          <Text style={[styles.figmaHeaderTitle, { marginTop: 0 }]}>Group Chats</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.mainCard}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomHeaderText}>{activeChat.title}</Text>
          </View>
          <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
            {activeChat.messages.map(msg => {
              if (msg.type === 'system') {
                return (
                  <Text key={msg.id} style={styles.systemMsg}>
                    {msg.text}
                  </Text>
                );
              }
              const sender = MOCK_USERS[msg.senderId as keyof typeof MOCK_USERS];
              const isBlocked = blockedUserIds.includes(msg.senderId!);
              const isMe = msg.senderId === 'diya';

              return (
                <View key={msg.id} style={[styles.msgRow, isMe && { justifyContent: 'flex-end' }]}>
                  {!isMe && (
                    <TouchableOpacity
                      onPress={() => {
                        setViewedUserId(msg.senderId!);
                        setView('profile');
                      }}
                      style={styles.avatarCol}
                    >
                      <Image source={AVATAR_MAP[sender.avatar]} style={styles.msgAvatar} />
                      <Text style={styles.avatarName}>{sender.name}</Text>
                    </TouchableOpacity>
                  )}
                  <View style={[styles.bubble, isBlocked && styles.blockedBubble]}>
                    <Text style={[styles.msgText, isBlocked && styles.blockedText]}>
                      {isBlocked ? 'MESSAGE BLOCKED' : msg.text}
                    </Text>
                  </View>
                  {isMe && (
                    <View style={styles.avatarCol}>
                      <Image source={AVATAR_MAP[sender.avatar]} style={styles.msgAvatar} />
                      <Text style={styles.avatarName}>{sender.name}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Message"
              value={inputText}
              onChangeText={setInputText}
              placeholderTextColor={COLORS.softCobalt}
            />
            <TouchableOpacity onPress={handleSendMessage}>
              <Ionicons name="arrow-forward-circle" size={40} color={COLORS.mutedSapphire} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // View Profile
  if (view === 'profile' && viewedUser) {
    const isAlreadyBlocked = blockedUserIds.includes(viewedUser.id);
    return (
      <View style={[styles.container, { backgroundColor: COLORS.skyIris }]}>
        <ScrollView 
          contentContainerStyle={styles.profileScroll} 
          style={{ width: '100%' }}
        >
          <View style={styles.wideProfileCard}>
            <Text style={styles.profileTitle}>{viewedUser.name}</Text>
            
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Image source={AVATAR_MAP[viewedUser.avatar]} style={styles.largeAvatar} />
              </View>
              <Text style={styles.coinText}>Fox Coins: 0</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={[styles.field, { flex: 2, marginRight: 12 }]}>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.staticInput}>{viewedUser.name}</Text>
                </View>
                <View style={[styles.field, { flex: 1.5 }]}>
                  <Text style={styles.label}>Year</Text>
                  <Text style={styles.staticInput}>{viewedUser.year}</Text>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Major</Text>
                <Text style={styles.staticInput}>{viewedUser.major}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Bio</Text>
                <Text style={[styles.staticInput, styles.textArea]}>{viewedUser.bio}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.blockBtn, isAlreadyBlocked && { backgroundColor: COLORS.mutedSapphire }]}
              onPress={() =>
                isAlreadyBlocked
                  ? setBlockedUserIds(blockedUserIds.filter(id => id !== viewedUser.id))
                  : setShowBlockModal(true)
              }
            >
              <Text style={styles.blockBtnText}>
                {isAlreadyBlocked ? 'Unblock User' : 'Block User'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.returnBtn} onPress={() => setView('room')}>
              <Text style={styles.returnBtnText}>Return to Chat</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal visible={showBlockModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.blockModal}>
              <Text style={styles.modalTitle}>
                Are you sure you want to block {viewedUser.name}?
              </Text>
              <Text style={styles.modalSubtitle}>
                You will no longer receive messages from {viewedUser.name}.
              </Text>
              <View style={styles.modalDivider} />
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setBlockedUserIds([...blockedUserIds, viewedUser.id]);
                  setShowBlockModal(false);
                  setView('room');
                }}
              >
                <Text style={styles.confirmText}>CONFIRM</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.skyIris,
    alignItems: 'center',
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 60,
    marginBottom: 10,
  },
  backBtn: {},
  figmaHeaderTitle: {
    fontFamily: FONTS.heading,
    fontSize: 40,
    color: COLORS.apricotBlush,
    marginTop: 60,
    marginBottom: 10,
  },
  mainCard: {
    flex: 1,
    width: '90%',
    backgroundColor: COLORS.apricotBlush,
    borderRadius: 40,
    padding: 20,
    marginBottom: 100,
  },
  listPadding: { paddingTop: 16, paddingHorizontal: 4 },
  chatListItem: {
    backgroundColor: COLORS.mutedSapphire,
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    marginTop: 8,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  chatListItemText: {
    flex: 1,
    color: '#fff',
    fontFamily: FONTS.body,
    fontWeight: '600',
    fontSize: 16,
  },
  unreadBadge: {
    backgroundColor: '#E53935',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -10,
    top: -10,
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Room
  roomHeader: {
    backgroundColor: COLORS.mutedSapphire,
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  roomHeaderText: {
    color: '#fff',
    fontFamily: FONTS.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatScroll: { flex: 1 },
  systemMsg: {
    textAlign: 'center',
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.deepNavy,
    marginVertical: 10,
    fontWeight: '600',
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarCol: { alignItems: 'center', width: 50 },
  msgAvatar: { width: 40, height: 40, borderRadius: 20 },
  avatarName: { fontSize: 10, color: COLORS.deepNavy, marginTop: 4 },
  bubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 15,
    marginHorizontal: 6,
    maxWidth: '65%',
  },
  msgText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.deepNavy },
  blockedBubble: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E53935',
  },
  blockedText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 10,
  },
  chatInput: {
    flex: 1,
    height: 45,
    fontFamily: FONTS.body,
    fontSize: 16,
  },

  // Profile 
  profileScroll: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  wideProfileCard: {
    width: '100%',
    backgroundColor: COLORS.apricotBlush,
    marginTop: 60,
    borderRadius: 35,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  profileTitle: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 10,
  },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.mutedSapphire,
  },
  largeAvatar: { width: 90, height: 90 },
  coinText: {
    marginTop: 10,
    fontFamily: FONTS.heading,
    color: COLORS.mutedSapphire,
    fontSize: 20,
  },
  form: { width: '100%' },
  row: { flexDirection: 'row' },
  field: { marginBottom: 15 },
  label: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.softCobalt,
    marginBottom: 5,
    fontWeight: '600',
  },
  staticInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.deepNavy,
    backgroundColor: '#fff',
  },
  textArea: { height: 70 },
  blockBtn: {
    backgroundColor: '#E53935',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  blockBtnText: { color: '#fff', fontSize: 20, fontFamily: FONTS.heading },
  returnBtn: {
    backgroundColor: COLORS.mutedSapphire,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  returnBtnText: { color: '#fff', fontSize: 20, fontFamily: FONTS.heading },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockModal: {
    width: '92%',
    backgroundColor: '#E53935',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontFamily: FONTS.heading,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSubtitle: {
    color: '#fff',
    fontFamily: FONTS.body,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.5,
    marginBottom: 20,
  },
  confirmBtn: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelText: { color: '#fff' },
});