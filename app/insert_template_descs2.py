import json, re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'tmp_special_descs.json', 'r', encoding='utf-8') as f:
    descs = json.load(f)

with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out_lines = []
for line in lines:
    out_lines.append(line)
    m = re.match(r"\s*(D\d+):\s*\{", line)
    if not m:
        continue
    dim = m.group(1)
    phase = None
    # 根据上下文判断 high 还是 low
    if 'SPECIAL_HIGH' in ''.join(out_lines[-20:]):
        phase = 'high'
    elif 'SPECIAL_LOW' in ''.join(out_lines[-20:]):
        phase = 'low'
    if not phase:
        continue
    key = f'{dim}_{phase}'
    if key not in descs:
        continue
    desc = descs[key].replace('\\', '\\\\').replace('`', '\\`')
    indent = len(line) - len(line.lstrip())
    desc_lines = desc.split('\n')
    desc_str = '\n' + ' ' * (indent + 2) + 'desc: `\n'
    for dl in desc_lines:
        desc_str += ' ' * (indent + 4) + dl + '\n'
    desc_str += ' ' * (indent + 2) + '`,'
    # 插入到当前行之前的位置？不，应该替换当前行，把 desc 加进去
    # 策略：把刚加入的当前行改为包含 desc 的多行
    out_lines.pop()
    base_line = line.rstrip()
    # base_line 形如 "  D1:  { name: '...', ..., img: '...' },"
    # 去掉尾部的 }, 加上 , desc: `...` },
    new_block = base_line.rstrip('},').rstrip() + ',\n' + desc_str + '\n' + ' ' * indent + '},'
    out_lines.append(new_block + '\n')

with open(root / 'src/data/archetypes.js', 'w', encoding='utf-8') as f:
    f.writelines(out_lines)

print('done')
