export interface ClinicalReportData {
  caseCode: string;
  patientName: string;
  patientId: string;
  patientDob?: string;
  patientGender?: string;
  patientPhone?: string;
  insuranceCode?: string;
  captureDate: string;
  doctorName: string;
  hospitalName?: string;
  departmentName?: string;
  notes?: string;
  conclusion?: string;
  aiPrediction: {
    predictedClass: 'Benign' | 'Malignant' | 'Normal';
    confidence: number;
    scores: {
      benign: number;
      malignant: number;
      normal: number;
    };
    latencyMs?: number;
    modelName?: string;
  };
  slices?: Array<{
    id: string;
    label: string;
    imageUri?: string;
    hasGradCam?: boolean;
    gradCamUri?: string;
  }>;
  language: 'vi' | 'en';
  includeGradCam: boolean;
  version?: string;
}

export interface ExportedPdfResult {
  id: string;
  fileName: string;
  fileUri: string;
  createdAt: string;
  fileSize: string;
  language: 'vi' | 'en';
  hasGradCam: boolean;
}

