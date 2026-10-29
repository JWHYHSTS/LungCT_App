import math
import os
from PIL import Image, ImageDraw

# Bảng màu nhận diện thương hiệu LungCT:
# Nền: Xanh đậm y tế (Navy Blue - #123047 hoặc #163852)
# Biểu tượng: Hai lá phổi trắng (#FFFFFF), viền nhẹ chống chói, đơn giản, rõ khi thu nhỏ
BG_COLOR = (18, 48, 71, 255)       # #123047 - Xanh đậm y tế
ICON_WHITE = (255, 255, 255, 255)  # Trắng tinh khiết
ACCENT_CYAN = (127, 196, 184, 255) # Điểm nhấn nhẹ thanh quản #7FC4B8

def draw_lungs_icon(draw, cx, cy, lung_w, lung_h, color=ICON_WHITE):
    """
    Vẽ biểu tượng 2 lá phổi đơn giản, rõ ràng, cân đối bằng hình học chuẩn:
    - cx, cy: Tâm biểu tượng
    - lung_w: Bán chiều rộng cụm 2 phổi
    - lung_h: Chiều cao cụm phổi
    """
    trachea_w = lung_w * 0.12
    trachea_h = lung_h * 0.35
    top_y = cy - lung_h * 0.48
    
    # 1. Khí quản chính giữa (Trachea)
    draw.rounded_rectangle(
        [cx - trachea_w / 2, top_y, cx + trachea_w / 2, top_y + trachea_h],
        radius=trachea_w / 3,
        fill=color
    )
    
    # Phế quản rẽ nhánh (Bronchi)
    branch_y = top_y + trachea_h * 0.7
    branch_thick = int(max(3, lung_w * 0.08))
    draw.line([cx - trachea_w * 0.2, branch_y, cx - lung_w * 0.45, branch_y + trachea_h * 0.5], fill=color, width=branch_thick)
    draw.line([cx + trachea_w * 0.2, branch_y, cx + lung_w * 0.45, branch_y + trachea_h * 0.5], fill=color, width=branch_thick)

    # 2. Hai lá phổi (Trái & Phải)
    # Lá phổi trái (nhìn từ trước: bên trái người xem)
    left_x1 = cx - lung_w * 0.88
    left_x2 = cx - lung_w * 0.08
    lobe_top = top_y + trachea_h * 0.32
    lobe_bottom = cy + lung_h * 0.48
    
    # Hình elip / rounded polygon cho lá phổi trái
    draw.pieslice([left_x1, lobe_top, left_x2, lobe_bottom], 120, 340, fill=color)
    draw.chord([left_x1, lobe_top, left_x2, lobe_bottom], 120, 340, fill=color)
    draw.ellipse([left_x1, lobe_top + (lobe_bottom - lobe_top) * 0.1, left_x2, lobe_bottom], fill=color)
    
    # Lá phổi phải
    right_x1 = cx + lung_w * 0.08
    right_x2 = cx + lung_w * 0.88
    draw.pieslice([right_x1, lobe_top, right_x2, lobe_bottom], 200, 60, fill=color)
    draw.chord([right_x1, lobe_top, right_x2, lobe_bottom], 200, 60, fill=color)
    draw.ellipse([right_x1, lobe_top + (lobe_bottom - lobe_top) * 0.1, right_x2, lobe_bottom], fill=color)


def generate_square_icon(size=1024, path="icon.png"):
    """Tạo icon vuông chuẩn (Expo icon.png / iOS AppIcon)"""
    img = Image.new("RGBA", (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Vùng biểu tượng nằm trong safe area (65% kích thước khung để không bị cắt khi launcher bo tròn)
    scale = size * 0.32
    draw_lungs_icon(draw, size / 2, size / 2, scale, scale * 1.15, ICON_WHITE)
    img.save(path, "PNG")
    print(f"Generated: {path} ({size}x{size})")


def generate_adaptive_foreground(size=512, path="android-icon-foreground.png"):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = size * 0.23
    draw_lungs_icon(draw, size / 2, size / 2, scale, scale * 1.15, ICON_WHITE)
    img.save(path, "PNG")
    print(f"Generated Adaptive Foreground: {path} ({size}x{size})")


def generate_adaptive_background(size=512, path="android-icon-background.png"):
    img = Image.new("RGBA", (size, size), BG_COLOR)
    img.save(path, "PNG")
    print(f"Generated Adaptive Background: {path} ({size}x{size})")


def generate_adaptive_monochrome(size=512, path="android-icon-monochrome.png"):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = size * 0.23
    draw_lungs_icon(draw, size / 2, size / 2, scale, scale * 1.15, (255, 255, 255, 255))
    img.save(path, "PNG")
    print(f"Generated Adaptive Monochrome: {path} ({size}x{size})")


def generate_android_mipmaps():
    densities = {
        'mdpi': (48, 108),
        'hdpi': (72, 162),
        'xhdpi': (96, 216),
        'xxhdpi': (144, 324),
        'xxxhdpi': (192, 432),
    }
    
    base_res = "mobile/android/app/src/main/res"
    if not os.path.exists(base_res):
        print(f"Skipping native mipmap: {base_res} not found")
        return

    for density, (icon_sz, fg_sz) in densities.items():
        folder = os.path.join(base_res, f"mipmap-{density}")
        os.makedirs(folder, exist_ok=True)
        
        # 1. ic_launcher.webp
        im_launcher = Image.new("RGBA", (icon_sz, icon_sz), BG_COLOR)
        draw_l = ImageDraw.Draw(im_launcher)
        scale_l = icon_sz * 0.32
        draw_lungs_icon(draw_l, icon_sz / 2, icon_sz / 2, scale_l, scale_l * 1.15, ICON_WHITE)
        im_launcher.save(os.path.join(folder, "ic_launcher.webp"), "WEBP")
        
        # 2. ic_launcher_round.webp
        mask = Image.new("L", (icon_sz, icon_sz), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse([0, 0, icon_sz - 1, icon_sz - 1], fill=255)
        im_round = Image.new("RGBA", (icon_sz, icon_sz), (0, 0, 0, 0))
        im_round.paste(im_launcher, (0, 0), mask)
        im_round.save(os.path.join(folder, "ic_launcher_round.webp"), "WEBP")
        
        # 3. ic_launcher_foreground.webp
        im_fg = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
        draw_fg = ImageDraw.Draw(im_fg)
        scale_fg = fg_sz * 0.23
        draw_lungs_icon(draw_fg, fg_sz / 2, fg_sz / 2, scale_fg, scale_fg * 1.15, ICON_WHITE)
        im_fg.save(os.path.join(folder, "ic_launcher_foreground.webp"), "WEBP")
        
        # 4. ic_launcher_background.webp
        im_bg = Image.new("RGBA", (fg_sz, fg_sz), BG_COLOR)
        im_bg.save(os.path.join(folder, "ic_launcher_background.webp"), "WEBP")
        
        # 5. ic_launcher_monochrome.webp
        im_mono = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
        draw_mono = ImageDraw.Draw(im_mono)
        draw_lungs_icon(draw_mono, fg_sz / 2, fg_sz / 2, scale_fg, scale_fg * 1.15, (255, 255, 255, 255))
        im_mono.save(os.path.join(folder, "ic_launcher_monochrome.webp"), "WEBP")
        
        print(f"Updated mipmap-{density} (launcher {icon_sz}px, fg {fg_sz}px)")


if __name__ == "__main__":
    assets_dir = "mobile/assets"
    os.makedirs(assets_dir, exist_ok=True)
    
    generate_square_icon(1024, os.path.join(assets_dir, "icon.png"))
    generate_square_icon(512, os.path.join(assets_dir, "splash-icon.png"))
    generate_adaptive_foreground(512, os.path.join(assets_dir, "android-icon-foreground.png"))
    generate_adaptive_background(512, os.path.join(assets_dir, "android-icon-background.png"))
    generate_adaptive_monochrome(512, os.path.join(assets_dir, "android-icon-monochrome.png"))
    
    generate_android_mipmaps()
    print("SUCCESS: Brand icons generated successfully!")
