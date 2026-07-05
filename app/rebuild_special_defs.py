import json, re, pathlib

root = pathlib.Path('D:/风不死/编码/Code/Mimo/MBTI-Character-Test/app')
with open(root / 'tmp_special_descs.json', 'r', encoding='utf-8') as f:
    descs = json.load(f)

with open(root / 'src/data/archetypes.js', 'r', encoding='utf-8') as f:
    content = f.read()

def escape_backtick(s):
    return s.replace('\\', '\\\\').replace('`', '\\`')

def build_block(dim, name, emoji, verse, img, phase):
    key = f'{dim}_{phase}'
    desc = escape_backtick(descs[key])
    desc_lines = [f"      {line}\n" for line in desc.split(chr(10))]
    desc_block = "".join(desc_lines)
    return (
        f"  {dim}: {{\n"
        f"    name: '{name}', emoji: '{emoji}', verse: '{verse}', img: '{img}',\n"
        f"    desc: `\n{desc_block}    `,\n"
        f"  }},"
    )

SPECIAL_HIGH_DEF = """const SPECIAL_HIGH = {\n""" + "\n".join([
    build_block(f'D{i}', name, emoji, verse, img, 'high')
    for i, (name, emoji, verse, img) in enumerate([
        ('洞察者', '👁️', '不是哥们你是监控啊', '/avatars/33_洞察者.jpg'),
        ('魅惑者', '💋', '测出这个的请联系作者，作者还是单身', '/avatars/34_魅惑者.jpg'),
        ('谋断者', '♟️', '看山是山，我不看山', '/avatars/35_谋断者.jpg'),
        ('光者', '☀️', '会发光，真的', '/avatars/36_光者.png'),
        ('革命者', '🏴', '犹然波浪里，涛声铸大观', '/avatars/37_革命者.jpg'),
        ('尊者', '👑', '我成尊不就是了', '/avatars/38_尊者.jpg'),
        ('圣母', '😇', '抱玉怀贞，德泽可渐被林薮', '/avatars/39_圣母.jpg'),
        ('赤子', '👶', '江山若尽余问道，不惧空存赤子心', '/avatars/40_赤子.jpg'),
        ('圣人', '🏛️', '在我燃尽之前，我将从天迹看到黎明', '/avatars/41_圣人.jpg'),
        ('无瑕者', '💎', '我爱她的热情、仁爱、和善良', '/avatars/42_无瑕者.jpg'),
        ('勇者', '🦁', '我常为自身的懦弱而感到自卑', '/avatars/43_勇者.jpg'),
        ('不朽者', '🗿', '二十三年身如故，一片碧血溅丹青', '/avatars/44_不朽者.jpg'),
        ('逍遥者', '☁️', '此生看尽逍遥，来世再谢春光', '/avatars/45_逍遥者.jpg'),
        ('贪者', '👑', '亦难常乐，玉坠兰折', '/avatars/46_贪者.png'),
        ('辩者', '🗣️', '此后所有的悲欢将在下一场', '/avatars/47_辩者.jpg'),
    ], start=1)
]) + "\n}\n"

SPECIAL_LOW_DEF = """const SPECIAL_LOW = {\n""" + "\n".join([
    build_block(f'D{i}', name, emoji, verse, img, 'low')
    for i, (name, emoji, verse, img) in enumerate([
        ('傻者', '🪨', '你好，小傻几', '/avatars/48_傻者.jpg'),
        ('空心人', '🫥', '去留求执意，情断为谁恩', '/avatars/49_空心人.png'),
        ('拖延者', '⏳', '刷完这个视频再干', '/avatars/50_拖延者.jpg'),
        ('悲者', '🌧️', '对坐相见不得，别后谁家花落', '/avatars/51_悲者.jpg'),
        ('守旧者', '📿', '抚琴闻天语，依旧长河吟', '/avatars/52_守旧者.png'),
        ('牛马', '🐴', '蚌埠住了', '/avatars/53_牛马.jpg'),
        ('冷血者', '🧊', '热情是热情者的热情，冷血是冷血者的冷血', '/avatars/54_冷血者.png'),
        ('疑心病', '🔍', '疑是六月飞雪，原来只是风吹', '/avatars/55_疑心病.png'),
        ('盗跖', '💀', '圣人不死，大盗不止', '/avatars/56_盗跖.png'),
        ('无耻者', '🪬', '阳和暄泽，亢旱则招怨；川泽滋荣，稻溺则见唾', '/avatars/57_无耻者.png'),
        ('懦夫', '🐛', '我常为自身的勇敢而感到骄傲', '/avatars/58_懦夫.png'),
        ('墙头草', '🌾', '我自楼台高吊，笑语成风争对', '/avatars/59_墙头草.png'),
        ('执念者', '🔗', '业火灼五腑，九死亦难悟', '/avatars/60_执念者.png'),
        ('无欲者', '🕊️', '恩仇具相去，今生各泛舟', '/avatars/61_无欲者.png'),
        ('尸体', '💀', '怎么会有这么无聊的人', '/avatars/62_尸体.png'),
    ], start=1)
]) + "\n}\n"

# 替换 SPECIAL_HIGH 和 SPECIAL_LOW
start_high = content.find('const SPECIAL_HIGH')
end_low = content.find('function getSpecialTraits', start_high)
content = content[:start_high] + SPECIAL_HIGH_DEF + "\n" + SPECIAL_LOW_DEF + "\n" + content[end_low:]

with open(root / 'src/data/archetypes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('done')
