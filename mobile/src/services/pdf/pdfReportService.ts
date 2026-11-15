import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ClinicalReportData, ExportedPdfResult } from './types';
import { readFileAsBase64, persistPdfFile } from '../storage/fileUtil';

/**
 * Dịch vụ biên dịch và xuất báo cáo y tế chẩn đoán hình ảnh PDF cục bộ (On-Device Local-First).
 * - Sử dụng expo-print để render template HTML chuẩn y khoa sang tệp PDF vật lý.
 * - Sử dụng expo-sharing để mở bảng chia sẻ hệ thống Android System Share Sheet.
 * - Tuyệt đối không gửi dữ liệu bệnh nhân hay file PDF lên server trung gian.
 */
export class PdfReportService {
  /**
   * Sinh chuỗi HTML tiêu chuẩn y khoa cho báo cáo chẩn đoán hình ảnh CT lồng ngực.
   */
  public static generateHtmlReport(data: ClinicalReportData): string {
    const isVi = data.language === 'vi';

    const labels = isVi
      ? {
          title: 'PHIẾU KẾT QUẢ CHẨN ĐOÁN HÌNH ẢNH CT PHỔI',
          subtitle: 'Hệ thống Trí tuệ Nhân tạo Hỗ trợ Sàng lọc Edge AI (On-Device)',
          facility: data.hospitalName || 'TRUNG TÂM CHẨN ĐOÁN HÌNH ẢNH & Y HỌC HẠT NHÂN',
          department: data.departmentName || 'Khoa Chẩn đoán Hình ảnh - Phân khoa Phổi & Lồng ngực',
          caseCode: 'Mã số ca khám',
          patientName: 'Họ và tên bệnh nhân',
          patientDob: 'Ngày sinh / Tuổi',
          patientGender: 'Giới tính',
          insuranceCode: 'Mã BHYT',
          phone: 'Số điện thoại',
          captureDate: 'Ngày thực hiện CT',
          doctorName: 'Bác sĩ chẩn đoán',
          clinicalHistory: 'Chỉ định & Tiền sử lâm sàng',
          aiSectionTitle: 'KẾT QUẢ ĐÁNH GIÁ TỪ MÔ HÌNH HỌC SÂU LAI (ADAPTIVE AACNN-ViT)',
          aiModelInfo: 'Mô hình suy luận On-Device',
          predictedLabel: 'Phân loại dự đoán',
          confidence: 'Độ tin cậy',
          latency: 'Độ trễ suy luận',
          benignScore: 'Khả năng Lành tính (Benign)',
          malignantScore: 'Khả năng Ác tính (Malignant)',
          normalScore: 'Khả năng Bình thường (Normal)',
          slicesSectionTitle: 'HÌNH ẢNH LÁT CẮT CT & BẢN ĐỒ NHIỆT GRAD-CAM',
          doctorAssessment: 'ĐÁNH GIÁ LÂM SÀNG & KHUYẾN NGHỊ BÁC SĨ',
          doctorSignature: 'Chữ ký Bác sĩ chẩn đoán',
          disclaimerTitle: 'LƯU Ý PHÁP LÝ & Y KHOA:',
          disclaimerBody:
            'Kết quả đánh giá từ mô hình Trí tuệ nhân tạo (AI) mang tính chất tham khảo định lượng hỗ trợ bác sĩ lâm sàng, không thay thế hoàn toàn chẩn đoán kết luận y khoa hoặc kết quả giải phẫu bệnh học chính thức.',
          classBenign: 'Lành tính (Benign)',
          classMalignant: 'Nguy cơ Ác tính (Malignant)',
          classNormal: 'Bình thường (Normal)',
          gradcamNote: 'Vùng kích hoạt Gradient-weighted Class Activation Mapping (Grad-CAM)',
        }
      : {
          title: 'LUNG CT SCAN DIAGNOSTIC REPORT',
          subtitle: 'Edge AI-Assisted Pulmonary Screening System (On-Device)',
          facility: data.hospitalName || 'IMAGING & NUCLEAR MEDICINE CENTER',
          department: data.departmentName || 'Department of Diagnostic Imaging - Thoracic Division',
          caseCode: 'Case Code',
          patientName: 'Patient Name',
          patientDob: 'Date of Birth / Age',
          patientGender: 'Gender',
          insuranceCode: 'Insurance ID',
          phone: 'Phone Number',
          captureDate: 'Scan Date',
          doctorName: 'Reporting Physician',
          clinicalHistory: 'Clinical Indication & History',
          aiSectionTitle: 'DEEP LEARNING MODEL ASSESSMENT (ADAPTIVE AACNN-ViT)',
          aiModelInfo: 'On-Device Edge Inference',
          predictedLabel: 'Prediction',
          confidence: 'Confidence',
          latency: 'Inference Latency',
          benignScore: 'Benign Probability',
          malignantScore: 'Malignant Probability',
          normalScore: 'Normal Probability',
          slicesSectionTitle: 'CT SLICE IMAGES & GRAD-CAM HEATMAP',
          doctorAssessment: 'CLINICAL EVALUATION & RECOMMENDATIONS',
          doctorSignature: 'Physician Signature',
          disclaimerTitle: 'MEDICAL & LEGAL DISCLAIMER:',
          disclaimerBody:
            'AI-assisted predictions are quantitative screening references for certified physicians and do not replace definitive clinical diagnosis or histopathological confirmation.',
          classBenign: 'Benign',
          classMalignant: 'Malignant Risk',
          classNormal: 'Normal',
          gradcamNote: 'Gradient-weighted Class Activation Mapping (Grad-CAM) Activation Region',
        };

    const predictedText =
      data.aiPrediction.predictedClass === 'Malignant'
        ? labels.classMalignant
        : data.aiPrediction.predictedClass === 'Benign'
          ? labels.classBenign
          : labels.classNormal;

    const badgeColor =
      data.aiPrediction.predictedClass === 'Malignant'
        ? 'rgb(211, 47, 47)'
        : data.aiPrediction.predictedClass === 'Benign'
          ? 'rgb(245, 124, 0)'
          : 'rgb(56, 142, 60)';

    const benignPercent = (data.aiPrediction.scores.benign * 100).toFixed(2);
    const malignantPercent = (data.aiPrediction.scores.malignant * 100).toFixed(2);
    const normalPercent = (data.aiPrediction.scores.normal * 100).toFixed(2);

    const slicesHtml = (data.slices || [])
      .map(
        (slice, idx) => `
        <div class="slice-card">
          <div class="slice-title">${slice.label || `Lát cắt CT #${idx + 1}`}</div>
          <div class="slice-images">
            ${
              slice.imageUri
                ? `<div class="img-box">
                    <img src="${slice.imageUri}" alt="CT Slice" />
                    <span class="img-caption">Lát cắt gốc 2D</span>
                  </div>`
                : ''
            }
            ${
              data.includeGradCam && slice.gradCamUri
                ? `<div class="img-box">
                    <img src="${slice.gradCamUri}" alt="Grad-CAM" />
                    <span class="img-caption">${labels.gradcamNote}</span>
                  </div>`
                : ''
            }
          </div>
        </div>
      `,
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="${data.language}">
<head>
  <meta charset="utf-8" />
  <title>${labels.title} - ${data.caseCode}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 18mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: rgb(26, 26, 26);
      line-height: 1.45;
      margin: 0;
      padding: 0;
      font-size: 13px;
    }
    .header {
      border-bottom: 2px solid rgb(0, 82, 204);
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .facility-info {
      font-size: 11px;
      color: rgb(94, 108, 132);
    }
    .facility-name {
      font-size: 14px;
      font-weight: 700;
      color: rgb(7, 71, 166);
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .report-title-box {
      text-align: center;
      margin-bottom: 18px;
    }
    .report-title {
      font-size: 18px;
      font-weight: 800;
      color: rgb(9, 30, 66);
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .report-subtitle {
      font-size: 11px;
      color: rgb(107, 119, 140);
      font-weight: 500;
    }
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .grid-table td {
      padding: 6px 10px;
      border: 1px solid rgb(223, 225, 230);
      font-size: 12px;
    }
    .grid-label {
      background-color: rgb(244, 245, 247);
      font-weight: 600;
      color: rgb(66, 82, 110);
      width: 22%;
    }
    .grid-value {
      color: rgb(23, 43, 77);
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: rgb(7, 71, 166);
      text-transform: uppercase;
      border-left: 4px solid rgb(0, 82, 204);
      padding-left: 8px;
      margin: 14px 0 8px 0;
    }
    .ai-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      color: rgb(255, 255, 255);
      font-weight: 700;
      font-size: 13px;
      background-color: ${badgeColor};
    }
    .score-bar-container {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }
    .score-bar-label {
      width: 160px;
      font-size: 12px;
      font-weight: 500;
    }
    .score-bar-track {
      flex: 1;
      height: 12px;
      background-color: rgb(235, 236, 240);
      border-radius: 6px;
      overflow: hidden;
      margin: 0 10px;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: 6px;
    }
    .score-bar-val {
      width: 50px;
      text-align: right;
      font-size: 12px;
      font-weight: 700;
    }
    .slice-card {
      margin-bottom: 12px;
      border: 1px solid rgb(223, 225, 230);
      border-radius: 6px;
      padding: 10px;
      background: rgb(250, 251, 252);
    }
    .slice-title {
      font-weight: 600;
      font-size: 12px;
      color: rgb(23, 43, 77);
      margin-bottom: 8px;
    }
    .slice-images {
      display: flex;
      gap: 14px;
    }
    .img-box {
      text-align: center;
      flex: 1;
    }
    .img-box img {
      width: 100%;
      max-height: 220px;
      object-fit: contain;
      border: 1px solid rgb(193, 199, 208);
      border-radius: 4px;
      background: black;
    }
    .img-caption {
      font-size: 10px;
      color: rgb(107, 119, 140);
      margin-top: 4px;
      display: block;
    }
    .signature-box {
      margin-top: 25px;
      display: flex;
      justify-content: flex-end;
    }
    .signature-content {
      text-align: center;
      width: 240px;
    }
    .signature-line {
      margin-top: 55px;
      font-weight: 700;
      color: rgb(9, 30, 66);
      border-top: 1px dashed rgb(122, 134, 154);
      padding-top: 6px;
    }
    .disclaimer-box {
      margin-top: 20px;
      padding: 8px 12px;
      background-color: rgb(255, 240, 179);
      border: 1px solid rgb(255, 227, 128);
      border-radius: 4px;
      font-size: 10.5px;
      color: rgb(23, 43, 77);
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="facility-name">${labels.facility}</div>
      <div class="facility-info">${labels.department}</div>
      <div class="facility-info">Địa chỉ: Khu nghiên cứu Y Sinh học Kỹ thuật cao • Hotline: 1900 6868</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 700; color: rgb(0, 82, 204); font-size: 12px;">LungCT On-Device v1.0</div>
      <div style="font-size: 11px; color: rgb(94, 108, 132);">Ngày in: ${new Date().toLocaleDateString('vi-VN')}</div>
    </div>
  </div>

  <div class="report-title-box">
    <div class="report-title">${labels.title}</div>
    <div class="report-subtitle">${labels.subtitle}</div>
  </div>

  <table class="grid-table">
    <tr>
      <td class="grid-label">${labels.patientName}</td>
      <td class="grid-value" style="font-weight: 700; color: rgb(9, 30, 66); font-size: 13px;">${data.patientName}</td>
      <td class="grid-label">${labels.caseCode}</td>
      <td class="grid-value" style="font-weight: 700; color: rgb(0, 82, 204);">${data.caseCode}</td>
    </tr>
    <tr>
      <td class="grid-label">${labels.patientDob}</td>
      <td class="grid-value">${data.patientDob || 'N/A'}</td>
      <td class="grid-label">${labels.patientGender}</td>
      <td class="grid-value">${data.patientGender || 'N/A'}</td>
    </tr>
    <tr>
      <td class="grid-label">${labels.insuranceCode}</td>
      <td class="grid-value">${data.insuranceCode || 'N/A'}</td>
      <td class="grid-label">${labels.captureDate}</td>
      <td class="grid-value">${data.captureDate}</td>
    </tr>
    <tr>
      <td class="grid-label">${labels.doctorName}</td>
      <td class="grid-value" style="font-weight: 600;">${data.doctorName}</td>
      <td class="grid-label">${labels.clinicalHistory}</td>
      <td class="grid-value">${data.notes || 'Khám sàng lọc tầm soát định kỳ tổn thương nhu mô phổi.'}</td>
    </tr>
  </table>

  <div class="section-title">${labels.aiSectionTitle}</div>
  <table class="grid-table" style="margin-bottom: 12px;">
    <tr>
      <td class="grid-label">${labels.predictedLabel}</td>
      <td class="grid-value" colspan="3">
        <span class="ai-badge">${predictedText}</span>
        <span style="margin-left: 14px; font-weight: 600; font-size: 12px;">${labels.confidence}: ${(data.aiPrediction.confidence * 100).toFixed(2)}%</span>
        ${
          data.aiPrediction.latencyMs
            ? `<span style="margin-left: 14px; color: rgb(94, 108, 132); font-size: 11px;">(${labels.latency}: ${data.aiPrediction.latencyMs} ms)</span>`
            : ''
        }
      </td>
    </tr>
  </table>

  <div style="background: rgb(250, 251, 252); border: 1px solid rgb(223, 225, 230); border-radius: 6px; padding: 12px; margin-bottom: 14px;">
    <div class="score-bar-container">
      <span class="score-bar-label">${labels.benignScore}</span>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width: ${benignPercent}%; background-color: rgb(245, 124, 0);"></div>
      </div>
      <span class="score-bar-val" style="color: rgb(245, 124, 0);">${benignPercent}%</span>
    </div>
    <div class="score-bar-container">
      <span class="score-bar-label">${labels.malignantScore}</span>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width: ${malignantPercent}%; background-color: rgb(211, 47, 47);"></div>
      </div>
      <span class="score-bar-val" style="color: rgb(211, 47, 47);">${malignantPercent}%</span>
    </div>
    <div class="score-bar-container">
      <span class="score-bar-label">${labels.normalScore}</span>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width: ${normalPercent}%; background-color: rgb(56, 142, 60);"></div>
      </div>
      <span class="score-bar-val" style="color: rgb(56, 142, 60);">${normalPercent}%</span>
    </div>
  </div>

  ${(data.slices && data.slices.length > 0) ? `<div class="section-title">${labels.slicesSectionTitle}</div>${slicesHtml}` : ''}

  <div class="section-title">${labels.doctorAssessment}</div>
  <div style="background: rgb(255, 255, 255); border: 1px solid rgb(223, 225, 230); border-radius: 6px; padding: 10px; font-size: 12px; line-height: 1.5;">
    ${data.conclusion || (isVi ? 'Hình ảnh gợi ý nốt mờ nhu mô phổi cần theo dõi định kỳ. Đề nghị kết hợp thăm khám lâm sàng và tái khám sau 3 tháng.' : 'Nodule findings require routine clinical follow-up in 3 months.')}
  </div>

  <div class="signature-box">
    <div class="signature-content">
      <div style="font-size: 11px; color: rgb(94, 108, 132); margin-bottom: 4px;">Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
      <div style="font-weight: 700; color: rgb(9, 30, 66);">${labels.doctorSignature}</div>
      <div class="signature-line">${data.doctorName}</div>
    </div>
  </div>

  <div class="disclaimer-box">
    <strong>${labels.disclaimerTitle}</strong> ${labels.disclaimerBody}
  </div>
</body>
</html>
    `;
  }

  /**
   * Chuyển đổi an toàn các đường dẫn tệp ảnh CT và Grad-CAM cục bộ thành chuỗi Base64 Data URI.
   * Giúp WebView của expo-print nhúng trực tiếp dữ liệu ảnh vào tài liệu PDF,
   * tránh hoàn toàn lỗi bị chặn truy cập file:// trên Android 11+ (hiển thị ảnh bị hỏng).
   */
  public static async resolveReportSlicesBase64(
    data: ClinicalReportData,
  ): Promise<ClinicalReportData> {
    if (!data.slices || data.slices.length === 0) {
      return data;
    }

    const resolvedSlices = await Promise.all(
      data.slices.map(async (slice) => {
        let resolvedImageUri = slice.imageUri;
        let resolvedGradCamUri = slice.gradCamUri;

        if (
          resolvedImageUri &&
          !resolvedImageUri.startsWith('data:') &&
          !resolvedImageUri.startsWith('http://') &&
          !resolvedImageUri.startsWith('https://')
        ) {
          try {
            const base64 = await readFileAsBase64(resolvedImageUri);
            if (base64) {
              const mime = resolvedImageUri.toLowerCase().endsWith('.png')
                ? 'image/png'
                : 'image/jpeg';
              resolvedImageUri = `data:${mime};base64,${base64}`;
            }
          } catch (err) {
            console.warn('[PdfReportService] Không thể nạp Base64 ảnh CT:', err);
          }
        }

        if (
          resolvedGradCamUri &&
          !resolvedGradCamUri.startsWith('data:') &&
          !resolvedGradCamUri.startsWith('http://') &&
          !resolvedGradCamUri.startsWith('https://')
        ) {
          try {
            const base64 = await readFileAsBase64(resolvedGradCamUri);
            if (base64) {
              const mime = resolvedGradCamUri.toLowerCase().endsWith('.png')
                ? 'image/png'
                : 'image/jpeg';
              resolvedGradCamUri = `data:${mime};base64,${base64}`;
            }
          } catch (err) {
            console.warn('[PdfReportService] Không thể nạp Base64 ảnh Grad-CAM:', err);
          }
        }

        return {
          ...slice,
          imageUri: resolvedImageUri,
          gradCamUri: resolvedGradCamUri,
        };
      }),
    );

    return {
      ...data,
      slices: resolvedSlices,
    };
  }

  /**
   * Biên dịch trực tiếp file PDF vật lý từ dữ liệu báo cáo trên thiết bị Android.
   */
  public static async exportCasePdf(data: ClinicalReportData): Promise<ExportedPdfResult> {
    const resolvedData = await this.resolveReportSlicesBase64(data);
    const html = this.generateHtmlReport(resolvedData);

    // Tạo file PDF vật lý bằng expo-print
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const fileName = `BaoCao_CT_${data.caseCode}_${data.language}.pdf`;

    // Lưu bền vững sang thư mục dicom_reports để tránh bị hệ thống Android dọn dẹp cache
    let finalUri = uri;
    try {
      finalUri = await persistPdfFile(uri, fileName);
    } catch (e) {
      console.warn('[PdfReportService] Không thể sao chép tệp PDF sang dicom_reports:', e);
    }

    return {
      id: `pdf-${Date.now()}`,
      fileName,
      fileUri: finalUri,
      createdAt: dateStr,
      fileSize: '1.2 MB',
      language: data.language,
      hasGradCam: data.includeGradCam,
    };
  }

  /**
   * Kích hoạt bảng chia sẻ hệ thống Android (Android Share Sheet).
   */
  public static async shareReportPdf(
    fileUri: string,
    dialogTitle: string = 'Chia sẻ báo cáo chẩn đoán LungCT',
  ): Promise<boolean> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Chia sẻ tệp không được hỗ trợ trên thiết bị này.');
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle,
      UTI: 'com.adobe.pdf',
    });

    return true;
  }

  /**
   * Mở trình quản lý in ấn hệ thống (Android Print Spooler) để in trực tiếp ra máy in kết nối.
   */
  public static async printDirectly(data: ClinicalReportData): Promise<void> {
    const resolvedData = await this.resolveReportSlicesBase64(data);
    const html = this.generateHtmlReport(resolvedData);
    await Print.printAsync({ html });
  }
}
