import re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 只检查 88-104 行 (SPECIAL_HIGH)
for i, line in enumerate(lines[87:104], start=88):
    # 统计单引号，忽略转义单引号 \'
    s = line
    # 简单替换转义单引号
    s_clean = s.replace("\\'", "")
    count = s_clean.count("'")
    if count % 2 != 0:
        print(f'Line {i}: odd single quotes ({count})')
        print(line[:200])

print('done')
