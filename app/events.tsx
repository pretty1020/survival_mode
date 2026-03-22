import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { EventPopup } from '@/components/EventPopup';
import { UpgradeCard } from '@/components/UpgradeCard';
import { budgetService } from '@/services/budgetService';
import { FinancialEvent } from '@/types';

const formatDate = (dateKey: string) => {
  const d = new Date(dateKey);
  const today = new Date().toISOString().split('T')[0];
  if (dateKey === today) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

export default function EventsScreen() {
  const { userData, setUserData, isPremium } = useApp();
  const [popupEvent, setPopupEvent] = useState<FinancialEvent | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const triggerRandomEvent = async () => {
    if (!userData) return;

    Alert.alert(
      'Trigger Event',
      'This action will affect your budget. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            const event = budgetService.generateRandomEvent(isPremium);
            const newData = await budgetService.addEvent(userData, event);
            setUserData(newData);
            setPopupEvent(event);
            setPopupVisible(true);
          },
        },
      ]
    );
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setPopupEvent(null);
  };

  if (!userData) return null;

  const todayKey = new Date().toISOString().split('T')[0];
  const todayEvents = userData.events.filter((e) => e.dateKey === todayKey);
  const pastEvents = userData.events.filter((e) => e.dateKey !== todayKey);
  const historyLimit = budgetService.getHistoryLimit(isPremium);
  const displayPastEvents = pastEvents.slice(0, historyLimit === Infinity ? 50 : 7);

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a', '#1e1b4b']} style={styles.gradient}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>What are Events?</Text>
          <Text style={styles.explanationText}>
            Events simulate real-life financial surprises—both good and bad. Tap the button below to trigger a random event that adds or subtracts from your budget. It helps you practice adapting when life throws curveballs at your wallet!
          </Text>
        </View>

        <Pressable style={styles.triggerButton} onPress={triggerRandomEvent}>
          <LinearGradient
            colors={['#7c3aed', '#5b21b6']}
            style={styles.triggerGradient}
          >
            <Text style={styles.triggerEmoji}>⚡</Text>
            <Text style={styles.triggerText}>Trigger Random Event</Text>
            <Text style={styles.triggerSubtext}>
              Life happens. See what hits your budget!
            </Text>
          </LinearGradient>
        </Pressable>

        {!isPremium && (
          <>
            <Text style={styles.limitNote}>
              Free: Limited events. Unlock premium for more dramatic event packs!
            </Text>
            <UpgradeCard />
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Events</Text>
          {todayEvents.length === 0 ? (
            <Text style={styles.emptyText}>
              No events yet. Tap above to trigger one! 🎲
            </Text>
          ) : (
            todayEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Events</Text>
          {displayPastEvents.length === 0 ? (
            <Text style={styles.emptyText}>No past events</Text>
          ) : (
            displayPastEvents.map((e) => (
              <EventCard key={e.id} event={e} showDate />
            ))
          )}
        </View>
      </ScrollView>

      <EventPopup
        visible={popupVisible}
        event={popupEvent}
        onClose={handleClosePopup}
      />
    </LinearGradient>
  );
}

function EventCard({
  event,
  showDate,
}: {
  event: FinancialEvent;
  showDate?: boolean;
}) {
  const isPositive = event.impact > 0;
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventIcon}>
        <Text style={styles.eventEmoji}>{event.emoji}</Text>
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleWrap}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
          </View>
          {event.isPremium && (
            <View style={styles.premiumTag}>
              <Text style={styles.premiumTagText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
        {showDate && (
          <Text style={styles.eventDate}>
            {formatDate(event.dateKey)}
          </Text>
        )}
      </View>
      <View style={styles.eventImpactWrap}>
        <Text
          style={[
            styles.eventImpact,
            isPositive ? styles.impactPositive : styles.impactNegative,
          ]}
          numberOfLines={1}
        >
          {isPositive ? '+' : ''}₱{event.impact}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  explanationBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  explanationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  explanationText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 22,
  },
  triggerButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  triggerGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.5)',
    borderRadius: 20,
  },
  triggerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  triggerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  triggerSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  limitNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eventEmoji: {
    fontSize: 24,
  },
  eventContent: {
    flex: 1,
    minWidth: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumTag: {
    backgroundColor: 'rgba(234,179,8,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  premiumTagText: {
    color: '#fde047',
    fontSize: 9,
    fontWeight: '700',
  },
  eventDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  eventDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
  },
  eventImpactWrap: {
    flexShrink: 0,
    marginLeft: 12,
  },
  eventImpact: {
    fontSize: 18,
    fontWeight: '700',
  },
  impactPositive: {
    color: '#4ade80',
  },
  impactNegative: {
    color: '#f87171',
  },
});
