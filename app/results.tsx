import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { UpgradeCard } from '@/components/UpgradeCard';
import { BADGES } from '@/constants/badges';

export default function ResultsScreen() {
  const router = useRouter();
  const { userData, isPremium } = useApp();

  if (!userData) return null;

  const currentBadge = BADGES.filter((b) => userData.badges.includes(b.id)).pop();
  const badgeName = currentBadge?.name ?? 'Budget Newbie';
  const badgeEmoji = currentBadge?.emoji ?? '🌱';

  const getSummaryText = () => {
    if (userData.daysSurvived >= 30) return "You're a legend. 30+ days survived! 🏆";
    if (userData.daysSurvived >= 14) return "Two weeks strong! Wallet Defender energy! ⚔️";
    if (userData.daysSurvived >= 7) return "One week survivor! You're built different. 💪";
    if (userData.daysSurvived >= 3) return "Tipid Warrior in the making! Keep going! 🔥";
    return "Every day counts. You survived today! 😮‍💨";
  };

  const shareResult = async () => {
    try {
      await Share.share({
        message: `I survived ${userData.daysSurvived} days on a ₱${userData.budgetSettings.dailyBudget}/day budget. Can you beat me? 🔥\n\n#SurvivalModeBudget #BudgetChallenge`,
        title: 'Survival Mode Budget Challenge',
      });
    } catch (e) {
      Alert.alert('Share', 'Sharing is not available');
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a', '#1e1b4b']} style={styles.gradient}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultCard}>
          <LinearGradient
            colors={['#1e3a5f', '#0f172a', '#1e293b']}
            style={styles.resultGradient}
          >
            <Text style={styles.resultEmoji}>{badgeEmoji}</Text>
            <Text style={styles.resultTitle}>You survived!</Text>
            <Text style={styles.resultSubtitle}>{getSummaryText()}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{userData.daysSurvived}</Text>
                <Text style={styles.resultStatLabel}>Days Survived</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>🔥 {userData.currentStreak}</Text>
                <Text style={styles.resultStatLabel}>Current Streak</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>🏆 {userData.bestStreak}</Text>
                <Text style={styles.resultStatLabel}>Best Streak</Text>
              </View>
            </View>

            <View style={styles.badgeSection}>
              <Text style={styles.badgeLabel}>Badge Unlocked</Text>
              <View style={styles.badgeDisplay}>
                <Text style={styles.badgeEmoji}>{badgeEmoji}</Text>
                <Text style={styles.badgeName}>{badgeName}</Text>
              </View>
            </View>

            <Text style={styles.challengeText}>
              I survived {userData.daysSurvived} days on a ₱{userData.budgetSettings.dailyBudget}/day budget.
              Can you beat me?
            </Text>
          </LinearGradient>
        </View>

        <Pressable style={styles.shareButton} onPress={shareResult}>
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.shareGradient}
          >
            <Text style={styles.shareText}>Share Results</Text>
          </LinearGradient>
        </Pressable>

        {!isPremium && (
          <>
            <Text style={styles.premiumNote}>
              Unlock extra result themes & styles with Lifetime Access
            </Text>
            <UpgradeCard />
          </>
        )}

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
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
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  resultGradient: {
    padding: 28,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  resultStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  resultStatValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  resultStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  badgeSection: {
    marginBottom: 20,
  },
  badgeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 8,
  },
  badgeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234,179,8,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    color: '#fde047',
    fontSize: 18,
    fontWeight: '700',
  },
  challengeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  shareButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  shareGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  shareText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  premiumNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 12,
  },
  homeButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
});
