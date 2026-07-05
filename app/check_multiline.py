import re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 检查每个 desc 字符串是否跨行（即 ' 和 ' 之间有真实换行）
for m in re.finditer(r"desc:\s*'([^']*\n[^']*)'", content, re.DOTALL):
    print('Multiline desc found:', m.group(0)[:100])

# 检查 SPECIAL_HIGH 区域是否有未闭合的字符串
start = content.find('const SPECIAL_HIGH')
end = content.find('const SPECIAL_LOW')
section = content[start:end]

# 简单 tokenizer 找未匹配的引号
in_str = False
str_char = None
line_no = content[:start].count('\n') + 1
for i, ch in enumerate(section):
    if ch == '\n':
        line_no += 1
    if not in_str and (ch == "'" or ch == '"'):
        in_str = True
        str_char = ch
    elif in_str and ch == str_char:
        # check escape
        escape_count = 0
        j = i - 1
        while j >= 0 and section[j] == '\\':
            escape_count += 1
            j -= 1
        if escape_count % 2 == 0:
            in_str = False
            str_char = None
    elif in_str and ch == '\n':
        print(f'Line {line_no}: unescaped newline inside string')

print('done')
