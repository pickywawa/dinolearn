import type { Catalog } from '../index';
import { kv } from '../kv';

/** Español (la segunda lengua es el inglés). */
const es: Catalog = {
  ...kv('lang', 'fr=francés; en=inglés; es=español; it=italiano; de=alemán; pt=portugués; ru=ruso; zh=chino; hi=hindi; ar=árabe; ur=urdu; bn=bengalí'),
  ...kv('country', 'fr=Francia; be=Bélgica; ch=Suiza; ca=Canadá; lu=Luxemburgo; gb=Reino Unido; us=Estados Unidos; es=España; mx=México; it=Italia; de=Alemania; at=Austria; pt=Portugal; br=Brasil; ru=Rusia; cn=China; in=India; eg=Egipto; ma=Marruecos; sa=Arabia Saudí; pk=Pakistán; bd=Bangladés'),

  'ui.loading': 'Cargando…',
  'ui.rotate': '¡Gira la tableta!',
  'ui.tap': '¡Toca la pantalla para jugar!',
  'ui.retry': 'Reintentar',
  'ui.problem': 'Problema: {reason}',
  'ui.cancel': 'Cancelar',
  'ui.home.playWith': '¡Juega con tu dino, {name}!',
  'ui.home.learn': '¡Aprende y juega con tu Dino!',
  'ui.home.summary': '{n} rondas terminadas. ¡Tu dino crece contigo!',
  'ui.home.sleeping': 'Chis… el dino está durmiendo.\nUn adulto puede desbloquearlo con su código.',
  'ui.home.timeUp': 'Se acabó el tiempo de juego.\nUn adulto puede desbloquearlo con su código.',
  'ui.child.title': '¿Cómo se llama el niño o la niña?',
  'ui.child.sub': 'El dino lo llamará por su nombre.',
  'ui.parents.title': 'Espacio para padres',
  'ui.pin.type': 'Escribe tu código de padres.',
  'ui.pin.title': 'Código de padres',
  'ui.pin.choose': 'Elige un código de 4 cifras.',
  'ui.wardrobe.title': 'Mi Dino – Vestuario',
  'ui.wardrobe.reactions': ['¡Qué chulo!', '¡Me encanta!', '¡Qué guapo estoy!', '¡Qué elegante!'],
  'ui.choose.voice': 'En voz alta',
  'ui.choose.voiceTitle': '¡Juega en voz alta!',
  'ui.choose.title': '¡Elige un juego!',
  'ui.end.3': '¡Bravo!', 'ui.end.2': '¡Genial!', 'ui.end.1': '¡Bien hecho!', 'ui.end.0': '¡Sigue así!',
  'ui.end.done': '¡Has terminado la ronda!',
  'ui.time.less': 'Menos tiempo', 'ui.time.more': 'Más tiempo',
  'ui.lang': 'Idioma', 'ui.langLabel': 'Idioma:', 'ui.mb': '{n} MB',
  'ui.pack.voice': 'paquete de {language}', 'ui.pack.asr': 'reconocimiento de voz',
  'ui.pack.downloading': 'Descargando: {list}', 'ui.pack.installing': 'Instalando el reconocimiento de voz',
  'ui.pack.speechTitle': 'Voz del dino ({language})', 'ui.pack.speechDetail': 'Una voz natural, igual en todos los aparatos.',
  'ui.pack.secondTitle': 'Voz en {language}', 'ui.pack.secondDetail': 'Para las palabras de los juegos en otro idioma.',
  'ui.pack.asrTitle': 'Reconocimiento de voz', 'ui.pack.asrDetail': 'Para responder en voz alta.',
  'ui.pack.download': 'Descargar', 'ui.pack.installed': 'Instalado ✓',
  'ui.pack.toDownload': 'Por descargar: {n} MB (mejor con wifi).', 'ui.pack.allInstalled': 'Todo está instalado.',
  'ui.pack.running': 'Descargando…', 'ui.pack.finished': 'Terminado.', 'ui.pack.failed': 'Error: {error}',
  'ui.pack.installingShort': 'Instalando…', 'ui.pack.waiting': 'En espera…',
  'voice.heard': 'He oído: {word}.',

  ...kv('p', `title=Espacio para padres; back=Volver al juego; noName=Sin nombre; addChild=+ Añadir un niño; newChild=Nuevo niño;
    newChildHelp=Al salir del espacio para padres, el nuevo niño tocará su huevo para que nazca su propio dino.;
    cancel=Cancelar; edit=✏️ Editar ficha; sheetOf=Ficha de {name}; sheet=Ficha del niño; sheetHelp=Nombre, edad y ajustes.;
    removeChild=Eliminar a {name}; thisChild=este niño;
    removeConfirm=¿Eliminar a {name}, su dino y todo su progreso? No se puede deshacer.;
    egg=huevo sin abrir; dino=dino; alternateAria=Turnos entre niños; age={n} años; otherCountry=otro país;
    series=rondas jugadas; answers=respuestas; firstTry=a la primera; today=jugado hoy;
    childrenHelp=Cada niño tiene su dino, su progreso y sus ajustes. Los ajustes de abajo son los del niño elegido.;
    alternate=Turnos: después de cada ronda, le toca al siguiente niño;
    difficulty=Dificultad inicial de los juegos: {n} de 20 ({stage}). Después se ajusta sola según los resultados.;
    stageCP=primer curso de primaria; stageK=infantil; dinoLevel=Nivel del dino;
    dinoLevelHelp=El dino crece cuando el niño le da de comer (nivel 1 a {max}). Puedes cambiarlo para ajustar la dificultad: los niveles 21 a 40 corresponden a primer curso de primaria.;
    noNight=Sin modo noche; week=Tiempo de juego en los últimos 7 días; daily=Tiempo de juego al día;
    dailyHelp=Cuando se acaba el tiempo, el niño termina la ronda y el juego se bloquea hasta el día siguiente: el dino se va a dormir. Con tu código puedes añadir 15 o 30 minutos, o desbloquear el día.;
    night=Hora de dormir (modo noche);
    nightHelp=A partir de esta hora, el cielo se hace de noche y el dino bosteza: propone una última ronda y luego duerme hasta la mañana. Tu código permite jugar un poco más esa noche.;
    enable=Activar {game}; levelOf=Nivel de {game}; levelAuto=Nivel automático; level=Nivel {n}; fromAge=Desde los {n} años;
    needsVoice=Juego en voz alta: permite el micrófono y descarga el reconocimiento de voz en {language} (sección «Voces y descargas»).;
    nAnswers={n} respuestas; notPlayed=Aún no jugado; rate={rate} a la primera; mastered={n} / {total} preguntas dominadas;
    lastPlayed=jugado por última vez el {date}; chooseAria=Botón para elegir un juego; games=Juegos;
    choose=Botón «Elegir un juego» en la pantalla de inicio;
    chooseHelp=Desactivado, el niño juega con el planeta: cada ronda mezcla todos los juegos de su edad. Activado, también puede elegir un juego concreto (y los juegos en voz alta, que no se mezclan con los demás).;
    gamesHelp=Desactiva un juego para que ya no se proponga. El nivel (1 a 20; 11 a 20 = primer curso de primaria) es donde empieza la próxima ronda; «auto» lo calcula según la edad, el dino y los resultados.;
    reviewToday=para repasar hoy; reviewTomorrow=vuelve mañana; reviewOn=vuelve el {date}; reviewN=repaso {n} de {total};
    review=Para repasar;
    reviewHelp=Una pregunta fallada vuelve al día siguiente, luego a los 3 días y luego a la semana. Acertada las tres veces, está aprendida; fallada, vuelve a empezar al día siguiente.;
    reviewNone=Nada que repasar por ahora. ¡Bravo!; sfxAria=Efectos de sonido; musicAria=Música de fondo; testVoice=Probar la voz;
    testHello=¡Hola! Soy Dino.; sound=Sonido y voz; sfx=Efectos de sonido (aciertos, errores, ñam…);
    music=Música de fondo suave (el niño también puede quitarla en la pantalla de inicio);
    phoneVoices=Voz principal: {main} · Voz del segundo idioma: {second}. Estas voces son del teléfono: para una voz más natural, instala una voz «mejorada» o «premium» en los ajustes de accesibilidad (texto a voz).;
    noVoice=ninguna encontrada; mic=Micrófono (juegos en voz alta);
    micHelp=En los juegos en voz alta, el niño responde hablando: nombra imágenes, dice palabras en el segundo idioma y resuelve cuentas. Todo se queda en este aparato: la voz nunca se graba ni se envía. El micrófono solo se enciende cuando el niño toca el gran botón del micrófono. Estas preguntas se mezclan con las demás cuando el niño toca el planeta.;
    noMic=Este navegador no permite usar el micrófono en el juego.; allowMic=Permitir el micrófono;
    allowMicNow=Permite el micrófono en la ventana del navegador…;
    micBlocked=El micrófono está bloqueado. Permítelo en los ajustes del navegador (candado junto a la dirección) y vuelve a intentarlo.;
    packsWhere=Los paquetes de reconocimiento de voz se descargan en la sección «Voces y descargas».;
    removePacks=Eliminar los paquetes;
    removePacksConfirm=¿Eliminar de este aparato los paquetes de reconocimiento de voz? Los juegos en voz alta ya no se propondrán.;
    packs=Voces y descargas;
    packsHelp=El idioma del juego, la voz natural del dino (creada en el aparato, sin Internet una vez descargada), la voz de los juegos en otro idioma y el reconocimiento de voz. Las descargas van en paralelo y siguen aunque cierres este espacio. Sin la voz del dino, el juego usa la voz del teléfono.;
    changeCode=Cambiar el código; newCode=Nuevo código de padres; newCodeHelp=Elige un nuevo código de 4 cifras.;
    codeChanged=El código de padres ha cambiado.; code=Código de padres;
    codeHelp=El código abre este espacio y desbloquea el juego cuando se acaba el tiempo del día. Si lo olvidas, «¿Código olvidado?» permite crear otro tras una pregunta para adultos.;
    reset=Empezar de cero; resetConfirm=¿Borrar todo el progreso (nivel del dino, respuestas, frutas)? Los ajustes se conservan.;
    privacy=Política de privacidad; close=Cerrar; data=Datos;
    dataHelp=Todo se guarda solo en este aparato. Nunca se envía ningún dato.`),

  ...kv('pin', `erase=Borrar; remember=Recuérdalo bien.; forgot=¿Código olvidado?;
    adultQuestion=Pregunta para un adulto: ¿cuánto es {a} × {b}? (3 cifras); cancel=Cancelar; wrongAnswer=No es correcto.;
    newCode=Nuevo código de padres; newCodeHelp=Elige un nuevo código de 4 cifras.; wrongCode=Código incorrecto.;
    otherCountry=Otro país; firstName=Nombre;
    micHtml=<b>Permitir el micrófono</b> (juegos en voz alta)<br><small>Todo se queda en este aparato: la voz nunca se graba ni se envía.</small>;
    missionsHtml=<b>Elegir las misiones</b><br><small>El niño puede elegir sus juegos (botón «Misiones»). Sin marcar: solo rondas al azar con «Jugar».</small>;
    ok=Vale; nameMissing=Escribe el nombre del niño.; age=Edad; years={n} años; country=País; daily=Tiempo de juego al día;
    night=Hora de dormir (modo noche); none=Ninguno; welcome=¡Bienvenido, papá o mamá!;
    welcomeHeard=Esto es lo que tu hijo le ha dicho al dino: corrígelo si hace falta. Puedes añadir otros niños y cambiarlo todo en el espacio para padres (candado en la pantalla de inicio).;
    welcomeHelp=El nombre, la edad y los ajustes de tu hijo. Puedes añadir otros niños y cambiarlo todo en el espacio para padres (candado en la pantalla de inicio).;
    yourCode=Tu código de padres;
    yourCodeHelp=Elige un código de 4 cifras. Abre el espacio para padres (candado en la pantalla de inicio) y desbloquea el juego cuando se acaba el tiempo del día. ¡No se lo des a tu hijo!;
    asleep=El dino está durmiendo; asleepHelp=Es hora de dormir. Escribe el código de padres para jugar un poco más esta noche.;
    timeUp=Se acabó el tiempo de juego; timeUpHelp=Escribe el código de padres para añadir tiempo hoy.;
    addTime=Añadir tiempo; todayOnly=Solo por hoy.; plus15=15 minutos más; plus30=30 minutos más; unlimited=Sin límite hoy`),

  ...kv('inst', `title=Instala DinoLearn en tu teléfono; later=Más tarde; okay=Vale; never=No volver a preguntar;
    android=Se abrirá a pantalla completa, en horizontal, como una aplicación de verdad. No hay nada más que descargar.;
    menu=En el menú del navegador:;
    androidSteps=<li>Toca <b>⋮</b> (los tres puntos, arriba a la derecha).</li><li>Elige <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>.</li><li>Abre el juego con el icono del dino.</li>;
    ios=Se abrirá a pantalla completa, sin las barras de Safari, como una aplicación de verdad.;
    iosSteps=<li>Toca {share} <b>Compartir</b> (abajo o arriba en Safari).</li><li>Elige <b>«Añadir a pantalla de inicio»</b> y luego <b>Añadir</b>.</li><li>Abre el juego con el icono del dino.</li>`),

  ...kv('title', `EN-1=Inglés — Escucha y toca; EN-2=Inglés — Los números; EN-3=Inglés — Memoria; MO-1=El mundo — Enséñame;
    MO-3=El mundo — Las sombras; MO-4=El mundo — Qué va junto; MO-5=El mundo — El más grande; LO-1=Lógica — El intruso;
    LO-2=Lógica — ¿Cuántos hay?; LO-3=Lógica — Qué sigue; LO-4=Lógica — Más y menos; LO-5=Lógica — Las cuentas;
    LO-6=Lógica — Los números; LO-7=Lógica — Formas y colores; LO-8=Lógica — La hora; LO-9=Lógica — El dinero;
    LO-10=Lógica — Memoria; LO-11=Lógica — Escucha y cuenta; TR-1=Escritura — Trazar formas;
    TR-2=Escritura — Trazar letras y números; VO-1=En voz alta — ¿Cómo se llama?; VO-2=En voz alta — ¡Dilo en inglés!;
    VO-13=En voz alta — Las cuentas`),

  ...kv('item', `top-hat=la chistera; billed-cap=la gorra; crown=la corona; womans-hat=el sombrero de paja;
    graduation-cap=el birrete; rescue-workers-helmet=el casco de bombero; headphone=los auriculares; hibiscus=la flor;
    glasses=las gafas; sunglasses=las gafas de sol; goggles=las gafas de bucear; ribbon=la pajarita; swim-ring=el flotador;
    sports-medal=la medalla; prayer-beads=el collar; cape-red=la capa de superhéroe; cape-blue=la capa de mago; wing=las alas;
    balloon=el globo; magic-wand=la varita mágica; lollipop=la piruleta; sunflower=el girasol; teddy-bear=el osito de peluche`),
  ...kv('dinocolor', '0=verde; 1=azul; 2=violeta; 3=rosa; 4=naranja; 5=amarillo; 6=turquesa; 7=rojo; 8=marrón'),

  ...kv('cat', `farm=un animal de la granja; sea=un animal del mar; bird=un pájaro; bug=un bicho; wild=un animal salvaje;
    forest=un animal del bosque; fruit=una fruta; veg=una verdura; meal=algo de comer; vehicle=un vehículo; toy=un juguete;
    home=algo de la casa; clothes=algo que se pone; tool=una herramienta; kitchen=un objeto de todos los días;
    music=un instrumento de música; sky=algo del cielo; plant=una planta; body=una parte del cuerpo; landscape=un lugar;
    color=un color; element=algo de la naturaleza`),
  ...kv('fam', `farm=animales de la granja; sea=animales del mar; bird=pájaros; bug=bichos; wild=animales salvajes;
    forest=animales del bosque; fruit=frutas; veg=verduras; meal=comidas y golosinas; vehicle=vehículos; toy=juguetes;
    home=cosas de la casa; clothes=ropa; tool=herramientas; kitchen=cosas del baño y de la cocina; music=instrumentos de música;
    sky=cosas del cielo y del tiempo; plant=plantas; body=partes del cuerpo; landscape=lugares; color=colores;
    element=cosas de la naturaleza`),
  ...kv('fruit', `red-apple=manzana; banana=plátano; strawberry=fresa; cherries=cerezas; grapes=uvas; tangerine=naranja;
    pear=pera; lemon=limón; watermelon=sandía; peach=melocotón; pineapple=piña; kiwi-fruit=kiwi; mango=mango;
    blueberries=arándanos; melon=melón; green-apple=manzana verde; coconut=coco`),
  ...kv('many', `food-red-apple=manzanas; food-banana=plátanos; food-strawberry=fresas; food-pear=peras; food-lemon=limones;
    food-tangerine=naranjas; food-kiwi-fruit=kiwis; food-peach=melocotones`),

  'g.hintFamily': 'Pista: es {family}.',
  'g.word': '¡{word}!',
  'g.yesWord': ['¡Sí, {word}!', '¡Eso es, {word}!'],
  'g.yesItIs': '¡Sí, es {word}!',
  'g.hint': 'Pista: {hint}.',
  'g.hintTens': 'Pista: mira primero la primera cifra, las decenas.',
  'g.plus': '{a} más {b}', 'g.minus': '{a} menos {b}',
  'g.calcPrompt': ['¿Cuánto es {calc}?', '{calc}, ¿cuánto da?'],
  'g.calcYes': '¡Sí! ¡{calc} son {n}!',
  'g.hintAdd': 'Pista: empieza en {a} y cuenta {b} más con los dedos.',
  'g.hintSub': 'Pista: empieza en {a} y cuenta {b} hacia atrás con los dedos.',
  'MO-1.prompt': ['¡Enséñame {word}!', '¿Dónde está {word}?', '¡Toca {word}!', '¿Encuentras {word}?'],
  'LO-1.prompt': ['¡Encuentra el intruso! ¿Cuál no es de la misma familia?', '¿Qué imagen no es de la misma familia?'],
  'LO-1.yes': '¡Sí, {word}! Los demás son {family}.',
  'LO-1.hint': 'Pista: {n} imágenes son {family}. Busca la que no lo es.',
  'LO-2.prompt': ['Hay {things}. ¿Cuántas frutas son? ¡Cuenta bien!', 'Cuenta las frutas: {things}. ¿Cuántas hay?'],
  'LO-2.promptMixed': '¡Cuidado! Cuenta solo estas frutas: {things}. ¿Cuántas hay?',
  'LO-2.yes': '{list}. ¡Son {n}!',
  'LO-2.hint': 'Pista: toca cada fruta con el dedo contando despacio.',
  'LO-2.hintBig': 'Pista: cuenta primero hasta diez y luego sigue: once, doce, trece…',
  'MO-3.prompt': ['¿De quién es esta sombra? ¡Toca la imagen correcta!', '¿Quién se esconde detrás de esta sombra?'],
  'LO-3.prompt': ['Mira bien la serie. ¿Qué fruta va después?', '¿Qué fruta continúa la serie?'],
  'LO-3.yes': '¡Sí! ¡{list}!',
  'LO-3.hint': 'Pista: la serie siempre vuelve a empezar igual. {list}…',
  'LO-3.numPrompt': 'Mira y escucha: {list}. ¿Qué número va después?',
  'LO-3.numYes': '¡Sí! ¡{list}, {n}!',
  'LO-3.hintGrow': 'Pista: sumamos uno, luego dos, luego tres… ¿y luego?',
  'LO-3.hintPlus': 'Pista: sumamos {n} cada vez.',
  'LO-3.hintMinus': 'Pista: quitamos {n} cada vez.',
  'LO-4.num.most': '¡Toca el número más grande!', 'LO-4.num.least': '¡Toca el número más pequeño!',
  'LO-4.numYes.most': '¡Sí! ¡{n} es el más grande!', 'LO-4.numYes.least': '¡Sí! ¡{n} es el más pequeño!',
  'LO-4.numHint.most': 'Pista: al contar, el más grande llega el último.',
  'LO-4.numHint.least': 'Pista: al contar, el más pequeño llega el primero.',
  'LO-4.pile.most': '¿Dónde hay más {things}? ¡Toca la carta correcta!',
  'LO-4.pile.least': '¿Dónde hay menos {things}? ¡Toca la carta correcta!',
  'LO-4.pileYes.most': '¡Sí! Aquí hay {n}. ¡Es donde hay más!',
  'LO-4.pileYes.least': '¡Sí! Aquí hay {n}. ¡Es donde hay menos!',
  'LO-4.pileHint.least': 'Pista: busca la carta con muy pocas frutas.',
  'LO-4.pileHint.most': 'Pista: busca la carta más llena.',
  'LO-5.compl': '¿{a} más cuánto son {b}?',
  'LO-5.complYes': '¡Sí! ¡{a} más {x} son {b}!',
  'LO-5.complHint': 'Pista: cuenta con los dedos, de {a} hasta {b}.',
  'LO-5.add': 'Mira, {a} {things}. Pongo {b} más. ¿Cuántas hay en total?',
  'LO-5.eat': 'Mira, {a} {things}. Dino se come {b}. ¿Cuántas quedan?',
  'LO-5.addHint': 'Pista: cuenta todas las frutas, a la izquierda y a la derecha.',
  'LO-5.eatHint': 'Pista: cuenta solo las frutas que no están tachadas.',
  'LO-11.prompt': ['Escucha bien: {calc}. ¿Cuánto da?', '¿Cuánto es {calc}?', 'De cabeza: {calc}. ¡Toca la respuesta!'],
  'VO-13.prompt': ['¿Cuánto es {calc}? ¡Dímelo!', '{calc}, ¿cuánto da? ¡Dímelo!'],
  'VO-13.repeat': 'Escucha: {calc} son {n}. ¡Ahora dilo tú!',
  'VO-13.fallback': '{calc}, ¿cuánto da? ¡Toca el número correcto!',
  'MO-4.prompt': ['Mira: {word}. ¿Qué va con esto?', '¡Encuentra lo que va bien con {word}!'],
  'MO-4.yes': '¡Sí, {a} va con {b}!',
  'MO-4.hint': 'Pista: imagina {word}. ¿Qué se ve a menudo con eso?',
  'MO-5.prompt.big': ['En la vida real, ¿cuál es el más grande?', '¡Toca el más grande en la vida real!'],
  'MO-5.prompt.small': ['En la vida real, ¿cuál es el más pequeño?', '¡Toca el más pequeño en la vida real!'],
  'MO-5.yes.big': '¡Sí! ¡En la vida real, {word} es lo más grande!',
  'MO-5.yes.small': '¡Sí! ¡En la vida real, {word} es lo más pequeño!',
  'MO-5.hint': 'Pista: en las imágenes todos tienen el mismo tamaño. ¡Imagínalos de verdad, a tu lado!',
  'LO-6.prompt': ['¡Toca el número {n}!', '¿Dónde está el número {n}?', '¡Encuentra el {n}!'],
  'LO-6.yes': '¡Sí! ¡Es el {n}!',
  'LO-6.hint': 'Pista: cuenta con los dedos hasta {n} y busca ese número.',
  'LO-6.hintBig': 'Pista: mira bien la primera cifra y luego la segunda.',
  'EN-2.hint': 'Pista: cuenta en inglés con los dedos y para cuando oigas el número correcto.',
  'LO-7.shape': '¡Toca {shape}!',
  'LO-7.color': '¡Toca la forma de color {color}!',
  'LO-7.both': '¡Toca {shape} de color {color}!',
  'LO-7.yes.shape': '¡Sí, {shape}!',
  'LO-7.yes.color': '¡Sí! ¡La de color {color}!',
  'LO-7.yes.both': '¡Sí, {shape} de color {color}!',
  'LO-7.hint.color': 'Pista: mira solo el color; la forma no importa.',
  'LO-7.hint.both': 'Pista: busca primero el color correcto y luego mira bien la forma.',
  ...kv('shape', 'circle=el círculo; square=el cuadrado; triangle=el triángulo; star=la estrella; heart=el corazón; rectangle=el rectángulo; diamond=el rombo; oval=el óvalo; hexagon=el hexágono; cross=la cruz'),
  ...kv('clue', `circle=el círculo es redondo, no tiene esquinas; square=el cuadrado tiene cuatro lados iguales;
    triangle=el triángulo tiene tres lados y tres puntas; star=la estrella tiene cinco puntas;
    heart=el corazón tiene dos curvas arriba y una punta abajo; rectangle=el rectángulo tiene cuatro lados, dos largos y dos cortos;
    diamond=el rombo es como un cuadrado apoyado en una punta; oval=el óvalo es un círculo estirado;
    hexagon=el hexágono tiene seis lados; cross=la cruz tiene cuatro brazos`),
  ...kv('color', 'red=rojo; blue=azul; green=verde; yellow=amarillo; orange=naranja; purple=violeta; pink=rosa'),
  'time.0': 'las {h} en punto', 'time.30': 'las {h} y media', 'time.15': 'las {h} y cuarto', 'time.45': 'las {next} menos cuarto',
  'time.m': 'las {h} y {m}', 'time.24': 'las {h}:{mm}',
  'LO-8.prompt': ['¡Toca el reloj que marca {time}!', '¿Dónde son {time}?'],
  'LO-8.yes': '¡Sí! ¡Son {time}!',
  'LO-8.hint': 'Pista: la aguja corta marca la hora, la larga los minutos.',
  'LO-8.hintHard': 'Pista: mira primero la aguja corta para la hora y luego la larga para los minutos.',
  'money.e1': 'un euro', 'money.e': '{e} euros', 'money.c1': 'un céntimo', 'money.c': '{c} céntimos', 'money.ec': '{e} euros con {c}',
  'LO-9.prompt': ['¡Toca la carta con {money}!', '¿Dónde hay justo {money}?'],
  'LO-9.yes': '¡Sí! ¡Son {money}!',
  'LO-9.hint': 'Pista: cuenta primero los billetes y las monedas grandes, y luego suma las pequeñas.',
  'TR.dots': ['¡Repasa la línea de puntos!', '¡Con el dedo, sigue los puntos!'],
  'TR.faint': 'Trázalo siguiendo los puntitos.',
  'TR.free': ['¡Ahora dibújalo tú solo, como el modelo!', '¡Te toca: dibújalo sin los puntos!'],
  'TR.yes': ['¡Bravo! ¡Muy bonito!', '¡Genial!', '¡Qué dibujo tan bonito!'],
  'TR.hint': '¡Mira, te enseño! Empieza en el punto verde número uno.',
  'LO-10.prompt': ['Da la vuelta a dos cartas. Si son iguales, ¡ganas la pareja!', '¡Encuentra todas las parejas!'],
  'LO-10.promptForeign': ['¡Da la vuelta a dos cartas y encuentra las parejas! Escucha… ¡en inglés!', '¡Encuentra las parejas y escucha las palabras en inglés!'],
  'LO-10.yes': ['¡Bravo, has encontrado todas las parejas!', '¡Qué memoria! ¡Todas las parejas!'],
  'LO-10.hint': '¡Recuerda dónde están las imágenes que ya has visto!',
  'VO-1.prompt': ['¿Cómo se llama esto?', '¿Qué es?', '¡Dime qué es!'],
  'VO-1.repeat': 'Escucha bien: {word}. ¡Ahora dilo tú!',
  'VO-2.prompt': ['¿Cómo se dice {word} en inglés?', 'En inglés, ¿cómo se dice {word}?', '¡Di {word} en inglés!'],
  'VO-2.yes': ['¡Bravo, muy bien dicho!', '¡Genial, hablas inglés!', '¡Perfecto!'],
  'VO-2.repeat': 'Escucha bien y repite conmigo:',
  'VO-2.fallback': 'Toca la imagen de la palabra en inglés:',
  'VO-2.hint': 'Pista: ¡piensa en las palabras en inglés que ya conoces!',
  'l.handover': ['¡Bravo {current}! ¡Ahora le toca a {next}!', '¡Gracias {current}! {next}, ¡te toca jugar!'],
  'l.gift': ['¡He crecido! ¡Elige un regalo para mí!', '¡Un regalo! ¿Cuál me vas a dar?'],
  'l.giftThanks': '¡Oh, {item}! ¡Gracias!',

  ...kv('num', `0=cero; 1=uno|un|una; 2=dos; 3=tres; 4=cuatro; 5=cinco; 6=seis; 7=siete; 8=ocho; 9=nueve; 10=diez; 11=once;
    12=doce; 13=trece; 14=catorce; 15=quince; 16=dieciséis; 17=diecisiete; 18=dieciocho; 19=diecinueve; 20=veinte`),

  'l.hello': ['¡Hola {name}! ¡Soy yo, tu dino!', '¡Hola {name}! ¡Nos vamos a divertir mucho juntos!'],
  'l.welcome_back': ['¡Has vuelto, {name}! ¡Hurra!', '¡Hola {name}! ¡Tenía muchas ganas de verte!', '¡Ah, aquí estás! ¿Jugamos?',
    '¡Hurra, ha llegado mi amigo!'],
  'l.home.play': ['Toca el botón verde: ¡vamos a dar la vuelta al mundo de los juegos!', '¿Jugamos? ¡Toca el botón verde!'],
  'l.home.categories': ['Y para elegir tu juego, toca el botoncito.'],
  'l.random.go': ['¡Vamos!', '¡Despegamos! ¡A dar la vuelta al mundo!', '¡Venga, a jugar!', 'Preparados… ¡ya!'],
  'l.home.choose': ['¡Elige un juego! Toca una burbuja grande.'],
  'l.home.EN-1': ['La bandera: ¡palabras en inglés!'],
  'l.home.MO-1': ['¡Enséñame las cosas del mundo!'],
  'l.home.LO-1': ['El puzle: ¡encuentra el intruso!'],
  'l.home.LO-2': ['El ábaco: ¡vamos a contar!'],
  'l.home.MO-3': ['La sombra: ¿de quién es?'],
  'l.home.LO-3': ['Las flechas: ¿qué sigue?'],
  'l.home.LO-4': ['La balanza: ¿dónde hay más?'],
  'l.home.LO-5': ['Los números: ¡vamos a hacer cuentas!'],
  'l.home.LO-11': ['La oreja: ¡cuentas de cabeza!'],
  'l.home.VO-13': ['El micrófono: ¡dime el resultado de la cuenta!'],
  'l.home.EN-2': ['El diez: ¡los números en inglés!'],
  'l.home.MO-4': ['El apretón de manos: ¿qué va junto?'],
  'l.home.MO-5': ['La regla: ¿qué es más grande de verdad?'],
  'l.home.LO-6': ['Los números: ¡encuentra el número correcto!'],
  'l.home.LO-10': ['Las cartas: ¡memoria!'],
  'l.home.EN-3': ['El comodín: ¡memoria en inglés!'],
  'l.home.LO-7': ['La paleta: ¡formas y colores!'],
  'l.home.LO-8': ['El despertador: ¿qué hora es?'],
  'l.home.LO-9': ['El billete: ¡vamos a contar dinero!'],
  'l.home.TR-1': ['El lápiz: ¡vamos a trazar formas!'],
  'l.home.TR-2': ['La mano que escribe: ¡vamos a trazar letras y números!'],
  'l.intro.MIX': ['¡Escucha bien cada pregunta!', '¡Abre bien las orejas!', '¿Estás listo? ¡Yo sí!'],
  'l.short.EN-1': ['¡En inglés!'],
  'l.short.MO-1': ['¡Enséñame!'],
  'l.short.MO-3': ['¡Una sombra!'],
  'l.short.LO-1': ['¡El intruso!'],
  'l.short.LO-2': ['¡Vamos a contar!'],
  'l.short.LO-3': ['¡Qué sigue!'],
  'l.short.LO-4': ['¡Más o menos!'],
  'l.short.LO-5': ['¡Una cuenta!'],
  'l.short.LO-11': ['¡Una cuenta de cabeza!'],
  'l.short.VO-13': ['¡Dime el resultado!'],
  'l.short.EN-2': ['¡Un número en inglés!'],
  'l.short.MO-4': ['¿Qué va junto?'],
  'l.short.MO-5': ['¡El más grande o el más pequeño!'],
  'l.short.LO-6': ['¡Encuentra el número!'],
  'l.short.LO-10': ['¡Memoria!'],
  'l.short.EN-3': ['¡Memoria en inglés!'],
  'l.short.LO-7': ['¡Formas y colores!'],
  'l.short.LO-8': ['¿Qué hora es?'],
  'l.short.LO-9': ['¡El dinero!'],
  'l.short.TR-1': ['¡Vamos a trazar!'],
  'l.short.TR-2': ['¡Vamos a escribir!'],
  'l.home.level': ['¡La estrella es mi nivel!'],
  'l.intro.EN-1': ['Digo una palabra en inglés. ¡Toca la imagen correcta!'],
  'l.intro.MO-1': ['Escucha bien y toca lo que te pido.', '¡Vamos a dar la vuelta al mundo! Encuentra lo que te pido.'],
  'l.intro.LO-1': ['Mira bien las imágenes. Solo una no es de la misma familia: ¡encuentra el intruso!'],
  'l.intro.LO-2': ['¡Vamos a contar! Cuenta las frutas y toca el número correcto.'],
  'l.intro.MO-3': ['Mira bien esta sombra negra. ¡Encuentra de quién es!'],
  'l.intro.LO-3': ['Mira bien la serie y encuentra lo que va después.'],
  'l.intro.LO-4': ['Mira bien las cartas. ¡Encuentra la que te pido!'],
  'l.intro.LO-11': ['¡Cuentas sin imágenes! Escucha bien, calcula de cabeza y toca el número correcto.'],
  'l.intro.VO-13': ['Yo digo una cuenta y tú me dices el resultado. ¡Toca el micrófono para responder!'],
  'l.intro.LO-5': ['¡Vamos a hacer cuentas! Escucha bien y toca el número correcto.', '¡Hora de las cuentas! Puedes contar con los dedos.'],
  'l.intro.EN-2': ['Digo un número en inglés. ¡Toca el número correcto!'],
  'l.intro.MO-4': ['Algunas cosas van juntas, como la llave y el candado. ¡Encuentra lo que va junto!'],
  'l.intro.MO-5': ['En las imágenes todo tiene el mismo tamaño. Pero, ¿y en la vida real? ¡Encuentra el que te pido!'],
  'l.intro.LO-6': ['Digo un número. ¡Encuéntralo entre las cartas!'],
  'l.intro.LO-10': ['¡Vamos a jugar a la memoria! Da la vuelta a dos cartas: si son iguales, ¡ganas la pareja!'],
  'l.intro.EN-3': ['¡Memoria en inglés! Cuando das la vuelta a una carta, digo la palabra en inglés. ¡Encuentra las parejas!'],
  'l.intro.LO-7': ['¡Vamos a jugar con formas y colores! Escucha bien y toca la forma correcta.'],
  'l.intro.LO-8': ['¡Mira bien los relojes! La aguja corta marca la hora, la larga los minutos.'],
  'l.intro.LO-9': ['¡Vamos a jugar a las tiendas! Cuenta las monedas y encuentra la cantidad correcta.'],
  'l.intro.TR-1': ['¡Vamos a dibujar con el dedo! Empieza en el punto verde y sigue la línea de puntos.'],
  'l.intro.TR-2': ['¡Vamos a aprender a escribir! Empieza en el punto verde número uno y sigue la línea de puntos.'],
  'l.trace.start': ['Pon el dedo en el punto verde y sigue los puntitos.', '¡Venga, dibuja con el dedo!'],
  'l.trace.continue': ['¡Sigue, ya casi está!', 'Falta un poco. ¡Sigue!'],
  'l.trace.retry': ['¡Casi! ¿Lo borramos y volvemos a empezar?', 'Uy, no es eso. ¡Inténtalo otra vez!'],
  'l.tutorial': ['¡Mira, te enseño! Tocamos la imagen correcta, así.'],
  'l.tutorial_your_turn': ['¡Ahora te toca a ti!'],
  'l.correct': ['¡Bravo {name}!', '¡Muy bien, {name}!', '¡Exacto!', '¡Genial!', '¡Súper!', '¡Sííí!', '¡Fantástico!', '¡Campeón!',
    '¡Eres una estrella!', '¡Eso es!', '¡Perfecto!', '¡Guau!'],
  'l.wrong': ['¡Uy! ¡Inténtalo otra vez!', 'Mmm, mira bien…', '¡Ese no! ¡Sigue buscando!', '¡Casi! ¡Otra vez!', 'No pasa nada, ¡inténtalo de nuevo!'],
  'l.hint': ['Te ayudo: ¡toca el que brilla!', 'Mira, ¡es el que te enseño!'],
  'l.streak': ['¡Tres seguidas! ¡Estás que lo bordas!', '¡Tres seguidas! ¡Increíble!'],
  'l.idle': ['¿Estás ahí? ¡Toca una carta!', '¡Te espero! Toca una carta.'],
  'l.touch_me': ['Para volver a oírlo, ¡tócame!'],
  'l.review_due': ['Esta ya la hemos visto juntos. ¿Te acuerdas?', '¡Una pregunta de repaso! Seguro que la sabes.'],
  'l.review': ['¡Ya te lo sabes todo! ¿Repasamos?'],
  'l.series_perfect': ['¡Guau, todo bien! ¡Eres una estrella, {name}!', '¡Ni un error! ¡Bailo de alegría!'],
  'l.series_great': ['¡Increíble! ¡Casi todo bien!', '¡Qué talento, {name}!'],
  'l.series_good': ['¡Muy bien jugado! ¡Aprendes rápido!', '¡Bravo, has encontrado muchas!'],
  'l.series_ok': ['¡Bien jugado! ¿Seguimos practicando?', '¡Bien! Cada ronda te ayuda a mejorar.'],
  'l.series_encourage': ['Era difícil, ¿verdad? ¡Yo también estoy aprendiendo!', '¡No pasa nada! Se aprende jugando.',
    '¡Hasta los dinosaurios grandes se equivocan! ¿Volvemos a empezar?'],
  'l.end.feed': ['¡Mira esta cesta de frutas! Toca la cesta para dármelas.', '¡Ñam! Dame la cesta: ¡tócala!'],
  'l.end.nothing': ['Esta vez no hay frutas. ¿Jugamos otra vez para ganar algunas?'],
  'l.end.again': ['¡Toca el botón verde para volver a jugar!'],
  'l.fly.visit': ['¡Mira, una mosca!', '¡Me encantan las moscas!'],
  'l.home.ambient': ['Creo que el volcán sigue en erupción.', 'Tengo un poco de hambre.', 'Me gustaría que me ayudaras a crecer.',
    '¡Mira cómo pasan las nubes!'],
  'l.fly.caught': ['¡Slurp! ¡Una mosca!', '¡Ñam, crujiente!', '¡Atrapada!'],
  'l.fruit.won': ['¡Una fruta para mí!', '¡Ñam, una fruta!'],
  'l.eating': ['¡Ñam ñam!', '¡Crac! ¡Riquísimo!', '¡Mmm, qué bueno!', '¡Más, por favor!', '¡Gracias!'],
  'l.full': ['¡Tengo la barriga llena! Guardo el resto para luego.'],
  'l.level_up': ['¡Oh! ¡Estoy creciendo! ¡Gracias por cuidarme tan bien!', '¡Mira, soy más grande!'],
  'l.tickle': ['¡Ji ji, me haces cosquillas!', '¡Ja ja ja! ¡Para!', '¡Ay, las cosquillas no!'],
  'l.start': ['¡Tócame para despertarme!'],
  'l.parent_code': ['Antes de jugar, ¡ve a buscar a mamá o a papá! Tienen que elegir un código secreto para mí.'],
  'l.parent_code_done': ['¡Gracias! ¡Ahora podemos jugar juntos!'],
  'l.wardrobe.intro': ['¡Arrastra una prenda hasta mí para ponérmela!', '¡Vísteme! Coge una prenda con el dedo y pónmela.'],
  'l.wardrobe.drag': ['¡Deja el dedo sobre la prenda y arrástrala hasta mí!'],
  'l.wardrobe.off': ['¡Vale, me lo quito!', '¡Fuera!'],
  'l.wardrobe.empty': ['¡Mi armario está vacío! Cuando crezca, ganarás una prenda para mí.'],
  'l.home.wardrobe': ['¡El sombrero es para vestirme!'],
  'l.gift.waiting': ['¡He crecido! Toca el regalo para elegir una prenda para mí.'],
  'l.gift.go': ['¡He crecido! Ven a mi armario: ¡te espera un regalo!'],
  'l.wardrobe.new': ['¡Arrástralo hasta mí para ponérmelo!'],
  'l.wardrobe.take_off': ['Para quitarme una prenda, arrástrala lejos de mí.'],
  'l.night.last': ['Uy, se hace tarde… ¿Una última ronda y a dormir?', 'Aaah… tengo sueño. ¡Venga, una última ronda!'],
  'l.night.goodnight': ['¡Era la última ronda! Gracias por este día tan bonito. ¡Buenas noches!'],
  'l.night.sleep': ['Chis… estoy durmiendo. Zzz… ¡Hasta mañana!'],
  'l.bedtime': ['¡Hoy hemos jugado mucho! Ahora me voy a dormir. ¿Jugamos mañana?'],
  'l.streak5': ['¡Cinco seguidas! ¡Eres un genio!', '¡Cinco! ¡Eres más fuerte que un T-rex!'],
  'l.correct_after_try': ['¡Lo has encontrado! ¿Ves? ¡Solo había que buscar!', '¡Eso es! No te has rendido, ¡bravo!'],
  'l.halfway': ['¡Ya vamos por la mitad! ¡Sigue así!', '¡La mitad! ¡Solo unas preguntas más!'],
  'l.last_question': ['¡Última pregunta!', '¡Venga, la última!'],
  'l.home.voice': ['El micrófono: ¡juegos en los que respondes con la voz!'],
  'l.home.voice_choose': ['¡Aquí respondes hablando! Elige un juego.'],
  'l.intro.VO-1': ['Te enseño una imagen. Toca el micrófono y dime cómo se llama.'],
  'l.intro.VO-2': ['¡Vamos a hablar inglés! Toca el micrófono y di la palabra en inglés.'],
  'l.home.VO-1': ['La cabeza que habla: ¡dime el nombre de las imágenes!'],
  'l.home.VO-2': ['La bandera: ¡di las palabras en inglés!'],
  'l.short.VO-1': ['¿Cómo se llama?'],
  'l.short.VO-2': ['¡En inglés!'],
  'l.voice.tap_mic': ['Toca el micrófono y respóndeme.', '¡Te toca! Toca el micrófono y habla fuerte.'],
  'l.voice.listening': ['¡Te escucho!', '¡Tengo las orejas bien abiertas!'],
  'l.voice.unheard': ['No te he oído bien. Toca el micrófono y habla fuerte.', '¡Oh, no he oído nada! Acércate y habla más fuerte.'],
  'l.voice.wrong': ['¡No es eso! ¡Inténtalo otra vez!', '¡Casi! ¡Otra vez!'],
  'l.voice.cards': ['¡Tengo las orejas cansadas! Toca la respuesta correcta con el dedo.'],
  'l.voice.give_up': ['El micrófono no me oye bien. A partir de ahora, ¡jugamos con el dedo!'],
  'l.voice.loading': ['Espera, me estoy limpiando las orejas…'],
  'l.voice.no_mic': ['Oh, no te oigo. ¡Jugamos con el dedo!'],
  'l.egg.1': ['¡Toc toc! ¿Hay alguien?', '¡Oh! ¡Algo se mueve ahí dentro!'],
  'l.egg.2': ['¡Otra vez! ¡Ayúdame a salir!', '¡Sigue, la cáscara se rompe!'],
  'l.egg.3': ['¡Casi! ¡Un golpecito más!'],
  'l.egg.hatched': ['¡Hola!', '¡Uf! ¡Aquí estoy!'],
  'l.hello.1': ['¡Hola! Soy tu dino, un pequeño bebé dinosaurio {color}. ¿Me ayudas a crecer?'],
  'l.hello.4': ['¡Vamos a jugar a muchos juegos juntos!'],
  'l.hello.5': ['Cada vez que aciertas, ganas una fruta.'],
  'l.hello.6': ['Me las das para comer: ¡cuanto más como, más crezco!'],
  'l.hello.7': ['¡Y cuando crezco, ganas premios!'],
  'l.hello.8': ['¡Venga, vamos!'],
  'l.hello.name': ['Pero primero dime: ¿cómo te llamas? ¡Toca el micrófono y di tu nombre en voz alta!'],
  'l.hello.name_again': ['No te he oído bien. ¡Toca el micrófono y repíteme tu nombre!'],
  'l.hello.name_ok': ['¡Encantado, {name}! ¡Qué nombre tan bonito!'],
  'l.hello.name_later': ['Ya me dirás tu nombre más tarde: ¡mamá o papá me lo escribirán!'],
  'l.hello.age': ['Y tú, {name}, ¿cuántos años tienes? ¡Toca el micrófono y dímelo!'],
  'l.hello.age_again': ['No te he oído bien. ¿Cuántos años tienes? ¡Toca el micrófono!'],
  'l.hello.age_later': ['No pasa nada: ¡mamá o papá me lo dirán!'],
  'l.hello.sibling': ['¡Hola {name}! Soy tu dino, un pequeño bebé dinosaurio {color}. ¡Nos vamos a divertir mucho juntos!'],
  'l.hello.mic_allow': ['Si aparece un mensaje en la pantalla, ¡pide a un adulto que toque «Permitir»!'],
  'l.hello.parent': ['¡Ahora dale el teléfono a mamá o a papá! Van a elegir un código secreto, solo para mí.'],
  'l.welcome_first': ['¡Esta es mi casa, {name}! ¡Nos vamos a divertir mucho!'],
  'l.burp': ['¡Uy! ¡Perdón!', '¡Ji ji… perdón!', '¡Lo siento… estaba tan rico!'],
  'l.fart': ['Uy… ¡perdón!', '¡Ji ji, no he sido yo!', '¡Perdón! ¡Mi barriga hace ruidos raros!'],
  'l.hunger.growl': ['¿Oyes eso? ¡Mi barriga ruge! ¡Dame la cesta!'],
  'l.hunger.look': ['Mmm… esa fruta tiene una pinta deliciosa… ¡Toca la cesta!'],
  'l.hunger.beg': ['¡Por favor, por favor! ¡Dame la cesta!', '¡Venga, {name}, por favor! ¡Tengo hambre!'],
  'l.hunger.gape': ['Mira, abro mucho la boca: ¡aaah! ¡Mete la fruta!'],
  'l.hunger.sad': ['Tengo tanta hambre… ¡Toca la cesta!', 'Tengo la barriga vacía… ¿Me das de comer?'],
  'l.child.turn': ['¡Te toca, {name}! ¿Jugamos juntos?', '¡Hola {name}! ¡Te toca jugar!'],
  'l.child.ask_name': ['¡Hola! Ve a buscar a mamá o a papá: ¡tienen que decirme tu nombre!'],
  'l.age.ask': ['¿Cuántos años tienes? ¡Toca la tarta con tu edad!'],
  'l.age.3': ['¡Tres años! ¡Súper!'], 'l.age.4': ['¡Cuatro años! ¡Súper!'], 'l.age.5': ['¡Cinco años! ¡Genial!'],
  'l.age.6': ['¡Seis años! ¡Genial!'], 'l.age.7': ['¡Siete años! ¡Guau!'],

  ...kv('c', `dog=el perro; cat=el gato; fish=el pez; bird=el pájaro; cow=la vaca; pig=el cerdo; horse=el caballo; duck=el pato;
    rabbit=el conejo; hen=la gallina; sheep=la oveja; frog=la rana; mouse=el ratón; dinosaur=el dinosaurio; red=rojo; blue=azul;
    green=verde; yellow=amarillo; orange_color=naranja; purple=violeta; pink=rosa; black=negro; white=blanco; brown=marrón;
    apple=la manzana; banana=el plátano; strawberry=la fresa; cherry=la cereza; orange=la naranja; egg=el huevo;
    ice_cream=el helado; pizza=la pizza; grapes=las uvas; pear=la pera; lemon=el limón; carrot=la zanahoria; bread=el pan;
    milk=la leche; cake=la tarta; watermelon=la sandía; cookie=la galleta; cheese=el queso; tomato=el tomate; pineapple=la piña;
    peach=el melocotón; broccoli=el brócoli; corn=el maíz; kiwi=el kiwi; mango=el mango; blueberries=los arándanos; coconut=el coco;
    car=el coche; ball=la pelota; bus=el autobús; train=el tren; plane=el avión; boat=el barco; bike=la bicicleta; balloon=el globo;
    teddy=el osito de peluche; book=el libro; house=la casa; kite=la cometa; bed=la cama; chair=la silla; door=la puerta;
    key=la llave; clock=el reloj; sun=el sol; moon=la luna; star=la estrella; flower=la flor; cloud=la nube; rainbow=el arcoíris;
    tree=el árbol; rain=la lluvia; snowflake=el copo de nieve; snowman=el muñeco de nieve; leaf=la hoja; mountain=la montaña;
    fire=el fuego; sunflower=el girasol; drop=la gota de agua; eye=el ojo; ear=la oreja; nose=la nariz; mouth=la boca;
    hand=la mano; foot=el pie; tooth=el diente; lion=el león; tiger=el tigre; elephant=el elefante; monkey=el mono; bear=el oso;
    giraffe=la jirafa; zebra=la cebra; panda=el panda; snake=la serpiente; turtle=la tortuga; crocodile=el cocodrilo;
    kangaroo=el canguro; hippo=el hipopótamo; gorilla=el gorila; rhino=el rinoceronte; butterfly=la mariposa; bee=la abeja;
    ladybug=la mariquita; spider=la araña; ant=la hormiga; snail=el caracol; dolphin=el delfín; whale=la ballena; octopus=el pulpo;
    crab=el cangrejo; shark=el tiburón; owl=el búho; penguin=el pingüino; parrot=el loro; flamingo=el flamenco; peacock=el pavo real;
    eagle=el águila; swan=el cisne; hat=el sombrero; shoe=el zapato; dress=el vestido; cap=la gorra; socks=los calcetines;
    gloves=los guantes; tshirt=la camiseta; glasses=las gafas; umbrella=el paraguas; pencil=el lápiz; spoon=la cuchara;
    scissors=las tijeras; hammer=el martillo; ladder=la escalera; broom=la escoba; bottle=el biberón; toothbrush=el cepillo de dientes;
    guitar=la guitarra; drum=el tambor; piano=el piano; violin=el violín; trumpet=la trompeta; helicopter=el helicóptero;
    tractor=el tractor; rocket=el cohete; ambulance=la ambulancia; motorbike=la moto; fire_engine=el camión de bomberos;
    police_car=el coche de policía; scooter=el patinete; sled=el trineo; llama=la llama; goat=la cabra; camel=el camello;
    hedgehog=el erizo; squirrel=la ardilla; bat=el murciélago; deer=el ciervo; wolf=el lobo; fox=el zorro; raccoon=el mapache;
    beaver=el castor; otter=la nutria; sloth=el perezoso; skunk=la mofeta; bison=el bisonte; castle=el castillo; tent=la tienda de campaña;
    lighthouse=el faro; volcano=el volcán; island=la isla; anchor=el ancla; magnet=el imán; compass=la brújula;
    microscope=el microscopio; telescope=el telescopio; hourglass=el reloj de arena; jellyfish=la medusa; seal=la foca;
    lobster=la langosta; shrimp=la gamba; squid=el calamar; oyster=la ostra; beetle=el escarabajo; cricket=el grillo;
    mosquito=el mosquito; worm=el gusano; scorpion=el escorpión; rooster=el gallo; turkey=el pavo; donkey=el burro; ox=el buey;
    leopard=el leopardo; polar_bear=el oso polar; koala=el koala; orangutan=el orangután; mammoth=el mamut; moose=el alce;
    badger=el tejón; avocado=el aguacate; eggplant=la berenjena; garlic=el ajo; onion=la cebolla; pepper=el chile;
    cucumber=el pepino; potato=la patata; mushroom=la seta; peanuts=los cacahuetes; croissant=el cruasán; pancakes=las tortitas;
    honey=la miel; spaghetti=los espaguetis; fries=las patatas fritas; sandwich=el sándwich; candle=la vela; mirror=el espejo;
    window=la ventana; bucket=el cubo; bell=la campana; lock=el candado; light_bulb=la bombilla; flashlight=la linterna;
    axe=el hacha; saw=la sierra; wrench=la llave inglesa; screwdriver=el destornillador; paintbrush=el pincel; crayon=la cera;
    trophy=el trofeo; medal=la medalla; ring=el anillo; skateboard=el monopatín; yoyo=el yoyó; roller_skate=el patín;
    canoe=la canoa; tram=el tranvía; parachute=el paracaídas; satellite=el satélite; brain=el cerebro; bone=el hueso;
    tongue=la lengua; leg=la pierna; tornado=el tornado; lightning=el rayo; comet=el cometa; cactus=el cactus;
    blossom=la flor del cerezo; feather=la pluma`),

  // ---- Mon pays ----
  "lang.ko": "coreano", "lang.ne": "nepalí",
  "lang.vi": "vietnamita", "lang.tr": "turco", "lang.fa": "persa", "lang.pl": "polaco", "lang.uk": "ucraniano",
  "lang.id": "indonesio",
  "country.cd": "RD del Congo",
  "title.MO-6": "El mundo — Mi país",
  "l.home.MO-6": ["El mapa: ¡preguntas sobre tu país!"],
  "l.intro.MO-6": ["¡Hablamos de tu país! Escucha bien y toca la imagen correcta.", "¿Conoces bien tu país? ¡Te hago preguntas!"],
  "l.short.MO-6": ["¡Una pregunta sobre tu país!"],
  "cty.flag": "¿Cuál es la bandera de {country}?",
  "cty.flagHard": "¡Cuidado, se parecen! ¿Cuál es la bandera de {country}?",
  "cty.flagYes": "¡Sí! ¡Es la bandera de {country}!",
  "cty.flagHint": "mira bien los colores y en qué orden están",
  "cty.symbol": "¿Cuál es un símbolo de {country}?",
  "cty.symbolYes": "¡Sí! ¡Es un símbolo de {country}!",
  "cty.symbolYesName": "¡Sí! ¡{name} es un símbolo de {country}!",
  "cty.food": ["¿Cuál es una especialidad de {country}?", "¿Qué se come mucho en {country}?"],
  "cty.foodYes": "¡Ñam! ¡Es una especialidad de {country}!",
  "cty.day": "¡El {date} es la fiesta nacional de {country}! ¿Qué miramos en el cielo por la noche?",
  "cty.dayYes": "¡Sí! ¡El {date} hay grandes fuegos artificiales!",
  "cty.currency": "¿Con qué dinero se paga en {country}?",
  "cty.currencyYes": "¡Sí! En {country} se paga con el {money}!",
  "cty.place": "¿Qué lugar famoso se ve en {country}?",
  "cty.sport": "¿Qué deporte gusta mucho en {country}?",
  "cty.thing": "¿Qué se ve a menudo en las fiestas de {country}?",
  "cty.landmarkYes": "¡Sí! ¡Bravo, conoces bien tu país!",
  "cty.capital": "¿Cuál es la capital de {country}? ¡Lee bien los nombres de las ciudades!",
  "cty.capitalYes": "¡Sí! ¡La capital de {country} es {city}!",
  "cty.neighbour": "¿Cuál de estas banderas es de un país vecino de {country}?",
  "cty.neighbourYes": "¡Sí! ¡Este país está justo al lado de {country}!",
  "cty.neighbourHint": "los vecinos están muy cerca, en el mismo continente",
};

export default es;
