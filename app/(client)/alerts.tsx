// OdontoSync — Client: Alerts & Care Tips (Stitch: 09ab092e)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Bell, Heart, CheckCheck } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function AlertsScreen() {
  const { notifications, careTips, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotificationStore();
  const { tab } = useLocalSearchParams<{ tab?: 'notifications' | 'tips' }>();
  const [activeTab, setActiveTab] = useState<'notifications' | 'tips'>('notifications');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications().catch(console.error);
    }, [])
  );

  useEffect(() => {
    if (tab === 'notifications' || tab === 'tips') {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleNotificationPress = (n: any) => {
    markAsRead(n.id);
    setSelectedNotification(n);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Alertas</Text>
        {activeTab === 'notifications' && unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={s.markAll}>
            <CheckCheck size={18} color={colors.primary} />
            <Text style={s.markAllTxt}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, activeTab === 'notifications' && s.tabActive]} onPress={() => setActiveTab('notifications')}>
          <Bell size={16} color={activeTab === 'notifications' ? colors.onPrimary : colors.onSurfaceVariant} />
          <Text style={[s.tabTxt, activeTab === 'notifications' && s.tabTxtActive]}>Notificações</Text>
          {unreadCount > 0 && <View style={s.badge}><Text style={s.badgeTxt}>{unreadCount}</Text></View>}
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'tips' && s.tabActive]} onPress={() => setActiveTab('tips')}>
          <Heart size={16} color={activeTab === 'tips' ? colors.onPrimary : colors.onSurfaceVariant} />
          <Text style={[s.tabTxt, activeTab === 'tips' && s.tabTxtActive]}>Dicas de Cuidados</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {activeTab === 'notifications' ? (
          notifications.length > 0 ? notifications.map((n) => (
            <TouchableOpacity key={n.id} onPress={() => handleNotificationPress(n)} activeOpacity={0.8}>
              <Card style={[s.nCard, { borderLeftColor: n.read ? 'transparent' : colors.primary }]} padding="md">
                <View style={s.nRow}>
                  <View style={[s.nIcon, { backgroundColor: n.read ? colors.surfaceContainerHigh : colors.primaryFixed + '40' }]}>
                    <Bell size={18} color={n.read ? colors.outline : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.nTitle}>{n.title}</Text>
                    <Text style={s.nMsg} numberOfLines={2}>{n.message}</Text>
                    <Text style={s.nTime}>{new Date(n.createdAt).toLocaleDateString('pt-BR')}</Text>
                  </View>
                  {!n.read && <View style={s.unreadDot} />}
                </View>
              </Card>
            </TouchableOpacity>
          )) : (
            <View style={s.empty}><Text style={s.emptyTxt}>Nenhuma notificação</Text></View>
          )
        ) : (
          careTips.map((tip) => (
            <Card key={tip.id} style={s.tipCard} padding="md">
              <View style={s.tipCat}><Text style={s.tipCatTxt}>{tip.category}</Text></View>
              <Text style={s.tipTitle}>{tip.title}</Text>
              <Text style={s.tipDesc}>{tip.description}</Text>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Elegant Notification Details Modal */}
      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <View style={s.modalIconContainer}>
                <Bell size={24} color={colors.primary} />
              </View>
              <Text style={s.modalTitle}>{selectedNotification?.title}</Text>
            </View>
            <ScrollView style={s.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={s.modalMsg}>{selectedNotification?.message}</Text>
              <Text style={s.modalTime}>
                Enviado em:{' '}
                {selectedNotification &&
                  new Date(selectedNotification.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={s.modalBtn}
              onPress={() => setSelectedNotification(null)}
            >
              <Text style={s.modalBtnTxt}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.md },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface },
  markAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markAllTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.primary, fontWeight: '500' },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.lg, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.surfaceContainerLow },
  tabActive: { backgroundColor: colors.primary },
  tabTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.onSurfaceVariant, fontWeight: '500' },
  tabTxtActive: { color: colors.onPrimary },
  badge: { backgroundColor: colors.error, borderRadius: 8, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeTxt: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: 12 },
  nCard: { marginBottom: 0, borderLeftWidth: 3 },
  nRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  nIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  nTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleSm, fontWeight: '600', color: colors.onSurface, marginBottom: 2 },
  nMsg: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, lineHeight: 18 },
  nTime: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: spacing['2xl'] },
  emptyTxt: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.outline },
  tipCard: { marginBottom: 0 },
  tipCat: { backgroundColor: colors.primaryFixed + '40', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  tipCatTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.primary, fontWeight: '600' },
  tipTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '600', color: colors.onSurface, marginBottom: 4 },
  tipDesc: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant, lineHeight: 22 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  modalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryFixed + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.titleMd,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
  },
  modalContent: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  modalMsg: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    textAlign: 'center',
  },
  modalTime: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.outline,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
