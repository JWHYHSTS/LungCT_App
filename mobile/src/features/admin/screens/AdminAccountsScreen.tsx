import React, { useMemo, useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Banner,
  EmptyState,
  FilterChip,
  IconButton,
  SearchField,
  StatusBadge,
  TopBar,
} from '../../../ui/components';
import { Icon } from '../../../ui/icons';
import {
  getAdminDoctors,
  subscribeAdminStore,
  type AdminDoctorAccount,
  type DoctorAccountStatus,
} from '../../../mocks/adminMocks';
import { useAuth } from '../../auth/context/AuthContext';

export interface AdminAccountsScreenProps {
  onNavigateToDetail: (accountId: string) => void;
}

type FilterKey = 'pending' | 'active' | 'locked' | 'all';

/**
 * SCR-M01 (09-admin-accounts): Màn hình Quản trị viên · Quản lý tài khoản.
 * - Ô tìm kiếm theo họ tên, email.
 * - Bộ lọc 4 chip: Chờ duyệt (mặc định), Hoạt động, Đã khóa, Tất cả.
 * - Thẻ danh sách hiển thị: avatar, họ tên, email, nơi công tác, ngày đăng ký, badge trạng thái.
 * - Trạng thái ngoại tuyến (offline): hiển thị Banner dữ liệu lưu trong phiên kèm thời điểm cập nhật.
 * - TUÂN THỦ BR-OWN-03: Tuyệt đối không tải hay hiển thị dữ liệu bệnh nhân/ca bệnh.
 */
export const AdminAccountsScreen: React.FC<AdminAccountsScreenProps> = ({ onNavigateToDetail }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { isOnline } = useAuth();

  const [doctors, setDoctors] = useState<AdminDoctorAccount[]>(getAdminDoctors);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsubscribe = subscribeAdminStore(() => {
      setDoctors(getAdminDoctors());
    });
    return unsubscribe;
  }, []);

  // Tính số lượng tài khoản theo từng trạng thái
  const counts = useMemo(() => {
    const pending = doctors.filter((d) => d.status === 'pending').length;
    const active = doctors.filter((d) => d.status === 'active').length;
    const locked = doctors.filter((d) => d.status === 'locked').length;
    return { pending, active, locked, all: doctors.length };
  }, [doctors]);

  // Lọc và tìm kiếm tài khoản bác sĩ
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // Bộ lọc trạng thái
      if (selectedFilter !== 'all' && doc.status !== selectedFilter) {
        return false;
      }
      // Tìm kiếm theo họ tên hoặc email
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = doc.fullName.toLowerCase().includes(q);
        const matchEmail = doc.email.toLowerCase().includes(q);
        return matchName || matchEmail;
      }
      return true;
    });
  }, [doctors, selectedFilter, searchQuery]);

  const getStatusBadge = (status: DoctorAccountStatus) => {
    switch (status) {
      case 'pending':
        return (
          <StatusBadge
            label={t('admin.status_pending', 'Chờ duyệt')}
            tone="warning"
            icon="pending"
          />
        );
      case 'active':
        return (
          <StatusBadge
            label={t('admin.status_active', 'Hoạt động')}
            tone="success"
            icon="success"
          />
        );
      case 'locked':
        return (
          <StatusBadge label={t('admin.status_locked', 'Đã khóa')} tone="danger" icon="lock" />
        );
    }
  };

  const renderItem = ({ item }: { item: AdminDoctorAccount }) => (
    <Pressable
      style={({ pressed }) => [
        styles.accountCard,
        {
          backgroundColor: colors.bg.surface,
          borderColor: colors.border.default,
          borderRadius: radius.lg,
          padding: spacing.md,
          marginBottom: spacing.xs,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.fullName}, ${item.status}`}
      onPress={() => onNavigateToDetail(item.id)}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.avatarWrapper}>
          <Icon name="profile" size={32} color={colors.brand.primary} />
        </View>
        <View style={styles.accountInfo}>
          <AppText variant="titleS" style={{ color: colors.text.primary }}>
            {item.fullName}
          </AppText>
          <AppText variant="bodyS" color={colors.text.secondary} style={{ marginTop: 2 }}>
            {item.email}
          </AppText>
        </View>
        <View>{getStatusBadge(item.status)}</View>
      </View>

      <View style={[styles.metaRow, { marginTop: spacing.sm }]}>
        <AppText variant="caption" color={colors.text.secondary}>
          {item.workplace} · {item.specialty}
        </AppText>
      </View>

      <View style={[styles.metaRow, { marginTop: 2 }]}>
        <AppText variant="caption" color={colors.text.tertiary}>
          {t('admin.registered_at', {
            time: item.registeredAt,
            defaultValue: `Đăng ký: ${item.registeredAt}`,
          })}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('admin.accounts_title', 'Quản lý tài khoản')}
        type="root"
        rightActions={
          <IconButton
            name="notifications"
            accessibilityLabel={t('admin.notifications', 'Thông báo')}
            onPress={() => {}}
          />
        }
      />

      {/* Banner cảnh báo ngoại tuyến (Q-22) */}
      {!isOnline && (
        <View style={{ marginHorizontal: spacing.md, marginTop: spacing.xs }}>
          <Banner
            type="warning"
            title={t('admin.offline_banner_title', 'Đang ngoại tuyến — Dữ liệu lưu trong phiên')}
            body={t(
              'admin.offline_banner_body',
              'Dữ liệu được cập nhật lúc 09:41. Các thao tác duyệt và khóa tài khoản tạm thời bị vô hiệu hóa khi không có kết nối mạng (Q-22).',
            )}
          />
        </View>
      )}

      {/* Thanh tìm kiếm và bộ lọc chip */}
      <View style={[styles.searchBox, { paddingHorizontal: spacing.md, paddingTop: spacing.xs }]}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('admin.search_placeholder', 'Tìm theo họ tên, email')}
          onClear={() => setSearchQuery('')}
        />

        <View style={[styles.chipGroup, { marginTop: spacing.xs }]}>
          <FilterChip
            label={`${t('admin.filter_pending', 'Chờ duyệt')} (${counts.pending})`}
            selected={selectedFilter === 'pending'}
            onPress={() => setSelectedFilter('pending')}
          />
          <FilterChip
            label={`${t('admin.filter_active', 'Hoạt động')} (${counts.active})`}
            selected={selectedFilter === 'active'}
            onPress={() => setSelectedFilter('active')}
          />
          <FilterChip
            label={`${t('admin.filter_locked', 'Đã khóa')} (${counts.locked})`}
            selected={selectedFilter === 'locked'}
            onPress={() => setSelectedFilter('locked')}
          />
          <FilterChip
            label={`${t('admin.filter_all', 'Tất cả')} (${counts.all})`}
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
          />
        </View>
      </View>

      {/* Danh sách tài khoản bác sĩ */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyWrapper, { padding: spacing.xl }]}>
            <EmptyState
              title={t('admin.empty_accounts_title', 'Không tìm thấy tài khoản bác sĩ nào')}
              body={t(
                'admin.empty_accounts_body',
                'Thử tìm kiếm với từ khóa khác hoặc chuyển sang bộ lọc khác.',
              )}
              type="noData"
            />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBox: {
    paddingBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
  accountCard: {
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
});
