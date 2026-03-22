import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { budgetService } from '@/services/budgetService';

const QUICK_AMOUNTS = [20, 50, 100, 150, 200, 500];

export default function AddExpenseScreen() {
  const router = useRouter();
  const { userData, setUserData, isLoading } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  if (isLoading || !userData) {
    return (
      <LinearGradient colors={['#0a0a0f', '#0f172a']} style={styles.gradient}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  const categories = budgetService.getCategories(userData);
  const selectedCategory = category || categories[0]?.name || 'Food';

  const handleAdd = async () => {
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Oops', 'Please enter a valid amount');
      return;
    }
    const cat = categories.find((c) => c.name === selectedCategory);
    const newData = await budgetService.addExpense(userData, {
      amount: numAmount,
      category: selectedCategory,
      note: note.trim() || undefined,
      emoji: cat?.emoji,
    });
    setUserData(newData);
    router.back();
  };

  const addQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.amountSection}>
            <Text style={styles.label}>Amount (₱)</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>Quick add</Text>
            <View style={styles.quickGrid}>
              {QUICK_AMOUNTS.map((val) => (
                <Pressable key={val} style={styles.quickButton} onPress={() => addQuickAmount(val)}>
                  <Text style={styles.quickText}>+{val}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.categoryButton, selectedCategory === c.name && styles.categoryButtonActive]}
                  onPress={() => setCategory(c.name)}
                >
                  <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                  <Text style={[styles.categoryLabel, selectedCategory === c.name && styles.categoryLabelActive]}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.manageCategories} onPress={() => router.push('/categories')}>
              <Text style={styles.manageCategoriesText}>Manage Categories →</Text>
            </Pressable>
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Lunch at Jollibee"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          <Pressable style={styles.submitButton} onPress={handleAdd}>
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.submitGradient}>
              <Text style={styles.submitText}>Add Expense</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  amountSection: { marginBottom: 24 },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  amountInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickSection: { marginBottom: 28 },
  quickLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  quickText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  categorySection: { marginBottom: 24 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(34,197,94,0.3)',
    borderColor: 'rgba(34,197,94,0.5)',
  },
  categoryEmoji: { fontSize: 18, marginRight: 8 },
  categoryLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  categoryLabelActive: { color: '#4ade80', fontWeight: '600' },
  manageCategories: { marginTop: 12 },
  manageCategoriesText: { color: '#3b82f6', fontSize: 14, fontWeight: '600' },
  noteSection: { marginBottom: 32 },
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  submitButton: { borderRadius: 16, overflow: 'hidden' },
  submitGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: 16 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
