import json, re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'tmp_special_descs.json', 'r', encoding='utf-8') as f:
    descs = json.load(f)

with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 在 SPECIAL_HIGH 和 SPECIAL_LOW 的每个条目中插入 desc（使用模板字符串）
# 匹配形如 D1:  { name: '...', emoji: '...', verse: '...', img: '...' },
# 在 verse/img 后插入 desc

def escape_backtick(s):
    return s.replace('\\', '\\\\').replace('`', '\\`')

for phase in ['high', 'low']:
    start_marker = 'const SPECIAL_HIGH' if phase == 'high' else 'const SPECIAL_LOW'
    start = content.find(start_marker)
    end_marker = 'const SPECIAL_LOW' if phase == 'high' else 'function getSpecialTraits'
    end = content.find(end_marker, start + 1)
    section = content[start:end]
    
    # 逐行处理
    lines = section.split('\n')
    new_lines = []
    for line in lines:
        new_lines.append(line)
        m = re.match(r"\s*(D\d+):\s*\{", line)
        if m:
            dim = m.group(1)
            key = f'{dim}_{phase}'
            if key in descs:
                desc_text = escape_backtick(descs[key])
                indent = len(line) - len(line.lstrip())
                # 模板字符串，缩进
                desc_lines = desc_text.split('\n')
                desc_joined = '\n' + ' ' * (indent + 2) + 'desc: `\n'
                for dl in desc_lines:
                    desc_joined += ' ' * (indent + 4) + dl + '\n'
                desc_joined += ' ' * (indent + 2) + '`,'
                new_lines.append(desc_joined)
    
    content = content[:start] + '\n'.join(new_lines) + content[end:]

with open(root / 'src/data/archetypes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('done')
