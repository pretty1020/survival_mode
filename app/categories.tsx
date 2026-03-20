import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { budgetService } from '@/services/budgetService';
import { Category } from '@/types';

const EMOJI_PICKER = ['🍔', '🚌', '📄', '🛒', '📱', '🚨', '🎮', '☕', '🍱', '💰', '🏠', '✈️'];

export default function CategoriesScreen() {
  const router = useRouter();
  const { userData, setUserData } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('💰');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');

  if (!userData) return null;

  const categories = budgetService.getCategories(userData);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Oops', 'Enter a category name');
      return;
    }
    const newData = await budgetService.addCategory(userData, trimmed, newEmoji);
    setUserData(newData);
    setNewName('');
    setNewEmoji('💰');
    setModalVisible(false);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditEmoji(cat.emoji);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (!trimmed) return;
    const newData = await budgetService.updateCategory(userData, editingId, {
      name: trimmed,
      emoji: editEmoji,
    });
    setUserData(newData);
    setEditingId(null);
  };

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted.');
      return;
    }
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const newData = await budgetService.deleteCategory(userData, cat.id);
          setUserData(newData);
          setEditingId(null);
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Add, edit, or remove expense categories</Text>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.card}>
            {editingId === cat.id ? (
              <View style={styles.editRow}>
                <Pressable onPress={() => setEditEmoji(EMOJI_PICKER[(EMOJI_PICKER.indexOf(editEmoji) + 1) % EMOJI_PICKER.length])}>
                  <Text style={styles.emojiLarge}>{editEmoji}</Text>
                </Pressable>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Category name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoFocus
                />
                <Pressable style={styles.saveBtn} onPress={handleSaveEdit}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
                <Pressable style={styles.cancelBtn} onPress={() => setEditingId(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.row}>
                <Text style={styles.emoji}>{cat.emoji}</Text>
                <Text style={styles.name}>{cat.name}</Text>
                {!cat.isDefault && (
                  <>
                    <Pressable style={styles.actionBtn} onPress={() => handleEdit(cat)}>
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.actionBtn} onPress={() => handleDelete(cat)}>
                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </View>
        ))}
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Category</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>New Category</Text>
            <View style={styles.emojiRow}>
              {EMOJI_PICKER.map((e) => (
                <Pressable
                  key={e}
                  style={[styles.emojiOption, newEmoji === e && styles.emojiOptionActive]}
                  onPress={() => setNewEmoji(e)}
                >
                  <Text style={styles.emojiOptionText}>{e}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Category name"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleAdd}>
                <Text style={styles.modalSaveText}>Add</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 24, marginRight: 14 },
  name: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { color: '#3b82f6', fontSize: 14, fontWeight: '600' },
  deleteText: { color: '#f87171' },
  editRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  emojiLarge: { fontSize: 28, marginRight: 8 },
  editInput: {
    flex: 1,
    minWidth: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  saveBtn: { backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  cancelBtnText: { color: 'rgba(255,255,255,0.7)' },
  addButton: {
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(59,130,246,0.3)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.5)',
  },
  addButtonText: { color: '#60a5fa', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionActive: { backgroundColor: 'rgba(59,130,246,0.4)' },
  emojiOptionText: { fontSize: 22 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  modalCancelText: { color: '#fff', fontSize: 16 },
  modalSave: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#22c55e' },
  modalSaveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
