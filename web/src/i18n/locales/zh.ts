import type { Catalog } from '../index';
import { kv } from '../kv';

/** 简体中文（第二语言：英语）。 */
const zh: Catalog = {
  ...kv('lang', 'fr=法语; en=英语; es=西班牙语; it=意大利语; de=德语; pt=葡萄牙语; ru=俄语; zh=中文; hi=印地语; ar=阿拉伯语; ur=乌尔都语; bn=孟加拉语'),
  ...kv('country', 'fr=法国; be=比利时; ch=瑞士; ca=加拿大; lu=卢森堡; gb=英国; us=美国; es=西班牙; mx=墨西哥; it=意大利; de=德国; at=奥地利; pt=葡萄牙; br=巴西; ru=俄罗斯; cn=中国; in=印度; eg=埃及; ma=摩洛哥; sa=沙特阿拉伯; pk=巴基斯坦; bd=孟加拉国'),

  'ui.loading': '加载中…',
  'ui.rotate': '把平板横过来！',
  'ui.tap': '点一下屏幕开始玩！',
  'ui.retry': '重试',
  'ui.problem': '出错了：{reason}',
  'ui.cancel': '取消',
  'ui.skip': '跳过', 'ui.home.play': '开始玩', 'ui.home.missions': '任务', 'ui.home.mydino': '我的恐龙', 'ui.home.settings': '设置', 'ui.end.again': '再玩一次', 'ui.home.playWith': '{name}，和你的小恐龙一起玩吧！',
  'ui.home.learn': '和你的小恐龙一起边玩边学！',
  'ui.home.summary': '已完成 {n} 轮。你的小恐龙和你一起长大！',
  'ui.home.sleeping': '嘘……小恐龙睡着了。\n家长可以用密码解锁。',
  'ui.home.timeUp': '今天的游戏时间到了。\n家长可以用密码解锁。',
  'ui.child.title': '孩子叫什么名字？',
  'ui.child.sub': '小恐龙会叫孩子的名字。',
  'ui.parents.title': '家长专区',
  'ui.pin.type': '请输入家长密码。',
  'ui.pin.title': '家长密码',
  'ui.pin.choose': '请设置一个4位数密码。',
  'ui.wardrobe.title': '我的小恐龙 – 衣柜',
  'ui.wardrobe.reactions': ['太酷了！', '我好喜欢！', '我好帅呀！', '真漂亮！'],
  'ui.choose.voice': '大声说',
  'ui.choose.voiceTitle': '用声音来玩！',
  'ui.choose.title': '选一个游戏！',
  'ui.end.3': '太棒了！', 'ui.end.2': '真厉害！', 'ui.end.1': '做得好！', 'ui.end.0': '继续加油！',
  'ui.end.done': '你完成了这一轮！',
  'ui.time.unlimited': '不限时', 'ui.time.less': '减少时间', 'ui.time.more': '增加时间',
  'ui.lang': '语言', 'ui.langLabel': '语言：', 'ui.mb': '{n} MB',
  'ui.pack.voice': '{language}语音包', 'ui.pack.asr': '语音识别',
  'ui.pack.stalled': '下载停止了，请检查网络连接。',
  'ui.pack.downloading': '正在下载：{list}', 'ui.pack.installing': '正在安装语音识别',
  'ui.pack.speechTitle': '小恐龙的声音（{language}）', 'ui.pack.speechDetail': '自然的声音，在所有设备上都一样。',
  'ui.pack.secondTitle': '{language}声音', 'ui.pack.secondDetail': '用于外语游戏里的单词。',
  'ui.pack.asrTitle': '语音识别', 'ui.pack.asrDetail': '用来大声回答。',
  'ui.pack.download': '下载', 'ui.pack.installed': '已安装 ✓',
  'ui.pack.toDownload': '需要下载：{n} MB（建议使用 Wi-Fi）。', 'ui.pack.allInstalled': '全部已安装。',
  'ui.pack.running': '正在下载…', 'ui.pack.finished': '完成。', 'ui.pack.failed': '失败：{error}',
  'ui.pack.installingShort': '正在安装…', 'ui.pack.waiting': '等待中…',
  'voice.heard': '我听到的是：{word}。',

  ...kv('p', `title=家长专区; back=返回游戏; noName=未命名; addChild=+ 添加孩子; newChild=新的孩子;
    newChildHelp=离开家长专区后，新的孩子点一下自己的蛋，就能孵出自己的小恐龙。;
    cancel=取消; edit=✏️ 编辑资料; sheetOf={name}的资料; sheet=孩子的资料; sheetHelp=名字、年龄和设置。;
    removeChild=删除{name}; thisChild=这个孩子;
    removeConfirm=删除{name}、他的小恐龙和所有进度吗？此操作无法撤销。;
    egg=蛋还没有孵化; dino=小恐龙; alternateAria=孩子之间轮流玩; age={n}岁; otherCountry=其他国家;
    series=已玩轮数; answers=回答; firstTry=一次答对; today=今天已玩;
    childrenHelp=每个孩子都有自己的小恐龙、进度和设置。下面的设置属于当前选中的孩子。;
    alternate=轮流：每轮结束后换下一个孩子玩;
    difficulty=游戏的起始难度：{n}/20（{stage}）。之后会根据结果自动调整。;
    stageCP=小学一年级; stageK=幼儿园; dinoLevel=小恐龙等级;
    dinoLevelHelp=孩子喂小恐龙时，小恐龙会长大（等级 1 到 {max}）。你可以修改等级来调整难度：21 到 40 级相当于小学一年级。;
    noNight=不使用夜间模式; week=最近7天的游戏时间; daily=每天游戏时间;
    dailyHelp=时间到了以后，孩子玩完这一轮，游戏就会锁定到第二天：小恐龙去睡觉了。用你的密码可以增加15或30分钟，或者解锁当天。;
    night=睡觉时间（夜间模式）;
    nightHelp=到了这个时间，天空会变黑，小恐龙会打哈欠：它会提议玩最后一轮，然后睡到早上。用你的密码可以让孩子当晚再多玩一会儿。;
    enable=开启{game}; levelOf={game}的等级; levelAuto=自动等级; level=等级 {n}; fromAge={n}岁起;
    needsVoice=语音游戏：请允许使用麦克风，并下载{language}语音识别（在“声音与下载”中）。;
    nAnswers={n}个回答; notPlayed=还没玩过; rate={rate}一次答对; mastered=已掌握 {n} / {total} 道题;
    lastPlayed=上次玩：{date}; chooseAria=选择游戏的按钮; games=游戏;
    choose=主页上的“选择游戏”按钮;
    chooseHelp=关闭时，孩子点星球来玩：每一轮混合该年龄的所有游戏。开启时，孩子还可以选择某个游戏（以及不和其他游戏混合的语音游戏）。;
    gamesHelp=关闭某个游戏后，它就不会再出现。等级（1 到 20；11 到 20 = 小学一年级）是下一轮开始的位置；“自动”会根据年龄、小恐龙和成绩来计算。;
    reviewToday=今天复习; reviewTomorrow=明天再来; reviewOn={date}再来; reviewN=第 {n} / {total} 次复习;
    review=需要练习;
    reviewHelp=答错的题第二天会再出现，然后3天后，再一周后。三次都答对就算学会了；答错就从第二天重新开始。;
    reviewNone=现在没有需要复习的。太棒了！; sfxAria=音效; musicAria=背景音乐; testVoice=试听声音;
    testHello=你好！我是小恐龙。; sound=声音; sfx=音效（答对、答错、吃东西……）;
    music=轻柔的背景音乐（孩子也可以在主页关闭）;
    phoneVoices=主声音：{main} · 第二语言声音：{second}。这些是手机自带的声音：想要更自然的声音，可以在辅助功能设置（文字转语音）中安装“增强”或“高级”声音。;
    noVoice=没有找到; mic=麦克风（语音游戏）;
    micHelp=在语音游戏中，孩子用说话来回答：说出图片的名字、说第二语言的单词、算算术。所有内容都留在这台设备上：声音不会被录下，也不会被发送。只有孩子点大麦克风按钮时，麦克风才会打开。孩子点星球时，这些题目会和其他题目混在一起。;
    noMic=这个浏览器不允许在游戏中使用麦克风。; allowMic=允许使用麦克风;
    allowMicNow=请在浏览器窗口中允许使用麦克风……;
    micBlocked=麦克风被阻止了。请在浏览器设置（地址旁边的锁）中允许，然后再试一次。;
    packsWhere=语音识别包在“声音与下载”中下载。;
    removePacks=删除语音包;
    removePacksConfirm=要从这台设备上删除语音识别包吗？之后将不再提供语音游戏。;
    packs=声音与下载;
    packsHelp=游戏语言、小恐龙的自然声音（在设备上生成，下载后无需联网）、外语游戏的声音和语音识别。下载会同时进行，关闭这个页面后也会继续。没有小恐龙的声音时，游戏会使用手机的声音。;
    changeCode=修改密码; newCode=新的家长密码; newCodeHelp=请设置一个新的4位数密码。;
    codeChanged=家长密码已修改。; code=家长密码;
    codeHelp=密码可以打开家长专区，并在当天时间用完时解锁游戏。如果忘记了，点“忘记密码？”回答一个成人问题后就可以重新设置。;
    reset=重新开始; resetConfirm=要清除所有进度（小恐龙等级、回答、水果）吗？设置会保留。;
    privacy=隐私政策; close=关闭; data=数据;
    dataHelp=所有内容只保存在这台设备上。不会发送任何数据。`),

  ...kv('pin', `erase=删除; remember=请记好它。; forgot=忘记密码？;
    adultQuestion=成人问题：{a} × {b} 等于多少？（3位数）; cancel=取消; wrongAnswer=不对哦。;
    newCode=新的家长密码; newCodeHelp=请设置一个新的4位数密码。; wrongCode=密码错误。;
    otherCountry=其他国家; firstName=名字;
    micHtml=<b>允许使用麦克风</b>（语音游戏）<br><small>所有内容都留在这台设备上：声音不会被录下，也不会被发送。</small>;
    missionsHtml=<b>选择任务</b><br><small>孩子可以自己选择游戏（“任务”按钮）。不勾选：只能用“开始”随机玩。</small>;
    ok=确定; nameMissing=请填写孩子的名字。; age=年龄; years={n}岁; country=国家; daily=每天游戏时间;
    night=睡觉时间（夜间模式）; none=无; welcome=欢迎您，家长！;
    welcomeHeard=这是孩子告诉小恐龙的内容：如有需要请修改。你可以在家长专区（主页上的锁）添加其他孩子或修改所有设置。;
    welcomeHelp=孩子的名字、年龄和设置。你可以在家长专区（主页上的锁）添加其他孩子或修改所有设置。;
    yourCode=你的家长密码;
    yourCodeHelp=请设置一个4位数密码。它可以打开家长专区（主页上的锁），并在当天时间用完时解锁游戏。不要告诉孩子哦！;
    asleep=小恐龙睡着了; asleepHelp=该睡觉了。输入家长密码，今晚可以再多玩一会儿。;
    timeUp=游戏时间到了; timeUpHelp=输入家长密码，为今天增加游戏时间。;
    addTime=增加时间; todayOnly=仅限今天。; plus15=再玩15分钟; plus30=再玩30分钟; unlimited=今天不限时`),

  ...kv('inst', `title=把 DinoLearn 安装到手机上; later=以后再说; okay=好的; never=不再询问;
    android=它会像真正的应用一样全屏横向打开。不需要再下载其他东西。;
    menu=在浏览器菜单中：;
    androidSteps=<li>点 <b>⋮</b>（右上角的三个点）。</li><li>选择<b>“安装应用”</b>或<b>“添加到主屏幕”</b>。</li><li>点小恐龙图标打开游戏。</li>;
    ios=它会像真正的应用一样全屏打开，没有 Safari 的工具栏。;
    iosSteps=<li>点 {share} <b>分享</b>（在 Safari 的底部或顶部）。</li><li>选择<b>“添加到主屏幕”</b>，然后点<b>添加</b>。</li><li>点小恐龙图标打开游戏。</li>`),

  ...kv('title', `EN-1=英语 — 听一听，点一点; EN-2=英语 — 数字; EN-3=英语 — 记忆翻牌; MO-1=世界 — 指给我看;
    MO-3=世界 — 影子; MO-4=世界 — 什么是一对; MO-5=世界 — 最大的; LO-1=逻辑 — 找不同;
    LO-2=逻辑 — 有几个？; LO-3=逻辑 — 接下来是什么; LO-4=逻辑 — 多和少; LO-5=逻辑 — 算术;
    LO-6=逻辑 — 数字; LO-7=逻辑 — 形状和颜色; LO-8=逻辑 — 认识时间; LO-9=逻辑 — 认识钱;
    LO-10=逻辑 — 记忆翻牌; LO-11=逻辑 — 听一听，算一算; TR-1=书写 — 描形状;
    TR-2=书写 — 描字母和数字; VO-1=大声说 — 这叫什么？; VO-2=大声说 — 用英语说！;
    VO-13=大声说 — 算术`),

  ...kv('item', `top-hat=礼帽; billed-cap=鸭舌帽; crown=王冠; womans-hat=草帽;
    graduation-cap=学士帽; rescue-workers-helmet=消防头盔; headphone=耳机; hibiscus=小花;
    glasses=眼镜; sunglasses=太阳镜; goggles=潜水镜; ribbon=领结; swim-ring=游泳圈;
    sports-medal=奖牌; prayer-beads=项链; cape-red=超级英雄披风; cape-blue=魔法师披风; wing=翅膀;
    balloon=气球; magic-wand=魔法棒; lollipop=棒棒糖; sunflower=向日葵; teddy-bear=泰迪熊`),
  ...kv('dinocolor', '0=绿色; 1=蓝色; 2=紫色; 3=粉色; 4=橙色; 5=黄色; 6=青绿色; 7=红色; 8=棕色'),

  ...kv('cat', `farm=农场动物; sea=海洋动物; bird=鸟; bug=小虫子; wild=野生动物; forest=森林动物; fruit=水果; veg=蔬菜;
    meal=吃的东西; vehicle=交通工具; toy=玩具; home=家里的东西; clothes=穿戴的东西; tool=工具; kitchen=日常用品;
    music=乐器; sky=天上的东西; plant=植物; body=身体部位; landscape=地方; color=颜色; element=大自然的东西`),
  ...kv('fam', `farm=农场动物; sea=海洋动物; bird=鸟; bug=小虫子; wild=野生动物; forest=森林动物; fruit=水果; veg=蔬菜;
    meal=食物和零食; vehicle=交通工具; toy=玩具; home=家里的东西; clothes=衣服; tool=工具; kitchen=浴室和厨房用品;
    music=乐器; sky=天空和天气; plant=植物; body=身体部位; landscape=地方; color=颜色; element=大自然的东西`),
  ...kv('fruit', `red-apple=苹果; banana=香蕉; strawberry=草莓; cherries=樱桃; grapes=葡萄; tangerine=橙子;
    pear=梨; lemon=柠檬; watermelon=西瓜; peach=桃子; pineapple=菠萝; kiwi-fruit=猕猴桃; mango=芒果;
    blueberries=蓝莓; melon=甜瓜; green-apple=青苹果; coconut=椰子`),
  ...kv('many', `food-red-apple=苹果; food-banana=香蕉; food-strawberry=草莓; food-pear=梨; food-lemon=柠檬;
    food-tangerine=橙子; food-kiwi-fruit=猕猴桃; food-peach=桃子`),

  'g.hintFamily': '提示：它是{family}。',
  'g.word': '{word}！',
  'g.yesWord': ['对，{word}！', '没错，{word}！'],
  'g.yesItIs': '对，是{word}！',
  'g.hint': '提示：{hint}。',
  'g.hintTens': '提示：先看第一个数字，也就是十位。',
  'g.plus': '{a}加{b}', 'g.minus': '{a}减{b}',
  'g.calcPrompt': ['{calc}等于几？', '{calc}，是多少？'],
  'g.calcYes': '对！{calc}等于{n}！',
  'g.hintAdd': '提示：从{a}开始，用手指再数{b}个。',
  'g.hintSub': '提示：从{a}开始，用手指往回数{b}个。',
  'MO-1.prompt': ['{word}在哪里？', '指给我看{word}！', '点一下{word}！', '你能找到{word}吗？'],
  'LO-1.prompt': ['找不同！哪个不是同一类的？', '哪张图片和别的不一样？'],
  'LO-1.yes': '对，{word}！其他的都是{family}。',
  'LO-1.hint': '提示：有{n}张图片是{family}。找出不是的那一张。',
  'LO-2.prompt': ['有几个{things}？仔细数一数！', '数一数{things}，一共有几个？'],
  'LO-2.promptMixed': '有几个{things}？注意，只数{things}！',
  'LO-2.yes': '{list}。一共{n}个！',
  'LO-2.hint': '提示：用手指点每个水果，慢慢数。',
  'LO-2.hintBig': '提示：先数到十，再接着数：十一、十二、十三……',
  'MO-3.prompt': ['这是谁的影子？点正确的图片！', '谁躲在这个影子后面？'],
  'LO-3.prompt': ['仔细看这个规律。接下来是什么水果？', '哪个水果能接上这个规律？'],
  'LO-3.yes': '对！{list}！',
  'LO-3.hint': '提示：规律总是一样地重复。{list}……',
  'LO-3.numPrompt': '看一看，听一听：{list}。接下来是几？',
  'LO-3.numYes': '对！{list}，{n}！',
  'LO-3.hintGrow': '提示：先加一，再加二，再加三……然后呢？',
  'LO-3.hintPlus': '提示：每次加{n}。',
  'LO-3.hintMinus': '提示：每次减{n}。',
  'LO-4.num.most': '点最大的数字！', 'LO-4.num.least': '点最小的数字！',
  'LO-4.numYes.most': '对！{n}最大！', 'LO-4.numYes.least': '对！{n}最小！',
  'LO-4.numHint.most': '提示：数数的时候，最大的数最后出现。',
  'LO-4.numHint.least': '提示：数数的时候，最小的数最先出现。',
  'LO-4.pile.most': '哪里的{things}最多？点正确的卡片！',
  'LO-4.pile.least': '哪里的{things}最少？点正确的卡片！',
  'LO-4.pileYes.most': '对！这里有{n}个，是最多的！',
  'LO-4.pileYes.least': '对！这里有{n}个，是最少的！',
  'LO-4.pileHint.least': '提示：找水果很少的那张卡片。',
  'LO-4.pileHint.most': '提示：找最满的那张卡片。',
  'LO-5.compl': '{a}加几等于{b}？',
  'LO-5.complYes': '对！{a}加{x}等于{b}！',
  'LO-5.complHint': '提示：用手指从{a}数到{b}。',
  'LO-5.add': '看，有{a}个{things}。我再放{b}个。一共有几个？',
  'LO-5.eat': '看，有{a}个{things}。小恐龙吃掉{b}个。还剩几个？',
  'LO-5.addHint': '提示：把左边和右边的水果都数一数。',
  'LO-5.eatHint': '提示：只数没有被划掉的水果。',
  'LO-11.prompt': ['仔细听：{calc}。等于几？', '{calc}等于几？', '心算：{calc}。点出答案！'],
  'VO-13.prompt': ['{calc}等于几？告诉我！', '{calc}是多少？说给我听！'],
  'VO-13.repeat': '听好：{calc}等于{n}。现在你来说！',
  'VO-13.fallback': '{calc}等于几？点正确的数字！',
  'MO-4.prompt': ['和{word}配对的是什么？', '看：{word}。什么和它是一对？'],
  'MO-4.yes': '对！{a}和{b}是一对！',
  'MO-4.hint': '提示：想一想{word}。它旁边经常有什么？',
  'MO-5.prompt.big': ['在现实中，哪个最大？', '点现实中最大的那个！'],
  'MO-5.prompt.small': ['在现实中，哪个最小？', '点现实中最小的那个！'],
  'MO-5.yes.big': '对！在现实中，{word}最大！',
  'MO-5.yes.small': '对！在现实中，{word}最小！',
  'MO-5.hint': '提示：图片里它们都一样大。想象一下它们真的在你身边！',
  'LO-6.prompt': ['点数字{n}！', '数字{n}在哪里？', '找到{n}！'],
  'LO-6.yes': '对！是{n}！',
  'LO-6.hint': '提示：用手指数到{n}，再找这个数字。',
  'LO-6.hintBig': '提示：先仔细看第一个数字，再看第二个。',
  'EN-2.hint': '提示：用手指用英语数数，听到正确的数字就停下。',
  'LO-7.shape': '点{shape}！',
  'LO-7.color': '点{color}的形状！',
  'LO-7.both': '点{color}的{shape}！',
  'LO-7.yes.shape': '对！{shape}！',
  'LO-7.yes.color': '对！{color}的那个！',
  'LO-7.yes.both': '对！{color}的{shape}！',
  'LO-7.hint.color': '提示：只看颜色，形状不重要。',
  'LO-7.hint.both': '提示：先找对颜色，再仔细看形状。',
  ...kv('shape', 'circle=圆形; square=正方形; triangle=三角形; star=星形; heart=心形; rectangle=长方形; diamond=菱形; oval=椭圆形; hexagon=六边形; cross=十字形'),
  ...kv('clue', `circle=圆形圆圆的，没有角; square=正方形有四条一样长的边; triangle=三角形有三条边和三个角;
    star=星形有五个尖角; heart=心形上面有两个圆弧，下面有一个尖; rectangle=长方形有四条边，两条长，两条短;
    diamond=菱形像一个立在角上的正方形; oval=椭圆形是拉长的圆; hexagon=六边形有六条边; cross=十字形有四个臂`),
  ...kv('color', 'red=红色; blue=蓝色; green=绿色; yellow=黄色; orange=橙色; purple=紫色; pink=粉色'),
  'time.0': '{h}点整', 'time.30': '{h}点半', 'time.15': '{h}点一刻', 'time.45': '{h}点三刻',
  'time.m': '{h}点{m}分', 'time.24': '{h}点{mm}分',
  'LO-8.prompt': ['点显示{time}的钟！', '哪个钟是{time}？'],
  'LO-8.yes': '对！是{time}！',
  'LO-8.hint': '提示：短针指的是小时，长针指的是分钟。',
  'LO-8.hintHard': '提示：先看短针知道几点，再看长针知道几分。',
  'money.e1': '一欧元', 'money.e': '{e}欧元', 'money.c1': '一欧分', 'money.c': '{c}欧分', 'money.ec': '{e}欧元{c}欧分',
  'LO-9.prompt': ['点有{money}的卡片！', '哪里正好是{money}？'],
  'LO-9.yes': '对！一共{money}！',
  'LO-9.hint': '提示：先数纸币和大硬币，再加上小硬币。',
  'TR.dots': ['沿着虚线描一描！', '用手指描这些点！'],
  'TR.faint': '跟着小点点描一描。',
  'TR.free': ['现在自己照着样子画！', '轮到你了：不看点点画出来！'],
  'TR.yes': ['太棒了！真漂亮！', '真厉害！', '画得真好看！'],
  'TR.hint': '看，我来教你！从1号绿点开始。',
  'LO-10.prompt': ['翻开两张牌。如果一样，你就赢得这一对！', '找出所有的对子！'],
  'LO-10.promptForeign': ['翻开两张牌，找出对子！听……是英语哦！', '找出对子，听听英语单词！'],
  'LO-10.yes': ['太棒了，你找到了所有的对子！', '记性真好！全部找到了！'],
  'LO-10.hint': '记住你已经看过的图片在哪里！',
  'VO-1.prompt': ['这个叫什么？', '这是什么？', '告诉我这是什么！'],
  'VO-1.repeat': '仔细听：{word}。现在你来说！',
  'VO-2.prompt': ['{word}用英语怎么说？', '用英语说：{word}！'],
  'VO-2.yes': ['太棒了，说得真好！', '真厉害，你会说英语！', '完美！'],
  'VO-2.repeat': '仔细听，跟我说：',
  'VO-2.fallback': '点这个英语单词的图片：',
  'VO-2.hint': '提示：想想你已经会的英语单词！',
  'l.handover': ['{current}真棒！现在轮到{next}了！', '谢谢{current}！{next}，轮到你玩了！'],
  'l.gift': ['我长大了！给我选一个礼物吧！', '礼物！你要送我哪一个？'],
  'l.giftThanks': '哇，{item}！谢谢你！',

  ...kv('num', `0=零; 1=一|幺; 2=二|两; 3=三; 4=四; 5=五; 6=六; 7=七; 8=八; 9=九; 10=十; 11=十一; 12=十二; 13=十三;
    14=十四; 15=十五; 16=十六; 17=十七; 18=十八; 19=十九; 20=二十`),

  'l.hello': ['你好，{name}！是我，你的小恐龙！', '你好，{name}！我们一起会玩得很开心！'],
  'l.welcome_back': ['{name}，你回来啦！太好了！', '你好，{name}！我好想你！', '啊，你来啦！我们玩吧？', '太好了，我的好朋友来了！'],
  'l.home.play': ['点绿色按钮：我们去游戏世界环游吧！', '要玩吗？点绿色按钮！'],
  'l.home.categories': ['想自己选游戏，就点小按钮。'],
  'l.random.go': ['出发！', '起飞！环游世界！', '来，我们玩吧！', '预备……开始！'],
  'l.home.choose': ['选一个游戏！点一个大泡泡。'],
  'l.home.EN-1': ['国旗：英语单词！'],
  'l.home.MO-1': ['指给我看世界上的东西！'],
  'l.home.LO-1': ['拼图：找不同！'],
  'l.home.LO-2': ['算盘：我们来数数！'],
  'l.home.MO-3': ['影子：这是谁？'],
  'l.home.LO-3': ['箭头：接下来是什么？'],
  'l.home.LO-4': ['天平：哪边更多？'],
  'l.home.LO-5': ['数字：我们来算术！'],
  'l.home.LO-11': ['耳朵：心算！'],
  'l.home.VO-13': ['麦克风：告诉我算式的答案！'],
  'l.home.EN-2': ['十：英语数字！'],
  'l.home.MO-4': ['握手：什么是一对？'],
  'l.home.MO-5': ['尺子：现实中谁更大？'],
  'l.home.LO-6': ['数字：找到正确的数字！'],
  'l.home.LO-10': ['卡片：记忆翻牌！'],
  'l.home.EN-3': ['小丑牌：英语记忆翻牌！'],
  'l.home.LO-7': ['调色板：形状和颜色！'],
  'l.home.LO-8': ['闹钟：现在几点？'],
  'l.home.LO-9': ['钞票：我们来数钱！'],
  'l.home.TR-1': ['铅笔：我们来描形状！'],
  'l.home.TR-2': ['写字的手：我们来描字母和数字！'],
  'l.intro.MIX': ['认真听每一道题！', '竖起耳朵听！', '准备好了吗？我准备好了！'],
  'l.short.EN-1': ['英语！'],
  'l.short.MO-1': ['指给我看！'],
  'l.short.MO-3': ['影子！'],
  'l.short.LO-1': ['找不同！'],
  'l.short.LO-2': ['数一数！'],
  'l.short.LO-3': ['接下来是什么！'],
  'l.short.LO-4': ['多还是少！'],
  'l.short.LO-5': ['算一算！'],
  'l.short.LO-11': ['心算！'],
  'l.short.VO-13': ['说出答案！'],
  'l.short.EN-2': ['英语数字！'],
  'l.short.MO-4': ['什么是一对？'],
  'l.short.MO-5': ['最大还是最小！'],
  'l.short.LO-6': ['找数字！'],
  'l.short.LO-10': ['记忆翻牌！'],
  'l.short.EN-3': ['英语记忆翻牌！'],
  'l.short.LO-7': ['形状和颜色！'],
  'l.short.LO-8': ['现在几点？'],
  'l.short.LO-9': ['认识钱！'],
  'l.short.TR-1': ['描一描！'],
  'l.short.TR-2': ['写一写！'],
  'l.home.level': ['星星是我的等级！'],
  'l.intro.EN-1': ['我说一个英语单词。点正确的图片！'],
  'l.intro.MO-1': ['仔细听，点我说的东西。', '我们去环游世界！找到我说的东西。'],
  'l.intro.LO-1': ['仔细看这些图片。只有一张不是同一类：找出来！'],
  'l.intro.LO-2': ['我们来数数！数一数水果，点正确的数字。'],
  'l.intro.MO-3': ['仔细看这个黑影子。找出它是谁的！'],
  'l.intro.LO-3': ['仔细看规律，找出接下来是什么。'],
  'l.intro.LO-4': ['仔细看卡片。找到我说的那一张！'],
  'l.intro.LO-11': ['没有图片的算术！仔细听，在心里算，然后点正确的数字。'],
  'l.intro.VO-13': ['我说一道算术题，你告诉我答案。点麦克风来回答！'],
  'l.intro.LO-5': ['我们来算术！仔细听，点正确的数字。', '算术时间到！你可以用手指数。'],
  'l.intro.EN-2': ['我用英语说一个数字。点正确的数字！'],
  'l.intro.MO-4': ['有些东西是一对，比如钥匙和锁。找出是一对的东西！'],
  'l.intro.MO-5': ['图片里东西都一样大。可是在现实中呢？找到我说的那个！'],
  'l.intro.LO-6': ['我说一个数字。在卡片里找到它！'],
  'l.intro.LO-10': ['我们来玩记忆翻牌！翻开两张牌：如果图片一样，你就赢得这一对！'],
  'l.intro.EN-3': ['英语记忆翻牌！你翻开一张牌，我就用英语说出这个词。找出对子！'],
  'l.intro.LO-7': ['我们来玩形状和颜色！仔细听，点正确的形状。'],
  'l.intro.LO-8': ['仔细看这些钟！短针指小时，长针指分钟。'],
  'l.intro.LO-9': ['我们来玩开商店！数一数硬币，找到正确的金额。'],
  'l.intro.TR-1': ['我们用手指画画！从绿点开始，沿着虚线走。'],
  'l.intro.TR-2': ['我们来学写字！从1号绿点开始，沿着虚线走。'],
  'l.trace.start': ['把手指放在绿点上，跟着小点点走。', '来，用手指画吧！'],
  'l.trace.continue': ['继续，快完成了！', '还差一点。继续！'],
  'l.trace.retry': ['差一点！我们擦掉重来好吗？', '哎呀，不太对。再试一次！'],
  'l.tutorial': ['看，我来教你！像这样点正确的图片。'],
  'l.tutorial_your_turn': ['现在轮到你了！'],
  'l.correct': ['{name}真棒！', '做得好，{name}！', '没错！', '太棒了！', '真厉害！', '耶！', '好极了！', '冠军！', '你是小明星！',
    '对啦！', '完美！', '哇！'],
  'l.wrong': ['哎呀！再试一次！', '嗯，仔细看看……', '不是这个！继续找！', '差一点！再来一次！', '没关系，再试试！'],
  'l.hint': ['我帮你：点那个闪闪发光的！', '看，就是我指的这个！'],
  'l.streak': ['连对三个！你太厉害了！', '连对三个！不可思议！'],
  'l.idle': ['你还在吗？点一张卡片吧！', '我在等你哦！点一张卡片。'],
  'l.touch_me': ['想再听一遍，就点我！'],
  'l.review_due': ['这道题我们以前一起做过。你还记得吗？', '复习题！我相信你会的。'],
  'l.review': ['你全都会了！我们复习一下吧？'],
  'l.series_perfect': ['哇，全对！你真是小明星，{name}！', '一个都没错！我高兴得跳起舞来！'],
  'l.series_great': ['太厉害了！几乎全对！', '{name}，你真有天赋！'],
  'l.series_good': ['玩得真好！你学得真快！', '真棒，你找到了好多！'],
  'l.series_ok': ['玩得不错！我们继续练习吧？', '很好！每一轮都让你更厉害。'],
  'l.series_encourage': ['有点难，对吧？我也在学习呢！', '没关系！我们边玩边学。', '大恐龙也会出错！我们再来一次？'],
  'l.end.feed': ['看这一篮水果！点篮子把水果给我。', '好吃！把篮子给我：点它！'],
  'l.end.nothing': ['这次没有水果。我们再玩一次赢一些吧？'],
  'l.end.again': ['点绿色按钮再玩一次！'],
  'l.fly.visit': ['看，一只苍蝇！', '我喜欢苍蝇！'],
  'l.home.ambient': ['我觉得火山还在喷发。', '我有点饿了。', '希望你能帮我长大。', '看，云朵飘过去了！'],
  'l.fly.caught': ['吸溜！一只苍蝇！', '好吃，脆脆的！', '抓到了！'],
  'l.fruit.won': ['给我一个水果！', '好吃，一个水果！'],
  'l.eating': ['啊呜啊呜！', '咔嚓！真好吃！', '嗯，好香！', '还要，谢谢！', '谢谢你！'],
  'l.full': ['我的肚子吃饱了！剩下的留到以后吃。'],
  'l.level_up': ['哦！我在长大！谢谢你把我照顾得这么好！', '看，我变大了！'],
  'l.tickle': ['嘻嘻，好痒！', '哈哈哈！别挠了！', '哎呀，别挠我痒痒！'],
  'l.start': ['点我，把我叫醒！'],
  'l.parent_code': ['玩之前，去叫爸爸或妈妈来！他们要为我设置一个秘密密码。'],
  'l.parent_code_done': ['谢谢！现在我们可以一起玩了！'],
  'l.wardrobe.intro': ['把一件东西拖到我身上，给我穿上！', '给我打扮一下！用手指拿起一件东西放到我身上。'],
  'l.wardrobe.drag': ['手指按住这件东西，把它拖到我身上！'],
  'l.wardrobe.off': ['好的，我脱下来！', '脱掉啦！'],
  'l.wardrobe.empty': ['我的衣柜是空的！我长大的时候，你就能为我赢得一件东西。'],
  'l.home.wardrobe': ['帽子是用来给我打扮的！'],
  'l.gift.waiting': ['我长大了！点礼物给我选一件东西。'],
  'l.gift.go': ['我长大了！来我的衣柜吧：有一个礼物在等你！'],
  'l.wardrobe.new': ['把它拖到我身上，给我穿上！'],
  'l.wardrobe.take_off': ['想给我脱下一件东西，就把它从我身上拖开。'],
  'l.night.last': ['哎呀，天晚了……再玩最后一轮，然后睡觉好吗？', '啊……我困了。来，最后一轮！'],
  'l.night.goodnight': ['这是最后一轮了！谢谢你陪我度过美好的一天。晚安！'],
  'l.night.sleep': ['嘘……我在睡觉。呼呼……明天见！'],
  'l.bedtime': ['我们今天玩得真开心！现在我要去睡觉了。明天再一起玩吧？'],
  'l.streak5': ['连对五个！你是天才！', '五个！你比霸王龙还厉害！'],
  'l.correct_after_try': ['你找到了！你看，只要认真找就行！', '对啦！你没有放弃，真棒！'],
  'l.halfway': ['已经一半了！继续加油！', '一半啦！只剩几道题了！'],
  'l.last_question': ['最后一题！', '来，最后一个！'],
  'l.home.voice': ['麦克风：用声音回答的游戏！'],
  'l.home.voice_choose': ['在这里，你要说出答案！选一个游戏。'],
  'l.intro.VO-1': ['我给你看一张图片。点麦克风，告诉我它叫什么。'],
  'l.intro.VO-2': ['我们来说英语！点麦克风，用英语说出这个词。'],
  'l.home.VO-1': ['说话的头：说出图片的名字！'],
  'l.home.VO-2': ['国旗：用英语说单词！'],
  'l.short.VO-1': ['这叫什么？'],
  'l.short.VO-2': ['用英语说！'],
  'l.voice.tap_mic': ['点麦克风，回答我。', '轮到你了！点麦克风，大声说。'],
  'l.voice.listening': ['我在听！', '我的耳朵竖起来了！'],
  'l.voice.unheard': ['我没听清楚。点麦克风，大声说。', '哦，我什么都没听到！靠近一点，大声一点。'],
  'l.voice.wrong': ['不是这个！再试一次！', '差一点！再来一次！'],
  'l.voice.cards': ['我的耳朵累了！用手指点正确的答案吧。'],
  'l.voice.give_up': ['麦克风听不清我说话。接下来我们用手指玩吧！'],
  'l.voice.loading': ['等一下，我在清理耳朵……'],
  'l.voice.no_mic': ['哦，我听不到你。我们用手指玩吧！'],
  'l.egg.1': ['咚咚！有人吗？', '哦！里面有东西在动！'],
  'l.egg.2': ['再来！帮我出来！', '继续，蛋壳要裂开了！'],
  'l.egg.3': ['差一点！再敲一下！'],
  'l.egg.hatched': ['你好！', '呼！我出来啦！'],
  'l.hello.1': ['你好！我是你的小恐龙，一只{color}的恐龙宝宝。你愿意帮我长大吗？'],
  'l.hello.4': ['我们要一起玩好多游戏：动物、形状、字母、数字，还有另一种语言！'],
  'l.hello.5': ['每次你第一次就答对，就能得到一个水果。看，它们掉进我的篮子里啦！'],
  'l.hello.6': ['然后你把水果喂给我吃。好吃！我吃得越多，长得越大！'],
  'l.hello.7': ['我长大的时候，你会得到礼物：给我打扮的衣服、星星，还有惊喜！'],
  'l.hello.2': ['我刚刚出生……我对这个世界还一无所知！跟着你，我会学会所有东西。'], 'l.hello.9': ['在“我的恐龙”里，你可以随便给我打扮：帽子、眼镜、披风……我会是最漂亮的恐龙！'], 'l.hello.10': ['如果你答错了，一点儿也没关系：我会给你提示，我们一起再试一次！'], 'l.hello.8': ['来，出发吧！'],
  'l.hello.name': ['不过先告诉我：你叫什么名字？点麦克风，大声说出你的名字！'],
  'l.hello.name_again': ['我没听清楚。点麦克风，再说一遍你的名字！'],
  'l.hello.name_ok': ['很高兴认识你，{name}！多好听的名字！'],
  'l.hello.name_later': ['你可以以后再告诉我你的名字：爸爸或妈妈会帮我写下来！'],
  'l.hello.age': ['{name}，你几岁了？点麦克风告诉我！'],
  'l.hello.age_again': ['我没听清楚。你几岁了？点麦克风！'],
  'l.hello.age_later': ['没关系：爸爸或妈妈会告诉我的！'],
  'l.hello.sibling': ['你好，{name}！我是你的小恐龙，一只{color}的恐龙宝宝。我们一起会玩得很开心！'],
  'l.hello.mic_allow': ['如果屏幕上出现一条消息，请大人点“允许”！'],
  'l.hello.parent': ['现在把手机交给爸爸或妈妈！他们要设置一个只属于我的秘密密码。'],
  'l.welcome_first': ['这是我的家，{name}！我们会玩得很开心！'],
  'l.burp': ['哎呀！对不起！', '嘻嘻……不好意思！', '对不起……太好吃了！'],
  'l.fart': ['哎呀……对不起！', '嘻嘻，不是我！', '对不起！我的肚子在发出奇怪的声音！'],
  'l.hunger.growl': ['你听到了吗？我的肚子在咕咕叫！把篮子给我！'],
  'l.hunger.look': ['嗯……这个水果看起来好好吃……点篮子！'],
  'l.hunger.beg': ['求求你，求求你！把篮子给我！', '来嘛，{name}，求你了！我饿了！'],
  'l.hunger.gape': ['看，我张大嘴巴：啊——！把水果放进来！'],
  'l.hunger.sad': ['我好饿啊……点篮子！', '我的肚子空空的……你能喂我吗？'],
  'l.child.turn': ['轮到你了，{name}！我们一起玩吧？', '你好，{name}！轮到你玩了！'],
  'l.child.ask_name': ['你好！去叫爸爸或妈妈来：他们要告诉我你的名字！'],
  'l.age.ask': ['你几岁了？点有你年龄的蛋糕！'],
  'l.age.3': ['三岁！真棒！'], 'l.age.4': ['四岁！真棒！'], 'l.age.5': ['五岁！太好了！'],
  'l.age.6': ['六岁！太好了！'], 'l.age.7': ['七岁！哇！'],

  ...kv('c', `dog=小狗; cat=小猫; fish=鱼; bird=小鸟; cow=奶牛; pig=小猪; horse=马; duck=鸭子; rabbit=兔子; hen=母鸡;
    sheep=绵羊; frog=青蛙; mouse=老鼠; dinosaur=恐龙; red=红色; blue=蓝色; green=绿色; yellow=黄色; orange_color=橙色;
    purple=紫色; pink=粉色; black=黑色; white=白色; brown=棕色; apple=苹果; banana=香蕉; strawberry=草莓; cherry=樱桃;
    orange=橙子; egg=鸡蛋; ice_cream=冰淇淋; pizza=比萨; grapes=葡萄; pear=梨; lemon=柠檬; carrot=胡萝卜; bread=面包;
    milk=牛奶; cake=蛋糕; watermelon=西瓜; cookie=饼干; cheese=奶酪; tomato=西红柿; pineapple=菠萝; peach=桃子;
    broccoli=西兰花; corn=玉米; kiwi=猕猴桃; mango=芒果; blueberries=蓝莓; coconut=椰子; car=汽车; ball=球; bus=公交车;
    train=火车; plane=飞机; boat=船; bike=自行车; balloon=气球; teddy=泰迪熊; book=书; house=房子; kite=风筝; bed=床;
    chair=椅子; door=门; key=钥匙; clock=钟; sun=太阳; moon=月亮; star=星星; flower=花; cloud=云; rainbow=彩虹; tree=树;
    rain=雨; snowflake=雪花; snowman=雪人; leaf=叶子; mountain=山; fire=火; sunflower=向日葵; drop=水滴; eye=眼睛;
    ear=耳朵; nose=鼻子; mouth=嘴巴; hand=手; foot=脚; tooth=牙齿; lion=狮子; tiger=老虎; elephant=大象; monkey=猴子;
    bear=熊; giraffe=长颈鹿; zebra=斑马; panda=熊猫; snake=蛇; turtle=乌龟; crocodile=鳄鱼; kangaroo=袋鼠; hippo=河马;
    gorilla=大猩猩; rhino=犀牛; butterfly=蝴蝶; bee=蜜蜂; ladybug=瓢虫; spider=蜘蛛; ant=蚂蚁; snail=蜗牛; dolphin=海豚;
    whale=鲸鱼; octopus=章鱼; crab=螃蟹; shark=鲨鱼; owl=猫头鹰; penguin=企鹅; parrot=鹦鹉; flamingo=火烈鸟; peacock=孔雀;
    eagle=老鹰; swan=天鹅; hat=帽子; shoe=鞋子; dress=裙子; cap=鸭舌帽; socks=袜子; gloves=手套; tshirt=T恤; glasses=眼镜;
    umbrella=雨伞; pencil=铅笔; spoon=勺子; scissors=剪刀; hammer=锤子; ladder=梯子; broom=扫帚; bottle=奶瓶;
    toothbrush=牙刷; guitar=吉他; drum=鼓; piano=钢琴; violin=小提琴; trumpet=小号; helicopter=直升机; tractor=拖拉机;
    rocket=火箭; ambulance=救护车; motorbike=摩托车; fire_engine=消防车; police_car=警车; scooter=滑板车; sled=雪橇;
    llama=羊驼; goat=山羊; camel=骆驼; hedgehog=刺猬; squirrel=松鼠; bat=蝙蝠; deer=鹿; wolf=狼; fox=狐狸; raccoon=浣熊;
    beaver=河狸; otter=水獭; sloth=树懒; skunk=臭鼬; bison=野牛; castle=城堡; tent=帐篷; lighthouse=灯塔; volcano=火山;
    island=小岛; anchor=锚; magnet=磁铁; compass=指南针; microscope=显微镜; telescope=望远镜; hourglass=沙漏;
    jellyfish=水母; seal=海豹; lobster=龙虾; shrimp=虾; squid=鱿鱼; oyster=牡蛎; beetle=甲虫; cricket=蟋蟀; mosquito=蚊子;
    worm=虫子; scorpion=蝎子; rooster=公鸡; turkey=火鸡; donkey=驴; ox=牛; leopard=豹子; polar_bear=北极熊; koala=考拉;
    orangutan=猩猩; mammoth=猛犸象; moose=驼鹿; badger=獾; avocado=牛油果; eggplant=茄子; garlic=大蒜; onion=洋葱;
    pepper=辣椒; cucumber=黄瓜; potato=土豆; mushroom=蘑菇; peanuts=花生; croissant=羊角面包; pancakes=松饼; honey=蜂蜜;
    spaghetti=意大利面; fries=薯条; sandwich=三明治; candle=蜡烛; mirror=镜子; window=窗户; bucket=水桶; bell=铃铛;
    lock=锁; light_bulb=灯泡; flashlight=手电筒; axe=斧头; saw=锯子; wrench=扳手; screwdriver=螺丝刀; paintbrush=画笔;
    crayon=蜡笔; trophy=奖杯; medal=奖牌; ring=戒指; skateboard=滑板; yoyo=溜溜球; roller_skate=旱冰鞋; canoe=独木舟;
    tram=有轨电车; parachute=降落伞; satellite=卫星; brain=大脑; bone=骨头; tongue=舌头; leg=腿; tornado=龙卷风;
    lightning=闪电; comet=彗星; cactus=仙人掌; blossom=樱花; feather=羽毛`),

  // ---- Mon pays ----
  "lang.ko": "韩语", "lang.ne": "尼泊尔语",
  "lang.vi": "越南语", "lang.tr": "土耳其语", "lang.fa": "波斯语", "lang.pl": "波兰语", "lang.uk": "乌克兰语",
  "lang.id": "印尼语",
  "country.cd": "刚果民主共和国",
  "title.MO-6": "世界 — 我的国家",
  "l.home.MO-6": ["地图：关于你的国家的问题！"],
  "l.intro.MO-6": ["我们来聊聊你的国家！仔细听，点正确的图片。", "你了解你的国家吗？我来问你问题！"],
  "l.short.MO-6": ["一个关于你的国家的问题！"],
  "cty.flag": "{country}的国旗是哪一面？",
  "cty.flagHard": "注意，它们很像！{country}的国旗是哪一面？",
  "cty.flagYes": "对！这是{country}的国旗！",
  "cty.flagHint": "仔细看颜色和它们的顺序",
  "cty.symbol": "哪一个是{country}的象征？",
  "cty.symbolYes": "对！这是{country}的象征！",
  "cty.symbolYesName": "对！{name}是{country}的象征！",
  "cty.food": ["哪一个是{country}的特色美食？", "在{country}，大家喜欢吃什么？"],
  "cty.foodYes": "好吃！这是{country}的特色美食！",
  "cty.day": "{date}是{country}的国庆节！晚上我们在天空中看什么？",
  "cty.dayYes": "对！{date}有很大的烟花！",
  "cty.currency": "在{country}用什么钱？",
  "cty.currencyYes": "对！在{country}用{money}！",
  "cty.place": "在{country}能看到哪个有名的地方？",
  "cty.sport": "在{country}，大家喜欢什么运动？",
  "cty.thing": "在{country}的节日里经常看到什么？",
  "cty.landmarkYes": "对！真棒，你很了解你的国家！",
  "cty.capital": "{country}的首都是哪里？仔细读城市的名字！",
  "cty.capitalYes": "对！{country}的首都是{city}！",
  "cty.neighbour": "这些国旗中，哪一面是{country}邻国的？",
  "cty.neighbourYes": "对！这个国家就在{country}旁边！",
  "cty.neighbourHint": "邻国离得很近，在同一个大洲",
  // Espace parents : onglets.
  'p.dailyShort': '之后恐龙就去睡觉。', 'p.credits': '致谢与许可', 'p.creditsHelp': 'DinoLearn 使用了以下软件、语音、图片、字体和声音。感谢它们的作者！', 'p.credits.voices': '恐龙的声音', 'p.credits.asr': '语音识别', 'p.credits.code': '游戏引擎', 'p.credits.images': '图片和字体', 'p.credits.sounds': '音效', 'p.tab.control': '控制', 'p.tab.print': '打印', 'p.printOffer': '提供可打印的练习纸', 'p.printOfferHelp': '游戏时间结束时，恐龙会送出三个信封；孩子每天可选一个，练习纸会出现在“打印”页。', 'p.tab.profile': '资料', 'p.tab.progress': '进步', 'p.tab.games': '游戏', 'p.tab.settings': '设置', 'p.summary': '概览', 'p.lower': '降低', 'p.higher': '提高',
};

export default zh;
