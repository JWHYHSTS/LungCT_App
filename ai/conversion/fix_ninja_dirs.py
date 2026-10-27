import os, glob

base = r"C:\LungCT\mobile\android\app\.cxx\RelWithDebInfo"
abi_dirs = glob.glob(os.path.join(base, "*", "*"))
print("Found ABI dirs:", abi_dirs)

for abi_dir in abi_dirs:
    if not os.path.isdir(abi_dir):
        continue
    ninja_file = os.path.join(abi_dir, "build.ninja")
    if not os.path.exists(ninja_file):
        continue
    print(f"Processing {abi_dir}...")
    with open(ninja_file, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if "OBJECT_FILE_DIR = " in line:
                target_dir = line.split("OBJECT_FILE_DIR = ")[1].strip()
                full_dir = os.path.join(abi_dir, target_dir)
                if not os.path.exists(full_dir):
                    os.makedirs(full_dir, exist_ok=True)
                    print(f"Created: {full_dir}")

print("Pre-creation done!")
