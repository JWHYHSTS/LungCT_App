/**
 * Test Suite kiểm tra logic dịch vụ On-Device AI Pipeline
 */

import {
  isInferenceRunning,
  testFusionBranchWithReferenceCLS,
  testVitBranchWithTensor,
  runFullPipelineOnDevice,
} from '../onDevicePipeline';
import { MODEL_CLASSES } from '../types';

describe('On-Device Pipeline Service', () => {
  it('định nghĩa đúng 3 lớp theo thứ tự chuẩn [Benign, Malignant, Normal]', () => {
    expect(MODEL_CLASSES).toEqual(['Benign', 'Malignant', 'Normal']);
  });

  it('chạy thành công nhánh Fusion độc lập với fake model', async () => {
    const dummyCls = new Float32Array(768);
    const dummyCnn = new Float32Array(512 * 512 * 3);
    const fakeOutput = new Float32Array([0.9728, 0.0002, 0.027]);

    const fakeTfliteModel = {
      runSync: jest.fn().mockReturnValue([fakeOutput.buffer]),
    };

    const res = await testFusionBranchWithReferenceCLS(dummyCls, dummyCnn, fakeTfliteModel);
    expect(res.scores.length).toBe(3);
    expect(res.scores[0]).toBeCloseTo(0.9728, 4);
    expect(fakeTfliteModel.runSync).toHaveBeenCalledTimes(1);
  });

  it('chạy thành công nhánh ViT độc lập với fake ort session', async () => {
    const dummyCls = new Float32Array(768);
    dummyCls[0] = -0.08057;

    const fakeOrtSession = {
      run: jest.fn().mockResolvedValue({
        cls_token: { data: dummyCls },
      }),
    };

    const res = await testVitBranchWithTensor({}, fakeOrtSession);
    expect(res.clsVector.length).toBe(768);
    expect(res.clsVector[0]).toBeCloseTo(-0.08057, 4);
  });

  it('chạy trọn vẹn pipeline nối hai nhánh và chặn double-execution', async () => {
    const dummyCls = new Float32Array(768);
    const dummyCnn = new Float32Array(512 * 512 * 3);
    const fakeOutput = new Float32Array([0.972849, 0.000188, 0.026962]);

    const fakeOrtSession = {
      run: jest.fn().mockResolvedValue({
        cls_token: { data: dummyCls },
      }),
    };
    const fakeTfliteModel = {
      runSync: jest.fn().mockReturnValue([fakeOutput.buffer]),
    };

    const result = await runFullPipelineOnDevice(
      {},
      dummyCnn,
      fakeOrtSession,
      fakeTfliteModel,
      120,
    );

    expect(result.predictedClass).toBe('Benign');
    expect(result.probabilities.Benign).toBeCloseTo(0.972849, 5);
    expect(result.gradcamAvailable).toBe(false);
    expect(result.isMock).toBe(false);
    expect(result.verifiedSource).toBe('on_device_fp32');
    expect(result.gradcamNotice).toContain('Grad-CAM chưa khả dụng');
    expect(isInferenceRunning()).toBe(false);
  });
});
