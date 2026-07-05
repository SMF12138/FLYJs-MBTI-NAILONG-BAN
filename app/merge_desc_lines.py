import re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    # 如果下一行是 desc: 缩进，且当前行以 }, 结尾
    if i + 1 < len(lines) and re.match(r"\s+desc: '", lines[i + 1]) and line.rstrip().endswith('},'):
        # 去掉当前行的 }, 换行，加入 desc 行和 },
        desc_line = lines[i + 1].rstrip().rstrip(',').rstrip("'")
        # desc_line 形如 "    desc: '...'"  -> 提取 desc 内容
        # 当前行形如 "  D1:  { name: '...' },\n"
        # 合并：当前行去掉 "\n" 和 "},\n" 部分，加上 ", desc: '...' },\n"
        new_line = line.rstrip().rstrip('},').rstrip() + ', ' + lines[i + 1].strip() + '\n'
        out_lines.append(new_line)
        i += 2
        continue
    out_lines.append(line)
    i += 1

with open(root / 'src/data/archetypes.js', 'w', encoding='utf-8') as f:
    f.writelines(out_lines)

print('done')
