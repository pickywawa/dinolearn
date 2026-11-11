import type { Catalog } from '../index';
import { kv } from '../kv';

/**
 * 한국어 (두 번째 언어: 영어). 넣는 낱말 뒤에 조사가 붙지 않도록
 * « 찾아 봐: {word}! »처럼 문장을 만들었어요.
 */
const ko: Catalog = {
  ...kv('lang', 'fr=프랑스어; en=영어; es=스페인어; it=이탈리아어; de=독일어; pt=포르투갈어; ru=러시아어; zh=중국어; hi=힌디어; ar=아랍어; ur=우르두어; bn=벵골어; id=인도네시아어; vi=베트남어; tr=튀르키예어; fa=페르시아어; pl=폴란드어; uk=우크라이나어; ko=한국어; ne=네팔어'),
  ...kv('country', 'fr=프랑스; be=벨기에; ch=스위스; ca=캐나다; lu=룩셈부르크; gb=영국; us=미국; es=스페인; mx=멕시코; it=이탈리아; de=독일; at=오스트리아; pt=포르투갈; br=브라질; ru=러시아; cn=중국; in=인도; eg=이집트; ma=모로코; sa=사우디아라비아; pk=파키스탄; bd=방글라데시; cd=콩고민주공화국'),

  'ui.loading': '불러오는 중…', 'ui.rotate': '태블릿을 돌려 줘!', 'ui.tap': '화면을 눌러서 놀자!', 'ui.retry': '다시 시도', 'ui.problem': '문제: {reason}',
  'ui.cancel': '취소', 'ui.skip': '건너뛰기', 'ui.home.play': '놀이 시작', 'ui.home.missions': '미션', 'ui.home.mydino': '내 공룡', 'ui.home.settings': '설정', 'ui.end.again': '다시 하기', 'ui.home.playWith': '{name}, 공룡이랑 놀자!', 'ui.home.learn': '공룡이랑 놀면서 배워요!',
  'ui.home.summary': '끝낸 판: {n}. 공룡이 너와 함께 자라요!',
  'ui.home.sleeping': '쉿… 공룡이 자고 있어요.\n부모님이 비밀번호로 열 수 있어요.', 'ui.home.timeUp': '오늘 놀이 시간이 끝났어요.\n부모님이 비밀번호로 열 수 있어요.',
  'ui.child.title': '아이 이름이 뭐예요?', 'ui.child.sub': '공룡이 이름을 불러 줄 거예요.', 'ui.parents.title': '부모님 공간',
  'ui.pin.type': '부모님 비밀번호를 입력하세요.', 'ui.pin.title': '부모님 비밀번호', 'ui.pin.choose': '숫자 4개로 된 비밀번호를 정하세요.',
  'ui.wardrobe.title': '내 공룡 – 옷장', 'ui.wardrobe.reactions': ['멋지다!', '정말 좋아!', '나 멋있지?', '정말 근사해!'],
  'ui.choose.voice': '소리 내어', 'ui.choose.voiceTitle': '목소리로 놀자!', 'ui.choose.title': '놀이를 골라 봐!',
  'ui.end.3': '최고야!', 'ui.end.2': '아주 잘했어!', 'ui.end.1': '잘했어!', 'ui.end.0': '계속 힘내!', 'ui.end.done': '한 판을 끝냈어!',
  'ui.time.unlimited': '무제한', 'ui.time.less': '시간 줄이기', 'ui.time.more': '시간 늘리기', 'ui.lang': '언어', 'ui.langLabel': '언어:', 'ui.mb': '{n}MB',
  'ui.pack.voice': '{language} 팩', 'ui.pack.asr': '음성 인식', 'ui.pack.stalled': '다운로드가 멈췄습니다. 연결을 확인하세요.', 'ui.pack.downloading': '내려받는 중: {list}', 'ui.pack.installing': '음성 인식 설치 중',
  'ui.pack.speechTitle': '공룡 목소리 ({language})', 'ui.pack.speechDetail': '어느 기기에서나 같은 자연스러운 목소리예요.',
  'ui.pack.secondTitle': '{language} 목소리', 'ui.pack.secondDetail': '외국어 놀이의 낱말에 써요.', 'ui.pack.asrTitle': '음성 인식',
  'ui.pack.asrDetail': '소리 내어 대답하기 위해 써요.', 'ui.pack.download': '내려받기', 'ui.pack.installed': '설치됨 ✓',
  'ui.pack.toDownload': '내려받을 크기: {n}MB (와이파이 권장).', 'ui.pack.allInstalled': '모두 설치되었어요.', 'ui.pack.running': '내려받는 중…',
  'ui.pack.finished': '완료.', 'ui.pack.failed': '실패: {error}', 'ui.pack.installingShort': '설치 중…', 'ui.pack.waiting': '기다리는 중…',
  'voice.heard': '이렇게 들었어: {word}.',

  ...kv('p', `title=부모님 공간; back=놀이로 돌아가기; noName=이름 없음; addChild=+ 아이 추가; newChild=새 아이;
    newChildHelp=부모님 공간을 나가면 새 아이가 자기 알을 눌러 자기 공룡을 부화시켜요.;
    cancel=취소; edit=✏️ 프로필 수정; sheetOf=프로필: {name}; sheet=아이 프로필; sheetHelp=이름, 나이, 설정.;
    removeChild=삭제: {name}; thisChild=이 아이; removeConfirm={name}의 공룡과 모든 기록을 삭제할까요? 되돌릴 수 없어요.;
    egg=아직 부화하지 않은 알; dino=공룡; alternateAria=아이들끼리 번갈아; age=나이: {n}; otherCountry=다른 나라;
    series=한 판 수; answers=대답 수; firstTry=한 번에 정답; today=오늘 놀이;
    childrenHelp=아이마다 자기 공룡, 기록, 설정이 있어요. 아래 설정은 선택한 아이의 것이에요.;
    alternate=번갈아 하기: 한 판이 끝날 때마다 다음 아이 차례;
    difficulty=놀이의 시작 난이도: 20 중 {n} ({stage}). 그다음에는 결과에 맞춰 스스로 바뀌어요.;
    stageCP=초등 1학년; stageK=유치원; dinoLevel=공룡 레벨;
    dinoLevelHelp=아이가 먹이를 주면 공룡이 자라요 (레벨 1~{max}). 난이도를 맞추려고 바꿀 수 있어요: 레벨 21~40은 초등 1학년 수준이에요.;
    noNight=밤 모드 없음; week=최근 7일 놀이 시간; daily=하루 놀이 시간;
    dailyHelp=시간이 다 되면 아이가 그 판을 마치고, 놀이는 다음 날까지 잠겨요: 공룡이 자러 가요. 비밀번호로 15분이나 30분을 더하거나 하루 종일 열 수 있어요.;
    night=잘 시간 (밤 모드);
    nightHelp=이 시간이 지나면 하늘이 밤이 되고 공룡이 하품해요: 마지막 한 판을 하자고 한 뒤 아침까지 자요. 비밀번호로 그날 밤 조금 더 놀게 할 수 있어요.;
    enable=켜기: {game}; levelOf=레벨: {game}; levelAuto=자동 레벨; level=레벨 {n}; fromAge={n}세부터;
    needsVoice=소리 내는 놀이: 마이크를 허용하고 음성 인식({language})을 내려받으세요 (“목소리와 내려받기” 항목).;
    nAnswers=대답: {n}; notPlayed=아직 안 함; rate=한 번에 정답: {rate}; mastered=익힌 문제: {total} 중 {n};
    lastPlayed=마지막: {date}; chooseAria=놀이 고르기 버튼; games=놀이; choose=첫 화면의 “놀이 고르기” 버튼;
    chooseHelp=꺼져 있으면 아이는 행성으로 놀아요: 한 판마다 나이에 맞는 모든 놀이가 섞여요. 켜져 있으면 놀이를 하나 골라서 할 수도 있어요.;
    gamesHelp=놀이를 끄면 더 이상 나오지 않아요. 레벨(1~20; 11~20 = 초등 1학년)은 다음 판의 시작이에요; “자동”은 나이, 공룡, 결과로 계산해요.;
    reviewToday=오늘 복습; reviewTomorrow=내일 다시; reviewOn=다시: {date}; reviewN=복습 {total} 중 {n}; review=연습할 것;
    reviewHelp=틀린 문제는 다음 날, 3일 뒤, 일주일 뒤에 다시 나와요. 세 번 다 맞으면 익힌 것이고, 틀리면 다음 날부터 다시 시작해요.;
    reviewNone=지금은 복습할 것이 없어요. 잘했어요!; sfxAria=효과음; musicAria=배경 음악; testVoice=목소리 들어 보기;
    testHello=안녕! 나는 디노야.; sound=소리; sfx=효과음 (정답, 오답, 냠냠…);
    music=잔잔한 배경 음악 (아이도 첫 화면에서 끌 수 있어요);
    phoneVoices=기본 목소리: {main} · 두 번째 언어 목소리: {second}. 휴대폰 목소리예요: 더 자연스러운 목소리를 원하면 접근성 설정(텍스트 음성 변환)에서 “고품질” 목소리를 설치하세요.;
    noVoice=찾을 수 없음; mic=마이크 (소리 내는 놀이);
    micHelp=소리 내는 놀이에서는 아이가 말로 대답해요. 모든 것은 이 기기에만 남아요: 목소리는 녹음되거나 전송되지 않아요. 마이크는 아이가 큰 마이크 버튼을 누를 때만 켜져요.;
    noMic=이 브라우저에서는 놀이에 마이크를 쓸 수 없어요.; allowMic=마이크 허용; allowMicNow=브라우저 창에서 마이크를 허용하세요…;
    micBlocked=마이크가 막혀 있어요. 브라우저 설정(주소 옆 자물쇠)에서 허용한 뒤 다시 해 보세요.;
    packsWhere=음성 인식 팩은 “목소리와 내려받기” 항목에서 내려받아요.; removePacks=팩 삭제;
    removePacksConfirm=이 기기에서 음성 인식 팩을 삭제할까요? 소리 내는 놀이가 더 이상 나오지 않아요.; packs=목소리와 내려받기;
    packsHelp=놀이 언어, 공룡의 자연스러운 목소리(기기에서 만들어지고, 내려받은 뒤에는 인터넷이 필요 없어요), 외국어 놀이 목소리, 음성 인식. 이 공간을 닫아도 내려받기는 계속돼요. 공룡 목소리가 없으면 휴대폰 목소리를 써요.;
    changeCode=비밀번호 바꾸기; newCode=새 부모님 비밀번호; newCodeHelp=숫자 4개로 된 새 비밀번호를 정하세요.; codeChanged=부모님 비밀번호를 바꿨어요.; code=부모님 비밀번호;
    codeHelp=비밀번호로 이 공간을 열고, 하루 시간이 끝났을 때 놀이를 열어요. 잊어버리면 “비밀번호를 잊으셨나요?”에서 어른용 질문에 답한 뒤 새로 만들 수 있어요.;
    reset=처음부터 다시; resetConfirm=모든 기록(공룡 레벨, 대답, 과일)을 지울까요? 설정은 남아요.;
    privacy=개인정보 처리방침; close=닫기; data=데이터; dataHelp=모든 것은 이 기기에만 저장돼요. 어떤 데이터도 전송되지 않아요.`),

  ...kv('pin', `erase=지우기; remember=잘 기억해 두세요.; forgot=비밀번호를 잊으셨나요?; adultQuestion=어른용 질문: {a} × {b}는? (세 자리);
    cancel=취소; wrongAnswer=틀렸어요.; newCode=새 부모님 비밀번호; newCodeHelp=숫자 4개로 된 새 비밀번호를 정하세요.; wrongCode=비밀번호가 틀렸어요.;
    otherCountry=다른 나라; firstName=이름;
    micHtml=<b>마이크 허용</b> (소리 내는 놀이)<br><small>모든 것은 이 기기에만 남아요: 목소리는 녹음되거나 전송되지 않아요.</small>;
    missionsHtml=<b>미션 고르기</b><br><small>아이가 놀이를 고를 수 있어요(“미션” 버튼). 선택하지 않으면 “놀기”로 무작위 판만 해요.</small>;
    ok=확인; nameMissing=아이 이름을 써 주세요.; age=나이; years={n}세; country=나라; daily=하루 놀이 시간; night=잘 시간 (밤 모드); none=없음;
    welcome=환영해요!;
    welcomeHeard=아이가 공룡에게 말한 내용이에요: 필요하면 고쳐 주세요. 부모님 공간(첫 화면의 자물쇠)에서 다른 아이를 추가하고 모든 것을 바꿀 수 있어요.;
    welcomeHelp=아이의 이름, 나이, 설정이에요. 부모님 공간(첫 화면의 자물쇠)에서 다른 아이를 추가하고 모든 것을 바꿀 수 있어요.;
    yourCode=부모님 비밀번호;
    yourCodeHelp=숫자 4개로 된 비밀번호를 정하세요. 부모님 공간(첫 화면의 자물쇠)을 열고, 하루 시간이 끝났을 때 놀이를 열어요. 아이에게는 알려 주지 마세요!;
    asleep=공룡이 자고 있어요; asleepHelp=잘 시간이에요. 오늘 밤 조금 더 놀려면 부모님 비밀번호를 입력하세요.;
    timeUp=놀이 시간이 끝났어요; timeUpHelp=오늘 시간을 더하려면 부모님 비밀번호를 입력하세요.;
    addTime=시간 더하기; todayOnly=오늘만.; plus15=15분 더; plus30=30분 더; unlimited=오늘은 제한 없음`),

  ...kv('inst', `title=휴대폰에 DinoLearn 설치하기; later=나중에; okay=확인; never=다시 묻지 않기;
    android=진짜 앱처럼 전체 화면, 가로로 열려요. 더 내려받을 것은 없어요.; menu=브라우저 메뉴에서:;
    androidSteps=<li><b>⋮</b>(오른쪽 위 점 세 개)를 누르세요.</li><li><b>“앱 설치”</b> 또는 <b>“홈 화면에 추가”</b>를 고르세요.</li><li>공룡 아이콘으로 놀이를 여세요.</li>;
    ios=진짜 앱처럼 Safari 막대 없이 전체 화면으로 열려요.;
    iosSteps=<li>{share} <b>공유</b>를 누르세요 (Safari 아래나 위).</li><li><b>“홈 화면에 추가”</b>, 그다음 <b>추가</b>를 고르세요.</li><li>공룡 아이콘으로 놀이를 여세요.</li>`),

  ...kv('title', `EN-1=영어 — 듣고 누르기; EN-2=영어 — 숫자; EN-3=영어 — 기억 놀이; MO-1=세상 — 보여 줘; MO-3=세상 — 그림자;
    MO-4=세상 — 짝 찾기; MO-5=세상 — 가장 큰 것; LO-1=생각 — 다른 하나; LO-2=생각 — 몇 개일까?; LO-3=생각 — 다음은 뭘까;
    LO-4=생각 — 많고 적고; LO-5=생각 — 셈하기; LO-6=생각 — 숫자; LO-7=생각 — 모양과 색깔; LO-8=생각 — 시계; LO-9=생각 — 돈;
    LO-10=생각 — 기억 놀이; LO-11=생각 — 듣고 셈하기; TR-1=쓰기 — 모양 따라 그리기; TR-2=쓰기 — 글자와 숫자 따라 쓰기;
    VO-1=소리 내어 — 이건 뭘까?; VO-2=소리 내어 — 영어로 말해 봐!; VO-13=소리 내어 — 셈하기; MO-6=세상 — 우리나라`),

  ...kv('item', `top-hat=실크해트; billed-cap=야구 모자; crown=왕관; womans-hat=밀짚모자; graduation-cap=학사모; rescue-workers-helmet=소방관 헬멧;
    headphone=헤드폰; hibiscus=꽃; glasses=안경; sunglasses=선글라스; goggles=물안경; ribbon=나비넥타이; swim-ring=튜브; sports-medal=메달;
    prayer-beads=목걸이; cape-red=슈퍼히어로 망토; cape-blue=마법사 망토; wing=날개; balloon=풍선; magic-wand=요술봉; lollipop=막대사탕;
    sunflower=해바라기; teddy-bear=곰 인형`),
  ...kv('dinocolor', '0=초록색; 1=파란색; 2=보라색; 3=분홍색; 4=주황색; 5=노란색; 6=청록색; 7=빨간색; 8=갈색'),

  ...kv('cat', `farm=농장 동물; sea=바다 동물; bird=새; bug=벌레; wild=야생 동물; forest=숲속 동물; fruit=과일; veg=채소; meal=먹을 것; vehicle=탈것;
    toy=장난감; home=집에 있는 물건; clothes=입는 것; tool=도구; kitchen=매일 쓰는 물건; music=악기; sky=하늘에 있는 것; plant=식물;
    body=몸의 한 부분; landscape=장소; color=색깔; element=자연에 있는 것`),
  ...kv('fam', `farm=농장 동물; sea=바다 동물; bird=새; bug=벌레; wild=야생 동물; forest=숲속 동물; fruit=과일; veg=채소; meal=음식과 간식;
    vehicle=탈것; toy=장난감; home=집 안 물건; clothes=옷; tool=도구; kitchen=욕실과 부엌 물건; music=악기; sky=하늘과 날씨; plant=식물;
    body=몸의 부분; landscape=장소; color=색깔; element=자연`),
  ...kv('fruit', `red-apple=사과; banana=바나나; strawberry=딸기; cherries=체리; grapes=포도; tangerine=오렌지; pear=배; lemon=레몬; watermelon=수박;
    peach=복숭아; pineapple=파인애플; kiwi-fruit=키위; mango=망고; blueberries=블루베리; melon=멜론; green-apple=풋사과; coconut=코코넛`),
  ...kv('many', `food-red-apple=사과; food-banana=바나나; food-strawberry=딸기; food-pear=배; food-lemon=레몬; food-tangerine=오렌지;
    food-kiwi-fruit=키위; food-peach=복숭아`),

  'g.hintFamily': '힌트: {family}.', 'g.word': '{word}!', 'g.yesWord': ['맞아, {word}!', '정답, {word}!'], 'g.yesItIs': '맞아, {word}!',
  'g.hint': '힌트: {hint}.', 'g.hintTens': '힌트: 먼저 첫 번째 숫자, 십의 자리를 봐.', 'g.plus': '{a} 더하기 {b}', 'g.minus': '{a} 빼기 {b}',
  'g.calcPrompt': ['{calc}, 얼마일까?', '{calc}는 몇일까?'], 'g.calcYes': '맞아! {calc}, 답은 {n}!',
  'g.hintAdd': '힌트: {a}에서 시작해서 손가락으로 {b}만큼 더 세어 봐.', 'g.hintSub': '힌트: {a}에서 시작해서 손가락으로 {b}만큼 거꾸로 세어 봐.',
  'MO-1.prompt': ['보여 줘: {word}!', '어디 있을까? {word}!', '눌러 봐: {word}!', '찾아 봐: {word}!'],
  'LO-1.prompt': ['다른 하나를 찾아 봐! 같은 무리가 아닌 건 뭘까?', '다른 그림과 다른 건 어느 거야?'],
  'LO-1.yes': '맞아, {word}! 나머지는 {family}.', 'LO-1.hint': '힌트: 그림 {n}개는 {family}. 아닌 걸 찾아 봐.',
  'LO-2.prompt': ['{things}, 몇 개 있을까? 잘 세어 봐!', '세어 보자: {things}. 몇 개야?'], 'LO-2.promptMixed': '{things}, 몇 개 있을까? 조심해, 그것만 세어야 해!',
  'LO-2.yes': '{list}. 모두 {n}!', 'LO-2.hint': '힌트: 과일을 하나씩 손가락으로 누르면서 천천히 세어 봐.', 'LO-2.hintBig': '힌트: 먼저 열까지 세고, 계속해 봐: 열하나, 열둘, 열셋…',
  'MO-3.prompt': ['이건 누구 그림자일까? 맞는 그림을 눌러 봐!', '이 그림자 뒤에 누가 숨어 있을까?'],
  'LO-3.prompt': ['순서를 잘 봐. 다음에 올 과일은 뭘까?', '어떤 과일이 다음에 올까?'], 'LO-3.yes': '맞아! {list}!',
  'LO-3.hint': '힌트: 순서가 늘 똑같이 다시 시작돼. {list}…', 'LO-3.numPrompt': '보고 들어 봐: {list}. 다음 숫자는 뭘까?',
  'LO-3.numYes': '맞아! {list}, {n}!', 'LO-3.hintGrow': '힌트: 하나를 더하고, 둘을 더하고, 셋을 더하고… 그다음은?',
  'LO-3.hintPlus': '힌트: 매번 {n}씩 더해.', 'LO-3.hintMinus': '힌트: 매번 {n}씩 빼.',
  'LO-4.num.most': '가장 큰 숫자를 눌러 봐!', 'LO-4.num.least': '가장 작은 숫자를 눌러 봐!', 'LO-4.numYes.most': '맞아! 가장 큰 숫자: {n}!',
  'LO-4.numYes.least': '맞아! 가장 작은 숫자: {n}!', 'LO-4.numHint.most': '힌트: 셀 때 가장 큰 숫자는 맨 나중에 나와.',
  'LO-4.numHint.least': '힌트: 셀 때 가장 작은 숫자는 맨 처음에 나와.',
  'LO-4.pile.most': '{things}, 어디에 가장 많을까? 맞는 카드를 눌러 봐!', 'LO-4.pile.least': '{things}, 어디에 가장 적을까? 맞는 카드를 눌러 봐!',
  'LO-4.pileYes.most': '맞아! 여기는 {n}개. 가장 많아!', 'LO-4.pileYes.least': '맞아! 여기는 {n}개. 가장 적어!',
  'LO-4.pileHint.least': '힌트: 과일이 아주 조금 있는 카드를 찾아 봐.', 'LO-4.pileHint.most': '힌트: 가장 꽉 찬 카드를 찾아 봐.',
  'LO-5.compl': '{a} 더하기 몇이면 {b}일까?', 'LO-5.complYes': '맞아! {a} 더하기 {x}, 답은 {b}!', 'LO-5.complHint': '힌트: 손가락으로 {a}부터 {b}까지 세어 봐.',
  'LO-5.add': '봐, 과일이 {a}개 있어. {b}개 더 놓을게. 모두 몇 개일까?', 'LO-5.eat': '봐, 과일이 {a}개 있어. 디노가 {b}개 먹어. 몇 개 남았을까?',
  'LO-5.addHint': '힌트: 왼쪽과 오른쪽 과일을 모두 세어 봐.', 'LO-5.eatHint': '힌트: 줄이 그어지지 않은 과일만 세어 봐.',
  'LO-11.prompt': ['잘 들어 봐: {calc}. 얼마일까?', '{calc}, 얼마일까?', '머릿속으로: {calc}. 답을 눌러 봐!'],
  'VO-13.prompt': ['{calc}, 얼마일까? 말해 줘!', '{calc}, 답은? 말해 봐!'], 'VO-13.repeat': '들어 봐: {calc}, 답은 {n}. 이제 네가 말해 봐!',
  'VO-13.fallback': '{calc}, 얼마일까? 맞는 숫자를 눌러 봐!',
  'MO-4.prompt': ['봐: {word}. 짝은 뭘까?', '짝을 찾아 봐: {word}!'], 'MO-4.yes': '맞아! {a}, 그리고 {b}. 짝꿍이야!',
  'MO-4.hint': '힌트: 떠올려 봐: {word}. 옆에 자주 있는 건 뭘까?',
  'MO-5.prompt.big': ['진짜로는 어느 게 가장 클까?', '진짜로 가장 큰 걸 눌러 봐!'], 'MO-5.prompt.small': ['진짜로는 어느 게 가장 작을까?', '진짜로 가장 작은 걸 눌러 봐!'],
  'MO-5.yes.big': '맞아! 진짜로 가장 큰 건: {word}!', 'MO-5.yes.small': '맞아! 진짜로 가장 작은 건: {word}!',
  'MO-5.hint': '힌트: 그림에서는 모두 크기가 같아. 진짜로 네 옆에 있다고 생각해 봐!',
  'LO-6.prompt': ['숫자 {n}을 눌러 봐!', '숫자 {n}은 어디 있을까?', '찾아 봐: {n}!'], 'LO-6.yes': '맞아! {n}이야!',
  'LO-6.hint': '힌트: 손가락으로 {n}까지 세고 그 숫자를 찾아 봐.', 'LO-6.hintBig': '힌트: 첫 번째 숫자를 잘 보고, 그다음 두 번째 숫자를 봐.',
  'EN-2.hint': '힌트: 손가락으로 영어로 세다가 맞는 숫자가 들리면 멈춰.',
  'LO-7.shape': '이 모양을 눌러 봐: {shape}!', 'LO-7.color': '색깔이 {color}인 모양을 눌러 봐!', 'LO-7.both': '눌러 봐: {shape}, 색깔은 {color}!',
  'LO-7.yes.shape': '맞아: {shape}!', 'LO-7.yes.color': '맞아, 색깔은 {color}!', 'LO-7.yes.both': '맞아: {shape}, 색깔은 {color}!',
  'LO-7.hint.color': '힌트: 색깔만 봐. 모양은 상관없어.', 'LO-7.hint.both': '힌트: 먼저 맞는 색깔을 찾고, 그다음 모양을 잘 봐.',
  ...kv('shape', 'circle=동그라미; square=네모; triangle=세모; star=별; heart=하트; rectangle=직사각형; diamond=마름모; oval=타원; hexagon=육각형; cross=십자 모양'),
  ...kv('clue', `circle=동그라미는 둥글고 모서리가 없어; square=네모는 네 변의 길이가 같아; triangle=세모는 변이 세 개, 꼭짓점이 세 개야;
    star=별은 뾰족한 끝이 다섯 개야; heart=하트는 위에 둥근 곳이 두 개, 아래에 뾰족한 끝이 하나야; rectangle=직사각형은 긴 변 두 개와 짧은 변 두 개가 있어;
    diamond=마름모는 꼭짓점으로 서 있는 네모 같아; oval=타원은 길쭉한 동그라미야; hexagon=육각형은 변이 여섯 개야; cross=십자 모양은 팔이 네 개야`),
  ...kv('color', 'red=빨간색; blue=파란색; green=초록색; yellow=노란색; orange=주황색; purple=보라색; pink=분홍색'),
  'time.0': '{h}시 정각', 'time.30': '{h}시 반', 'time.15': '{h}시 15분', 'time.45': '{h}시 45분', 'time.m': '{h}시 {m}분', 'time.24': '{h}시 {m}분',
  'LO-8.prompt': ['이 시각을 가리키는 시계를 눌러 봐: {time}!', '어느 시계가 {time}일까?'], 'LO-8.yes': '맞아! 지금은 {time}!',
  'LO-8.hint': '힌트: 짧은바늘은 시, 긴바늘은 분을 가리켜.', 'LO-8.hintHard': '힌트: 먼저 짧은바늘로 시를, 그다음 긴바늘로 분을 봐.',
  'money.e1': '1유로', 'money.e': '{e}유로', 'money.c1': '1센트', 'money.c': '{c}센트', 'money.ec': '{e}유로 {c}센트',
  'LO-9.prompt': ['이만큼 있는 카드를 눌러 봐: {money}!', '딱 {money}, 어디 있을까?'], 'LO-9.yes': '맞아! 모두 {money}!',
  'LO-9.hint': '힌트: 먼저 지폐와 큰 동전을 세고, 그다음 작은 동전을 더해.',
  'TR.dots': ['점선을 따라 그려 봐!', '손가락으로 점을 따라가 봐!'], 'TR.faint': '작은 점을 따라 그려 봐.',
  'TR.free': ['이제 본보기처럼 혼자 그려 봐!', '네 차례야: 점 없이 그려 봐!'], 'TR.yes': ['최고야! 정말 예쁘다!', '멋져!', '그림이 참 예쁘다!'],
  'TR.hint': '봐, 내가 보여 줄게! 초록색 1번 점에서 시작해.',
  'LO-10.prompt': ['카드 두 장을 뒤집어 봐. 같으면 짝을 얻어!', '짝을 모두 찾아 봐!'],
  'LO-10.promptForeign': ['카드 두 장을 뒤집고 짝을 찾아 봐! 들어 봐… 영어야!', '짝을 찾으면서 영어 낱말을 들어 봐!'],
  'LO-10.yes': ['최고야, 짝을 모두 찾았어!', '기억력 대단해! 짝을 다 찾았어!'], 'LO-10.hint': '이미 본 그림이 어디 있었는지 기억해!',
  'VO-1.prompt': ['이건 이름이 뭘까?', '이게 뭐야?', '이게 뭔지 말해 줘!'], 'VO-1.repeat': '잘 들어 봐: {word}. 이제 네가 말해 봐!',
  'VO-2.prompt': ['영어로 뭐라고 할까? {word}!', '영어로 말해 봐: {word}!'], 'VO-2.yes': ['최고야, 잘 말했어!', '멋져, 영어를 하네!', '완벽해!'],
  'VO-2.repeat': '잘 듣고 따라 해 봐:', 'VO-2.fallback': '이 영어 낱말의 그림을 눌러 봐:', 'VO-2.hint': '힌트: 이미 아는 영어 낱말을 떠올려 봐!',
  'l.handover': ['잘했어, {current}! 이제 {next} 차례야!', '고마워, {current}! {next}, 네 차례야!'],
  'l.gift': ['나 자랐어! 선물을 골라 줘!', '선물이다! 어떤 걸 줄 거야?'], 'l.giftThanks': '와, {item}! 고마워!',

  ...kv('num', `0=영|공; 1=일|하나|한; 2=이|둘|두; 3=삼|셋|세; 4=사|넷|네; 5=오|다섯; 6=육|여섯; 7=칠|일곱; 8=팔|여덟; 9=구|아홉; 10=십|열;
    11=십일|열하나; 12=십이|열둘; 13=십삼|열셋; 14=십사|열넷; 15=십오|열다섯; 16=십육|열여섯; 17=십칠|열일곱; 18=십팔|열여덟;
    19=십구|열아홉; 20=이십|스물`),

  'l.hello': ['안녕, {name}! 나야, 네 공룡!', '안녕, {name}! 우리 같이 재미있게 놀자!'],
  'l.welcome_back': ['돌아왔구나, {name}! 야호!', '안녕, {name}! 정말 보고 싶었어!', '아, 왔구나! 놀까?'],
  'l.home.play': ['초록 버튼을 눌러: 놀이 세상을 한 바퀴 돌자!', '놀까? 초록 버튼을 눌러!'], 'l.home.categories': ['놀이를 고르려면 작은 버튼을 눌러.'],
  'l.random.go': ['출발!', '이륙! 세계 여행!', '자, 놀자!'], 'l.home.choose': ['놀이를 골라 봐! 큰 방울을 눌러.'],
  'l.home.EN-1': ['깃발: 영어 낱말!'], 'l.home.MO-1': ['세상의 물건을 보여 줘!'], 'l.home.LO-1': ['퍼즐: 다른 하나를 찾아!'], 'l.home.LO-2': ['주판: 세어 보자!'],
  'l.home.MO-3': ['그림자: 누구일까?'], 'l.home.LO-3': ['화살표: 다음은 뭘까?'], 'l.home.LO-4': ['저울: 어디가 더 많을까?'], 'l.home.LO-5': ['숫자: 셈해 보자!'],
  'l.home.LO-11': ['귀: 머릿속 셈!'], 'l.home.VO-13': ['마이크: 셈의 답을 말해 줘!'], 'l.home.EN-2': ['열: 영어 숫자!'], 'l.home.MO-4': ['악수: 짝은 뭘까?'],
  'l.home.MO-5': ['자: 진짜로 더 큰 건?'], 'l.home.LO-6': ['숫자: 맞는 숫자를 찾아!'], 'l.home.LO-10': ['카드: 기억 놀이!'], 'l.home.EN-3': ['조커: 영어 기억 놀이!'],
  'l.home.LO-7': ['팔레트: 모양과 색깔!'], 'l.home.LO-8': ['자명종: 몇 시일까?'], 'l.home.LO-9': ['지폐: 돈을 세어 보자!'], 'l.home.TR-1': ['연필: 모양을 따라 그리자!'],
  'l.home.TR-2': ['글씨 쓰는 손: 글자와 숫자를 따라 쓰자!'], 'l.home.MO-6': ['지도: 우리나라 문제!'],
  'l.intro.MIX': ['문제를 하나하나 잘 들어 봐!', '귀를 쫑긋 세워!', '준비됐어? 나는 준비됐어!'],
  'l.short.EN-1': ['영어!'], 'l.short.MO-1': ['보여 줘!'], 'l.short.MO-3': ['그림자!'], 'l.short.LO-1': ['다른 하나!'], 'l.short.LO-2': ['세어 보자!'],
  'l.short.LO-3': ['다음은 뭘까!'], 'l.short.LO-4': ['많을까 적을까!'], 'l.short.LO-5': ['셈하기!'], 'l.short.LO-11': ['머릿속 셈!'], 'l.short.VO-13': ['답을 말해 봐!'],
  'l.short.EN-2': ['영어 숫자!'], 'l.short.MO-4': ['짝은 뭘까?'], 'l.short.MO-5': ['가장 클까 작을까!'], 'l.short.LO-6': ['숫자를 찾아!'], 'l.short.LO-10': ['기억 놀이!'],
  'l.short.EN-3': ['영어 기억 놀이!'], 'l.short.LO-7': ['모양과 색깔!'], 'l.short.LO-8': ['몇 시일까?'], 'l.short.LO-9': ['돈!'], 'l.short.TR-1': ['따라 그리자!'],
  'l.short.TR-2': ['따라 쓰자!'], 'l.short.MO-6': ['우리나라 문제!'], 'l.home.level': ['별은 내 레벨이야!'],
  'l.intro.EN-1': ['영어 낱말을 말할게. 맞는 그림을 눌러 봐!'], 'l.intro.MO-1': ['잘 듣고 내가 말하는 걸 눌러 봐.', '세계 여행을 가자! 내가 말하는 걸 찾아 봐.'],
  'l.intro.LO-1': ['그림을 잘 봐. 하나만 같은 무리가 아니야: 찾아 봐!'], 'l.intro.LO-2': ['세어 보자! 과일을 세고 맞는 숫자를 눌러 봐.'],
  'l.intro.MO-3': ['이 검은 그림자를 잘 봐. 누구 건지 찾아 봐!'], 'l.intro.LO-3': ['순서를 잘 보고 다음에 올 걸 찾아 봐.'],
  'l.intro.LO-4': ['카드를 잘 봐. 내가 말하는 카드를 찾아 봐!'], 'l.intro.LO-11': ['그림 없는 셈! 잘 듣고, 머릿속으로 셈하고, 맞는 숫자를 눌러 봐.'],
  'l.intro.VO-13': ['내가 셈을 말하면 네가 답을 말해 줘. 대답하려면 마이크를 눌러!'],
  'l.intro.LO-5': ['셈해 보자! 잘 듣고 맞는 숫자를 눌러 봐.', '셈하기 시간! 손가락으로 세어도 돼.'], 'l.intro.EN-2': ['영어로 숫자를 말할게. 맞는 숫자를 눌러 봐!'],
  'l.intro.MO-4': ['열쇠와 자물쇠처럼 짝이 되는 것들이 있어. 짝을 찾아 봐!'], 'l.intro.MO-5': ['그림에서는 모두 크기가 같아. 그런데 진짜로는? 내가 말하는 걸 찾아 봐!'],
  'l.intro.LO-6': ['숫자를 말할게. 카드에서 찾아 봐!'], 'l.intro.LO-10': ['기억 놀이를 하자! 카드 두 장을 뒤집어: 그림이 같으면 짝을 얻어!'],
  'l.intro.EN-3': ['영어 기억 놀이! 카드를 뒤집으면 내가 영어로 말해 줄게. 짝을 찾아 봐!'], 'l.intro.LO-7': ['모양과 색깔로 놀자! 잘 듣고 맞는 모양을 눌러 봐.'],
  'l.intro.LO-8': ['시계를 잘 봐! 짧은바늘은 시, 긴바늘은 분이야.'], 'l.intro.LO-9': ['가게 놀이를 하자! 동전을 세고 맞는 금액을 찾아 봐.'],
  'l.intro.TR-1': ['손가락으로 그리자! 초록 점에서 시작해서 점선을 따라가.'], 'l.intro.TR-2': ['글씨 쓰기를 배우자! 초록색 1번 점에서 시작해서 점선을 따라가.'],
  'l.intro.MO-6': ['우리나라 이야기를 하자! 잘 듣고 맞는 그림을 눌러 봐.', '우리나라를 잘 알아? 문제를 낼게!'],
  'l.trace.start': ['초록 점에 손가락을 대고 작은 점들을 따라가.'], 'l.trace.continue': ['계속해, 거의 다 됐어!'], 'l.trace.retry': ['아깝다! 지우고 다시 해 볼까?'],
  'l.tutorial': ['봐, 내가 보여 줄게! 이렇게 맞는 그림을 눌러.'], 'l.tutorial_your_turn': ['이제 네 차례야!'],
  'l.correct': ['잘했어, {name}!', '훌륭해, {name}!', '정답!', '최고야!', '멋져!', '그렇지!', '챔피언!', '넌 별이야!', '완벽해!'],
  'l.wrong': ['앗! 다시 해 봐!', '음, 잘 봐…', '그게 아니야! 계속 찾아 봐!', '아깝다! 한 번 더!', '괜찮아, 다시 해 봐!'],
  'l.hint': ['도와줄게: 반짝이는 걸 눌러!'], 'l.streak': ['세 번 연속! 대단해!'], 'l.idle': ['거기 있어? 카드를 눌러 봐!'], 'l.touch_me': ['다시 들으려면 나를 눌러!'],
  'l.review_due': ['이건 전에 같이 봤어. 기억나?'], 'l.review': ['다 알고 있구나! 복습할까?'],
  'l.series_perfect': ['와, 다 맞았어! 넌 진짜 별이야, {name}!', '하나도 안 틀렸어! 신나서 춤춰!'], 'l.series_great': ['대단해! 거의 다 맞았어!', '재능이 대단해, {name}!'],
  'l.series_good': ['정말 잘했어! 빨리 배우는구나!'], 'l.series_ok': ['잘했어! 더 연습할까?'], 'l.series_encourage': ['어려웠지? 나도 배우는 중이야!', '괜찮아! 놀면서 배우는 거야.'],
  'l.end.feed': ['이 과일 바구니 좀 봐! 바구니를 눌러서 나한테 줘.'], 'l.end.nothing': ['이번엔 과일이 없어. 과일을 받으러 다시 놀까?'],
  'l.end.again': ['다시 놀려면 초록 버튼을 눌러!'], 'l.fly.visit': ['봐, 파리다!'], 'l.home.ambient': ['화산이 아직도 터지고 있나 봐.', '배가 조금 고파.', '구름이 지나가는 것 좀 봐!'],
  'l.fly.caught': ['후루룩! 파리다!', '잡았다!'], 'l.fruit.won': ['나한테 과일!'], 'l.eating': ['냠냠!', '맛있다!', '더 줘!', '고마워!'],
  'l.full': ['배가 꽉 찼어! 나머지는 나중에 먹을게.'], 'l.level_up': ['오! 나 자라고 있어! 잘 돌봐 줘서 고마워!', '봐, 나 더 커졌어!'],
  'l.tickle': ['히히, 간지러워!', '하하하! 그만해!'], 'l.start': ['나를 눌러서 깨워 줘!'], 'l.parent_code': ['놀기 전에 엄마나 아빠를 불러 줘! 나를 위해 비밀번호를 정해야 해.'],
  'l.parent_code_done': ['고마워! 이제 같이 놀 수 있어!'], 'l.wardrobe.intro': ['물건을 나한테 끌어다 놓으면 내가 입어 볼게!'],
  'l.wardrobe.drag': ['물건을 손가락으로 누른 채 나한테 끌어와!'], 'l.wardrobe.off': ['좋아, 벗을게!'], 'l.wardrobe.empty': ['내 옷장이 비었어! 내가 자라면 네가 물건을 받아 줄 거야.'],
  'l.home.wardrobe': ['모자는 나를 꾸미는 거야!'], 'l.gift.waiting': ['나 자랐어! 선물을 눌러서 나한테 줄 물건을 골라 줘.'],
  'l.gift.go': ['나 자랐어! 내 옷장으로 와: 선물이 기다리고 있어!'], 'l.wardrobe.new': ['나한테 끌어다 놓으면 입어 볼게!'],
  'l.wardrobe.take_off': ['물건을 벗기려면 나한테서 멀리 끌어내.'], 'l.night.last': ['어, 늦었네… 마지막 한 판 하고 잘까?'],
  'l.night.goodnight': ['이게 마지막 판이었어! 즐거운 하루 고마워. 잘 자!'], 'l.night.sleep': ['쉿… 나 자고 있어. 쿨쿨… 내일 봐!'],
  'l.bedtime': ['오늘 많이 놀았다! 이제 자러 갈게. 내일 또 놀까?'], 'l.streak5': ['다섯 번 연속! 넌 천재야!'], 'l.correct_after_try': ['찾았다! 봐, 찾기만 하면 됐잖아!'],
  'l.halfway': ['벌써 절반이야! 힘내!'], 'l.last_question': ['마지막 문제!'], 'l.home.voice': ['마이크: 목소리로 대답하는 놀이!'],
  'l.home.voice_choose': ['여기서는 말로 대답해! 놀이를 골라 봐.'], 'l.intro.VO-1': ['그림을 보여 줄게. 마이크를 누르고 이름을 말해 봐.'],
  'l.intro.VO-2': ['영어로 말해 보자! 마이크를 누르고 영어로 말해 봐.'], 'l.home.VO-1': ['말하는 머리: 그림 이름을 말해 봐!'], 'l.home.VO-2': ['깃발: 영어로 말해 봐!'],
  'l.short.VO-1': ['이름이 뭘까?'], 'l.short.VO-2': ['영어로!'], 'l.voice.tap_mic': ['마이크를 누르고 대답해 줘.', '네 차례야! 마이크를 누르고 크게 말해.'],
  'l.voice.listening': ['듣고 있어!'], 'l.voice.unheard': ['잘 못 들었어. 마이크를 누르고 더 크게 말해 줘.'], 'l.voice.wrong': ['그게 아니야! 다시 해 봐!'],
  'l.voice.cards': ['귀가 피곤해! 맞는 답을 손가락으로 눌러 줘.'], 'l.voice.give_up': ['마이크가 잘 안 들려. 이제부터 손가락으로 놀자!'],
  'l.voice.loading': ['잠깐, 귀를 청소하고 있어…'], 'l.voice.no_mic': ['어, 네 목소리가 안 들려. 손가락으로 놀자!'],
  'l.egg.1': ['똑똑! 누구 있어요?', '오! 안에서 뭔가 움직여!'], 'l.egg.2': ['한 번 더! 나가게 도와줘!'], 'l.egg.3': ['거의 다 됐어! 한 번만 더 톡!'],
  'l.egg.hatched': ['안녕!', '휴! 나 나왔어!'],
  'l.hello.1': ['안녕! 나는 네 공룡이야. 색깔은 {color}, 작은 아기 공룡이지. 내가 자라게 도와줄래?'],
  'l.hello.4': ['우리 같이 놀이를 아주 많이 할 거야. 동물, 모양, 글자, 숫자, 그리고 다른 나라 말까지!'], 'l.hello.5': ['처음에 바로 맞히면 과일을 하나 받아. 봐, 과일이 내 바구니에 떨어지고 있어!'],
  'l.hello.6': ['그다음엔 그 과일을 나한테 먹여 줘. 냠냠! 많이 먹을수록 나는 쑥쑥 자라!'], 'l.hello.7': ['내가 자라면 너는 선물을 받아. 나를 꾸밀 옷이랑 별이랑 깜짝 선물!'], 'l.hello.2': ['나는 방금 알에서 나왔어… 아직 세상에 대해 아무것도 몰라! 너랑 함께 모든 걸 배울 거야.'], 'l.hello.9': ['‘내 공룡’에서 나를 마음대로 꾸며 줄 수 있어. 모자, 안경, 망토… 나는 제일 멋진 공룡이 될 거야!'], 'l.hello.10': ['틀려도 괜찮아. 내가 힌트를 줄게. 그리고 같이 다시 해 보자!'], 'l.hello.8': ['자, 시작하자!'],
  'l.hello.name': ['그런데 먼저 말해 줘: 이름이 뭐야? 마이크를 누르고 이름을 크게 말해 봐!'],
  'l.hello.name_again': ['잘 못 들었어. 마이크를 누르고 이름을 다시 말해 줘!'], 'l.hello.name_ok': ['만나서 반가워, {name}! 이름이 참 예쁘다!'],
  'l.hello.name_later': ['이름은 나중에 말해 줘: 엄마나 아빠가 써 줄 거야!'], 'l.hello.age': ['그리고 {name}, 몇 살이야? 마이크를 누르고 말해 줘!'],
  'l.hello.age_again': ['잘 못 들었어. 몇 살이야? 마이크를 눌러 줘!'], 'l.hello.age_later': ['괜찮아: 엄마나 아빠가 알려 줄 거야!'],
  'l.hello.sibling': ['안녕, {name}! 나는 네 공룡이야. 색깔은 {color}, 작은 아기 공룡이지. 우리 같이 재미있게 놀자!'],
  'l.hello.mic_allow': ['화면에 알림이 나오면 어른에게 “허용”을 눌러 달라고 해!'], 'l.hello.parent': ['이제 휴대폰을 엄마나 아빠에게 줘! 나만을 위한 비밀번호를 정할 거야.'],
  'l.welcome_first': ['여기가 우리 집이야, {name}! 재미있게 놀자!'], 'l.burp': ['앗! 미안!', '미안… 너무 맛있었어!'], 'l.fart': ['앗… 미안!', '히히, 나 아니야!'],
  'l.hunger.growl': ['들려? 배에서 꼬르륵 소리가 나! 바구니를 줘!'], 'l.hunger.look': ['음… 저 과일 정말 맛있어 보여… 바구니를 눌러 줘!'],
  'l.hunger.beg': ['제발, 제발! 바구니를 줘!', '{name}, 제발! 배고파!'], 'l.hunger.gape': ['봐, 입을 크게 벌릴게: 아~! 과일을 넣어 줘!'],
  'l.hunger.sad': ['너무 배고파… 바구니를 눌러 줘!'], 'l.child.turn': ['네 차례야, {name}! 같이 놀까?'], 'l.child.ask_name': ['안녕! 엄마나 아빠를 불러 줘: 네 이름을 알려 줘야 해!'],
  'l.age.ask': ['몇 살이야? 네 나이가 적힌 케이크를 눌러 봐!'], 'l.age.3': ['세 살! 멋져!'], 'l.age.4': ['네 살! 멋져!'], 'l.age.5': ['다섯 살! 대단해!'],
  'l.age.6': ['여섯 살! 대단해!'], 'l.age.7': ['일곱 살! 와!'],

  // ---- Mon pays ----
  'cty.flag': '{country} 국기는 어느 거야?', 'cty.flagHard': '조심해, 비슷해! {country} 국기는 어느 거야?', 'cty.flagYes': '맞아! {country} 국기야!',
  'cty.flagHint': '색깔과 그 순서를 잘 봐', 'cty.symbol': '{country} 상징은 어느 거야?', 'cty.symbolYes': '맞아! {country} 상징이야!',
  'cty.symbolYesName': '맞아! {name}: {country} 상징이야!', 'cty.food': ['{country} 대표 음식은 어느 거야?', '{country} 사람들이 즐겨 먹는 건 뭘까?'],
  'cty.foodYes': '냠! {country} 대표 음식이야!', 'cty.day': '{date}: {country} 국경일이야! 저녁에 하늘에서 뭘 볼까?', 'cty.dayYes': '맞아! {date}에는 커다란 불꽃놀이가 있어!',
  'cty.currency': '{country} 사람들은 어떤 돈을 쓸까?', 'cty.currencyYes': '맞아! {country} 돈: {money}!', 'cty.place': '{country} 유명한 곳은 어디야?',
  'cty.sport': '{country} 사람들이 좋아하는 운동은 뭘까?', 'cty.thing': '{country} 명절에 자주 보이는 건 뭘까?', 'cty.landmarkYes': '맞아! 우리나라를 잘 아는구나!',
  'cty.capital': '{country} 수도는 어디야? 도시 이름을 잘 읽어 봐!', 'cty.capitalYes': '맞아! {country} 수도: {city}!',
  'cty.neighbour': '이 국기들 중에 {country} 이웃 나라 국기는 어느 거야?', 'cty.neighbourYes': '맞아! 이 나라는 {country} 바로 옆에 있어!',
  'cty.neighbourHint': '이웃 나라는 아주 가까이, 같은 대륙에 있어',

  ...kv('c', `dog=강아지; cat=고양이; fish=물고기; bird=새; cow=소; pig=돼지; horse=말; duck=오리; rabbit=토끼; hen=암탉; sheep=양; frog=개구리;
    mouse=쥐; dinosaur=공룡; red=빨간색; blue=파란색; green=초록색; yellow=노란색; orange_color=주황색; purple=보라색; pink=분홍색; black=검은색;
    white=흰색; brown=갈색; apple=사과; banana=바나나; strawberry=딸기; cherry=체리; orange=오렌지; egg=달걀; ice_cream=아이스크림; pizza=피자;
    grapes=포도; pear=배; lemon=레몬; carrot=당근; bread=빵; milk=우유; cake=케이크; watermelon=수박; cookie=쿠키; cheese=치즈; tomato=토마토;
    pineapple=파인애플; peach=복숭아; broccoli=브로콜리; corn=옥수수; kiwi=키위; mango=망고; blueberries=블루베리; coconut=코코넛; car=자동차;
    ball=공; bus=버스; train=기차; plane=비행기; boat=보트; bike=자전거; balloon=풍선; teddy=곰 인형; book=책; house=집; kite=연; bed=침대;
    chair=의자; door=문; key=열쇠; clock=시계; sun=해; moon=달; star=별; flower=꽃; cloud=구름; rainbow=무지개; tree=나무; rain=비;
    snowflake=눈송이; snowman=눈사람; leaf=나뭇잎; mountain=산; fire=불; sunflower=해바라기; drop=물방울; eye=눈; ear=귀; nose=코;
    mouth=입; hand=손; foot=발; tooth=이빨; lion=사자; tiger=호랑이; elephant=코끼리; monkey=원숭이; bear=곰; giraffe=기린; zebra=얼룩말;
    panda=판다; snake=뱀; turtle=거북; crocodile=악어; kangaroo=캥거루; hippo=하마; gorilla=고릴라; rhino=코뿔소; butterfly=나비; bee=벌;
    ladybug=무당벌레; spider=거미; ant=개미; snail=달팽이; dolphin=돌고래; whale=고래; octopus=문어; crab=게; shark=상어; owl=부엉이;
    penguin=펭귄; parrot=앵무새; flamingo=홍학; peacock=공작; eagle=독수리; swan=백조; hat=모자; shoe=신발; dress=원피스; cap=야구 모자;
    socks=양말; gloves=장갑; tshirt=티셔츠; glasses=안경; umbrella=우산; pencil=연필; spoon=숟가락; scissors=가위; hammer=망치; ladder=사다리;
    broom=빗자루; bottle=젖병; toothbrush=칫솔; guitar=기타; drum=북; piano=피아노; violin=바이올린; trumpet=트럼펫; helicopter=헬리콥터;
    tractor=트랙터; rocket=로켓; ambulance=구급차; motorbike=오토바이; fire_engine=소방차; police_car=경찰차; scooter=킥보드; sled=썰매;
    llama=라마; goat=염소; camel=낙타; hedgehog=고슴도치; squirrel=다람쥐; bat=박쥐; deer=사슴; wolf=늑대; fox=여우; raccoon=너구리;
    beaver=비버; otter=수달; sloth=나무늘보; skunk=스컹크; bison=들소; castle=성; tent=텐트; lighthouse=등대; volcano=화산; island=섬;
    anchor=닻; magnet=자석; compass=나침반; microscope=현미경; telescope=망원경; hourglass=모래시계; jellyfish=해파리; seal=물개;
    lobster=바닷가재; shrimp=새우; squid=오징어; oyster=굴; beetle=딱정벌레; cricket=귀뚜라미; mosquito=모기; worm=지렁이; scorpion=전갈;
    rooster=수탉; turkey=칠면조; donkey=당나귀; ox=황소; leopard=표범; polar_bear=북극곰; koala=코알라; orangutan=오랑우탄; mammoth=매머드;
    moose=말코손바닥사슴; badger=오소리; avocado=아보카도; eggplant=가지; garlic=마늘; onion=양파; pepper=고추; cucumber=오이; potato=감자;
    mushroom=버섯; peanuts=땅콩; croissant=크루아상; pancakes=팬케이크; honey=꿀; spaghetti=스파게티; fries=감자튀김; sandwich=샌드위치;
    candle=양초; mirror=거울; window=창문; bucket=양동이; bell=종; lock=자물쇠; light_bulb=전구; flashlight=손전등; axe=도끼; saw=톱;
    wrench=스패너; screwdriver=드라이버; paintbrush=붓; crayon=크레용; trophy=트로피; medal=메달; ring=반지; skateboard=스케이트보드; yoyo=요요;
    roller_skate=롤러스케이트; canoe=카누; tram=전차; parachute=낙하산; satellite=인공위성; brain=뇌; bone=뼈; tongue=혀; leg=다리; tornado=회오리바람;
    lightning=번개; comet=혜성; cactus=선인장; blossom=벚꽃; feather=깃털`),
  // Espace parents : onglets.
  'p.dailyShort': '그다음엔 공룡이 자러 가요.', 'p.credits': '만든 사람과 라이선스', 'p.creditsHelp': 'DinoLearn은 이 프로그램, 목소리, 그림, 글꼴, 소리로 만들어졌어요. 만든 분들께 감사드려요!', 'p.credits.voices': '공룡 목소리', 'p.credits.asr': '음성 인식', 'p.credits.code': '게임 엔진', 'p.credits.images': '그림과 글꼴', 'p.credits.sounds': '효과음', 'p.tab.profile': '프로필', 'p.tab.progress': '성장', 'p.tab.games': '놀이', 'p.tab.settings': '설정', 'p.summary': '한눈에', 'p.lower': '낮추기', 'p.higher': '높이기',
};

export default ko;
