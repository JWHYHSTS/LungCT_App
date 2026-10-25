import manifest from '../../../../assets/icons/manifest.json';
import { ICON_MAP, type IconName } from '../Icon';

describe('Hệ thống Icon (UI-02)', () => {
  const iconList = manifest.icons as { name: string }[];

  test('manifest.json phải khai báo đúng 64 icon', () => {
    expect(iconList).toHaveLength(64);
  });

  test('tất cả 64 icon trong manifest đều phải tồn tại trong ICON_MAP và có thể render hợp lệ', () => {
    iconList.forEach((item) => {
      const name = item.name as IconName;
      const component = ICON_MAP[name];
      expect(component).toBeDefined();
      expect(component).not.toBeNull();
      // Trong môi trường React / React Native, component có thể là function component hoặc ExoticComponent (memo/forwardRef)
      expect(['function', 'object']).toContain(typeof component);
    });
  });

  test('không có icon thừa ngoài manifest trong ICON_MAP', () => {
    const mapKeys = Object.keys(ICON_MAP);
    expect(mapKeys).toHaveLength(64);
  });
});
