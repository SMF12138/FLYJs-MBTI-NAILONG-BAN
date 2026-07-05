import json, re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取 D1 high 的 desc
match = re.search(r"D1.*?desc:\s*`(.*?)`", content, re.DOTALL)
if match:
    desc = match.group(1)
    # 模拟 formatDesc
    result = '\n'.join(line.strip() for line in desc.strip().split('\n') if line.strip())
    print('Result:')
    print(repr(result[:200]))
