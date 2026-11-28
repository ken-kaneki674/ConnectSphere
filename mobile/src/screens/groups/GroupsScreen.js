import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/Header';
import { GroupCard } from '../../components/GroupCard';
import { api } from '../../services/api';

export const GroupsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'my'

  const loadGroups = useCallback(async () => {
    try {
      const data = await api.getGroups();
      setGroups(data || []);
    } catch (e) {
      console.log('Error loading groups', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups])
  );

  const handleJoinToggle = async (group) => {
    const updated = await api.toggleJoinGroup(group.id, group.is_member);
    if (updated) {
      setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
    }
  };

  const displayedGroups = groups.filter((g) => {
    if (filter === 'my') return g.is_member;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => navigation.navigate('CreateGroup', { onGroupCreated: loadGroups }),
        }}
      />

      {/* Title & Filter Tabs */}
      <View style={styles.topSection}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: theme.colors.text }]}>Groupes</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateGroup', { onGroupCreated: loadGroups })}
            style={[styles.newBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="add" size={16} color="#FFF" />
            <Text style={styles.newBtnText}>Créer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterTabs}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[styles.tab, filter === 'all' && { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[
                styles.tabText,
                { color: filter === 'all' ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              Tous ({groups.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('my')}
            style={[styles.tab, filter === 'my' && { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[
                styles.tabText,
                { color: filter === 'my' ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              Mes groupes ({groups.filter((g) => g.is_member).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedGroups}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadGroups();
              }}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => navigation.navigate('GroupDetail', { group: item, onUpdate: loadGroups })}
              onJoinToggle={() => handleJoinToggle(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {filter === 'my'
                  ? "Vous n'avez rejoint aucun groupe pour le moment."
                  : 'Aucun groupe disponible.'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  screenTitle: { fontSize: 22, fontWeight: '800' },
  newBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  newBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  filterTabs: { flexDirection: 'row', gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 14, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
