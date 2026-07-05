import json, re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'tmp_special_descs.json', 'r', encoding='utf-8') as f:
    descs = json.load(f)

with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 阶段：high 或 low
phase = None
out_lines = []

for line in lines:
    if line.strip().startswith('const SPECIAL_HIGH'):
        phase = 'high'
    elif line.strip().startswith('const SPECIAL_LOW'):
        phase = 'low'
    elif line.strip() == '}' and phase:
        phase = None

    out_lines.append(line)

    m = re.match(r"\s*(D\d+):\s*\{", line)
    if m and phase:
        dim = m.group(1)
        key = f'{dim}_{phase}'
        if key in descs:
            desc = descs[key].replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', '\\n')
            indent = len(line) - len(line.lstrip())
            out_lines.append(' ' * (indent + 2) + f"desc: '{desc}',\n")

with open(root / 'src/data/archetypes.js', 'w', encoding='utf-8') as f:
    f.writelines(out_lines)

print('done')
