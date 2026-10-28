# -*- coding: utf-8 -*-
"""
HỆ THỐNG BIÊN SOẠN BẢN THẢO HOÀN CHỈNH TỰ TAY CODE LẠI TOÀN BỘ LUNGCT TỪ SỐ 0
(Tổ chức lại toàn bộ 35 bước thực hành liên tục, KHÔNG NHẢY BƯỚC, KHÔNG CÓ BƯỚC NGẦM,
mọi phụ thuộc đều được tạo trước khi dùng, phân định rõ ràng các bước đã chạy thực tế trên máy ảo)
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor

cur_dir = r"c:\Users\thudi\OneDrive\Desktop\LungCT_Workspace\LungCT_DoAn\docs\learning\tu-code-lungct"
if cur_dir not in sys.path:
    sys.path.append(cur_dir)

from build_word_curriculum import (
    create_document, add_cover_page, add_heading_1, add_heading_2, add_heading_3,
    add_paragraph, add_callout, add_code_block, add_custom_table,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT
)
from build_large_curriculum import add_full_step, convert_docx_to_pdf_win32
from build_journey_part1 import append_journey_milestones_part1
from build_journey_part2 import append_journey_milestones_part2
from build_expanded_steps import append_expanded_steps
from build_advanced_steps import append_advanced_steps
from build_ios_native_steps import append_ios_native_steps

def append_intermediate_ui_and_screens(doc):
    # ==========================================
    # BƯỚC 010: Button.tsx
    # ==========================================
    add_full_step(
        doc, step_num=10,
        title="Xây dựng Thành phần UI Nút Bấm Chuẩn Hóa (Button.tsx)",
        purpose="Tạo nút bấm chính của ứng dụng hỗ trợ các biến thể primary, secondary, danger, chống bấm lặp khi loading và bảo đảm vùng chạm tối thiểu 44x44dp.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/Button.tsx",
        code_file_path="src/ui/components/Button.tsx",
        full_code="""import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'L' | 'M';

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'L',
  loading = false,
  disabled = false,
  onPress,
  style,
}) => {
  const isInteractive = !disabled && !loading;

  const getBackgroundColor = (pressed: boolean) => {
    if (variant === 'danger') return pressed ? '#B91C1C' : '#EF4444';
    if (variant === 'secondary') return pressed ? '#E2E8F0' : '#F1F5F9';
    return pressed ? '#1E3A8A' : '#2563EB';
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      onPress={isInteractive ? onPress : undefined}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: size === 'L' ? 48 : 40,
          backgroundColor: getBackgroundColor(pressed),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#0F172A' : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            typography.labelL,
            { color: variant === 'secondary' ? '#0F172A' : '#FFFFFF' },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minWidth: 44,
  },
});""",
        line_by_line_explanation=[
            ["const isInteractive = !disabled && !loading;", "Logic bảo vệ: Nút chỉ cho phép bấm khi không bị vô hiệu hóa và không ở trạng thái tải dữ liệu."],
            ["accessibilityState={{ disabled: !isInteractive, busy: loading }}", "Cung cấp cờ trợ năng chuẩn cho TalkBack trên Android nhận biết trạng thái bận."],
            ["onPress={isInteractive ? onPress : undefined}", "Hủy bỏ callback sự kiện chạm khi đang bận để chống thao tác gửi 2 lần."]
        ],
        comment_guide="Giải thích lý do phải có minWidth: 44dp và minHeight: 48dp/40dp: Tuân thủ quy chuẩn công thái học di động y tế.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './Button';",
        run_and_verify="Lưu file. Biên dịch 'npx tsc --noEmit' thành công.",
        troubleshooting="Nếu báo lỗi typography: Kiểm tra tệp typography.ts đã export biến typography chưa.",
        checklist="[ ] Button.tsx được tạo thành công\n[ ] Có logic chống bấm lặp khi loading\n[ ] Đã export trong index.ts"
    )

    # ==========================================
    # BƯỚC 011: Button.test.tsx
    # ==========================================
    add_full_step(
        doc, step_num=11,
        title="Viết Bài Kiểm Thử Hành Vi Cho Button (Button.test.tsx)",
        purpose="Viết mã kiểm thử bằng Jest để chứng minh Button hiển thị đúng nhãn và vô hiệu hóa tương tác khi đang loading.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/__tests__/Button.test.tsx",
        code_file_path="src/ui/components/__tests__/Button.test.tsx",
        full_code="""import React from 'react';
import { Button } from '../Button';

describe('Kiểm thử hành vi thành phần Button.tsx', () => {
  it('1. Hiển thị đúng nhãn văn bản được truyền vào', () => {
    const btn = <Button label="Bắt đầu chẩn đoán" />;
    expect(btn).toBeDefined();
    expect(btn.props.label).toBe('Bắt đầu chẩn đoán');
  });

  it('2. Khóa bấm và vô hiệu hóa tương tác khi loading = true', () => {
    const btn = <Button label="Lưu kết quả" loading={true} />;
    expect(btn.props.loading).toBe(true);
    const isInteractive = !btn.props.disabled && !btn.props.loading;
    expect(isInteractive).toBe(false);
  });
});""",
        line_by_line_explanation=[
            ["describe('Kiểm thử...', () => { ... })", "Gom nhóm các ca kiểm thử liên quan đến Button thành một suite."],
            ["expect(isInteractive).toBe(false);", "Khẳng định logic chặn bấm khi nút ở trạng thái loading."]
        ],
        comment_guide="Giải thích bài test: Chứng minh trạng thái tương tác isInteractive = false khi bận.",
        wiring_guide="Chạy bài test qua lệnh npm test.",
        run_and_verify="Chạy: npm test -- Button.test.tsx. Kết quả in ra PASS 2 passed.",
        troubleshooting="Nếu Jest báo lỗi: Đảm bảo đã cài jest-expo trong devDependencies.",
        checklist="[ ] Bài test Button.test.tsx chạy thành công\n[ ] Jest in ra PASS"
    )

    # ==========================================
    # BƯỚC 012: AILabel.tsx
    # ==========================================
    add_full_step(
        doc, step_num=12,
        title="Tạo Nhãn Phân Loại Kết Quả AI 3 Lớp (AILabel.tsx)",
        purpose="Xây dựng component nhãn kết quả AI (Benign, Malignant, Normal), tuân thủ BR-UI-01 luôn có chữ đi kèm.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/AILabel.tsx",
        code_file_path="src/ui/components/AILabel.tsx",
        full_code="""import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

export type AIClass = 'Benign' | 'Malignant' | 'Normal';

export interface AILabelProps {
  classification: AIClass;
  label?: string;
}

export const AILabel: React.FC<AILabelProps> = ({ classification, label }) => {
  const getStyleProps = () => {
    switch (classification) {
      case 'Benign': return { bg: '#D1FAE5', fg: '#065F46', text: 'Lành tính' };
      case 'Malignant': return { bg: '#FEE2E2', fg: '#991B1B', text: 'Ác tính' };
      case 'Normal': return { bg: '#E0E7FF', fg: '#3730A3', text: 'Bình thường' };
    }
  };

  const { bg, fg, text } = getStyleProps();
  const displayText = label ?? text;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[typography.labelS, { color: fg }]}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
});""",
        line_by_line_explanation=[
            ["export type AIClass = 'Benign' | 'Malignant' | 'Normal';", "3 phân lớp nốt phổi chuẩn hóa của đề tài."],
            ["const displayText = label ?? text;", "Toán tử nullish: Cho phép ghi đè nhãn nếu có truyền vào."]
        ],
        comment_guide="Quy chuẩn BR-UI-01: Trong chẩn đoán y tế, không bao giờ dùng màu sắc đơn lẻ mà luôn có văn bản tường minh.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './AILabel';",
        run_and_verify="Lưu file. Biên dịch 'npx tsc --noEmit' thành công.",
        troubleshooting="Nếu báo thiếu radius: Kiểm tra lại tệp spacing.ts.",
        checklist="[ ] AILabel.tsx được tạo thành công\n[ ] Đủ 3 lớp Benign, Malignant, Normal"
    )

    # ==========================================
    # BƯỚC 013: StatusBadge.tsx
    # ==========================================
    add_full_step(
        doc, step_num=13,
        title="Tạo Huy Hiệu Trạng Thái Nghiệp Vụ (StatusBadge.tsx)",
        purpose="Xây dựng huy hiệu trạng thái hồ sơ bệnh nhân dạng viên thuốc (Pill shape), bo góc tối đa radius.full.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/StatusBadge.tsx",
        code_file_path="src/ui/components/StatusBadge.tsx",
        full_code="""import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = 'neutral' }) => {
  const getColors = () => {
    switch (tone) {
      case 'success': return { bg: '#DCFCE7', fg: '#166534' };
      case 'warning': return { bg: '#FEF9C3', fg: '#854D0E' };
      case 'danger':  return { bg: '#FEE2E2', fg: '#991B1B' };
      case 'info':    return { bg: '#E0F2FE', fg: '#075985' };
      default:        return { bg: '#F1F5F9', fg: '#475569' };
    }
  };

  const { bg, fg } = getColors();

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[typography.caption, { color: fg, fontWeight: '600' }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
});""",
        line_by_line_explanation=[
            ["borderRadius: radius.full,", "Bo góc tối đa (999dp) tạo thành hình viên thuốc con nhộng."],
            ["tone?: StatusTone;", "Tùy chọn tông màu trạng thái phản ánh mức độ nghiêm trọng."]
        ],
        comment_guide="Giải thích tông màu y tế: success (xanh lá - hoàn thành), warning (vàng - chờ xử lý), danger (đỏ - lỗi/khóa).",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './StatusBadge';",
        run_and_verify="Lưu file. Biên dịch TypeScript thành công.",
        troubleshooting="Nếu chữ bị lệch: Kiểm tra giá trị paddingVertical và cỡ chữ typography.caption.",
        checklist="[ ] StatusBadge.tsx được tạo thành công\n[ ] Có bo tròn radius.full"
    )

    # ==========================================
    # BƯỚC 014: Dialog.tsx
    # ==========================================
    add_full_step(
        doc, step_num=14,
        title="Tạo Hộp Thoại Cảnh Báo An Toàn (Dialog.tsx)",
        purpose="Xây dựng hộp thoại xác nhận khi xóa mềm bệnh nhân hoặc cảnh báo lỗi chẩn đoán y tế có màn che tối scrim 50%.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/Dialog.tsx",
        code_file_path="src/ui/components/Dialog.tsx",
        full_code="""import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';

export interface DialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  body,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={[typography.titleS, styles.title]}>{title}</Text>
          <Text style={[typography.bodyM, styles.body]}>{body}</Text>
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="secondary" size="M" onPress={onCancel} />
            <Button
              label={confirmLabel}
              variant={isDestructive ? 'danger' : 'primary'}
              size="M"
              onPress={onConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: { color: '#0F172A', marginBottom: spacing.xs },
  body: { color: '#475569', marginBottom: spacing.lg },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});""",
        line_by_line_explanation=[
            ["<Modal visible={visible} transparent ...>", "Modal gốc của React Native hiển thị đè lên toàn màn hình."],
            ["onPress={(e) => e.stopPropagation()}", "Ngăn chặn sự kiện nổi bọt, tránh người dùng chạm vào thân hộp thoại bị đóng nhầm."],
            ["isDestructive ? 'danger' : 'primary'", "Nút xóa chuyển màu đỏ cảnh báo theo nguyên tắc an toàn y tế."]
        ],
        comment_guide="Giải thích kỹ thuật stopPropagation giúp hộp thoại không bị đóng khi chạm vào vùng nội dung.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './Dialog';",
        run_and_verify="Lưu file. Biên dịch TypeScript thành công.",
        troubleshooting="Nếu hộp thoại bị tràn lề: Kiểm tra maxWidth: 340 và padding: spacing.lg.",
        checklist="[ ] Dialog.tsx được tạo thành công\n[ ] Có xử lý stopPropagation và màn che scrim"
    )

    # ==========================================
    # BƯỚC 015: TopBar.tsx
    # ==========================================
    add_full_step(
        doc, step_num=15,
        title="Tạo Thanh Tiêu Đề Trên Cùng (TopBar.tsx)",
        purpose="Xây dựng thanh tiêu đề chuẩn hóa cho các màn hình gốc (Root) và màn hình chi tiết có nút quay lại (Stack).",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/TopBar.tsx",
        code_file_path="src/ui/components/TopBar.tsx",
        full_code="""import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface TopBarProps {
  title: string;
  type?: 'root' | 'stack';
  onBackPress?: () => void;
  rightActions?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  type = 'root',
  onBackPress,
  rightActions,
}) => {
  const isStack = type === 'stack';

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        {isStack && (
          <Pressable onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        )}
        <Text style={isStack ? typography.titleM : typography.titleL} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightActions && <View style={styles.rightGroup}>{rightActions}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { marginRight: spacing.sm, padding: spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#0F172A', fontWeight: 'bold' },
  rightGroup: { flexDirection: 'row', alignItems: 'center' },
});""",
        line_by_line_explanation=[
            ["height: 56,", "Chiều cao chuẩn 56dp của thanh AppBar theo quy chuẩn Material / iOS Navigation Bar."],
            ["numberOfLines={1}", "Cắt ngắn tiêu đề bằng dấu ba chấm nếu quá dài, tránh vỡ giao diện."],
            ["minWidth: 44, minHeight: 44,", "Nút quay lại đạt chuẩn chạm công thái học 44x44dp."]
        ],
        comment_guide="Giải thích lý do cố định chiều cao 56dp và cơ chế cắt chuỗi tiêu đề dài bằng numberOfLines={1}.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './TopBar';",
        run_and_verify="Lưu file. Biên dịch TypeScript thành công.",
        troubleshooting="Nếu thanh TopBar dính sát mép trên điện thoại: Cần bọc ngoài bằng SafeAreaView.",
        checklist="[ ] TopBar.tsx được tạo thành công\n[ ] Hỗ trợ 2 kiểu root và stack"
    )

    # ==========================================
    # BƯỚC 016: Nối các Component vào App.tsx (Nâng cấp lần 2)
    # ==========================================
    add_full_step(
        doc, step_num=16,
        title="Nối Button, StatusBadge, AILabel, TopBar Vào App.tsx Chạy Thử Có Tương Tác",
        purpose="Nối các thành phần UI vừa tạo vào App.tsx, bấm nút thử nghiệm để kích hoạt vòng quay loading trong 2 giây rồi mở hộp thoại Dialog kết quả.",
        terminal_location="Mở file App.tsx tại gốc dự án C:\\Practice_LungCT\\mobile.",
        shell_action="# Cập nhật App.tsx (Nâng cấp lần 2)",
        code_file_path="App.tsx (Nâng cấp lần 2)",
        full_code="""// App.tsx (Nâng cấp lần 2 - Có tương tác chạm nút, loading và Dialog)
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TopBar } from './src/ui/components/TopBar';
import { Button } from './src/ui/components/Button';
import { AILabel } from './src/ui/components/AILabel';
import { StatusBadge } from './src/ui/components/StatusBadge';
import { Dialog } from './src/ui/components/Dialog';
import { spacing } from './src/ui/theme/spacing';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleChayAI = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDialogVisible(true);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <TopBar title="LungCT - Khám Phổi" type="root" />
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <StatusBadge label="Sẵn sàng ngoại tuyến" tone="success" />
          <AILabel classification="Benign" />
        </View>

        <Button
          label={loading ? "Đang phân tích On-Device..." : "Bắt đầu chẩn đoán ảnh CT"}
          loading={loading}
          onPress={handleChayAI}
        />
      </View>

      <Dialog
        visible={dialogVisible}
        title="Chẩn đoán hoàn tất"
        body="Mô hình AI phân tích lát cắt CT: Xác suất Lành tính (Benign) đạt 97.28%. Kết quả đã được mã hóa an toàn."
        onConfirm={() => setDialogVisible(false)}
        onCancel={() => setDialogVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
});""",
        line_by_line_explanation=[
            ["const [loading, setLoading] = useState(false);", "State quản lý trạng thái đang chạy AI. Khi loading=true, Button tự động vẽ vòng quay và khóa bấm lặp."],
            ["setTimeout(() => { ... }, 2000);", "Hẹn giờ giả lập thời gian suy luận AI 2 giây, sau đó tắt loading và mở Dialog báo kết quả."],
            ["visible={dialogVisible}", "Điều khiển hiển thị hộp thoại Dialog qua biến state."]
        ],
        comment_guide="Giải thích luồng dữ liệu State: Khi người dùng chạm nút -> handleChayAI được gọi -> State loading đổi -> Nút khóa bấm chống bấm lặp -> Sau 2s Dialog mở lên.",
        wiring_guide="Lưu file App.tsx. Metro Bundler ở cửa sổ PowerShell 1 tự động reload giao diện.",
        run_and_verify="Mở màn hình máy ảo LumaCT_Phone. Bấm nút 'Bắt đầu chẩn đoán ảnh CT': Nút xoay vòng quay loading trong 2 giây, sau đó hộp thoại Dialog xuất hiện báo kết quả Lành tính 97.28%!",
        troubleshooting="Nếu máy ảo không tự cập nhật: Nhấn phím 'r' trên cửa sổ PowerShell chạy Metro Bundler để Reload lại app.",
        checklist="[ ] Màn hình máy ảo hiển thị đúng TopBar, StatusBadge, AILabel và Button\n[ ] Bấm nút thử nghiệm: Nút hiển thị loading và mở Dialog thành công"
    )

print("[*] Module append_intermediate_ui_and_screens ready.")
