import re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 清理 SPECIAL_HIGH / SPECIAL_LOW 区域中的 desc 模板字符串残留
# 删除从 "const SPECIAL_HIGH" 到 "function getSpecialTraits" 之间的所有 desc 块

start = content.find('const SPECIAL_HIGH')
end = content.find('function getSpecialTraits', start)
section = content[start:end]

# 删除 desc: `...` 块（多行模板字符串）
section = re.sub(r",\s*desc:\s*`[^`]*`", '', section, flags=re.DOTALL)
# 删除 desc: '...' 单行
section = re.sub(r",\s*desc:\s*'[^']*'", '', section)

content = content[:start] + section + content[end:]

with open(root / 'src/data/archetypes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('done')
