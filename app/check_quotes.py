import re

with open('src/data/archetypes.js', 'r', encoding='utf-8') as f:
    content = f.read()

for m in re.finditer(r"desc:\s*'([^']*)'", content, re.DOTALL):
    s = m.group(1)
    if "'" in s or '"' in s:
        print('Found quote in desc:', repr(s[:80]))

print('done')
