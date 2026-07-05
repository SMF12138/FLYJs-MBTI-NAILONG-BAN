import json, re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'tmp_special_descs.json', 'r', encoding='utf-8') as f:
    descs = json.load(f)

with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    content = f.read()

for i in range(1, 16):
    key = f'D{i}_high'
    desc = descs[key].replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', '\\n')
    old = re.search(rf"D{i}:\s+\{{.*?img: '/avatars/.*?\.jpg' \}},", content, re.DOTALL).group(0)
    new = old.replace(" },", f",\n    desc: '{desc}' }},")
    content = content.replace(old, new, 1)

for i in range(1, 16):
    key = f'D{i}_low'
    desc = descs[key].replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', '\\n')
    old = re.search(rf"D{i}:\s+\{{.*?img: '/avatars/.*?\.(jpg|png)' \}},", content, re.DOTALL).group(0)
    new = old.replace(" },", f",\n    desc: '{desc}' }},")
    content = content.replace(old, new, 1)

with open(root / 'src/data/archetypes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('done')
