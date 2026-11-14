import type { Catalog } from '../index';
import { kv } from '../kv';

/** Tiếng Việt (ngôn ngữ thứ hai: tiếng Anh). */
const vi: Catalog = {
  ...kv('lang', 'fr=tiếng Pháp; en=tiếng Anh; es=tiếng Tây Ban Nha; it=tiếng Ý; de=tiếng Đức; pt=tiếng Bồ Đào Nha; ru=tiếng Nga; zh=tiếng Trung; hi=tiếng Hindi; ar=tiếng Ả Rập; ur=tiếng Urdu; bn=tiếng Bengal; id=tiếng Indonesia; vi=tiếng Việt; tr=tiếng Thổ Nhĩ Kỳ; fa=tiếng Ba Tư; pl=tiếng Ba Lan; uk=tiếng Ukraina'),
  ...kv('country', 'fr=Pháp; be=Bỉ; ch=Thụy Sĩ; ca=Canada; lu=Luxembourg; gb=Vương quốc Anh; us=Hoa Kỳ; es=Tây Ban Nha; mx=Mexico; it=Ý; de=Đức; at=Áo; pt=Bồ Đào Nha; br=Brazil; ru=Nga; cn=Trung Quốc; in=Ấn Độ; eg=Ai Cập; ma=Maroc; sa=Ả Rập Xê Út; pk=Pakistan; bd=Bangladesh; cd=CHDC Congo'),

  'ui.loading': 'Đang tải…', 'ui.rotate': 'Xoay máy tính bảng nhé!', 'ui.tap': 'Chạm vào màn hình để chơi!',
  'ui.retry': 'Thử lại', 'ui.problem': 'Có lỗi: {reason}', 'ui.cancel': 'Hủy',
  'ui.skip': 'Bỏ qua', 'ui.home.play': 'Chơi', 'ui.home.missions': 'Nhiệm vụ', 'ui.home.mydino': 'Khủng long', 'ui.home.settings': 'Cài đặt', 'ui.end.again': 'Chơi lại', 'ui.home.playWith': 'Chơi với khủng long của con nào, {name}!', 'ui.home.learn': 'Vừa học vừa chơi với Dino!',
  'ui.home.summary': 'Đã chơi xong {n} lượt. Khủng long lớn lên cùng con!',
  'ui.home.sleeping': 'Suỵt… khủng long đang ngủ.\nBố mẹ có thể mở khóa bằng mã.',
  'ui.home.timeUp': 'Hết giờ chơi rồi.\nBố mẹ có thể mở khóa bằng mã.',
  'ui.child.title': 'Bé tên là gì?', 'ui.child.sub': 'Khủng long sẽ gọi bé bằng tên.',
  'ui.parents.title': 'Góc phụ huynh', 'ui.pin.type': 'Nhập mã phụ huynh.', 'ui.pin.title': 'Mã phụ huynh',
  'ui.pin.choose': 'Chọn mã gồm 4 chữ số.', 'ui.wardrobe.title': 'Dino của tôi – Tủ quần áo',
  'ui.wardrobe.reactions': ['Đẹp quá!', 'Mình thích lắm!', 'Mình đẹp trai ghê!', 'Sang quá!'],
  'ui.choose.voice': 'Nói to', 'ui.choose.voiceTitle': 'Chơi bằng giọng nói!', 'ui.choose.title': 'Chọn một trò chơi!',
  'ui.end.3': 'Giỏi quá!', 'ui.end.2': 'Tuyệt vời!', 'ui.end.1': 'Làm tốt lắm!', 'ui.end.0': 'Cố lên nhé!',
  'ui.end.done': 'Con đã chơi xong lượt này!', 'ui.time.unlimited': 'Không giới hạn', 'ui.time.less': 'Bớt thời gian', 'ui.time.more': 'Thêm thời gian',
  'ui.lang': 'Ngôn ngữ', 'ui.langLabel': 'Ngôn ngữ:', 'ui.mb': '{n} MB',
  'ui.pack.voice': 'gói {language}', 'ui.pack.asr': 'nhận dạng giọng nói',
  'ui.pack.stalled': 'Tải xuống bị dừng. Hãy kiểm tra kết nối.',
  'ui.pack.downloading': 'Đang tải: {list}', 'ui.pack.installing': 'Đang cài nhận dạng giọng nói',
  'ui.pack.speechTitle': 'Giọng của khủng long ({language})', 'ui.pack.speechDetail': 'Giọng tự nhiên, giống nhau trên mọi thiết bị.',
  'ui.pack.secondTitle': 'Giọng {language}', 'ui.pack.secondDetail': 'Cho các từ trong trò chơi ngoại ngữ.',
  'ui.pack.asrTitle': 'Nhận dạng giọng nói', 'ui.pack.asrDetail': 'Để trả lời bằng giọng nói.',
  'ui.pack.download': 'Tải về', 'ui.pack.installed': 'Đã cài ✓', 'ui.pack.toDownload': 'Cần tải: {n} MB (nên dùng Wi-Fi).',
  'ui.pack.allInstalled': 'Đã cài đặt tất cả.', 'ui.pack.running': 'Đang tải…', 'ui.pack.finished': 'Xong.',
  'ui.pack.failed': 'Lỗi: {error}', 'ui.pack.installingShort': 'Đang cài…', 'ui.pack.waiting': 'Đang chờ…',
  'voice.heard': 'Mình nghe thấy: {word}.',

  ...kv('p', `title=Góc phụ huynh; back=Quay lại trò chơi; noName=Chưa có tên; addChild=+ Thêm bé; newChild=Bé mới;
    newChildHelp=Khi rời góc phụ huynh, bé mới sẽ chạm vào quả trứng để khủng long của bé nở ra.;
    cancel=Hủy; edit=✏️ Sửa hồ sơ; sheetOf=Hồ sơ của {name}; sheet=Hồ sơ của bé; sheetHelp=Tên, tuổi và cài đặt.;
    removeChild=Xóa {name}; thisChild=bé này; removeConfirm=Xóa {name}, khủng long và toàn bộ tiến trình? Không thể hoàn tác.;
    egg=trứng chưa nở; dino=khủng long; alternateAria=Thay phiên giữa các bé; age={n} tuổi; otherCountry=nước khác;
    series=lượt đã chơi; answers=câu trả lời; firstTry=đúng ngay lần đầu; today=đã chơi hôm nay;
    childrenHelp=Mỗi bé có khủng long, tiến trình và cài đặt riêng. Cài đặt bên dưới là của bé đang chọn.;
    alternate=Thay phiên: sau mỗi lượt đến lượt bé tiếp theo;
    difficulty=Độ khó ban đầu: {n} trên 20 ({stage}). Sau đó tự điều chỉnh theo kết quả.;
    stageCP=lớp 1; stageK=mẫu giáo; dinoLevel=Cấp độ khủng long;
    dinoLevelHelp=Khủng long lớn lên khi bé cho nó ăn (cấp 1 đến {max}). Bạn có thể đổi để chỉnh độ khó: cấp 21 đến 40 tương ứng lớp 1.;
    noNight=Không có chế độ đêm; week=Thời gian chơi 7 ngày qua; daily=Thời gian chơi mỗi ngày;
    dailyHelp=Khi hết giờ, bé chơi nốt lượt rồi trò chơi khóa đến hôm sau: khủng long đi ngủ. Với mã của bạn, có thể thêm 15 hoặc 30 phút, hoặc mở cả ngày.;
    night=Giờ đi ngủ (chế độ đêm);
    nightHelp=Sau giờ này, trời tối và khủng long ngáp: nó đề nghị một lượt cuối rồi ngủ đến sáng. Mã của bạn cho bé chơi thêm một chút tối hôm đó.;
    enable=Bật {game}; levelOf=Cấp độ {game}; levelAuto=Cấp độ tự động; level=Cấp {n}; fromAge=Từ {n} tuổi;
    needsVoice=Trò chơi nói to: cho phép micrô và tải nhận dạng giọng nói {language} (mục “Giọng nói và tải về”).;
    nAnswers={n} câu trả lời; notPlayed=Chưa chơi; rate={rate} đúng ngay lần đầu; mastered=Đã thuộc {n} / {total} câu;
    lastPlayed=chơi lần cuối ngày {date}; chooseAria=Nút chọn trò chơi; games=Trò chơi;
    choose=Nút “Chọn trò chơi” trên màn hình chính;
    chooseHelp=Khi tắt, bé chơi với hành tinh: mỗi lượt trộn mọi trò chơi theo tuổi. Khi bật, bé có thể chọn một trò chơi cụ thể.;
    gamesHelp=Tắt một trò chơi để nó không xuất hiện nữa. Cấp độ (1 đến 20; 11 đến 20 = lớp 1) là điểm bắt đầu lượt sau; “tự động” tính theo tuổi, khủng long và kết quả.;
    reviewToday=ôn hôm nay; reviewTomorrow=quay lại ngày mai; reviewOn=quay lại ngày {date}; reviewN=lần ôn {n} trên {total};
    review=Cần luyện tập;
    reviewHelp=Câu trả lời sai sẽ quay lại hôm sau, rồi 3 ngày sau, rồi một tuần sau. Đúng cả ba lần là đã thuộc; sai thì bắt đầu lại từ hôm sau.;
    reviewNone=Hiện chưa có gì cần ôn. Giỏi lắm!; sfxAria=Hiệu ứng âm thanh; musicAria=Nhạc nền; testVoice=Nghe thử giọng;
    testHello=Xin chào! Mình là Dino.; sound=Âm thanh; sfx=Hiệu ứng âm thanh (đúng, sai, ăn ngon…);
    music=Nhạc nền nhẹ nhàng (bé cũng có thể tắt ở màn hình chính);
    phoneVoices=Giọng chính: {main} · Giọng ngôn ngữ thứ hai: {second}. Đây là giọng của điện thoại: để có giọng tự nhiên hơn, hãy cài giọng “nâng cao” trong cài đặt trợ năng (chuyển văn bản thành giọng nói).;
    noVoice=không tìm thấy; mic=Micrô (trò chơi nói to);
    micHelp=Trong trò chơi nói to, bé trả lời bằng giọng nói. Mọi thứ ở lại trên thiết bị này: giọng nói không bao giờ được ghi âm hay gửi đi. Micrô chỉ bật khi bé chạm vào nút micrô lớn.;
    noMic=Trình duyệt này không cho dùng micrô trong trò chơi.; allowMic=Cho phép micrô;
    allowMicNow=Hãy cho phép micrô trong cửa sổ trình duyệt…;
    micBlocked=Micrô đang bị chặn. Hãy cho phép trong cài đặt trình duyệt (ổ khóa cạnh địa chỉ) rồi thử lại.;
    packsWhere=Gói nhận dạng giọng nói được tải trong mục “Giọng nói và tải về”.;
    removePacks=Xóa các gói; removePacksConfirm=Xóa gói nhận dạng giọng nói khỏi thiết bị? Trò chơi nói to sẽ không còn xuất hiện.;
    packs=Giọng nói và tải về;
    packsHelp=Ngôn ngữ trò chơi, giọng tự nhiên của khủng long (tạo trên thiết bị, không cần mạng sau khi tải), giọng cho trò chơi ngoại ngữ và nhận dạng giọng nói. Việc tải vẫn tiếp tục khi bạn đóng mục này. Nếu chưa có giọng khủng long, trò chơi dùng giọng của điện thoại.;
    changeCode=Đổi mã; newCode=Mã phụ huynh mới; newCodeHelp=Chọn mã mới gồm 4 chữ số.; codeChanged=Đã đổi mã phụ huynh.;
    code=Mã phụ huynh;
    codeHelp=Mã mở góc này và mở khóa trò chơi khi hết giờ trong ngày. Nếu quên, “Quên mã?” cho phép tạo mã mới sau một câu hỏi dành cho người lớn.;
    reset=Bắt đầu lại; resetConfirm=Xóa toàn bộ tiến trình (cấp khủng long, câu trả lời, trái cây)? Cài đặt được giữ lại.;
    privacy=Chính sách quyền riêng tư; close=Đóng; data=Dữ liệu; dataHelp=Mọi thứ chỉ được lưu trên thiết bị này. Không có dữ liệu nào được gửi đi.`),

  ...kv('pin', `erase=Xóa; remember=Hãy ghi nhớ kỹ.; forgot=Quên mã?; adultQuestion=Câu hỏi cho người lớn: {a} × {b} bằng bao nhiêu? (3 chữ số);
    cancel=Hủy; wrongAnswer=Chưa đúng.; newCode=Mã phụ huynh mới; newCodeHelp=Chọn mã mới gồm 4 chữ số.; wrongCode=Sai mã.;
    otherCountry=Nước khác; firstName=Tên;
    micHtml=<b>Cho phép micrô</b> (trò chơi nói to)<br><small>Mọi thứ ở lại trên thiết bị này: giọng nói không bao giờ được ghi âm hay gửi đi.</small>;
    missionsHtml=<b>Chọn nhiệm vụ</b><br><small>Bé có thể tự chọn trò chơi (nút “Nhiệm vụ”). Nếu bỏ chọn: chỉ chơi ngẫu nhiên bằng nút “Chơi”.</small>;
    ok=OK; nameMissing=Hãy viết tên của bé.; age=Tuổi; years={n} tuổi; country=Quốc gia; daily=Thời gian chơi mỗi ngày;
    night=Giờ đi ngủ (chế độ đêm); none=Không; welcome=Chào mừng bố mẹ!;
    welcomeHeard=Đây là những gì bé đã kể với khủng long: hãy sửa nếu cần. Bạn có thể thêm bé khác và đổi mọi thứ trong góc phụ huynh (ổ khóa trên màn hình chính).;
    welcomeHelp=Tên, tuổi và cài đặt của bé. Bạn có thể thêm bé khác và đổi mọi thứ trong góc phụ huynh (ổ khóa trên màn hình chính).;
    yourCode=Mã phụ huynh của bạn;
    yourCodeHelp=Chọn mã gồm 4 chữ số. Mã mở góc phụ huynh (ổ khóa trên màn hình chính) và mở khóa trò chơi khi hết giờ. Đừng nói cho bé biết!;
    asleep=Khủng long đang ngủ; asleepHelp=Đến giờ ngủ rồi. Nhập mã phụ huynh để chơi thêm một chút tối nay.;
    timeUp=Hết giờ chơi; timeUpHelp=Nhập mã phụ huynh để thêm thời gian hôm nay.;
    addTime=Thêm thời gian; todayOnly=Chỉ hôm nay.; plus15=Thêm 15 phút; plus30=Thêm 30 phút; unlimited=Không giới hạn hôm nay`),

  ...kv('inst', `title=Cài DinoLearn lên điện thoại; later=Để sau; okay=OK; never=Đừng hỏi lại;
    android=Ứng dụng sẽ mở toàn màn hình, nằm ngang, như một ứng dụng thật. Không cần tải gì thêm.; menu=Trong menu trình duyệt:;
    androidSteps=<li>Chạm <b>⋮</b> (ba chấm, góc trên bên phải).</li><li>Chọn <b>“Cài đặt ứng dụng”</b> hoặc <b>“Thêm vào màn hình chính”</b>.</li><li>Mở trò chơi bằng biểu tượng khủng long.</li>;
    ios=Ứng dụng sẽ mở toàn màn hình, không có thanh Safari, như một ứng dụng thật.;
    iosSteps=<li>Chạm {share} <b>Chia sẻ</b> (dưới hoặc trên Safari).</li><li>Chọn <b>“Thêm vào MH chính”</b>, rồi <b>Thêm</b>.</li><li>Mở trò chơi bằng biểu tượng khủng long.</li>`),

  ...kv('title', `EN-1=Tiếng Anh — Nghe và chạm; EN-2=Tiếng Anh — Con số; EN-3=Tiếng Anh — Lật thẻ; MO-1=Thế giới — Chỉ cho mình;
    MO-3=Thế giới — Cái bóng; MO-4=Thế giới — Cặp đôi; MO-5=Thế giới — To nhất; LO-1=Tư duy — Cái khác biệt;
    LO-2=Tư duy — Có bao nhiêu?; LO-3=Tư duy — Tiếp theo là gì; LO-4=Tư duy — Nhiều và ít; LO-5=Tư duy — Làm tính;
    LO-6=Tư duy — Con số; LO-7=Tư duy — Hình và màu; LO-8=Tư duy — Xem giờ; LO-9=Tư duy — Tiền;
    LO-10=Tư duy — Lật thẻ; LO-11=Tư duy — Nghe và tính; TR-1=Tập viết — Tô hình; TR-2=Tập viết — Tô chữ và số;
    VO-1=Nói to — Cái này tên gì?; VO-2=Nói to — Nói bằng tiếng Anh!; VO-13=Nói to — Làm tính; MO-6=Thế giới — Đất nước của con`),

  ...kv('item', `top-hat=mũ chóp cao; billed-cap=mũ lưỡi trai; crown=vương miện; womans-hat=mũ rơm; graduation-cap=mũ tốt nghiệp;
    rescue-workers-helmet=mũ lính cứu hỏa; headphone=tai nghe; hibiscus=bông hoa; glasses=kính; sunglasses=kính râm;
    goggles=kính bơi; ribbon=nơ con bướm; swim-ring=phao bơi; sports-medal=huy chương; prayer-beads=vòng cổ;
    cape-red=áo choàng siêu nhân; cape-blue=áo choàng phù thủy; wing=đôi cánh; balloon=bóng bay; magic-wand=đũa phép;
    lollipop=kẹo mút; sunflower=hoa hướng dương; teddy-bear=gấu bông`),
  ...kv('dinocolor', '0=xanh lá; 1=xanh dương; 2=tím; 3=hồng; 4=cam; 5=vàng; 6=xanh ngọc; 7=đỏ; 8=nâu'),

  ...kv('cat', `farm=con vật ở trang trại; sea=con vật dưới biển; bird=một loài chim; bug=một con côn trùng; wild=con vật hoang dã;
    forest=con vật trong rừng; fruit=một loại quả; veg=một loại rau; meal=đồ ăn; vehicle=một phương tiện; toy=một món đồ chơi;
    home=đồ vật trong nhà; clothes=đồ để mặc; tool=một dụng cụ; kitchen=đồ dùng hằng ngày; music=một nhạc cụ;
    sky=thứ ở trên trời; plant=một loài cây; body=một bộ phận cơ thể; landscape=một nơi chốn; color=một màu; element=thứ trong tự nhiên`),
  ...kv('fam', `farm=con vật trang trại; sea=con vật dưới biển; bird=các loài chim; bug=côn trùng; wild=thú hoang dã; forest=con vật trong rừng;
    fruit=trái cây; veg=rau củ; meal=đồ ăn và bánh kẹo; vehicle=phương tiện; toy=đồ chơi; home=đồ vật trong nhà; clothes=quần áo;
    tool=dụng cụ; kitchen=đồ trong phòng tắm và nhà bếp; music=nhạc cụ; sky=bầu trời và thời tiết; plant=cây cối;
    body=bộ phận cơ thể; landscape=nơi chốn; color=màu sắc; element=thứ trong tự nhiên`),
  ...kv('fruit', `red-apple=táo; banana=chuối; strawberry=dâu tây; cherries=anh đào; grapes=nho; tangerine=cam; pear=lê; lemon=chanh;
    watermelon=dưa hấu; peach=đào; pineapple=dứa; kiwi-fruit=kiwi; mango=xoài; blueberries=việt quất; melon=dưa lưới;
    green-apple=táo xanh; coconut=dừa`),
  ...kv('many', `food-red-apple=quả táo; food-banana=quả chuối; food-strawberry=quả dâu; food-pear=quả lê; food-lemon=quả chanh;
    food-tangerine=quả cam; food-kiwi-fruit=quả kiwi; food-peach=quả đào`),

  'g.hintFamily': 'Gợi ý: đó là {family}.', 'g.word': '{word}!', 'g.yesWord': ['Đúng rồi, {word}!', 'Chính xác, {word}!'],
  'g.yesItIs': 'Đúng, đó là {word}!', 'g.hint': 'Gợi ý: {hint}.', 'g.hintTens': 'Gợi ý: nhìn chữ số đầu tiên trước, đó là hàng chục.',
  'g.plus': '{a} cộng {b}', 'g.minus': '{a} trừ {b}', 'g.calcPrompt': ['{calc} bằng mấy?', '{calc}, là bao nhiêu?'],
  'g.calcYes': 'Đúng rồi! {calc} bằng {n}!', 'g.hintAdd': 'Gợi ý: bắt đầu từ {a}, đếm thêm {b} trên ngón tay.',
  'g.hintSub': 'Gợi ý: bắt đầu từ {a}, đếm lùi {b} trên ngón tay.',
  'MO-1.prompt': ['Chỉ cho mình {word}!', '{word} ở đâu?', 'Chạm vào {word}!', 'Con tìm được {word} không?'],
  'LO-1.prompt': ['Tìm cái khác biệt! Cái nào không cùng nhóm?', 'Hình nào khác với các hình còn lại?'],
  'LO-1.yes': 'Đúng, {word}! Những cái kia là {family}.', 'LO-1.hint': 'Gợi ý: có {n} hình là {family}. Hãy tìm hình không phải.',
  'LO-2.prompt': ['Có bao nhiêu {things}? Đếm kỹ nhé!', 'Đếm {things} nào. Có bao nhiêu?'],
  'LO-2.promptMixed': 'Có bao nhiêu {things}? Chú ý, chỉ đếm {things} thôi!', 'LO-2.yes': '{list}. Tất cả là {n}!',
  'LO-2.hint': 'Gợi ý: chạm vào từng quả và đếm thật chậm.', 'LO-2.hintBig': 'Gợi ý: đếm đến mười trước, rồi đếm tiếp: mười một, mười hai, mười ba…',
  'MO-3.prompt': ['Đây là bóng của ai? Chạm vào hình đúng!', 'Ai đang trốn sau cái bóng này?'],
  'LO-3.prompt': ['Nhìn kỹ dãy hình. Quả nào tiếp theo?', 'Quả nào nối tiếp dãy này?'], 'LO-3.yes': 'Đúng rồi! {list}!',
  'LO-3.hint': 'Gợi ý: dãy luôn lặp lại giống nhau. {list}…', 'LO-3.numPrompt': 'Nhìn và nghe: {list}. Số nào tiếp theo?',
  'LO-3.numYes': 'Đúng rồi! {list}, {n}!', 'LO-3.hintGrow': 'Gợi ý: cộng một, rồi hai, rồi ba… rồi sao nữa?',
  'LO-3.hintPlus': 'Gợi ý: mỗi lần cộng thêm {n}.', 'LO-3.hintMinus': 'Gợi ý: mỗi lần bớt đi {n}.',
  'LO-4.num.most': 'Chạm vào số lớn nhất!', 'LO-4.num.least': 'Chạm vào số nhỏ nhất!',
  'LO-4.numYes.most': 'Đúng rồi! {n} là số lớn nhất!', 'LO-4.numYes.least': 'Đúng rồi! {n} là số nhỏ nhất!',
  'LO-4.numHint.most': 'Gợi ý: khi đếm, số lớn nhất đến sau cùng.', 'LO-4.numHint.least': 'Gợi ý: khi đếm, số nhỏ nhất đến đầu tiên.',
  'LO-4.pile.most': 'Ở đâu có nhiều {things} nhất? Chạm vào thẻ đúng!', 'LO-4.pile.least': 'Ở đâu có ít {things} nhất? Chạm vào thẻ đúng!',
  'LO-4.pileYes.most': 'Đúng rồi! Ở đây có {n}. Nhiều nhất!', 'LO-4.pileYes.least': 'Đúng rồi! Ở đây có {n}. Ít nhất!',
  'LO-4.pileHint.least': 'Gợi ý: tìm thẻ có rất ít quả.', 'LO-4.pileHint.most': 'Gợi ý: tìm thẻ đầy nhất.',
  'LO-5.compl': '{a} cộng mấy bằng {b}?', 'LO-5.complYes': 'Đúng rồi! {a} cộng {x} bằng {b}!',
  'LO-5.complHint': 'Gợi ý: đếm trên ngón tay, từ {a} đến {b}.',
  'LO-5.add': 'Nhìn này, có {a} {things}. Mình thêm {b} nữa. Tất cả là bao nhiêu?',
  'LO-5.eat': 'Nhìn này, có {a} {things}. Dino ăn mất {b}. Còn lại bao nhiêu?',
  'LO-5.addHint': 'Gợi ý: đếm hết các quả, bên trái và bên phải.', 'LO-5.eatHint': 'Gợi ý: chỉ đếm những quả không bị gạch.',
  'LO-11.prompt': ['Nghe kỹ nhé: {calc}. Là bao nhiêu?', '{calc} bằng mấy?', 'Tính nhẩm: {calc}. Chạm vào đáp án!'],
  'VO-13.prompt': ['{calc} bằng mấy? Nói cho mình biết!', '{calc}, là bao nhiêu? Nói to lên nào!'],
  'VO-13.repeat': 'Nghe này: {calc} bằng {n}. Giờ con nói nhé!', 'VO-13.fallback': '{calc}, là bao nhiêu? Chạm vào số đúng!',
  'MO-4.prompt': ['Nhìn này: {word}. Cái gì đi cùng với nó?', 'Tìm thứ đi cùng với {word}!'],
  'MO-4.yes': 'Đúng rồi! {a} đi cùng với {b}!', 'MO-4.hint': 'Gợi ý: hãy tưởng tượng {word}. Thường có gì ở bên cạnh?',
  'MO-5.prompt.big': ['Ngoài đời thật, cái nào to nhất?', 'Chạm vào cái to nhất ngoài đời thật!'],
  'MO-5.prompt.small': ['Ngoài đời thật, cái nào nhỏ nhất?', 'Chạm vào cái nhỏ nhất ngoài đời thật!'],
  'MO-5.yes.big': 'Đúng rồi! Ngoài đời thật, {word} to nhất!', 'MO-5.yes.small': 'Đúng rồi! Ngoài đời thật, {word} nhỏ nhất!',
  'MO-5.hint': 'Gợi ý: trong hình chúng đều to bằng nhau. Hãy tưởng tượng chúng thật, ở ngay cạnh con!',
  'LO-6.prompt': ['Chạm vào số {n}!', 'Số {n} ở đâu?', 'Tìm số {n}!'], 'LO-6.yes': 'Đúng rồi! Đó là {n}!',
  'LO-6.hint': 'Gợi ý: đếm trên ngón tay đến {n} rồi tìm số đó.', 'LO-6.hintBig': 'Gợi ý: nhìn kỹ chữ số đầu tiên, rồi chữ số thứ hai.',
  'EN-2.hint': 'Gợi ý: đếm bằng tiếng Anh trên ngón tay và dừng lại khi nghe đúng số.',
  'LO-7.shape': 'Chạm vào {shape}!', 'LO-7.color': 'Chạm vào hình màu {color}!', 'LO-7.both': 'Chạm vào {shape} màu {color}!',
  'LO-7.yes.shape': 'Đúng rồi, {shape}!', 'LO-7.yes.color': 'Đúng rồi, hình màu {color}!', 'LO-7.yes.both': 'Đúng rồi, {shape} màu {color}!',
  'LO-7.hint.color': 'Gợi ý: chỉ nhìn màu thôi, hình dạng không quan trọng.', 'LO-7.hint.both': 'Gợi ý: tìm đúng màu trước, rồi nhìn kỹ hình dạng.',
  ...kv('shape', 'circle=hình tròn; square=hình vuông; triangle=hình tam giác; star=ngôi sao; heart=trái tim; rectangle=hình chữ nhật; diamond=hình thoi; oval=hình bầu dục; hexagon=hình lục giác; cross=dấu cộng'),
  ...kv('clue', `circle=hình tròn tròn đều, không có góc; square=hình vuông có bốn cạnh bằng nhau; triangle=hình tam giác có ba cạnh và ba góc;
    star=ngôi sao có năm cánh; heart=trái tim có hai đường cong ở trên và một đầu nhọn ở dưới; rectangle=hình chữ nhật có bốn cạnh, hai dài và hai ngắn;
    diamond=hình thoi giống hình vuông đứng trên một góc; oval=hình bầu dục là hình tròn bị kéo dài; hexagon=hình lục giác có sáu cạnh;
    cross=dấu cộng có bốn nhánh`),
  ...kv('color', 'red=đỏ; blue=xanh dương; green=xanh lá; yellow=vàng; orange=cam; purple=tím; pink=hồng'),
  'time.0': '{h} giờ đúng', 'time.30': '{h} giờ rưỡi', 'time.15': '{h} giờ mười lăm', 'time.45': '{next} giờ kém mười lăm',
  'time.m': '{h} giờ {m} phút', 'time.24': '{h} giờ {m} phút',
  'LO-8.prompt': ['Chạm vào đồng hồ chỉ {time}!', 'Đồng hồ nào chỉ {time}?'], 'LO-8.yes': 'Đúng rồi! Bây giờ là {time}!',
  'LO-8.hint': 'Gợi ý: kim ngắn chỉ giờ, kim dài chỉ phút.', 'LO-8.hintHard': 'Gợi ý: nhìn kim ngắn để biết giờ trước, rồi kim dài để biết phút.',
  'money.e1': 'một euro', 'money.e': '{e} euro', 'money.c1': 'một xu', 'money.c': '{c} xu', 'money.ec': '{e} euro {c} xu',
  'LO-9.prompt': ['Chạm vào thẻ có {money}!', 'Ở đâu có đúng {money}?'], 'LO-9.yes': 'Đúng rồi! Tất cả là {money}!',
  'LO-9.hint': 'Gợi ý: đếm tờ tiền và đồng xu lớn trước, rồi cộng thêm đồng nhỏ.',
  'TR.dots': ['Tô theo đường chấm chấm!', 'Dùng ngón tay đi theo các chấm!'], 'TR.faint': 'Vẽ theo các chấm nhỏ.',
  'TR.free': ['Giờ con tự vẽ một mình, giống hình mẫu nhé!', 'Đến lượt con: vẽ không cần chấm!'],
  'TR.yes': ['Giỏi quá! Đẹp lắm!', 'Tuyệt vời!', 'Bức vẽ đẹp quá!'], 'TR.hint': 'Nhìn này, mình chỉ cho! Bắt đầu từ chấm xanh số một.',
  'LO-10.prompt': ['Lật hai thẻ. Nếu giống nhau, con được cặp đó!', 'Tìm tất cả các cặp!'],
  'LO-10.promptForeign': ['Lật hai thẻ và tìm các cặp! Nghe nhé… bằng tiếng Anh!', 'Tìm các cặp và nghe từ tiếng Anh!'],
  'LO-10.yes': ['Giỏi quá, con đã tìm được tất cả các cặp!', 'Trí nhớ tuyệt vời! Đủ cả các cặp!'],
  'LO-10.hint': 'Hãy nhớ những hình con đã thấy ở đâu nhé!',
  'VO-1.prompt': ['Cái này tên là gì?', 'Đây là gì?', 'Nói cho mình biết đây là gì!'], 'VO-1.repeat': 'Nghe kỹ nhé: {word}. Giờ con nói đi!',
  'VO-2.prompt': ['Nhìn này: {word}! Trong {language}, ta nói:', 'Đây là {word}. Trong {language} gọi là:'],
  'VO-2.yes': ['Giỏi quá, nói hay lắm!', 'Tuyệt vời, con nói được tiếng Anh!', 'Hoàn hảo!'], 'VO-2.repeat': 'Nghe kỹ rồi nhắc lại theo mình:',
  'VO-2.fallback': 'Chạm vào hình của từ tiếng Anh này:',
  'l.handover': ['Giỏi lắm {current}! Giờ đến lượt {next}!', 'Cảm ơn {current}! {next}, đến lượt con chơi rồi!'],
  'l.gift': ['Mình lớn rồi! Chọn một món quà cho mình nhé!', 'Quà! Con tặng mình món nào?'], 'l.giftThanks': 'Ồ, {item}! Cảm ơn con!',

  ...kv('num', `0=không; 1=một|mốt; 2=hai; 3=ba; 4=bốn|tư; 5=năm|lăm; 6=sáu; 7=bảy; 8=tám; 9=chín; 10=mười; 11=mười một; 12=mười hai;
    13=mười ba; 14=mười bốn; 15=mười lăm; 16=mười sáu; 17=mười bảy; 18=mười tám; 19=mười chín; 20=hai mươi`),

  'l.hello': ['Chào {name}! Mình đây, khủng long của con!', 'Chào {name}! Chúng mình sẽ chơi thật vui!'],
  'l.welcome_back': ['Con về rồi, {name}! Hoan hô!', 'Chào {name}! Mình nhớ con lắm!', 'À, con đây rồi! Mình chơi nhé?'],
  'l.home.play': ['Chạm nút xanh lá: cùng đi vòng quanh thế giới trò chơi nào!', 'Chơi nhé? Chạm nút xanh lá!'],
  'l.home.categories': ['Để chọn trò chơi, chạm vào nút nhỏ.'], 'l.random.go': ['Đi thôi!', 'Cất cánh! Vòng quanh thế giới!', 'Nào, chơi thôi!'],
  'l.home.choose': ['Chọn một trò chơi! Chạm vào bong bóng lớn.'],
  'l.home.EN-1': ['Lá cờ: từ tiếng Anh!'], 'l.home.MO-1': ['Chỉ cho mình mọi thứ trên thế giới!'], 'l.home.LO-1': ['Xếp hình: tìm cái khác biệt!'],
  'l.home.LO-2': ['Bàn tính: cùng đếm nào!'], 'l.home.MO-3': ['Cái bóng: của ai đây?'], 'l.home.LO-3': ['Mũi tên: tiếp theo là gì?'],
  'l.home.LO-4': ['Cái cân: bên nào nhiều hơn?'], 'l.home.LO-5': ['Con số: cùng làm tính!'], 'l.home.LO-11': ['Cái tai: tính nhẩm!'],
  'l.home.VO-13': ['Micrô: nói kết quả phép tính!'], 'l.home.EN-2': ['Số mười: số đếm tiếng Anh!'], 'l.home.MO-4': ['Bắt tay: cái gì đi cùng nhau?'],
  'l.home.MO-5': ['Cái thước: cái nào to hơn ngoài đời?'], 'l.home.LO-6': ['Con số: tìm đúng số!'], 'l.home.LO-10': ['Thẻ bài: lật thẻ!'],
  'l.home.EN-3': ['Lá bài: lật thẻ tiếng Anh!'], 'l.home.LO-7': ['Bảng màu: hình và màu!'], 'l.home.LO-8': ['Đồng hồ báo thức: mấy giờ rồi?'],
  'l.home.LO-9': ['Tờ tiền: cùng đếm tiền!'], 'l.home.TR-1': ['Bút chì: cùng tô hình!'], 'l.home.TR-2': ['Bàn tay viết: cùng tô chữ và số!'],
  'l.home.MO-6': ['Bản đồ: câu hỏi về đất nước của con!'],
  'l.intro.MIX': ['Nghe kỹ từng câu hỏi nhé!', 'Vểnh tai lên nào!', 'Con sẵn sàng chưa? Mình sẵn sàng rồi!'],
  'l.short.EN-1': ['Tiếng Anh!'], 'l.short.MO-1': ['Chỉ cho mình!'], 'l.short.MO-3': ['Cái bóng!'], 'l.short.LO-1': ['Cái khác biệt!'],
  'l.short.LO-2': ['Cùng đếm!'], 'l.short.LO-3': ['Tiếp theo là gì!'], 'l.short.LO-4': ['Nhiều hay ít!'], 'l.short.LO-5': ['Một phép tính!'],
  'l.short.LO-11': ['Tính nhẩm!'], 'l.short.VO-13': ['Nói đáp án!'], 'l.short.EN-2': ['Số tiếng Anh!'], 'l.short.MO-4': ['Cái gì đi cùng nhau?'],
  'l.short.MO-5': ['To nhất hay nhỏ nhất!'], 'l.short.LO-6': ['Tìm số!'], 'l.short.LO-10': ['Lật thẻ!'], 'l.short.EN-3': ['Lật thẻ tiếng Anh!'],
  'l.short.LO-7': ['Hình và màu!'], 'l.short.LO-8': ['Mấy giờ rồi?'], 'l.short.LO-9': ['Tiền!'], 'l.short.TR-1': ['Cùng tô!'],
  'l.short.TR-2': ['Cùng viết!'], 'l.short.MO-6': ['Câu hỏi về đất nước của con!'], 'l.home.level': ['Ngôi sao là cấp độ của mình!'],
  'l.intro.EN-1': ['Mình nói một từ tiếng Anh. Chạm vào hình đúng!'],
  'l.intro.MO-1': ['Nghe kỹ và chạm vào thứ mình nói.', 'Cùng đi vòng quanh thế giới! Tìm thứ mình nói nhé.'],
  'l.intro.LO-1': ['Nhìn kỹ các hình. Chỉ có một hình không cùng nhóm: tìm nó nhé!'],
  'l.intro.LO-2': ['Cùng đếm nào! Đếm các quả rồi chạm vào số đúng.'], 'l.intro.MO-3': ['Nhìn kỹ cái bóng đen này. Tìm xem nó là của ai!'],
  'l.intro.LO-3': ['Nhìn kỹ dãy hình và tìm cái tiếp theo.'], 'l.intro.LO-4': ['Nhìn kỹ các thẻ. Tìm thẻ mình nói nhé!'],
  'l.intro.LO-11': ['Làm tính không có hình! Nghe kỹ, tính nhẩm rồi chạm vào số đúng.'],
  'l.intro.VO-13': ['Mình đọc một phép tính, bạn nói kết quả nhé! Khi micro xuất hiện, hãy nói câu trả lời.'],
  'l.intro.LO-5': ['Cùng làm tính! Nghe kỹ rồi chạm vào số đúng.', 'Giờ làm tính rồi! Con có thể đếm ngón tay.'],
  'l.intro.EN-2': ['Mình nói một số bằng tiếng Anh. Chạm vào số đúng!'],
  'l.intro.MO-4': ['Có những thứ đi cùng nhau, như chìa khóa và ổ khóa. Tìm cặp đôi nhé!'],
  'l.intro.MO-5': ['Trong hình mọi thứ to bằng nhau. Nhưng ngoài đời thì sao? Tìm thứ mình nói!'],
  'l.intro.LO-6': ['Mình nói một số. Tìm nó trong các thẻ!'],
  'l.intro.LO-10': ['Cùng chơi lật thẻ! Lật hai thẻ: nếu hai hình giống nhau, con được cặp đó!'],
  'l.intro.EN-3': ['Lật thẻ tiếng Anh! Khi con lật thẻ, mình đọc từ đó bằng tiếng Anh. Tìm các cặp nhé!'],
  'l.intro.LO-7': ['Cùng chơi với hình và màu! Nghe kỹ rồi chạm vào hình đúng.'],
  'l.intro.LO-8': ['Nhìn kỹ các đồng hồ! Kim ngắn chỉ giờ, kim dài chỉ phút.'], 'l.intro.LO-9': ['Cùng chơi bán hàng! Đếm tiền và tìm đúng số tiền.'],
  'l.intro.TR-1': ['Cùng vẽ bằng ngón tay! Bắt đầu từ chấm xanh và đi theo đường chấm chấm.'],
  'l.intro.TR-2': ['Cùng tập viết! Bắt đầu từ chấm xanh số một và đi theo đường chấm chấm.'],
  'l.intro.MO-6': ['Cùng nói về đất nước của con! Nghe kỹ và chạm vào hình đúng.', 'Con có hiểu đất nước mình không? Mình hỏi nhé!'],
  'l.trace.start': ['Đặt ngón tay lên chấm xanh rồi đi theo các chấm nhỏ.'], 'l.trace.continue': ['Tiếp tục nào, sắp xong rồi!'],
  'l.trace.retry': ['Gần đúng rồi! Mình xóa đi và làm lại nhé?'], 'l.tutorial': ['Nhìn này, mình chỉ cho! Chạm vào hình đúng như thế này.'],
  'l.tutorial_your_turn': ['Giờ đến lượt con!'],
  'l.correct': ['Giỏi lắm {name}!', 'Hay quá, {name}!', 'Chính xác!', 'Tuyệt vời!', 'Siêu quá!', 'Đúng rồi!', 'Nhà vô địch!', 'Con là ngôi sao!', 'Hoàn hảo!'],
  'l.wrong': ['Ôi! Thử lại nào!', 'Hừm, nhìn kỹ nhé…', 'Không phải cái đó! Tìm tiếp nào!', 'Gần đúng rồi! Thêm lần nữa!', 'Không sao, thử lại nhé!'],
  'l.hint': ['Mình giúp nhé: chạm vào cái đang sáng!'], 'l.streak': ['Đúng ba lần liền! Con giỏi quá!'], 'l.idle': ['Con còn đó không? Chạm vào một thẻ nhé!'],
  'l.touch_me': ['Muốn nghe lại thì chạm vào mình!'], 'l.review_due': ['Câu này mình đã gặp rồi. Con nhớ không?'], 'l.review': ['Con biết hết rồi! Mình ôn lại nhé?'],
  'l.series_perfect': ['Ôi, đúng hết! Con đúng là ngôi sao, {name}!', 'Không sai câu nào! Mình vui quá nhảy múa luôn!'],
  'l.series_great': ['Tuyệt vời! Gần như đúng hết!', 'Con tài quá, {name}!'], 'l.series_good': ['Chơi giỏi lắm! Con học nhanh thật!'],
  'l.series_ok': ['Chơi tốt lắm! Mình luyện tiếp nhé?'], 'l.series_encourage': ['Khó quá phải không? Mình cũng đang học!', 'Không sao! Vừa chơi vừa học mà.'],
  'l.end.feed': ['Nhìn giỏ trái cây này! Chạm vào giỏ để cho mình ăn.'], 'l.end.nothing': ['Lần này không có trái cây. Chơi lại để có nhé?'],
  'l.end.again': ['Chạm nút xanh lá để chơi lại!'], 'l.fly.visit': ['Nhìn kìa, một con ruồi!'],
  'l.home.ambient': ['Hình như núi lửa vẫn đang phun.', 'Mình hơi đói rồi.', 'Nhìn mây bay kìa!'],
  'l.fly.caught': ['Xoạt! Bắt được con ruồi!', 'Bắt được rồi!'], 'l.fruit.won': ['Một quả cho mình!'],
  'l.eating': ['Măm măm!', 'Ngon quá!', 'Thêm nữa đi!', 'Cảm ơn con!'], 'l.full': ['Bụng mình no căng rồi! Để dành phần còn lại nhé.'],
  'l.level_up': ['Ôi! Mình đang lớn! Cảm ơn con đã chăm sóc mình!', 'Nhìn này, mình to hơn rồi!'],
  'l.tickle': ['Hi hi, nhột quá!', 'Ha ha ha! Thôi mà!'], 'l.start': ['Chạm vào mình để đánh thức mình nhé!'],
  'l.parent_code': ['Trước khi chơi, con gọi bố hoặc mẹ nhé! Bố mẹ cần chọn một mã bí mật cho mình.'],
  'l.parent_code_done': ['Cảm ơn! Giờ mình chơi cùng nhau được rồi!'],
  'l.wardrobe.intro': ['Kéo một món đồ lên người mình để mình mặc thử!'], 'l.wardrobe.drag': ['Giữ ngón tay trên món đồ và kéo về phía mình!'],
  'l.wardrobe.off': ['Được rồi, mình cởi ra!'], 'l.wardrobe.empty': ['Tủ đồ của mình trống trơn! Khi mình lớn, con sẽ được một món đồ cho mình.'],
  'l.home.wardrobe': ['Cái mũ để thay đồ cho mình!'], 'l.gift.waiting': ['Mình lớn rồi! Chạm vào hộp quà để chọn đồ cho mình.'],
  'l.gift.go': ['Mình lớn rồi! Đến tủ đồ của mình nào: có quà đang chờ con!'], 'l.wardrobe.new': ['Kéo nó lên người mình để mình mặc nhé!'],
  'l.wardrobe.take_off': ['Muốn cởi đồ cho mình thì kéo nó ra xa.'],
  'l.night.last': ['Ôi, muộn rồi… Chơi lượt cuối rồi đi ngủ nhé?'], 'l.night.goodnight': ['Đó là lượt cuối rồi! Cảm ơn con vì một ngày thật vui. Chúc ngủ ngon!'],
  'l.night.sleep': ['Suỵt… mình đang ngủ. Khò khò… Mai gặp nhé!'], 'l.bedtime': ['Hôm nay chơi vui quá! Giờ mình đi ngủ đây. Mai chơi tiếp nhé?'],
  'l.streak5': ['Đúng năm lần liền! Con là thiên tài!'], 'l.correct_after_try': ['Con tìm ra rồi! Thấy chưa, chỉ cần tìm kỹ thôi!'],
  'l.halfway': ['Được một nửa rồi! Cố lên nào!'], 'l.last_question': ['Câu hỏi cuối cùng!'],
  'l.home.voice': ['Micrô: những trò chơi trả lời bằng giọng nói!'], 'l.home.voice_choose': ['Ở đây con trả lời bằng cách nói! Chọn một trò chơi.'],
  'l.intro.VO-1': ['Mình cho bạn xem một bức tranh. Khi micro xuất hiện, nói cho mình biết nó tên là gì!', 'Mình chơi bằng giọng nói nhé! Nhìn tranh, và khi micro xuất hiện, hãy nói to tên của nó.'],
  'l.intro.VO-2': ['Mình cùng nói {language} nhé! Mình nói từ, và bạn nhắc lại khi micro xuất hiện.', 'Nghe kỹ từ {language} nhé, rồi nhắc lại khi micro xuất hiện!'],
  'l.home.VO-1': ['Cái đầu biết nói: nói tên các hình!'], 'l.home.VO-2': ['Lá cờ: nhắc lại các từ {language}!'],
  'l.short.VO-1': ['Cái này tên gì?'], 'l.short.VO-2': ['Tiếng Anh!'],
  'l.voice.tap_mic': ['Đến lượt con! Khi micro hiện ra, con nói nhé!', 'Micro đang bật: nói to lên nào!', 'Mình đang nghe: nói đi nào!'],
  'l.voice.listening': ['Mình đang nghe đây!'], 'l.voice.unheard': ['Mình nghe chưa rõ. Micro bật lại rồi: nói to lên nhé!', 'Hừm, mình chưa hiểu. Bạn nói to lại được không?', 'Ôi, mình chẳng nghe thấy gì! Lại gần hơn và nói to hơn nhé.'],
  'l.voice.wrong': ['Không phải rồi! Thử lại nào!'], 'l.voice.cards': ['Tai mình mỏi rồi! Chạm vào đáp án đúng bằng ngón tay nhé.'],
  'l.voice.give_up': ['Micrô nghe không rõ. Từ giờ mình chơi bằng ngón tay nhé!'], 'l.voice.loading': ['Chờ chút, mình đang ngoáy tai…'],
  'l.voice.no_mic': ['Ôi, mình không nghe được con. Chơi bằng ngón tay nhé!'],
  'l.egg.1': ['Cốc cốc! Có ai không?', 'Ồ! Có gì đó đang động đậy bên trong!'], 'l.egg.2': ['Nữa đi! Giúp mình ra ngoài!'],
  'l.egg.3': ['Sắp rồi! Gõ thêm một cái nữa!'], 'l.egg.hatched': ['Xin chào!', 'Phù! Mình ra rồi!'],
  'l.hello.1': ['Xin chào! Mình là khủng long của con, một chú khủng long con màu {color}. Con giúp mình lớn lên nhé?'],
  'l.hello.4': ['Chúng mình sẽ chơi thật nhiều trò cùng nhau: con vật, hình khối, chữ cái, con số, và cả một ngôn ngữ khác nữa!'], 'l.hello.5': ['Mỗi lần bạn trả lời đúng ngay lần đầu, bạn được một quả. Nhìn kìa, chúng rơi vào giỏ của mình!'],
  'l.hello.6': ['Rồi bạn cho mình ăn. Ngon quá! Mình càng ăn nhiều thì càng lớn nhanh!'], 'l.hello.7': ['Và khi mình lớn lên, bạn sẽ nhận quà: quần áo để hóa trang cho mình, ngôi sao và những bất ngờ!'],
  'l.hello.2': ['Mình vừa mới nở ra… Mình chưa biết gì về thế giới cả! Cùng với bạn, mình sẽ học hết mọi thứ.'], 'l.hello.9': ['Trong “Khủng long”, bạn có thể mặc đồ cho mình tùy thích: mũ, kính, áo choàng… Mình sẽ là chú khủng long đẹp nhất!'], 'l.hello.10': ['Còn nếu bạn trả lời sai cũng không sao đâu: mình sẽ gợi ý, và chúng mình cùng thử lại nhé!'], 'l.hello.8': ['Nào, bắt đầu thôi!'],
  'l.hello.name': ['Nhưng trước tiên, nói cho mình biết: bạn tên là gì? Khi micro xuất hiện, hãy nói to tên của bạn!'],
  'l.hello.name_again': ['Mình nghe chưa rõ. Hãy nói lại tên bạn khi micro xuất hiện nhé!'],
  'l.hello.name_ok': ['Rất vui được gặp con, {name}! Tên con đẹp quá!'],
  'l.hello.name_later': ['Con nói tên sau cũng được: bố hoặc mẹ sẽ viết cho mình!'],
  'l.hello.age': ['Còn bạn, {name}, bạn mấy tuổi rồi? Khi micro xuất hiện, nói cho mình nhé!'],
  'l.hello.age_again': ['Mình nghe chưa rõ. Bạn mấy tuổi? Nói khi micro xuất hiện nhé!'], 'l.hello.age_later': ['Không sao: bố hoặc mẹ sẽ nói cho mình!'],
  'l.hello.sibling': ['Chào {name}! Mình là khủng long của con, một chú khủng long con màu {color}. Chúng mình sẽ chơi thật vui!'],
  'l.hello.mic_allow': ['Nếu có thông báo trên màn hình, nhờ người lớn chạm vào “Cho phép” nhé!'],
  'l.hello.parent': ['Giờ con đưa điện thoại cho bố hoặc mẹ nhé! Bố mẹ sẽ chọn một mã bí mật, chỉ dành cho mình.'],
  'l.welcome_first': ['Đây là nhà của mình, {name}! Chúng mình sẽ vui lắm đây!'],
  'l.hunger.growl': ['Con nghe thấy không? Bụng mình kêu rồi! Đưa giỏ cho mình nào!'], 'l.hunger.look': ['Ưm… quả kia trông ngon quá… Chạm vào giỏ đi!'],
  'l.hunger.beg': ['Đi mà, đi mà! Đưa giỏ cho mình!', 'Nào {name}, đi mà! Mình đói lắm!'], 'l.hunger.gape': ['Nhìn này, mình há miệng to: aaa! Bỏ quả vào đi!'],
  'l.hunger.sad': ['Mình đói quá… Chạm vào giỏ đi!'], 'l.child.turn': ['Đến lượt con, {name}! Chơi cùng nhau nhé?'],
  'l.child.ask_name': ['Chào con! Gọi bố hoặc mẹ nhé: bố mẹ cần nói cho mình tên con!'],
  'l.age.ask': ['Con mấy tuổi? Chạm vào chiếc bánh có tuổi của con!'],
  'l.age.3': ['Ba tuổi! Tuyệt!'], 'l.age.4': ['Bốn tuổi! Tuyệt!'], 'l.age.5': ['Năm tuổi! Giỏi quá!'], 'l.age.6': ['Sáu tuổi! Giỏi quá!'], 'l.age.7': ['Bảy tuổi! Oa!'],

  // ---- Mon pays ----
  "lang.ko": "tiếng Hàn", "lang.ne": "tiếng Nepal",
  'cty.flag': 'Lá cờ nào là của {country}?', 'cty.flagHard': 'Cẩn thận, chúng giống nhau lắm! Lá cờ nào là của {country}?',
  'cty.flagYes': 'Đúng rồi! Đó là cờ {country}!', 'cty.flagHint': 'nhìn kỹ các màu và thứ tự của chúng',
  'cty.symbol': 'Cái nào là biểu tượng của {country}?', 'cty.symbolYes': 'Đúng rồi! Đó là biểu tượng của {country}!',
  'cty.symbolYesName': 'Đúng rồi! {name} là biểu tượng của {country}!',
  'cty.food': ['Món nào là đặc sản của {country}?', 'Người ở {country} thích ăn gì?'], 'cty.foodYes': 'Ngon quá! Đó là đặc sản của {country}!',
  'cty.day': 'Ngày {date} là ngày quốc khánh của {country}! Buổi tối mình ngắm gì trên bầu trời?', 'cty.dayYes': 'Đúng rồi! Ngày {date} có pháo hoa thật lớn!',
  'cty.currency': 'Ở {country} người ta trả bằng tiền gì?', 'cty.currencyYes': 'Đúng rồi! Ở {country} người ta trả bằng {money}!',
  'cty.place': 'Ở {country} có nơi nổi tiếng nào?', 'cty.sport': 'Ở {country} mọi người thích môn thể thao nào?',
  'cty.thing': 'Trong các lễ hội ở {country} hay thấy gì?', 'cty.landmarkYes': 'Đúng rồi! Giỏi quá, con hiểu đất nước mình lắm!',
  'cty.capital': 'Thủ đô của {country} là gì? Đọc kỹ tên các thành phố nhé!', 'cty.capitalYes': 'Đúng rồi! Thủ đô của {country} là {city}!',
  'cty.neighbour': 'Lá cờ nào là của một nước láng giềng của {country}?', 'cty.neighbourYes': 'Đúng rồi! Nước này ở ngay cạnh {country}!',
  'cty.neighbourHint': 'nước láng giềng ở rất gần, trên cùng một châu lục',

  ...kv('c', `dog=con chó; cat=con mèo; fish=con cá; bird=con chim; cow=con bò; pig=con lợn; horse=con ngựa; duck=con vịt; rabbit=con thỏ;
    hen=con gà mái; sheep=con cừu; frog=con ếch; mouse=con chuột; dinosaur=con khủng long; red=màu đỏ; blue=màu xanh dương; green=màu xanh lá;
    yellow=màu vàng; orange_color=màu cam; purple=màu tím; pink=màu hồng; black=màu đen; white=màu trắng; brown=màu nâu; apple=quả táo;
    banana=quả chuối; strawberry=quả dâu tây; cherry=quả anh đào; orange=quả cam; egg=quả trứng; ice_cream=kem; pizza=bánh pizza;
    grapes=chùm nho; pear=quả lê; lemon=quả chanh; carrot=củ cà rốt; bread=bánh mì; milk=sữa; cake=bánh ngọt; watermelon=quả dưa hấu;
    cookie=bánh quy; cheese=phô mai; tomato=quả cà chua; pineapple=quả dứa; peach=quả đào; broccoli=bông cải xanh; corn=bắp ngô;
    kiwi=quả kiwi; mango=quả xoài; blueberries=quả việt quất; coconut=quả dừa; car=ô tô; ball=quả bóng; bus=xe buýt; train=tàu hỏa;
    plane=máy bay; boat=con thuyền; bike=xe đạp; balloon=bóng bay; teddy=gấu bông; book=quyển sách; house=ngôi nhà; kite=cái diều;
    bed=cái giường; chair=cái ghế; door=cánh cửa; key=chìa khóa; clock=đồng hồ; sun=mặt trời; moon=mặt trăng; star=ngôi sao; flower=bông hoa;
    cloud=đám mây; rainbow=cầu vồng; tree=cái cây; rain=mưa; snowflake=bông tuyết; snowman=người tuyết; leaf=chiếc lá; mountain=ngọn núi;
    fire=ngọn lửa; sunflower=hoa hướng dương; drop=giọt nước; eye=con mắt; ear=cái tai; nose=cái mũi; mouth=cái miệng; hand=bàn tay;
    foot=bàn chân; tooth=cái răng; lion=con sư tử; tiger=con hổ; elephant=con voi; monkey=con khỉ; bear=con gấu; giraffe=con hươu cao cổ;
    zebra=con ngựa vằn; panda=gấu trúc; snake=con rắn; turtle=con rùa; crocodile=con cá sấu; kangaroo=con chuột túi; hippo=con hà mã;
    gorilla=con khỉ đột; rhino=con tê giác; butterfly=con bướm; bee=con ong; ladybug=con bọ rùa; spider=con nhện; ant=con kiến;
    snail=con ốc sên; dolphin=cá heo; whale=cá voi; octopus=con bạch tuộc; crab=con cua; shark=cá mập; owl=con cú; penguin=chim cánh cụt;
    parrot=con vẹt; flamingo=chim hồng hạc; peacock=con công; eagle=đại bàng; swan=thiên nga; hat=cái mũ; shoe=chiếc giày; dress=chiếc váy;
    cap=mũ lưỡi trai; socks=đôi tất; gloves=đôi găng tay; tshirt=áo phông; glasses=cái kính; umbrella=cái ô; pencil=bút chì; spoon=cái thìa;
    scissors=cái kéo; hammer=cái búa; ladder=cái thang; broom=cái chổi; bottle=bình sữa; toothbrush=bàn chải đánh răng; guitar=đàn ghi-ta;
    drum=cái trống; piano=đàn piano; violin=đàn vi-ô-lông; trumpet=kèn trumpet; helicopter=trực thăng; tractor=máy kéo; rocket=tên lửa;
    ambulance=xe cứu thương; motorbike=xe máy; fire_engine=xe cứu hỏa; police_car=xe cảnh sát; scooter=xe trượt scooter; sled=xe trượt tuyết;
    llama=lạc đà không bướu; goat=con dê; camel=lạc đà; hedgehog=con nhím; squirrel=con sóc; bat=con dơi; deer=con hươu; wolf=chó sói;
    fox=con cáo; raccoon=gấu mèo; beaver=hải ly; otter=rái cá; sloth=con lười; skunk=chồn hôi; bison=bò rừng; castle=lâu đài; tent=cái lều;
    lighthouse=ngọn hải đăng; volcano=núi lửa; island=hòn đảo; anchor=mỏ neo; magnet=nam châm; compass=la bàn; microscope=kính hiển vi;
    telescope=kính thiên văn; hourglass=đồng hồ cát; jellyfish=con sứa; seal=hải cẩu; lobster=tôm hùm; shrimp=con tôm; squid=con mực;
    oyster=con hàu; beetle=bọ cánh cứng; cricket=con dế; mosquito=con muỗi; worm=con giun; scorpion=bọ cạp; rooster=con gà trống;
    turkey=gà tây; donkey=con lừa; ox=con trâu; leopard=con báo; polar_bear=gấu Bắc Cực; koala=gấu koala; orangutan=đười ươi;
    mammoth=voi ma mút; moose=nai sừng tấm; badger=con lửng; avocado=quả bơ; eggplant=quả cà tím; garlic=củ tỏi; onion=củ hành;
    pepper=quả ớt; cucumber=quả dưa chuột; potato=củ khoai tây; mushroom=cây nấm; peanuts=hạt lạc; croissant=bánh sừng bò;
    pancakes=bánh kếp; honey=mật ong; spaghetti=mì Ý; fries=khoai tây chiên; sandwich=bánh kẹp; candle=cây nến; mirror=cái gương;
    window=cửa sổ; bucket=cái xô; bell=cái chuông; lock=ổ khóa; light_bulb=bóng đèn; flashlight=đèn pin; axe=cái rìu; saw=cái cưa;
    wrench=cờ lê; screwdriver=tua vít; paintbrush=cây cọ vẽ; crayon=bút sáp màu; trophy=cúp; medal=huy chương; ring=chiếc nhẫn;
    skateboard=ván trượt; yoyo=con quay yo-yo; roller_skate=giày trượt patin; canoe=xuồng; tram=tàu điện; parachute=dù nhảy;
    satellite=vệ tinh; brain=bộ não; bone=khúc xương; tongue=cái lưỡi; leg=cái chân; tornado=lốc xoáy; lightning=tia chớp;
    comet=sao chổi; cactus=cây xương rồng; blossom=hoa anh đào; feather=chiếc lông vũ`),
  // Espace parents : onglets.
  'p.dailyShort': 'Sau đó khủng long đi ngủ.', 'p.credits': 'Ghi công và giấy phép', 'p.creditsHelp': 'DinoLearn được làm từ các phần mềm, giọng nói, hình ảnh, phông chữ và âm thanh này. Cảm ơn các tác giả!', 'p.credits.voices': 'Giọng khủng long', 'p.credits.asr': 'Nhận dạng giọng nói', 'p.credits.code': 'Bộ máy trò chơi', 'p.credits.images': 'Hình ảnh và phông chữ', 'p.credits.sounds': 'Hiệu ứng âm thanh', 'p.tab.control': 'Kiểm soát', 'p.tab.print': 'In', 'p.printOffer': 'Đề xuất phiếu để in', 'p.printOfferHelp': 'Khi hết giờ chơi, khủng long tặng ba phong bì; bé chọn một (mỗi ngày một lần) và phiếu sẽ có trong thẻ In.', 'p.tab.profile': 'Hồ sơ', 'p.tab.progress': 'Tiến bộ', 'p.tab.games': 'Trò chơi', 'p.tab.settings': 'Cài đặt', 'p.summary': 'Tóm tắt', 'p.lower': 'Giảm', 'p.higher': 'Tăng',
  // Programme le dino (LO-12).
  'title.LO-12': 'Tư duy — Lập trình cho khủng long',
  'l.intro.LO-12': ['Mình cùng lập trình nhé! Các mũi tên chỉ cho mình đường đi: giúp mình tìm quả táo nào!'],
  'l.home.LO-12': ['Mũi tên: lập trình cho khủng long!'],
  'l.short.LO-12': ['Lập trình cho khủng long!'],
  'LO-12.prompt': 'Chạm vào mũi tên để đưa mình tới quả táo nhé!',
  'LO-12.promptProgram': 'Đặt các mũi tên, rồi bấm nút xanh để mình đi nào!',
  'LO-12.promptLoop': 'Đặt các mũi tên, và dùng nút “nhân” để lặp lại một mũi tên. Rồi bấm nút xanh!',
  'LO-12.promptFruits': 'Nhặt cả hai quả nhé! Đặt hết các mũi tên, rồi bấm nút xanh.',
  'LO-12.yes': 'Ngon quá! Giỏi lắm, bạn lập trình cho mình rất tốt!',
  'LO-12.hint': 'Nhìn kỹ nhé: mũi tên nhấp nháy là hướng đúng đấy!',
  'LO-12.bumpRock': 'Ối, một tảng đá!',
  'LO-12.bumpWater': 'Ôi không, nước! Mình không biết bơi.',
  'LO-12.bumpEdge': 'Ối, mình không được ra khỏi khu vườn!',
  'LO-12.short': 'Mình còn thiếu mũi tên: mình chưa tới nơi!',
  'LO-12.empty': 'Hãy đặt mũi tên ở dưới trước, rồi bấm nút xanh nhé!',
  'LO-12.full': 'Hết chỗ rồi! Chạm vào một mũi tên ở dưới để bỏ nó đi.',
  'LO-12.best': 'Và bạn còn tìm ra chương trình ngắn nhất nữa!',
  // Micro qui s'allume tout seul, ventre qui gargouille, anglais à répéter.
  'l.tummy': ['Ọc ọc… Nghe không? Bụng mình nói cảm ơn đấy!', 'Ôi, bụng mình kêu ọc ọc: nó vui lắm!', 'Bụng mình kêu những tiếng ngộ nghĩnh: nó đang tiêu hóa!'],
  'l.home.hungry': ['Bụng mình kêu ọc ọc…', 'Mình đói quá!', 'Mình muốn ăn một quả táo ghê!', 'Hừm, mình muốn ăn một quả chuối ghê…'],
  'p.micHelp': 'Trẻ trả lời bằng giọng nói (gọi tên hình, nhắc lại từ, tính toán). Mọi thứ ở lại trên thiết bị này: không ghi âm, không gửi đi. Micro lớn chỉ hiện ra khi đến lượt trẻ nói.',
  'VO-2.repeatNow': ['Đến lượt bạn, nhắc lại nào!', 'Nhắc lại theo mình nhé!'],
  // Catégories des missions.
  'ui.cat.math': 'Toán',
  'ui.cat.logic': 'Tư duy',
  'ui.cat.world': 'Thế giới',
  // Sudoku des fruits (LO-13).
  'title.LO-13': 'Tư duy — Sudoku trái cây',
  'l.intro.LO-13': ['Sudoku trái cây! Kéo mỗi quả vào một ô trống, nhưng nhớ nhé: một loại quả không được xuất hiện hai lần trên một hàng hay một cột!'],
  'l.home.LO-13': ['Lưới trái cây: sudoku!'],
  'l.short.LO-13': ['Sudoku trái cây!'],
  'LO-13.prompt': 'Kéo trái cây vào các ô trống. Mỗi loại quả chỉ một lần trên mỗi hàng và mỗi cột!',
  'LO-13.promptBox': 'Kéo trái cây vào các ô trống. Mỗi loại quả chỉ một lần trên mỗi hàng, mỗi cột và mỗi ô vuông!',
  'LO-13.yes': 'Giỏi lắm, lưới đã đầy rồi!',
  'LO-13.hint': 'Nhìn ô đang sáng: chỉ một loại quả đặt được ở đó!',
  'LO-13.conflictRow': 'Ối! Quả này đã có trên hàng này rồi.',
  'LO-13.conflictCol': 'Ối! Quả này đã có trong cột này rồi.',
  'LO-13.conflictBox': 'Ối! Quả này đã có trong ô vuông này rồi.',
  'LO-13.wrong': 'Hừm, không phải ở đây! Nhìn kỹ các hàng và cột khác nhé.',
  // Partage le gâteau (LO-14).
  'title.LO-14': 'Toán — Chia bánh',
  'l.intro.LO-14': ['Đến giờ ăn xế rồi! Giúp tớ chia bánh cho các bạn nhé: ai cũng phải được miếng bằng nhau.'],
  'l.home.LO-14': ['Cái bánh: chia cho các bạn của tớ nào!'],
  'l.short.LO-14': ['Chia bánh nào!'],
  'LO-14.give': 'Các bạn tớ đến ăn xế! Kéo một miếng bánh vào mỗi cái đĩa.',
  'LO-14.smallest': 'Ôi, một bạn của tớ có miếng nhỏ hơn! Chạm vào bạn được ít nhất.',
  'LO-14.cut2': 'Chúng ta có hai người! Cắt bánh thành hai miếng bằng nhau: vuốt ngón tay ngay chính giữa.',
  'LO-14.cut4': 'Chúng ta có bốn người! Cắt bánh thành bốn miếng bằng nhau: vẽ hai đường chéo nhau, ngay chính giữa.',
  'LO-14.equalPick': 'Cái bánh nào được cắt thành các miếng đều bằng nhau? Chạm vào nó!',
  'LO-14.half': 'Cho bạn tớ một nửa cái bánh: kéo các miếng vào đĩa của bạn ấy, rồi chạm nút xanh.',
  'LO-14.quarter': 'Cho bạn tớ một phần tư cái bánh: kéo các miếng vào đĩa của bạn ấy, rồi chạm nút xanh.',
  'LO-14.cookies': 'Chia bánh quy: mỗi bạn phải được bằng nhau! Xong rồi thì chạm nút xanh.',
  'LO-14.findHalf': 'Chúng tớ đã ăn một nửa của một trong những cái bánh này. Cái nào? Chạm vào nó!',
  'LO-14.findQuarter': 'Chúng tớ đã ăn một phần tư của một trong những cái bánh này. Cái nào? Chạm vào nó!',
  'LO-14.yes': 'Ngon quá! Ai cũng được miếng bằng nhau, công bằng rồi!',
  'LO-14.hint': 'Nhìn kỹ nhé, bàn tay sẽ chỉ cho con!',
  'LO-14.already': 'Bạn ấy có miếng rồi! Đưa cho bạn khác nhé.',
  'LO-14.offCenter': 'Ôi, các miếng sẽ không bằng nhau! Cắt ngay chính giữa bánh nhé.',
  'LO-14.unfair': 'Không công bằng! Các miếng không bằng nhau: cắt chéo nhau, thật thẳng nhé!',
  'LO-14.tooFew': 'Chưa đúng! Nhìn kỹ xem cần bao nhiêu miếng.',
  'LO-14.tooMany': 'Ôi, nhiều quá! Chạm vào một miếng trong đĩa để lấy lại.',
  'LO-14.left': 'Vẫn còn bánh quy chưa chia!',
  'LO-14.uneven': 'Không bằng nhau! Đếm kỹ bánh quy của mỗi bạn.',
  'LO-14.wrongPick': 'Không phải, nhìn kỹ độ to của các miếng nhé!',
  'LO-14.cut3': 'Chúng ta có ba người! Cắt bánh thành ba miếng bằng nhau: vẽ ba đường từ giữa ra mép, như ngôi sao.',
  'LO-14.cut6': 'Chúng ta có sáu người! Cắt bánh thành sáu miếng bằng nhau: ba đường ngay chính giữa.',
  'LO-14.cut8': 'Chúng ta có tám người! Cắt bánh thành tám miếng bằng nhau: bốn đường ngay chính giữa.',
  'LO-14.third': 'Cho bạn tớ một phần ba cái bánh: kéo các miếng vào đĩa của bạn ấy, rồi chạm nút xanh.',
  'LO-14.twoThirds': 'Cho bạn tớ hai phần ba cái bánh: kéo các miếng vào đĩa của bạn ấy, rồi chạm nút xanh.',
  'LO-14.threeQuarters': 'Cho bạn tớ ba phần tư cái bánh: kéo các miếng vào đĩa của bạn ấy, rồi chạm nút xanh.',
  'LO-14.findThird': 'Chúng tớ đã ăn một phần ba của một trong những cái bánh này. Cái nào? Chạm vào nó!',
  'LO-14.fromCenter': 'Bắt đầu ngay chính giữa bánh, rồi kéo ra tận mép nhé!',
  'LO-14.unfairEven': 'Không công bằng! Các miếng không bằng nhau: chia các đường thật đều nhé!',
  'p.yourOpinion': 'Ý kiến của bạn',
  'p.rateHelp': 'Bạn có thích DinoLearn không? Một lượt đánh giá hoặc nhận xét ngắn trên cửa hàng giúp các phụ huynh khác tìm thấy ứng dụng. Việc này miễn phí và hoàn toàn tự nguyện.',
  'p.rateBtn': 'Đánh giá DinoLearn',
  'p.rateAsk': 'Bạn có thích DinoLearn không?',
  'p.rateLater': 'Để sau',
  'p.rateNever': 'Đừng hỏi lại',
};

export default vi;
