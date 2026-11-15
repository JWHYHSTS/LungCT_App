import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PdfReportService } from '../pdfReportService';
import { ClinicalReportData } from '../types';

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
  printAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

describe('PDF-01: PdfReportService Unit Tests', () => {
  const sampleData: ClinicalReportData = {
    caseCode: 'CA-2026-9901',
    patientName: 'Trần Văn An',
    patientId: 'BN-1002',
    patientDob: '15/08/1975',
    patientGender: 'Nam',
    patientPhone: '0903123456',
    insuranceCode: 'DN4791234567890',
    captureDate: '12/11/2026',
    doctorName: 'BS. CKII Dương Hải Đăng',
    hospitalName: 'Bệnh viện Phạm Ngọc Thạch',
    departmentName: 'Khoa Chẩn đoán Hình ảnh',
    notes: 'Bệnh nhân ho kéo dài 3 tuần, tiền sử hút thuốc lá 20 năm.',
    conclusion: 'Nốt mờ thùy trên phổi phải kích thước 8mm, bờ không đều.',
    aiPrediction: {
      predictedClass: 'Malignant',
      confidence: 0.942,
      scores: {
        benign: 0.045,
        malignant: 0.942,
        normal: 0.013,
      },
      latencyMs: 142,
      modelName: 'Adaptive AACNN-ViT FP32',
    },
    slices: [
      {
        id: 'slice-01',
        label: 'Lát cắt Axial #45',
        imageUri: 'file:///data/user/0/com.anonymous.mobile/files/slice_45.png',
        hasGradCam: true,
        gradCamUri: 'file:///data/user/0/com.anonymous.mobile/files/gradcam_45.png',
      },
    ],
    language: 'vi',
    includeGradCam: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. generateHtmlReport (Tiếng Việt) tạo đầy đủ thông tin bệnh nhân, AI scores và miễn trừ trách nhiệm', () => {
    const html = PdfReportService.generateHtmlReport(sampleData);

    expect(html).toContain('PHIẾU KẾT QUẢ CHẨN ĐOÁN HÌNH ẢNH CT PHỔI');
    expect(html).toContain('CA-2026-9901');
    expect(html).toContain('Trần Văn An');
    expect(html).toContain('BS. CKII Dương Hải Đăng');
    expect(html).toContain('ADAPTIVE AACNN-ViT');
    expect(html).toContain('Nguy cơ Ác tính (Malignant)');
    expect(html).toContain('94.20%');
    expect(html).toContain('LƯU Ý PHÁP LÝ & Y KHOA:');
    expect(html).toContain('slice_45.png');
    expect(html).toContain('gradcam_45.png');
  });

  test('2. generateHtmlReport (English) sinh đúng thuật ngữ y khoa song ngữ', () => {
    const enData: ClinicalReportData = {
      ...sampleData,
      language: 'en',
    };
    const html = PdfReportService.generateHtmlReport(enData);

    expect(html).toContain('LUNG CT SCAN DIAGNOSTIC REPORT');
    expect(html).toContain('Reporting Physician');
    expect(html).toContain('Malignant Risk');
    expect(html).toContain('MEDICAL & LEGAL DISCLAIMER:');
  });

  test('3. exportCasePdf gọi Print.printToFileAsync và trả về kết quả tệp PDF vật lý', async () => {
    (Print.printToFileAsync as jest.Mock).mockResolvedValueOnce({
      uri: 'file:///data/user/0/com.anonymous.mobile/cache/BaoCao_CT_CA-2026-9901_vi.pdf',
      numberOfPages: 1,
    });

    const result = await PdfReportService.exportCasePdf(sampleData);

    expect(Print.printToFileAsync).toHaveBeenCalledTimes(1);
    expect(result.fileName).toBe('BaoCao_CT_CA-2026-9901_vi.pdf');
    expect(result.fileUri).toContain('BaoCao_CT_CA-2026-9901_vi.pdf');
    expect(result.language).toBe('vi');
    expect(result.hasGradCam).toBe(true);
    expect(result.fileSize).toBeDefined();
  });

  test('4. shareReportPdf mở Android Share Sheet khi thiết bị hỗ trợ', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValueOnce(undefined);

    const uri = 'file:///data/user/0/com.anonymous.mobile/cache/report.pdf';
    const success = await PdfReportService.shareReportPdf(uri, 'Chia sẻ hồ sơ');

    expect(Sharing.isAvailableAsync).toHaveBeenCalledTimes(1);
    expect(Sharing.shareAsync).toHaveBeenCalledWith(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Chia sẻ hồ sơ',
      UTI: 'com.adobe.pdf',
    });
    expect(success).toBe(true);
  });

  test('5. shareReportPdf ném ngoại lệ khi nền tảng không hỗ trợ share sheet', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

    await expect(
      PdfReportService.shareReportPdf('file:///path/to/doc.pdf'),
    ).rejects.toThrow('Chia sẻ tệp không được hỗ trợ');
  });

  test('6. printDirectly gọi Print.printAsync với mã HTML hợp lệ', async () => {
    (Print.printAsync as jest.Mock).mockResolvedValueOnce(undefined);

    await PdfReportService.printDirectly(sampleData);

    expect(Print.printAsync).toHaveBeenCalledTimes(1);
    const callArg = (Print.printAsync as jest.Mock).mock.calls[0][0];
    expect(callArg.html).toContain('CA-2026-9901');
  });

  test('7. resolveReportSlicesBase64 xử lý an toàn dữ liệu ảnh không làm sập ứng dụng', async () => {
    const dataWithDataUri: ClinicalReportData = {
      ...sampleData,
      slices: [
        {
          id: 'slice-inline',
          label: 'Lát cắt Inline',
          imageUri: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
          hasGradCam: false,
        },
      ],
    };

    const resolved = await PdfReportService.resolveReportSlicesBase64(dataWithDataUri);
    expect(resolved.slices?.[0].imageUri).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
  });
});

