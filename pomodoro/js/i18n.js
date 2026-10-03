/* ---------- idiomas: português, inglês e espanhol ----------
   O site é escrito em português. Este arquivo troca cada texto pela tradução
   (inclusive os que aparecem depois, como avisos e conquistas).
   Textos com partes que mudam usam I18N.t('texto com {nome}', {nome:...}). */
window.I18N = (() => {
  const LOCALES = {pt:'pt-BR', en:'en-US', es:'es-ES'};
  let lang = '';
  try { lang = localStorage.getItem('pomodoro-lang') || ''; } catch (e) {}
  if (!LOCALES[lang]) { const n = (navigator.language || 'pt').slice(0, 2).toLowerCase(); lang = LOCALES[n] ? n : 'pt'; }

  /* português: [inglês, espanhol] */
  const D = {
    /* topo e cronômetro */
    'Ver meu progresso':['See my progress','Ver mi progreso'],
    'entrar':['sign in','entrar'], 'sincronizando…':['syncing…','sincronizando…'],
    'modo dia':['day mode','modo día'], 'modo noite':['night mode','modo noche'],
    'parar sons':['stop sounds','detener sonidos'], 'tela cheia':['fullscreen','pantalla completa'],
    'Idioma':['Language','Idioma'],
    'Cronômetro':['Timer','Temporizador'], 'Modo':['Mode','Modo'],
    'foco':['focus','enfoque'], 'pausa':['break','pausa'], 'pausa curta':['short break','pausa corta'], 'pausa longa':['long break','pausa larga'],
    'Ajustes':['Settings','Ajustes'], 'ajustes':['settings','ajustes'], 'Fechar ajustes':['Close settings','Cerrar ajustes'],
    'hora de focar':['time to focus','hora de enfocarse'], 'respira um pouquinho':['take a little breather','respira un poquito'], 'pausa merecida':['well-deserved break','pausa merecida'],
    'o que você vai fazer?':['what are you going to do?','¿qué vas a hacer?'], 'Atividade':['Activity','Actividad'],
    'Reiniciar (R)':['Restart (R)','Reiniciar (R)'], 'Reiniciar':['Restart','Reiniciar'], 'Pular (S)':['Skip (S)','Saltar (S)'], 'Pular':['Skip','Saltar'],
    'começar':['start','empezar'], 'pausar':['pause','pausar'], 'continuar':['resume','continuar'],
    'levanta, bebe uma água, alonga':['get up, drink some water, stretch','levántate, toma agua, estírate'],
    'zerar':['reset','reiniciar'], 'Zerar as bolinhas e começar o ciclo de novo':['Reset the dots and start the cycle again','Reiniciar los puntos y empezar el ciclo de nuevo'],
    '{c} de {n} até a pausa longa':['{c} of {n} until the long break','{c} de {n} hasta la pausa larga'],
    'sequência':['sequence','secuencia'], 'sequência · repete':['sequence · repeats','secuencia · se repite'],
    'etapa {i} de {n} · {label} {m} min':['step {i} of {n} · {label} {m} min','etapa {i} de {n} · {label} {m} min'],

    /* ajustes */
    'rotina':['routine','rutina'], 'Foco (min)':['Focus (min)','Enfoque (min)'], 'Pausa curta (min)':['Short break (min)','Pausa corta (min)'],
    'Pausa longa (min)':['Long break (min)','Pausa larga (min)'], 'Pausa longa a cada':['Long break every','Pausa larga cada'],
    'repetir a sequência quando acabar':['repeat the sequence when it ends','repetir la secuencia al terminar'],
    'lembrete de água':['water reminder','recordatorio de agua'], 'meu bichinho me lembra de beber água':['my pet reminds me to drink water','mi mascota me recuerda beber agua'],
    'a cada':['every','cada'], '1 hora':['1 hour','1 hora'], '2 horas':['2 hours','2 horas'], 'volume':['volume','volumen'],
    'Diminuir volume do lembrete':['Lower reminder volume','Bajar el volumen del recordatorio'], 'Volume do lembrete de água':['Water reminder volume','Volumen del recordatorio de agua'],
    'Aumentar volume do lembrete':['Raise reminder volume','Subir el volumen del recordatorio'], 'testar agora':['test now','probar ahora'],
    'outras opções':['other options','otras opciones'], 'Começar o próximo sozinho':['Start the next one automatically','Empezar el siguiente automáticamente'],
    'Sininho ao terminar':['Chime when it ends','Campanita al terminar'], 'Aviso quando o tempo acabar (mesmo em outra aba)':['Notify me when time is up (even in another tab)','Avisar cuando termine el tiempo (aunque esté en otra pestaña)'],
    'Relógio em pixel':['Pixel clock','Reloj pixelado'], 'zerar a contagem de hoje':["reset today's count",'reiniciar el conteo de hoy'],
    'clássico':['classic','clásico'], 'meio a meio':['half and half','mitad y mitad'], 'foco profundo':['deep focus','enfoque profundo'],
    'ultradiano':['ultradian','ultradiano'], 'leve':['light','ligero'], 'do meu jeito':['my way','a mi manera'],
    '25 foco · 5 pausa · 15 a cada 4':['25 focus · 5 break · 15 every 4','25 enfoque · 5 pausa · 15 cada 4'],
    '25 foco · 25 pausa':['25 focus · 25 break','25 enfoque · 25 pausa'],
    '50 foco · 10 pausa · 30 a cada 3':['50 focus · 10 break · 30 every 3','50 enfoque · 10 pausa · 30 cada 3'],
    '52 foco · 17 pausa':['52 focus · 17 break','52 enfoque · 17 pausa'],
    '90 foco · 20 pausa · 30 a cada 2':['90 focus · 20 break · 30 every 2','90 enfoque · 20 pausa · 30 cada 2'],
    '15 foco · 5 pausa':['15 focus · 5 break','15 enfoque · 5 pausa'],
    'monte sua própria sequência de foco e pausas':['build your own sequence of focus and breaks','arma tu propia secuencia de enfoque y pausas'],
    '{n} etapas · {t} no total · {f} de foco':['{n} steps · {t} total · {f} of focus','{n} etapas · {t} en total · {f} de enfoque'],
    'limite':['limit','límite'], 'a sequência aceita até 24 etapas.':['a sequence can have up to 24 steps.','la secuencia admite hasta 24 etapas.'],
    'sequência concluída!':['sequence complete!','¡secuencia completada!'], 'quando quiser, é só começar de novo.':['start again whenever you like.','cuando quieras, empieza de nuevo.'],
    'ciclo zerado':['cycle reset','ciclo reiniciado'], 'as bolinhas voltaram para o começo.':['the dots are back to the start.','los puntos volvieron al comienzo.'],

    /* atividades */
    'estudando':['studying','estudiando'], 'lendo':['reading','leyendo'], 'trabalhando':['working','trabajando'], 'programando':['coding','programando'],
    'escrevendo':['writing','escribiendo'], 'criando':['creating','creando'], 'tarefas de casa':['chores','tareas de casa'], 'jogando':['gaming','jugando'],
    'exercício':['exercise','ejercicio'], 'tocando':['playing','tocando'], 'outra coisa':['something else','otra cosa'],

    /* tarefas e música */
    'tarefas':['tasks','tareas'], 'clique para focar nela':['click one to focus on it','haz clic para enfocarte en ella'], 'o que vamos fazer?':['what are we doing?','¿qué vamos a hacer?'],
    'Nova tarefa':['New task','Nueva tarea'], 'Pomodoros estimados':['Estimated pomodoros','Pomodoros estimados'], 'Adicionar tarefa':['Add task','Añadir tarea'],
    'nenhuma tarefa ainda. adiciona a primeira aí em cima.':['no tasks yet. add the first one above.','aún no hay tareas. añade la primera arriba.'],
    'música':['music','música'], 'Spotify ou YouTube':['Spotify or YouTube','Spotify o YouTube'],
    'rádio lo-fi 24h (YouTube)':['24h lo-fi radio (YouTube)','radio lo-fi 24h (YouTube)'], 'lo-fi de chuva (YouTube)':['rainy lo-fi (YouTube)','lo-fi de lluvia (YouTube)'],
    'cole aqui o link da playlist ou vídeo':['paste the playlist or video link here','pega aquí el enlace de la playlist o del video'],
    'Link do Spotify ou YouTube':['Spotify or YouTube link','Enlace de Spotify o YouTube'], 'tocar':['play','reproducir'],
    'tocar e pausar junto com o pomodoro':['play and pause along with the pomodoro','reproducir y pausar junto con el pomodoro'],
    'continuar tocando nas pausas':['keep playing during breaks','seguir sonando en las pausas'], 'fechar o player':['close the player','cerrar el reproductor'],
    'cole o link de uma playlist ou música do Spotify, ou de um vídeo ou playlist do YouTube.':['paste a link to a Spotify playlist or song, or a YouTube video or playlist.','pega el enlace de una playlist o canción de Spotify, o de un video o playlist de YouTube.'],
    'dica: entre na sua conta do Spotify neste navegador para ouvir as músicas inteiras.':['tip: sign in to Spotify in this browser to hear full songs.','consejo: inicia sesión en Spotify en este navegador para escuchar las canciones completas.'],
    'o vídeo continua tocando enquanto você usa o pomodoro.':['the video keeps playing while you use the pomodoro.','el video sigue sonando mientras usas el pomodoro.'],
    'não reconheci esse link. use um link do Spotify (open.spotify.com/...) ou do YouTube (youtube.com/... ou youtu.be/...).':["I didn't recognize that link. use a Spotify link (open.spotify.com/...) or a YouTube link (youtube.com/... or youtu.be/...).",'no reconocí ese enlace. usa un enlace de Spotify (open.spotify.com/...) o de YouTube (youtube.com/... o youtu.be/...).'],

    /* hoje, relógios e sons */
    'hoje':['today','hoy'], 'min foco':['focus min','min de enfoque'], 'hoje, {date}':['today, {date}','hoy, {date}'],
    'relógios do mundo':['world clocks','relojes del mundo'], 'fusos horários':['time zones','husos horarios'], 'Adicionar cidade':['Add city','Añadir ciudad'],
    'adicionar cidade':['add city','añadir ciudad'], 'adicione uma cidade abaixo.':['add a city below.','añade una ciudad abajo.'], 'mesma hora':['same time','misma hora'],
    'Nova York':['New York','Nueva York'], 'Cidade do México':['Mexico City','Ciudad de México'], 'Lisboa':['Lisbon','Lisboa'], 'Londres':['London','Londres'],
    'Madri':['Madrid','Madrid'], 'Berlim':['Berlin','Berlín'], 'Roma':['Rome','Roma'], 'Pequim':['Beijing','Pekín'], 'Seul':['Seoul','Seúl'], 'Tóquio':['Tokyo','Tokio'],
    'sons':['sounds','sonidos'], 'misture do seu jeito':['mix them your way','mézclalos a tu gusto'], 'sons do cenário':['scene sounds','sonidos del escenario'],
    'volume geral':['master volume','volumen general'], 'Volume geral':['Master volume','Volumen general'],
    'Diminuir volume geral':['Lower master volume','Bajar el volumen general'], 'Aumentar volume geral':['Raise master volume','Subir el volumen general'],
    'desligado':['off','apagado'], 'batida lo-fi':['lo-fi beat','ritmo lo-fi'], 'chuva':['rain','lluvia'], 'lareira':['fireplace','chimenea'], 'mar':['sea','mar'],
    'vento':['wind','viento'], 'chiado de vinil':['vinyl crackle','crujido de vinilo'], 'passarinhos':['birds','pajaritos'], 'grilos':['crickets','grillos'],
    'cafeteria':['coffee shop','cafetería'], 'espaço':['space','espacio'],

    /* progresso, coleção e níveis */
    'progresso':['progress','progreso'], 'conquistas':['achievements','logros'], 'toque numa medalha para ver como conseguir.':['tap a medal to see how to get it.','toca una medalla para ver cómo conseguirla.'],
    '{a} de {b}':['{a} of {b}','{a} de {b}'], 'nível {n}':['level {n}','nivel {n}'], '{a} / {b} xp até o nível {n}':['{a} / {b} xp to level {n}','{a} / {b} xp hasta el nivel {n}'],
    '🔥 {n} dias seguidos de foco':['🔥 {n} days of focus in a row','🔥 {n} días seguidos de enfoque'], '🔥 1 dia de foco':['🔥 1 day of focus','🔥 1 día de enfoque'],
    '🔥 faça um pomodoro hoje pra começar sua sequência':['🔥 do a pomodoro today to start your streak','🔥 haz un pomodoro hoy para empezar tu racha'],
    '🔓 no nível {n}: {list}':['🔓 at level {n}: {list}','🔓 en el nivel {n}: {list}'],
    '🎉 você já desbloqueou todos os cenários e bichinhos':['🎉 you unlocked every scene and pet','🎉 ya desbloqueaste todos los escenarios y mascotas'],
    'conquista nova':['new achievement','nuevo logro'], 'nível {n}: {name}!':['level {n}: {name}!','¡nivel {n}: {name}!'], 'você desbloqueou {list}':['you unlocked {list}','desbloqueaste {list}'],
    'XP, continue assim':['XP, keep it up','XP, sigue así'],
    'coleção':['collection','colección'], 'suba de nível para desbloquear':['level up to unlock','sube de nivel para desbloquear'], 'cores':['colors','colores'],
    'Tema de cor':['Color theme','Tema de color'], 'cenários':['scenes','escenarios'], 'bichinho':['pet','mascota'], 'pintar o bichinho':['paint your pet','pintar tu mascota'],
    'Cor do bichinho':['Pet color','Color de la mascota'], 'cor original':['original color','color original'], 'usando':['in use','en uso'], 'companhia':['your buddy','tu compañía'],
    '🔒 nível {n}':['🔒 level {n}','🔒 nivel {n}'],
    'Sementinha':['Little Seed','Semillita'], 'Broto':['Sprout','Brote'], 'Mudinha':['Seedling','Plantita'], 'Florzinha':['Little Flower','Florecita'],
    'Tomatinho verde':['Green Tomato','Tomatito verde'], 'Tomate maduro':['Ripe Tomato','Tomate maduro'], 'Tomateiro':['Tomato Plant','Tomatera'],
    'Horta inteira':['Whole Garden','Huerta entera'], 'Colheita farta':['Big Harvest','Gran cosecha'], 'Lenda do Foco':['Focus Legend','Leyenda del Enfoque'],
    'laranja':['orange','naranja'], 'roxo':['purple','morado'], 'azul':['blue','azul'], 'rosa':['pink','rosa'], 'verde':['green','verde'], 'tomate':['tomato','tomate'],
    'branco':['white','blanco'], 'preto':['black','negro'], 'cinza':['gray','gris'], 'creme':['cream','crema'], 'marrom':['brown','marrón'], 'lilás':['lilac','lila'],
    'amarelo':['yellow','amarillo'], 'vermelho':['red','rojo'],
    'cidade chuvosa':['rainy city','ciudad lluviosa'], 'quarto':['bedroom','habitación'], 'floresta':['forest','bosque'], 'praia':['beach','playa'],
    'hora de dormir':['bedtime','hora de dormir'], 'estúdio de música':['music studio','estudio de música'], 'quarto gamer':['gamer room','cuarto gamer'],
    'parque':['park','parque'], 'cerejeiras':['cherry blossoms','cerezos'], 'chalé na neve':['snowy cabin','cabaña en la nieve'],
    'gatinho':['kitty','gatito'], 'raposinha':['little fox','zorrito'], 'cachorrinho':['puppy','perrito'], 'coelhinho':['bunny','conejito'], 'pinguim':['penguin','pingüino'],
    'sapinho':['froggy','ranita'], 'patinho':['duckling','patito'], 'ursinho':['teddy bear','osito'],

    /* conquistas */
    'primeiro tomate':['first tomato','primer tomate'], 'complete seu primeiro pomodoro':['complete your first pomodoro','completa tu primer pomodoro'],
    'dia produtivo':['productive day','día productivo'], '5 pomodoros no mesmo dia':['5 pomodoros in one day','5 pomodoros en el mismo día'],
    'maratona':['marathon','maratón'], '10 pomodoros no mesmo dia':['10 pomodoros in one day','10 pomodoros en el mismo día'],
    'ciclo completo':['full cycle','ciclo completo'], 'chegue até uma pausa longa':['reach a long break','llega a una pausa larga'],
    'cedinho':['early bird','madrugador'], 'termine um pomodoro antes das 8h':['finish a pomodoro before 8 am','termina un pomodoro antes de las 8'],
    'coruja':['night owl','búho'], 'termine um pomodoro depois das 22h':['finish a pomodoro after 10 pm','termina un pomodoro después de las 22'],
    '3 dias seguidos':['3 days in a row','3 días seguidos'], 'foque 3 dias sem pular nenhum':['focus 3 days without skipping one','enfócate 3 días sin saltarte ninguno'],
    'semana inteira':['whole week','semana entera'], 'foque 7 dias sem pular nenhum':['focus 7 days without skipping one','enfócate 7 días sin saltarte ninguno'],
    'cesta cheia':['full basket','cesta llena'], '25 pomodoros no total':['25 pomodoros in total','25 pomodoros en total'],
    'centena':['one hundred','centena'], '100 pomodoros no total':['100 pomodoros in total','100 pomodoros en total'],
    'riscando a lista':['checking things off','tachando la lista'], 'conclua 5 tarefas':['complete 5 tasks','completa 5 tareas'],
    'multitarefa':['multitasker','multitarea'], 'foque em 4 atividades diferentes':['focus on 4 different activities','enfócate en 4 actividades distintas'],
    'turista':['tourist','turista'], 'experimente 3 cenários':['try 3 scenes','prueba 3 escenarios'],
    'dj do foco':['focus DJ','DJ del enfoque'], 'toque 3 sons ao mesmo tempo':['play 3 sounds at once','reproduce 3 sonidos a la vez'],
    'chegue ao nível 5':['reach level 5','llega al nivel 5'], 'lenda':['legend','leyenda'], 'chegue ao nível 10':['reach level 10','llega al nivel 10'],
    'duas semanas':['two weeks','dos semanas'], 'foque 14 dias seguidos':['focus 14 days in a row','enfócate 14 días seguidos'],
    'mês inteiro':['whole month','mes entero'], 'foque 30 dias seguidos':['focus 30 days in a row','enfócate 30 días seguidos'],
    '250 tomates':['250 tomatoes','250 tomates'], '250 pomodoros no total':['250 pomodoros in total','250 pomodoros en total'],
    '500 tomates':['500 tomatoes','500 tomates'], '500 pomodoros no total':['500 pomodoros in total','500 pomodoros en total'],
    '10 horas':['10 hours','10 horas'], '10 horas de foco no total':['10 hours of focus in total','10 horas de enfoque en total'],
    '50 horas':['50 hours','50 horas'], '50 horas de foco no total':['50 hours of focus in total','50 horas de enfoque en total'],
    'mergulho':['deep dive','inmersión'], 'termine um foco de 50 minutos ou mais':['finish a focus session of 50 minutes or more','termina un enfoque de 50 minutos o más'],
    'fim de semana produtivo':['productive weekend','fin de semana productivo'], 'termine um pomodoro no sábado ou no domingo':['finish a pomodoro on Saturday or Sunday','termina un pomodoro el sábado o el domingo'],
    'termine um foco usando uma sequência personalizada':['finish a focus session using a custom sequence','termina un enfoque usando una secuencia personalizada'],
    'faz de tudo':['jack of all trades','todoterreno'], 'foque em 8 atividades diferentes':['focus on 8 different activities','enfócate en 8 actividades distintas'],
    'viajante':['traveler','viajero'], 'experimente 6 cenários':['try 6 scenes','prueba 6 escenarios'],
    'volta ao mundo':['around the world','vuelta al mundo'], 'experimente todos os cenários':['try every scene','prueba todos los escenarios'],
    'amigo dos bichos':['animal friend','amigo de los animales'], 'escolha 3 bichinhos diferentes':['choose 3 different pets','elige 3 mascotas distintas'],
    'estilo próprio':['your own style','estilo propio'], 'pinte seu bichinho com uma cor nova':['paint your pet a new color','pinta tu mascota de un color nuevo'],
    'querido diário':['dear diary','querido diario'], 'escreva no diário':['write in your diary','escribe en el diario'],
    'diário em dia':['diary up to date','diario al día'], 'escreva no diário em 7 dias diferentes':['write in your diary on 7 different days','escribe en el diario en 7 días distintos'],
    'bloco cheio':['full notepad','libreta llena'], 'crie 3 notas':['create 3 notes','crea 3 notas'],
    'trilha sonora':['soundtrack','banda sonora'], 'toque uma música do Spotify ou do YouTube':['play a song from Spotify or YouTube','reproduce una canción de Spotify o YouTube'],
    'turma do foco':['focus crew','pandilla del enfoque'], 'faça uma amizade no ranking':['make a friend in the ranking','haz una amistad en el ranking'],
    'primeiro golinho':['first sip','primer sorbo'], 'marque seu primeiro copo de água':['log your first glass of water','marca tu primer vaso de agua'],
    'bem hidratado':['well hydrated','bien hidratado'], 'marque 8 copos de água no mesmo dia':['log 8 glasses of water in one day','marca 8 vasos de agua en el mismo día'],
    'onda de hidratação':['hydration wave','ola de hidratación'], 'beba água 3 dias seguidos (pelo menos 4 copos por dia)':['drink water 3 days in a row (at least 4 glasses a day)','bebe agua 3 días seguidos (al menos 4 vasos al día)'],
    'baleia azul':['blue whale','ballena azul'], 'beba água 7 dias seguidos (pelo menos 4 copos por dia)':['drink water 7 days in a row (at least 4 glasses a day)','bebe agua 7 días seguidos (al menos 4 vasos al día)'],
    '50 copos':['50 glasses','50 vasos'], 'marque 50 copos de água no total':['log 50 glasses of water in total','marca 50 vasos de agua en total'],
    'oásis':['oasis','oasis'], 'marque 200 copos de água no total':['log 200 glasses of water in total','marca 200 vasos de agua en total'],

    /* avisos */
    'pomodoro concluído!':['pomodoro done!','¡pomodoro completado!'], 'hora de uma pausa.':['time for a break.','hora de una pausa.'],
    'fim da pausa':['break is over','fin de la pausa'], 'bora focar de novo?':['ready to focus again?','¿volvemos a enfocarnos?'],
    'sem notificações':['no notifications','sin notificaciones'], 'este navegador não permite avisos.':["this browser doesn't allow notifications.",'este navegador no permite avisos.'],
    'avisos ligados':['notifications on','avisos activados'], 'quando o tempo acabar, chega um aviso mesmo se você estiver em outra aba.':["when time is up, you'll get a notice even in another tab.",'cuando termine el tiempo, te llegará un aviso aunque estés en otra pestaña.'],
    'avisos bloqueados':['notifications blocked','avisos bloqueados'], 'libere as notificações deste site nas configurações do navegador.':["allow this site's notifications in your browser settings.",'permite las notificaciones de este sitio en la configuración del navegador.'],

    /* água */
    'hora de beber água!':['time to drink water!','¡hora de beber agua!'], 'bebi':['drank it','ya bebí'], 'daqui a 5 min':['in 5 min','en 5 min'],
    '{pet} veio lembrar: um golinho agora e você foca melhor.':['{pet} came to remind you: a little sip now helps you focus.','{pet} vino a recordarte: un sorbito ahora y te concentras mejor.'],
    '{pet} veio lembrar.':['{pet} came to remind you.','{pet} vino a recordarte.'],
    'nenhum copo marcado hoje ainda':['no glasses logged today yet','aún no marcaste ningún vaso hoy'],
    'hoje: {drops} {n} copo':['today: {drops} {n} glass','hoy: {drops} {n} vaso'], 'hoje: {drops} {n} copos':['today: {drops} {n} glasses','hoy: {drops} {n} vasos'],
    'boa':['nice','bien'], '{n} copo hoje.':['{n} glass today.','{n} vaso hoy.'], '{n} copos hoje.':['{n} glasses today.','{n} vasos hoy.'],
    'lembrete ligado':['reminder on','recordatorio activado'], 'seu bichinho aparece a cada {n} minutos.':['your pet will show up every {n} minutes.','tu mascota aparecerá cada {n} minutos.'],

    /* diário e notas */
    'diário':['diary','diario'], 'Diário e notas':['Diary and notes','Diario y notas'], 'notas':['notes','notas'],
    'Dia anterior':['Previous day','Día anterior'], 'Próximo dia':['Next day','Día siguiente'], 'Como você está':['How are you','Cómo estás'],
    'como foi seu dia? o que você estudou, aprendeu, sentiu...':['how was your day? what did you study, learn, feel...','¿cómo fue tu día? qué estudiaste, aprendiste, sentiste...'],
    'Texto do diário':['Diary text','Texto del diario'], 'dias anteriores':['previous days','días anteriores'], 'seus dias escritos aparecem aqui.':['the days you write about show up here.','los días que escribas aparecen aquí.'],
    'nova nota':['new note','nueva nota'], 'título':['title','título'], 'Título da nota':['Note title','Título de la nota'], 'escreva aqui...':['write here...','escribe aquí...'],
    'Texto da nota':['Note text','Texto de la nota'], 'apagar nota':['delete note','borrar nota'], 'clique de novo para apagar':['click again to delete','haz clic de nuevo para borrar'],
    'nenhuma nota ainda.':['no notes yet.','aún no hay notas.'], 'nota sem título':['untitled note','nota sin título'],
    'só você vê o seu diário e as suas notas.':['only you can see your diary and notes.','solo tú puedes ver tu diario y tus notas.'],
    'salvando…':['saving…','guardando…'], 'salvo':['saved','guardado'],
    'ótimo':['great','genial'], 'bem':['good','bien'], 'mais ou menos':['so-so','más o menos'], 'triste':['sad','triste'], 'cansado':['tired','cansado'],

    /* ranking e conta */
    'ranking dos amigos':["friends' ranking",'ranking de amigos'], 'pomodoros nos últimos 7 dias':['pomodoros in the last 7 days','pomodoros en los últimos 7 días'],
    'entre na sua conta para salvar seu progresso na nuvem e competir com amigos.':['sign in to save your progress in the cloud and compete with friends.','inicia sesión para guardar tu progreso en la nube y competir con amigos.'],
    'entrar ou criar conta':['sign in or create an account','entrar o crear una cuenta'],
    'código de amigo (ex.: K7Q2MX)':['friend code (e.g. K7Q2MX)','código de amigo (ej.: K7Q2MX)'], 'Código de amigo':['Friend code','Código de amigo'],
    'adicionar':['add','añadir'], 'Atualizar ranking':['Refresh ranking','Actualizar ranking'], 'Atualizar':['Refresh','Actualizar'],
    'pedidos de amizade':['friend requests','solicitudes de amistad'],
    'peça o código de amigo de alguém (fica em ☁ conta) e cole aqui. mande o seu também!':["ask someone for their friend code (it's under ☁ account) and paste it here. send yours too!",'pide el código de amigo de alguien (está en ☁ cuenta) y pégalo aquí. ¡manda el tuyo también!'],
    'aceitar':['accept','aceptar'], 'recusar':['decline','rechazar'], 'cancelar':['cancel','cancelar'], 'desfazer?':['remove?','¿quitar?'], 'desfazer amizade':['remove friend','quitar amistad'],
    'essa pessoa saiu do ranking':['this person left the ranking','esta persona salió del ranking'], 'amizade escondida':['hidden friend','amistad oculta'],
    '{ic} nível {n}':['{ic} level {n}','{ic} nivel {n}'], '{nick} (só você vê)':['{nick} (only you see this)','{nick} (solo tú lo ves)'],
    '💌 {who} quer ser sua amizade no ranking':['💌 {who} wants to be your friend in the ranking','💌 {who} quiere ser tu amistad en el ranking'],
    '⏳ esperando {who} aceitar':['⏳ waiting for {who} to accept','⏳ esperando que {who} acepte'],
    'pedido de amizade':['friend request','solicitud de amistad'], '{who} quer entrar no seu ranking.':['{who} wants to join your ranking.','{who} quiere entrar en tu ranking.'],
    'pronto! você e {who} agora estão no mesmo ranking 🎉':['done! you and {who} are now in the same ranking 🎉','¡listo! tú y {who} ya están en el mismo ranking 🎉'],
    'pedido enviado para {nick}! quando a pessoa aceitar, vocês ficam no mesmo ranking.':['request sent to {nick}! once they accept, you will share the same ranking.','¡solicitud enviada a {nick}! cuando acepte, compartirán el mismo ranking.'],
    '{nick} já tinha te mandado um pedido. agora vocês estão no mesmo ranking! 🎉':['{nick} had already sent you a request. you are now in the same ranking! 🎉','{nick} ya te había enviado una solicitud. ¡ahora están en el mismo ranking! 🎉'],
    '{nick} já está no seu ranking.':['{nick} is already in your ranking.','{nick} ya está en tu ranking.'],
    'você já mandou um pedido para {nick}. é só esperar.':['you already sent {nick} a request. just wait.','ya le enviaste una solicitud a {nick}. solo espera.'],
    'amizade desfeita.':['friend removed.','amistad eliminada.'], 'o código tem 6 letras e números.':['the code has 6 letters and numbers.','el código tiene 6 letras y números.'],
    'esse é o seu próprio código 😄':["that's your own code 😄",'ese es tu propio código 😄'],
    'você chegou ao limite de 60 amizades e pedidos.':['you reached the limit of 60 friends and requests.','llegaste al límite de 60 amistades y solicitudes.'],
    'não achei ninguém com esse código. confira se a pessoa deixou "aparecer no ranking" ligado.':['I couldn\'t find anyone with that code. check that the person has "show me in friends\' ranking" on.','no encontré a nadie con ese código. revisa que la persona tenga activado "aparecer en el ranking".'],
    'não consegui mandar o pedido agora. tente de novo.':["couldn't send the request right now. try again.",'no pude enviar la solicitud ahora. inténtalo de nuevo.'],
    'não consegui carregar o ranking agora.':["couldn't load the ranking right now.",'no pude cargar el ranking ahora.'],
    'não consegui carregar as amizades agora.':["couldn't load your friends right now.",'no pude cargar tus amistades ahora.'],
    'não consegui desfazer agora.':["couldn't remove it right now.",'no pude quitarla ahora.'], 'não consegui agora. tente de novo.':["couldn't do it right now. try again.",'no pude ahora. inténtalo de nuevo.'],
    'o ranking fica disponível quando as contas forem ativadas neste site.':['the ranking will be available once accounts are enabled on this site.','el ranking estará disponible cuando se activen las cuentas en este sitio.'],
    'sua conta':['your account','tu cuenta'], 'Fechar':['Close','Cerrar'],
    'as contas ainda estão sendo ativadas neste site. enquanto isso, seu progresso fica salvo neste navegador.':['accounts are still being enabled on this site. meanwhile, your progress is saved in this browser.','las cuentas aún se están activando en este sitio. mientras tanto, tu progreso queda guardado en este navegador.'],
    'não foi possível carregar o sistema de contas agora. confira sua internet e recarregue a página.':["the account system couldn't load right now. check your connection and reload the page.",'no se pudo cargar el sistema de cuentas ahora. revisa tu internet y recarga la página.'],
    'entre para salvar seu progresso na nuvem, usar no celular e no computador, e competir com amigos.':['sign in to save your progress in the cloud, use it on your phone and computer, and compete with friends.','inicia sesión para guardar tu progreso en la nube, usarlo en el celular y en la computadora, y competir con amigos.'],
    'li e aceito a':['I have read and accept the','leí y acepto la'], 'política de privacidade':['privacy policy','política de privacidad'],
    'entrar com Google':['sign in with Google','entrar con Google'], 'ou com e-mail':['or with email','o con correo'],
    'apelido (aparece no ranking)':['nickname (shown in the ranking)','apodo (aparece en el ranking)'], 'Apelido':['Nickname','Apodo'], 'apelido':['nickname','apodo'],
    'e-mail':['email','correo'], 'E-mail':['Email','Correo'], 'senha (mínimo 6 caracteres)':['password (at least 6 characters)','contraseña (mínimo 6 caracteres)'], 'Senha':['Password','Contraseña'],
    'não tenho conta, quero criar':["I don't have an account yet",'no tengo cuenta, quiero crearla'], 'já tenho conta, quero entrar':['I already have an account','ya tengo cuenta, quiero entrar'],
    'criar conta':['create account','crear cuenta'], 'esqueci a senha':['forgot my password','olvidé mi contraseña'],
    'conectado como':['signed in as','conectado como'], 'aparecer no ranking dos amigos':["show me in friends' ranking",'aparecer en el ranking de amigos'],
    'seu código de amigo':['your friend code','tu código de amigo'], 'copiar':['copy','copiar'], 'baixar meus dados':['download my data','descargar mis datos'],
    'sair da conta':['sign out','cerrar sesión'], 'excluir minha conta':['delete my account','eliminar mi cuenta'],
    'isso apaga para sempre sua conta e todos os seus dados da nuvem: progresso, histórico, tarefas e amigos. não dá para desfazer.':['this permanently deletes your account and all your data in the cloud: progress, history, tasks and friends. it can\'t be undone.','esto borra para siempre tu cuenta y todos tus datos en la nube: progreso, historial, tareas y amigos. no se puede deshacer.'],
    'apagar também os dados deste navegador':['also delete the data in this browser','borrar también los datos de este navegador'],
    'digite EXCLUIR para confirmar':['type EXCLUIR to confirm','escribe EXCLUIR para confirmar'], 'Digite EXCLUIR para confirmar':['Type EXCLUIR to confirm','Escribe EXCLUIR para confirmar'],
    'excluir para sempre':['delete forever','eliminar para siempre'], 'para confirmar, digite EXCLUIR no campo acima.':['to confirm, type EXCLUIR in the field above.','para confirmar, escribe EXCLUIR en el campo de arriba.'],
    'excluindo…':['deleting…','eliminando…'], 'conta excluída':['account deleted','cuenta eliminada'], 'seus dados foram apagados da nuvem.':['your data was deleted from the cloud.','tus datos se borraron de la nube.'],
    '☁ tudo salvo na nuvem · {t}':['☁ all saved to the cloud · {t}','☁ todo guardado en la nube · {t}'],
    '⚠ não consegui salvar agora. vou tentar de novo.':["⚠ couldn't save right now. I'll try again.",'⚠ no pude guardar ahora. lo intentaré de nuevo.'],
    'nuvem':['cloud','nube'], 'não consegui buscar seus dados agora.':["couldn't fetch your data right now.",'no pude traer tus datos ahora.'],
    'oi, {nick}!':['hi, {nick}!','¡hola, {nick}!'], 'seu progresso agora fica salvo na nuvem.':['your progress is now saved in the cloud.','tu progreso ahora queda guardado en la nube.'],
    'conta Google':['Google account','cuenta de Google'], 'alguém':['someone','alguien'],
    'código copiado! mande para seus amigos.':['code copied! send it to your friends.','¡código copiado! mándalo a tus amigos.'],
    'selecionei o código: é só copiar (Ctrl+C).':['I selected the code: just copy it (Ctrl+C).','seleccioné el código: solo cópialo (Ctrl+C).'],
    'para continuar, marque que você leu e aceita a política de privacidade.':['to continue, confirm that you have read and accept the privacy policy.','para continuar, marca que leíste y aceptas la política de privacidad.'],
    'abrindo o Google…':['opening Google…','abriendo Google…'], 'criando sua conta…':['creating your account…','creando tu cuenta…'], 'entrando…':['signing in…','entrando…'],
    'digite seu e-mail no campo acima e clique de novo em "esqueci a senha".':['type your email above and click "forgot my password" again.','escribe tu correo arriba y haz clic de nuevo en "olvidé mi contraseña".'],
    'se existir conta com esse e-mail, chegou um link para criar uma senha nova. olhe também o spam.':['if an account exists with that email, a link to create a new password was sent. check your spam too.','si existe una cuenta con ese correo, te llegó un enlace para crear una contraseña nueva. revisa también el spam.'],
    'esse e-mail não parece válido.':["that email doesn't look valid.",'ese correo no parece válido.'], 'já existe uma conta com esse e-mail. tente entrar.':['an account with that email already exists. try signing in.','ya existe una cuenta con ese correo. intenta entrar.'],
    'a senha precisa ter pelo menos 6 caracteres.':['the password needs at least 6 characters.','la contraseña necesita al menos 6 caracteres.'], 'e-mail ou senha incorretos.':['wrong email or password.','correo o contraseña incorrectos.'],
    'não achei conta com esse e-mail.':["I couldn't find an account with that email.",'no encontré una cuenta con ese correo.'], 'digite a senha.':['type your password.','escribe la contraseña.'],
    'a janela do Google foi fechada antes de terminar.':['the Google window was closed before finishing.','la ventana de Google se cerró antes de terminar.'],
    'o navegador bloqueou a janela do Google. libere pop-ups para este site e tente de novo.':['the browser blocked the Google window. allow pop-ups for this site and try again.','el navegador bloqueó la ventana de Google. permite ventanas emergentes para este sitio e inténtalo de nuevo.'],
    'este endereço ainda não foi autorizado no Firebase (Authentication > Configurações > Domínios autorizados).':['this address is not authorized in Firebase yet (Authentication > Settings > Authorized domains).','esta dirección aún no está autorizada en Firebase (Authentication > Configuración > Dominios autorizados).'],
    'esse jeito de entrar ainda não foi ativado no Firebase.':['this sign-in method is not enabled in Firebase yet.','este método de acceso aún no está activado en Firebase.'],
    'muitas tentativas seguidas. espere uns minutos e tente de novo.':['too many attempts. wait a few minutes and try again.','demasiados intentos seguidos. espera unos minutos e inténtalo de nuevo.'],
    'sem conexão com a internet.':['no internet connection.','sin conexión a internet.'],
    'por segurança, saia e entre de novo na conta antes de excluir.':['for security, sign out and sign in again before deleting.','por seguridad, sal y vuelve a entrar en tu cuenta antes de eliminarla.'],
    'algo deu errado. tente de novo.':['something went wrong. try again.','algo salió mal. inténtalo de nuevo.'],

    /* histórico e rodapé */
    'histórico':['history','historial'], 'pomodoros no total':['total pomodoros','pomodoros en total'], 'tempo de foco':['focus time','tiempo de enfoque'],
    'recorde num dia':['best day','récord en un día'], 'últimos 7 dias':['last 7 days','últimos 7 días'], 'Mês anterior':['Previous month','Mes anterior'], 'Próximo mês':['Next month','Mes siguiente'],
    'menos':['less','menos'], 'mais':['more','más'], 'no que você focou (30 dias)':['what you focused on (30 days)','en qué te enfocaste (30 días)'],
    'quando você completar pomodoros, aparece aqui no que você mais focou.':["once you complete pomodoros, you'll see here what you focused on most.",'cuando completes pomodoros, aquí verás en qué te enfocaste más.'],
    'nenhum pomodoro nos últimos 7 dias ainda':['no pomodoros in the last 7 days yet','aún no hay pomodoros en los últimos 7 días'],
    '{p} pomodoro · {m} de foco nos últimos 7 dias':['{p} pomodoro · {m} of focus in the last 7 days','{p} pomodoro · {m} de enfoque en los últimos 7 días'],
    '{p} pomodoros · {m} de foco nos últimos 7 dias':['{p} pomodoros · {m} of focus in the last 7 days','{p} pomodoros · {m} de enfoque en los últimos 7 días'],
    'dia {d}: {p} pomodoro':['day {d}: {p} pomodoro','día {d}: {p} pomodoro'], 'dia {d}: {p} pomodoros':['day {d}: {p} pomodoros','día {d}: {p} pomodoros'],
    'dom':['Sun','dom'], 'seg':['Mon','lun'], 'ter':['Tue','mar'], 'qua':['Wed','mié'], 'qui':['Thu','jue'], 'sex':['Fri','vie'], 'sáb':['Sat','sáb'],
    'começar/pausar':['start/pause','empezar/pausar'], 'reiniciar':['restart','reiniciar'], 'pular':['skip','saltar'], 'privacidade':['privacy','privacidad'],
    'sobre e privacidade':['about & privacy','sobre mí y privacidad'], 'feito com carinho por':['made with love by','hecho con cariño por'],
    'Mudar idioma':['Change language','Cambiar idioma'], 'relógios do mundo':['world clocks','relojes del mundo'],
    'Tirar {name}':['Remove {name}','Quitar {name}'],
    'começar {m}':['start {m}','empezar {m}'],
    'isto é só um teste: o copo não conta.':["this is just a test: the glass won't count.",'esto es solo una prueba: el vaso no cuenta.'],
    'teste':['test','prueba'], 'tudo certo! no lembrete de verdade, o copo conta.':['all good! on a real reminder, the glass counts.','¡todo bien! en el recordatorio de verdad, el vaso cuenta.'],
    'metrônomo':['metronome','metrónomo'], 'Mais devagar':['Slower','Más lento'], 'Mais rápido':['Faster','Más rápido'],
    'Andamento (BPM)':['Tempo (BPM)','Tempo (BPM)'], 'compasso':['time signature','compás'], 'bater no ritmo':['tap the beat','marcar el ritmo'],
    'ligar metrônomo':['start metronome','encender metrónomo'], 'parar metrônomo':['stop metronome','detener metrónomo'],
    'Diminuir volume do metrônomo':['Lower metronome volume','Bajar el volumen del metrónomo'], 'Volume do metrônomo':['Metronome volume','Volumen del metrónomo'],
    'Aumentar volume do metrônomo':['Raise metronome volume','Subir el volumen del metrónomo'],
    'som':['sound','sonido'], 'relógio (clássico)':['clock tick (classic)','reloj (clásico)'], 'clique':['click','clic'], 'bip digital':['digital beep','bip digital'], 'bloco de madeira':['woodblock','bloque de madera'],
    'clave':['clave','clave'], 'cowbell':['cowbell','cencerro'], 'chimbal':['hi-hat','charles'], 'baqueta':['rimshot','baqueta'], 'tique-taque':['tick-tock','tic-tac'],
    'bateria':['drums','batería'], 'subdivisão':['subdivision','subdivisión'], 'nenhuma':['none','ninguna'], 'colcheias (2)':['eighths (2)','corcheas (2)'],
    'lojinha':['shop','tiendita'], 'moedas':['coins','monedas'], 'moedas: abrir a lojinha':['coins: open the shop','monedas: abrir la tiendita'],
    'cada bichinho tem a sua roupinha. ganhe moedas com pomodoros de 20 min ou mais, tarefas, copos de água, conquistas e níveis.':['each pet has its own outfit. earn coins with pomodoros of 20 min or more, tasks, glasses of water, achievements and levels.','cada mascota tiene su propia ropita. gana monedas con pomodoros de 20 min o más, tareas, vasos de agua, logros y niveles.'],
    'cabeça':['head','cabeza'], 'rosto':['face','cara'], 'pescoço':['neck','cuello'], 'roupa':['outfit','ropa'],
    'usar':['wear','usar'], 'tirar':['take off','quitar'], 'comprado!':['bought!','¡comprado!'], 'faltam {n} moedas':['{n} coins short','faltan {n} monedas'],
    'termine pomodoros, tarefas e conquistas para ganhar mais.':['finish pomodoros, tasks and achievements to earn more.','termina pomodoros, tareas y logros para ganar más.'],
    'laço':['bow','lazo'], 'florzinha':['little flower','florecita'], 'gorro rosa':['pink beanie','gorro rosa'], 'gorro azul':['blue beanie','gorro azul'], 'boné':['cap','gorra'],
    'chapéu de festa':['party hat','gorro de fiesta'], 'chapéu de bruxa':['witch hat','sombrero de bruja'], 'coroa':['crown','corona'], 'óculos escuros':['sunglasses','gafas de sol'],
    'óculos de coração':['heart glasses','gafas de corazón'], 'gravatinha':['bow tie','pajarita'], 'bandana':['bandana','bandana'], 'cachecol':['scarf','bufanda'],
    'suéter listrado':['striped sweater','suéter a rayas'], 'moletom lilás':['lilac hoodie','sudadera lila'], 'capa de herói':['hero cape','capa de héroe'],
    'Minimizar painel':['Minimize panel','Minimizar panel'], 'Mostrar painel':['Show panel','Mostrar panel'],
    'água':['water','agua'], '{n} de {g}':['{n} of {g}','{n} de {g}'],
    'minhas rotinas':['my routines','mis rutinas'], 'salvar a rotina atual':['save the current routine','guardar la rutina actual'], 'nome (ex.: jogando)':['name (e.g. gaming)','nombre (ej.: jugando)'],
    'Nome da rotina':['Routine name','Nombre de la rutina'], 'Usar quando a atividade for':['Use when the activity is','Usar cuando la actividad sea'], 'sem atividade':['no activity','sin actividad'],
    'salvar':['save','guardar'], 'ligada a uma atividade, a rotina entra sozinha quando você escolhe essa atividade.':['linked to an activity, the routine turns on by itself when you pick that activity.','vinculada a una actividad, la rutina se activa sola cuando eliges esa actividad.'],
    'rotina {name}':['routine {name}','rutina {name}'], 'salva! {steps} min':['saved! {steps} min','¡guardada! {steps} min'], 'rotina':['routine','rutina'],
    'dê um nome para a rotina, ex.: jogando.':['give the routine a name, e.g. gaming.','ponle un nombre a la rutina, ej.: jugando.'], 'apagar rotina':['delete routine','borrar rutina'],
    'imparável':['unstoppable','imparable'], '20 pomodoros no mesmo dia':['20 pomodoros in one day','20 pomodoros en el mismo día'], 'mil tomates':['a thousand tomatoes','mil tomates'],
    '1000 pomodoros no total':['1000 pomodoros in total','1000 pomodoros en total'], '100 horas':['100 hours','100 horas'], '100 horas de foco no total':['100 hours of focus in total','100 horas de enfoque en total'],
    'dia de maratona':['marathon day','día de maratón'], '4 horas de foco no mesmo dia':['4 hours of focus in one day','4 horas de enfoque en el mismo día'],
    'dois meses':['two months','dos meses'], 'foque 60 dias seguidos':['focus 60 days in a row','enfócate 60 días seguidos'], 'lista zerada':['empty list','lista vacía'],
    'conclua 50 tarefas':['complete 50 tasks','completa 50 tareas'], 'nuvem de chuva':['rain cloud','nube de lluvia'], 'marque 500 copos de água no total':['log 500 glasses of water in total','marca 500 vasos de agua en total'],
    'zoológico':['zoo','zoológico'], 'escolha todos os bichinhos':['choose every pet','elige todas las mascotas'], 'no ritmo':['on beat','al ritmo'], 'use o metrônomo':['use the metronome','usa el metrónomo'],
    'rotina própria':['own routine','rutina propia'], 'salve uma rotina sua':['save a routine of your own','guarda una rutina tuya'], 'cofrinho':['piggy bank','alcancía'],
    'ganhe 100 moedas':['earn 100 coins','gana 100 monedas'], 'tesouro':['treasure','tesoro'], 'ganhe 1000 moedas':['earn 1000 coins','gana 1000 monedas'],
    'primeira comprinha':['first purchase','primera compra'], 'compre um item na lojinha':['buy an item in the shop','compra un artículo en la tiendita'],
    'guarda-roupa':['wardrobe','armario'], 'tenha 5 itens da lojinha':['own 5 shop items','ten 5 artículos de la tiendita'], 'bem arrumado':['dressed up','bien arreglado'],
    'vista o bichinho com 3 peças ao mesmo tempo':['dress your pet in 3 items at once','viste a tu mascota con 3 prendas a la vez'], 'realeza':['royalty','realeza'], 'compre a coroa':['buy the crown','compra la corona'],
    'tercinas (3)':['triplets (3)','tresillos (3)'], 'semicolcheias (4)':['sixteenths (4)','semicorcheas (4)'], 'acento no 1º tempo':['accent on beat 1','acento en el 1.er tiempo'],

    /* missões e metas */
    'missões':['missions','misiones'], 'ganhe moedas extras':['earn extra coins','gana monedas extra'], 'minhas metas':['my goals','mis metas'], 'Missões e metas':['Missions and goals','Misiones y metas'],
    'de hoje':['today','de hoy'], 'da semana':['this week','de la semana'], 'renova em {t}':['renews in {t}','se renueva en {t}'], 'renova em {n} dias':['renews in {n} days','se renueva en {n} días'],
    'faça {n} pomodoros':['do {n} pomodoros','haz {n} pomodoros'], 'foque {n} minutos':['focus {n} minutes','enfócate {n} minutos'], 'conclua {n} tarefas':['complete {n} tasks','completa {n} tareas'],
    'beba {n} copos de água':['drink {n} glasses of water','bebe {n} vasos de agua'], 'foque {n} min em {act}':['focus {n} min on {act}','enfócate {n} min en {act}'],
    'faça {n} pomodoros na semana':['do {n} pomodoros this week','haz {n} pomodoros en la semana'], 'foque {h} horas na semana':['focus {h} hours this week','enfócate {h} horas en la semana'],
    'conclua {n} tarefas na semana':['complete {n} tasks this week','completa {n} tareas en la semana'], 'foque em {n} dias diferentes':['focus on {n} different days','enfócate en {n} días distintos'],
    'beba {n} copos de água na semana':['drink {n} glasses of water this week','bebe {n} vasos de agua en la semana'], 'missão cumprida!':['mission complete!','¡misión cumplida!'],
    'por dia':['per day','por día'], 'por semana':['per week','por semana'], '{n} pomodoros':['{n} pomodoros','{n} pomodoros'], '{n} dias com foco':['{n} days with focus','{n} días con enfoque'],
    'crie sua primeira meta aqui embaixo.':['create your first goal below.','crea tu primera meta aquí abajo.'], 'apagar meta':['delete goal','borrar meta'], 'meta batida!':['goal reached!','¡meta cumplida!'],
    'horas':['hours','horas'], 'pomodoros':['pomodoros','pomodoros'], 'dias':['days','días'], 'horas de foco':['hours of focus','horas de enfoque'], 'dias com foco':['days with focus','días con enfoque'],
    'Tipo de meta':['Goal type','Tipo de meta'], 'Quantidade':['Amount','Cantidad'], 'Período':['Period','Período'], 'Atividade':['Activity','Actividad'], 'criar meta':['create goal','crear meta'],
    'qualquer atividade':['any activity','cualquier actividad'], 'cada meta batida vale 25 🪙 (uma vez por dia ou por semana).':['each goal reached is worth 25 🪙 (once per day or per week).','cada meta cumplida vale 25 🪙 (una vez por día o por semana).'],
    '"dias com foco" só faz sentido por semana.':['"days with focus" only works per week.','"días con enfoque" solo tiene sentido por semana.'], 'a semana tem 7 dias 😄':['a week has 7 days 😄','la semana tiene 7 días 😄'],
    'dá para ter até 8 metas.':['you can have up to 8 goals.','puedes tener hasta 8 metas.'], 'meta':['goal','meta'], 'limite':['limit','límite'],
    'missão cumprida':['mission accomplished','misión cumplida'], 'complete uma missão':['complete a mission','completa una misión'], 'agente secreto':['secret agent','agente secreto'],
    'complete 30 missões':['complete 30 missions','completa 30 misiones'], 'semana vencida':['week conquered','semana superada'], 'complete uma missão semanal':['complete a weekly mission','completa una misión semanal'],
    'meta batida':['goal reached','meta cumplida'], 'bata uma meta pessoal':['reach a personal goal','cumple una meta personal'], 'persistência':['persistence','persistencia'],
    'bata 10 metas pessoais':['reach 10 personal goals','cumple 10 metas personales'], 'retrospectiva':['recap','resumen'], 'veja o resumo da semana':['see the weekly recap','mira el resumen de la semana'],
    'desafiante':['challenger','retador'], 'desafie uma amizade':['challenge a friend','reta a una amistad'], 'vitória':['victory','victoria'], 'vença um desafio':['win a challenge','gana un reto'],
    'campeonato':['championship','campeonato'], 'vença 5 desafios':['win 5 challenges','gana 5 retos'], 'paisagem nova':['new scenery','paisaje nuevo'],
    'compre um cenário na coleção':['buy a scene in the collection','compra un escenario en la colección'], 'galeria completa':['full gallery','galería completa'],
    'compre todos os cenários à venda':['buy every scene for sale','compra todos los escenarios a la venta'], 'surpresa!':['surprise!','¡sorpresa!'], 'abra o baú diário':['open the daily chest','abre el cofre diario'],
    'caçador de tesouros':['treasure hunter','cazador de tesoros'], 'abra o baú 7 dias seguidos':['open the chest 7 days in a row','abre el cofre 7 días seguidos'],
    'modo monge':['monk mode','modo monje'], 'termine um pomodoro no foco total':['finish a pomodoro in total focus','termina un pomodoro en enfoque total'],
    'experimente todos os cenários de nível':['try every level scene','prueba todos los escenarios de nivel'],

    /* resumo da semana */
    'resumo da semana':['weekly recap','resumen de la semana'], 'meu resumo da semana':['my weekly recap','mi resumen de la semana'], 'esta semana':['this week','esta semana'],
    'semana passada':['last week','semana pasada'], 'tempo de foco':['focus time','tiempo de enfoque'], 'tarefas':['tasks','tareas'], 'baixar imagem':['download image','descargar imagen'],
    'baixe e poste nos stories 📸':['download it and post it on your stories 📸','descárgala y publícala en tus historias 📸'], 'Semana anterior':['Previous week','Semana anterior'],
    'Esta semana':['This week','Esta semana'], 'Imagem com o resumo da semana':['Image with the weekly recap','Imagen con el resumen de la semana'],
    'seg':['mon','lun'], 'ter':['tue','mar'], 'qua':['wed','mié'], 'qui':['thu','jue'], 'sex':['fri','vie'], 'sáb':['sat','sáb'], 'dom':['sun','dom'],

    /* baú, foco total, cenários à venda */
    'baú':['chest','cofre'], 'baú diário':['daily chest','cofre diario'], 'baú diário: abra uma vez por dia':['daily chest: open once a day','cofre diario: ábrelo una vez al día'], 'oba!':['yay!','¡bien!'],
    '{n} dias seguidos abrindo o baú (+{b} de bônus)':['{n} days in a row opening the chest (+{b} bonus)','{n} días seguidos abriendo el cofre (+{b} de bono)'],
    'volte amanhã: abrindo todo dia, o prêmio aumenta.':['come back tomorrow: open it every day and the prize grows.','vuelve mañana: si lo abres todos los días, el premio aumenta.'],
    'foco total':['total focus','enfoque total'], 'esconde tudo e deixa só o cronômetro':['hides everything but the timer','oculta todo y deja solo el cronómetro'], 'sair do foco total':['exit total focus','salir del enfoque total'],
    'suba de nível ou compre com moedas':['level up or buy with coins','sube de nivel o compra con monedas'], 'cenário novo!':['new scene!','¡escenario nuevo!'],
    'termine pomodoros, missões e conquistas para ganhar mais.':['finish pomodoros, missions and achievements to earn more.','termina pomodoros, misiones y logros para ganar más.'],
    'aquário':['aquarium','acuario'], 'noite de halloween':['halloween night','noche de halloween'], 'festival de lanternas':['lantern festival','festival de linternas'], 'deserto sob as estrelas':['desert under the stars','desierto bajo las estrellas'],

    /* amizades: agora e desafios */
    'mostrar às amizades o que estou fazendo agora (ex.: 📚 estudando · 12 min)':['show friends what I am doing right now (e.g. 📚 studying · 12 min)','mostrar a mis amistades lo que estoy haciendo ahora (ej.: 📚 estudiando · 12 min)'],
    'faltam {n} min':['{n} min left','faltan {n} min'], 'pausado':['paused','en pausa'], 'desafios':['challenges','retos'], 'desafiar':['challenge','retar'],
    'Desafiar quem':['Challenge whom','Retar a quién'], 'Tipo de desafio':['Challenge type','Tipo de reto'], 'Duração':['Duration','Duración'],
    'mais pomodoros':['most pomodoros','más pomodoros'], 'mais copos de água':['most glasses of water','más vasos de agua'], '1 dia':['1 day','1 día'], '3 dias':['3 days','3 días'], '7 dias':['7 days','7 días'],
    'mais minutos de foco':['most focus minutes','más minutos de foco'], 'mais tarefas concluídas':['most tasks done','más tareas hechas'], 'criar o meu desafio':['create my own challenge','crear mi reto'], '14 dias':['14 days','14 días'],
    'qual é o desafio? ex.: ler 10 páginas':['what is the challenge? e.g.: read 10 pages','¿cuál es el reto? ej.: leer 10 páginas'],
    'o placar começa do zero quando a outra pessoa aceita. quem fizer mais no período ganha 30 🪙 (empate: 10 🪙 para cada).':['the score starts at zero when the other person accepts. whoever does more in the period wins 30 🪙 (tie: 10 🪙 each).','el marcador empieza en cero cuando la otra persona acepta. quien haga más en el período gana 30 🪙 (empate: 10 🪙 para cada uno).'],
    'no desafio criado por vocês, cada uma marca +1 no desafio toda vez que fizer. vale a palavra de cada uma 🤞':['in a challenge you create, each person taps +1 every time they do it. it works on trust 🤞','en un reto creado por ustedes, cada una marca +1 cada vez que lo haga. vale la palabra de cada una 🤞'],
    'escreva qual é o desafio (ex.: ler 10 páginas).':['write what the challenge is (e.g.: read 10 pages).','escribe cuál es el reto (ej.: leer 10 páginas).'],
    'quem fizer mais pomodoros (ou beber mais copos de água) no período ganha 30 🪙 (empate: 10 🪙 para cada).':['whoever does more pomodoros (or drinks more glasses of water) in the period wins 30 🪙 (tie: 10 🪙 each).','quien haga más pomodoros (o beba más vasos de agua) en el período gana 30 🪙 (empate: 10 🪙 para cada uno).'],
    'sem placar: não consegui ver os pontos de {who}':['no score: couldn\'t see {who}\'s points','sin marcador: no pude ver los puntos de {who}'],
    'desafio novo!':['new challenge!','¡reto nuevo!'], '{who} te desafiou.':['{who} challenged you.','{who} te retó.'], 'você x {who}':['you vs {who}','tú vs {who}'],
    '{n} dias':['{n} days','{n} días'], '{n} dia':['{n} day','{n} día'], '{who} te desafiou! começa quando você aceitar.':['{who} challenged you! it starts when you accept.','¡{who} te retó! empieza cuando aceptes.'],
    'acaba em {n} dias':['ends in {n} days','termina en {n} días'], 'acaba hoje à meia-noite':['ends tonight at midnight','termina hoy a medianoche'],
    'esperando {who} abrir o site para fechar o placar':['waiting for {who} to open the site to close the score','esperando que {who} abra el sitio para cerrar el marcador'],
    '🥇 você venceu!':['🥇 you won!','🥇 ¡ganaste!'], '🤝 empate':['🤝 tie','🤝 empate'], '{who} venceu':['{who} won','{who} ganó'],
    'você venceu o desafio!':['you won the challenge!','¡ganaste el reto!'], 'empate!':['tie!','¡empate!'], 'desafio encerrado':['challenge over','reto terminado'],
    'não foi dessa vez. bora uma revanche?':['not this time. rematch?','no fue esta vez. ¿revancha?'], 'os desafios precisam das regras novas do Firebase.':['challenges need the new Firebase rules.','los retos necesitan las reglas nuevas de Firebase.'],
    'nenhum desafio ainda. escolha uma amizade e mande o primeiro!':['no challenges yet. pick a friend and send the first one!','ningún reto aún. ¡elige una amistad y manda el primero!'],
    'dá para ter até 10 desafios ao mesmo tempo. apague os que já acabaram.':['you can have up to 10 challenges at once. delete the finished ones.','puedes tener hasta 10 retos a la vez. borra los que ya terminaron.'],
    'vocês já têm um desafio desse tipo rolando.':['you already have a challenge of this type going on.','ya tienen un reto de este tipo en curso.'], 'desafio enviado para {who}! ⚔️':['challenge sent to {who}! ⚔️','¡reto enviado a {who}! ⚔️'],
    'não consegui mandar o desafio agora.':['couldn\'t send the challenge right now.','no pude enviar el reto ahora.'],

    /* copos de água e itens novos da lojinha */
    '{n} copos':['{n} glasses','{n} vasos'], '{n} copo':['{n} glass','{n} vaso'], 'nenhum copo ainda':['no glasses yet','ningún vaso aún'],
    'instalar app':['install app','instalar app'], 'instalar o pomodoro como app no celular ou no computador':['install the pomodoro as an app on your phone or computer','instala el pomodoro como app en el celular o en la computadora'], 'app instalado!':['app installed!','¡app instalada!'], 'agora o pomodoro tem ícone próprio no seu aparelho.':['now the pomodoro has its own icon on your device.','ahora el pomodoro tiene su propio ícono en tu dispositivo.'], 'instalar no iPhone':['install on iPhone','instalar en iPhone'], 'no Safari, toque em compartilhar (o quadradinho com a setinha) e depois em "Adicionar à Tela de Início".':['in Safari, tap share (the square with the arrow) and then "Add to Home Screen".','en Safari, toca compartir (el cuadrito con la flecha) y luego "Agregar a inicio".'],
    'bichinhos':['pets','mascotas'], 'meta de água':['water goal','meta de agua'], 'ligue o lembrete de água nos ajustes (⚙) para marcar os copos.':['turn on the water reminder in settings (⚙) to log glasses.','activa el recordatorio de agua en los ajustes (⚙) para marcar los vasos.'], 'copos de água':['glasses of water','vasos de agua'], '{n} copos de água':['{n} glasses of water','{n} vasos de agua'], 'copos':['glasses','vasos'], 'Zelda e Kirby':['Zelda & Kirby','Zelda y Kirby'], 'outros jogos':['other games','otros juegos'],
    'personagem novo!':['new character!','¡personaje nuevo!'], 'visita especial':['special guest','visita especial'],
    'personagens especiais não usam roupinhas. escolha um bichinho na coleção para vestir.':['special characters don\'t wear outfits. pick a pet in the collection to dress up.','los personajes especiales no usan ropita. elige una mascota en la colección para vestir.'],
    'compre um personagem especial':['buy a special character','compra un personaje especial'],
    'orelhas de coelho':['bunny ears','orejas de conejo'], 'chapéu de chef':['chef hat','gorro de chef'], 'gorro de Natal':['Santa hat','gorro de Navidad'], 'fones de ouvido':['headphones','auriculares'],
    'auréola':['halo','aureola'], 'óculos redondos':['round glasses','gafas redondas'], 'bigode':['mustache','bigote'], 'coleira de sininho':['bell collar','collar de cascabel'],
    'colar de pérolas':['pearl necklace','collar de perlas'], 'pijama de bolinhas':['polka-dot pajamas','pijama de lunares'], 'asas de anjo':['angel wings','alas de ángel'], 'asas de morcego':['bat wings','alas de murciélago'],

    /* caixa de sugestões */
    'sugestões':['suggestions','sugerencias'], 'mande uma ideia ou conte um problema':['send an idea or report a problem','envía una idea o cuenta un problema'],
    'mandar sugestão':['send a suggestion','enviar sugerencia'], 'enviar':['send','enviar'], 'recebidas':['received','recibidas'],
    'teve uma ideia, achou um problema ou quer mandar um carinho? escreve aqui que chega direto para mim':['got an idea, found a problem or want to send some love? write it here and it comes straight to me','¿tienes una idea, encontraste un problema o quieres mandar cariño? escríbelo aquí y me llega directo'],
    'Tipo de sugestão':['Suggestion type','Tipo de sugerencia'], 'ideia':['idea','idea'], 'problema':['problem','problema'], 'elogio':['compliment','elogio'], 'outro':['other','otro'],
    'o que você queria no pomodoro? se for um problema, conta o que aconteceu e em qual aparelho.':['what would you like in the pomodoro? if it\'s a problem, tell me what happened and on which device.','¿qué te gustaría en el pomodoro? si es un problema, cuenta qué pasó y en qué dispositivo.'],
    'Sua sugestão':['Your suggestion','Tu sugerencia'], 'como te respondo? e-mail ou @ (opcional)':['how can I reply? e-mail or @ (optional)','¿cómo te respondo? e-mail o @ (opcional)'], 'Contato (opcional)':['Contact (optional)','Contacto (opcional)'],
    'enviar sugestão':['send suggestion','enviar sugerencia'],
    'não precisa de conta. se você tiver entrado na conta, seu apelido vai junto.':['no account needed. if you\'re signed in, your nickname goes along.','no necesitas cuenta. si iniciaste sesión, tu apodo va junto.'],
    'escreva um pouquinho mais':['write a little more','escribe un poquito más'], 'espere {n} s para mandar outra.':['wait {n} s to send another one.','espera {n} s para enviar otra.'],
    'enviando…':['sending…','enviando…'], 'não consegui enviar agora. confira sua internet e tente de novo.':['couldn\'t send it right now. check your internet and try again.','no pude enviarla ahora. revisa tu internet e inténtalo de nuevo.'],
    'sugestão enviada!':['suggestion sent!','¡sugerencia enviada!'], 'obrigada por ajudar o pomodoro a ficar melhor.':['thanks for helping the pomodoro get better.','gracias por ayudar a que el pomodoro mejore.'],
    'novas':['new','nuevas'], 'todas':['all','todas'], 'nenhuma sugestão ainda.':['no suggestions yet.','ninguna sugerencia aún.'], 'nada novo por aqui':['nothing new here','nada nuevo por aquí'],
    'sem conta':['no account','sin cuenta'], 'marcar como nova':['mark as new','marcar como nueva'], 'lida':['read','leída'], 'apagar':['delete','borrar'], 'apagar?':['delete?','¿borrar?'],
    /* plantinha, ranking com bichinhos e música no foco total */
    'plantinha':['plant','plantita'], 'O que você está plantando':['What you\'re growing','Lo que estás plantando'],
    'o que você está plantando? cada pomodoro vira uma plantinha no "hoje", e os nomes dos níveis mudam junto.':['what are you growing? each pomodoro becomes a little plant in "today", and the level names change too.','¿qué estás plantando? cada pomodoro se vuelve una plantita en "hoy", y los nombres de los niveles cambian también.'],
    'você está plantando: {p}':['you\'re growing: {p}','estás plantando: {p}'], 'agora você planta {p}':['now you grow {p}','ahora plantas {p}'],
    'cada pomodoro vira uma plantinha no "hoje".':['each pomodoro becomes a little plant in "today".','cada pomodoro se vuelve una plantita en "hoy".'],
    'milho':['corn','maíz'], 'morango':['strawberry','fresa'], 'cenoura':['carrot','zanahoria'], 'abóbora':['pumpkin','calabaza'], 'lírio':['lily','lirio'],
    'girassol':['sunflower','girasol'], 'roseira':['rose','rosal'], 'cerejeira':['cherry blossom','cerezo'], 'cacto':['cactus','cactus'],
    'Espiguinha verde':['Green Ear of Corn','Espiguita verde'], 'Milho maduro':['Ripe Corn','Maíz maduro'], 'Milharal':['Cornfield','Maizal'],
    'Moranguinho verde':['Green Strawberry','Fresita verde'], 'Morango maduro':['Ripe Strawberry','Fresa madura'], 'Pé de morango':['Strawberry Plant','Planta de fresa'],
    'Cenourinha':['Baby Carrot','Zanahorita'], 'Cenoura madura':['Ripe Carrot','Zanahoria madura'], 'Canteiro de cenouras':['Carrot Bed','Huerto de zanahorias'],
    'Aboborinha verde':['Green Pumpkin','Calabacita verde'], 'Abóbora madura':['Ripe Pumpkin','Calabaza madura'], 'Canteiro de abóboras':['Pumpkin Patch','Huerto de calabazas'],
    'Botão de lírio':['Lily Bud','Capullo de lirio'], 'Lírio aberto':['Lily in Bloom','Lirio abierto'], 'Canteiro de lírios':['Lily Bed','Cantero de lirios'],
    'Botão de girassol':['Sunflower Bud','Capullo de girasol'], 'Girassol aberto':['Sunflower in Bloom','Girasol abierto'], 'Campo de girassóis':['Sunflower Field','Campo de girasoles'],
    'Botão de rosa':['Rosebud','Capullo de rosa'], 'Rosa aberta':['Rose in Bloom','Rosa abierta'], 'Roseiral':['Rose Garden','Rosaleda'],
    'Botão de cerejeira':['Cherry Bud','Capullo de cerezo'], 'Flor de cerejeira':['Cherry Blossom','Flor de cerezo'], 'Cerejeira':['Cherry Tree','Cerezo'],
    'Cactinho':['Little Cactus','Cactito'], 'Cacto florido':['Blooming Cactus','Cactus florido'], 'Jardim de cactos':['Cactus Garden','Jardín de cactus'],
    'Jardim inteiro':['Whole Garden','Jardín entero'], 'Primavera em flor':['Spring in Bloom','Primavera en flor'],
    'mostrar às amizades o que estou fazendo agora':['show friends what I\'m doing right now','mostrar a mis amistades lo que estoy haciendo ahora'],
    'pausar música':['pause music','pausar música'], 'tocar música':['play music','reproducir música'],
    'a plantinha murchou':['the little plant wilted','la plantita se marchitó'], 'tudo bem, a próxima cresce!':['that\'s ok, the next one will grow!','¡tranquila, la próxima crecerá!'],

    /* clima de verdade */
    'clima de verdade':['real weather','clima real'], 'o cenário chove, neva ou fica nublado junto com a minha cidade':['the scene rains, snows or gets cloudy along with my city','el escenario llueve, nieva o se nubla junto con mi ciudad'],
    'sua cidade (ex.: Manaus)':['your city (e.g. London)','tu ciudad (ej.: Madrid)'], 'Sua cidade':['Your city','Tu ciudad'], 'buscar':['search','buscar'],
    'usar minha localização':['use my location','usar mi ubicación'], 'a cidade fica só neste aparelho. o tempo vem do Open-Meteo.':['the city stays only on this device. the weather comes from Open-Meteo.','la ciudad queda solo en este dispositivo. el clima viene de Open-Meteo.'],
    'cidade: {c}':['city: {c}','ciudad: {c}'], 'escolha sua cidade abaixo.':['choose your city below.','elige tu ciudad abajo.'], 'clima ligado':['weather on','clima activado'],
    'o cenário agora segue o tempo de {c}.':['the scene now follows the weather in {c}.','el escenario ahora sigue el clima de {c}.'], 'agora escolha sua cidade':['now choose your city','ahora elige tu ciudad'],
    'procurando…':['searching…','buscando…'], 'não achei essa cidade. confira o nome.':['couldn\'t find that city. check the name.','no encontré esa ciudad. revisa el nombre.'],
    'sem conexão agora. tente de novo.':['no connection right now. try again.','sin conexión ahora. inténtalo de nuevo.'], 'este navegador não deixa usar a localização.':['this browser doesn\'t allow using location.','este navegador no permite usar la ubicación.'],
    'pedindo a localização…':['asking for location…','pidiendo la ubicación…'], 'não deu para pegar a localização. digite a cidade.':['couldn\'t get the location. type the city.','no se pudo obtener la ubicación. escribe la ciudad.'],
    'minha localização':['my location','mi ubicación'], 'céu limpo':['clear sky','cielo despejado'], 'poucas nuvens':['a few clouds','pocas nubes'], 'nublado':['cloudy','nublado'],
    'neblina':['fog','niebla'], 'garoa':['drizzle','llovizna'], 'neve':['snow','nieve'], 'tempestade':['storm','tormenta'], 'tempo bom':['nice weather','buen tiempo'],

    /* roleta da pausa */
    'roleta da pausa':['break roulette','ruleta de la pausa'], 'girar':['spin','girar'], 'fiz!':['done!','¡hecho!'], 'girar de novo':['spin again','girar de nuevo'],
    'alongar':['stretch','estirarse'], 'levanta, estica os braços para cima e gira os ombros e o pescoço devagar.':['get up, stretch your arms up and slowly roll your shoulders and neck.','levántate, estira los brazos hacia arriba y gira los hombros y el cuello despacio.'],
    'beber água':['drink water','tomar agua'], 'pega um copo de água e bebe com calma.':['grab a glass of water and drink it slowly.','toma un vaso de agua con calma.'],
    'descansar os olhos':['rest your eyes','descansar los ojos'], 'olha para algo bem longe por 20 segundos. seus olhos agradecem.':['look at something far away for 20 seconds. your eyes will thank you.','mira algo bien lejos por 20 segundos. tus ojos lo agradecen.'],
    'respirar 4-7-8':['4-7-8 breathing','respirar 4-7-8'], 'inspira em 4, segura em 7 e solta em 8. siga a bolinha:':['breathe in for 4, hold for 7, breathe out for 8. follow the circle:','inhala en 4, aguanta en 7 y exhala en 8. sigue la bolita:'],
    'arrumar a mesa':['tidy the desk','ordenar la mesa'], 'guarda 3 coisas que estão fora do lugar.':['put away 3 things that are out of place.','guarda 3 cosas que están fuera de lugar.'],
    'dançar uma música':['dance to a song','bailar una canción'], 'coloca uma música que você ama e mexe o corpo.':['put on a song you love and move your body.','pon una canción que ames y mueve el cuerpo.'],
    'lanchinho':['little snack','meriendita'], 'come uma fruta ou alguma coisa leve.':['eat a fruit or something light.','come una fruta o algo ligero.'],
    'mandar um oi':['say hi','mandar un hola'], 'manda uma mensagem carinhosa para alguém de quem você gosta.':['send a sweet message to someone you like.','manda un mensaje cariñoso a alguien que quieras.'],
    'dar uma voltinha':['take a little walk','dar una vueltita'], 'anda um pouco pela casa ou vai até a janela pegar um ar.':['walk around the house a bit or get some air by the window.','camina un poco por la casa o ve a la ventana a tomar aire.'],
    'fechar os olhos':['close your eyes','cerrar los ojos'], 'fecha os olhos e fica 1 minuto só respirando.':['close your eyes and just breathe for 1 minute.','cierra los ojos y quédate 1 minuto solo respirando.'],
    'inspira…':['breathe in…','inhala…'], 'segura…':['hold…','aguanta…'], 'solta…':['breathe out…','exhala…'], 'pronto':['done','listo'],
    'pausa bem feita!':['break well spent!','¡pausa bien hecha!'], 'a moedinha da roleta é uma por pausa.':['the roulette coin is one per break.','la monedita de la ruleta es una por pausa.'],
    'pausa de verdade':['real break','pausa de verdad'], 'cumpra 10 sorteios da roleta da pausa':['complete 10 break roulette draws','cumple 10 sorteos de la ruleta de la pausa'],

    'no ranking, convide uma amizade para uma sala: o cronômetro fica igual para as duas, e quem começar ou pausar muda para as duas.':['in the ranking, invite a friend to a room: the timer is the same for both of you, and whoever starts or pauses changes it for both.','en el ranking, invita a una amistad a una sala: el temporizador es igual para las dos, y quien empiece o pause lo cambia para las dos.'],
    'na pausa, gire a roleta e descubra o que fazer: alongar, beber água, respirar 4-7-8… cumpriu? ganha moedinha.':['on your break, spin the roulette and find out what to do: stretch, drink water, 4-7-8 breathing… did it? you earn a coin.','en la pausa, gira la ruleta y descubre qué hacer: estirarte, tomar agua, respirar 4-7-8… ¿lo hiciste? ganas una monedita.'],
    'nos ajustes (⚙), escolha sua cidade: quando chover, nevar ou estiver nublado aí, o cenário fica igual.':['in settings (⚙), pick your city: when it rains, snows or gets cloudy there, the scene does too.','en los ajustes (⚙), elige tu ciudad: cuando llueva, nieve o esté nublado allí, el escenario también.'],

    /* mudança de endereço */
    'o pomodoro mudou de casa!':['the pomodoro has moved!','¡el pomodoro se mudó!'], 'agora ele fica em':['it now lives at','ahora está en'],
    'ir para o endereço novo':['go to the new address','ir a la dirección nueva'], 'levar meus dados':['take my data','llevar mis datos'],
    'como levo meu progresso?':['how do I bring my progress?','¿cómo llevo mi progreso?'],
    'com conta: é só entrar na sua conta no endereço novo, tudo volta sozinho. sem conta: clique em "levar meus dados", abra o endereço novo e vá em ⚙ ajustes → "carregar meus dados de um arquivo".':['with an account: just sign in at the new address and everything comes back. without an account: click "take my data", open the new address and go to ⚙ settings → "load my data from a file".','con cuenta: solo inicia sesión en la dirección nueva y todo vuelve solo. sin cuenta: haz clic en "llevar mis datos", abre la dirección nueva y ve a ⚙ ajustes → "cargar mis datos desde un archivo".'],
    'carregar meus dados de um arquivo':['load my data from a file','cargar mis datos desde un archivo'], 'arquivo inválido':['invalid file','archivo no válido'],
    'escolha o arquivo meu-pomodoro.json.':['choose the meu-pomodoro.json file.','elige el archivo meu-pomodoro.json.'],
    'juntar os dados do arquivo com os deste aparelho? nada daqui é apagado.':['merge the data from the file with this device\'s data? nothing here gets deleted.','¿juntar los datos del archivo con los de este dispositivo? no se borra nada de aquí.'],
    'dados carregados!':['data loaded!','¡datos cargados!'], 'seu progresso chegou. a página vai recarregar.':['your progress is here. the page will reload.','tu progreso llegó. la página se recargará.'],
    'não deu certo':['it didn\'t work','no funcionó'], 'o arquivo parece estar danificado.':['the file seems to be damaged.','el archivo parece estar dañado.'],

    /* focar junto */
    'focar junto':['focus together','enfocarse juntas'], 'Focar junto com quem':['Focus together with whom','Enfocarse junto con quién'], 'convidar':['invite','invitar'],
    'o cronômetro fica igual para as duas pessoas: quem começar, pausar ou pular, muda para as duas.':['the timer is the same for both people: whoever starts, pauses or skips changes it for both.','el temporizador es igual para las dos personas: quien empiece, pause o salte, lo cambia para las dos.'],
    'sair':['leave','salir'], 'convite para focar junto!':['invite to focus together!','¡invitación para enfocarse juntas!'],
    '{who} quer focar junto com você. aceite no ranking.':['{who} wants to focus together with you. accept it in the ranking.','{who} quiere enfocarse contigo. acepta en el ranking.'],
    'focando junto!':['focusing together!','¡enfocándose juntas!'], 'agora o cronômetro de vocês é um só.':['now you share one timer.','ahora tienen un solo temporizador.'],
    'a sala acabou':['the room ended','la sala terminó'], '{who} saiu. seu cronômetro continua normal.':['{who} left. your timer keeps going as usual.','{who} salió. tu temporizador sigue normal.'],
    '👯 focando junto com {who}':['👯 focusing with {who}','👯 enfocándote con {who}'], '{who} te chamou para focar junto!':['{who} invited you to focus together!','¡{who} te invitó a enfocarse juntas!'],
    'saia da sala atual antes de entrar em outra.':['leave the current room before joining another one.','sal de la sala actual antes de entrar en otra.'],
    'você já está focando junto com alguém.':['you\'re already focusing with someone.','ya te estás enfocando con alguien.'],
    'você já mandou um convite. espere a resposta ou cancele.':['you already sent an invite. wait for the answer or cancel it.','ya enviaste una invitación. espera la respuesta o cancélala.'],
    'convite enviado para {who}! 👯':['invite sent to {who}! 👯','¡invitación enviada a {who}! 👯'], 'não consegui mandar o convite agora.':['couldn\'t send the invite right now.','no pude enviar la invitación ahora.'],
    'o focar junto precisa das regras novas do Firebase.':['focus together needs the new Firebase rules.','enfocarse juntas necesita las reglas nuevas de Firebase.'],
    'estudo em dupla':['study buddies','estudio en dúo'], 'termine um pomodoro focando junto com uma amizade':['finish a pomodoro focusing together with a friend','termina un pomodoro enfocándote con una amistad'],

    /* Halloween */
    'só em outubro':['October only','solo en octubre'], 'abóbora na cabeça':['pumpkin hat','calabaza en la cabeza'], 'colar de aranha':['spider necklace','collar de araña'],
    'lençol de fantasma':['ghost sheet','sábana de fantasma'], 'capa de vampiro':['vampire cape','capa de vampiro'],
    'de Halloween':['Halloween','de Halloween'], 'acaba em {n} dias':['ends in {n} days','termina en {n} días'],
    'faça {n} pomodoros no Halloween':['do {n} pomodoros during Halloween','haz {n} pomodoros en Halloween'], 'foque {h} horas no Halloween':['focus {h} hours during Halloween','enfócate {h} horas en Halloween'],
    'foque em {n} dias diferentes no Halloween':['focus on {n} different days during Halloween','enfócate en {n} días diferentes en Halloween'], 'conclua {n} tarefas no Halloween':['complete {n} tasks during Halloween','completa {n} tareas en Halloween'],
    'doce ou foco':['trick or focus','dulce o enfoque'], 'complete as 4 missões de Halloween (em outubro)':['complete the 4 Halloween missions (in October)','completa las 4 misiones de Halloween (en octubre)'],

    /* novidades */
    'novidades':['what\'s new','novedades'], 'o pomodoro ganhou umas coisinhas novas, muitas pedidas por vocês:':['the pomodoro got some new things, many of them requested by you:','el pomodoro tiene cositas nuevas, muchas pedidas por ustedes:'],
    'o Halloween chegou':['Halloween is here','llegó Halloween'],
    'até 2 de novembro: missões especiais, itens assustadores na lojinha (só em outubro) e uma medalha nova. o cenário "noite de halloween" é grátis na coleção.':['until November 2: special missions, spooky items in the shop (October only) and a new medal. the "halloween night" scene is free in the collection.','hasta el 2 de noviembre: misiones especiales, artículos terroríficos en la tiendita (solo en octubre) y una medalla nueva. el escenario "noche de halloween" es gratis en la colección.'],
    'escolha o que plantar':['choose what to grow','elige qué plantar'],
    'tomate, milho, lírio, girassol, morango… cada pomodoro vira uma plantinha no "hoje", e os nomes dos níveis mudam junto.':['tomato, corn, lily, sunflower, strawberry… each pomodoro becomes a little plant in "today", and the level names change too.','tomate, maíz, lirio, girasol, fresa… cada pomodoro se vuelve una plantita en "hoy", y los nombres de los niveles cambian también.'],
    'escolher agora':['choose now','elegir ahora'], 'a plantinha cresce no relógio':['the little plant grows on the timer','la plantita crece en el reloj'],
    'durante o foco ela nasce e vai crescendo até ficar pronta. desistiu no meio? ela murcha':['during focus it sprouts and grows until it\'s ready. gave up halfway? it wilts','durante el enfoque nace y va creciendo hasta estar lista. ¿te rendiste a la mitad? se marchita'],
    'bichinhos no ranking':['pets in the ranking','mascotas en el ranking'],
    'cada amizade aparece com o bichinho dela e um simbolozinho do que está fazendo agora (📚, 🎮, ☕…). quem estiver focando aparece em cima do seu cronômetro, do lado do seu bichinho.':['each friend shows up with their pet and a little symbol of what they\'re doing now (📚, 🎮, ☕…). whoever is focusing shows up above your timer, next to your pet.','cada amistad aparece con su mascota y un simbolito de lo que está haciendo ahora (📚, 🎮, ☕…). quien esté enfocándose aparece arriba de tu reloj, al lado de tu mascota.'],
    'música no foco total':['music in full focus','música en enfoque total'], 'agora dá para tocar e pausar a música sem sair do foco total.':['now you can play and pause the music without leaving full focus.','ahora puedes reproducir y pausar la música sin salir del enfoque total.'],
    'caixa de sugestões':['suggestion box','buzón de sugerencias'],
    'teve uma ideia ou achou um problema? manda pelo botão 💡 sugestões lá em cima, que chega direto para mim.':['got an idea or found a problem? send it with the 💡 suggestions button at the top, it comes straight to me.','¿tienes una idea o encontraste un problema? envíala con el botón 💡 sugerencias de arriba, me llega directo.'],
    'não consegui abrir as sugestões. as regras novas do Firebase já foram publicadas?':['couldn\'t open the suggestions. have the new Firebase rules been published?','no pude abrir las sugerencias. ¿ya se publicaron las reglas nuevas de Firebase?'],

    /* ligas semanais */
    'liga':['league','liga'], 'liga bronze':['bronze league','liga bronce'], 'liga prata':['silver league','liga plata'], 'liga ouro':['gold league','liga oro'],
    'liga diamante':['diamond league','liga diamante'], 'liga lendária':['legendary league','liga legendaria'],

    '{a} de {b} feitas':['{a} of {b} done','{a} de {b} hechas'],
    'tarefas concluídas nos últimos 7 dias (só para mostrar, não conta no ranking)':['tasks done in the last 7 days (just for show, doesn\'t count in the ranking)','tareas hechas en los últimos 7 días (solo para mostrar, no cuenta en el ranking)'],
    'pomodoros e tarefas dos últimos 7 dias · a ordem é pelos pomodoros':['pomodoros and tasks from the last 7 days · ordered by pomodoros','pomodoros y tareas de los últimos 7 días · el orden es por pomodoros'],

    /* login do programa do computador */
    'abri o seu navegador: entre com o Google lá e depois volte para cá.':['I opened your browser: sign in with Google there and then come back here.','abrí tu navegador: entra con Google allí y luego vuelve aquí.'],
    'entrar no programa do computador':['sign in to the desktop app','entrar en el programa de la computadora'],
    'clique no botão para entrar com o Google. depois o login volta sozinho para o programa.':['click the button to sign in with Google. then the login goes back to the app by itself.','haz clic en el botón para entrar con Google. después el inicio de sesión vuelve solo al programa.'],
    'entrar com o Google':['sign in with Google','entrar con Google'],
    'pronto! o navegador vai perguntar se pode abrir o Pomodoro Lo-fi: clique em abrir. depois pode fechar esta aba.':['done! your browser will ask if it can open Pomodoro Lo-fi: click open. then you can close this tab.','¡listo! el navegador va a preguntar si puede abrir Pomodoro Lo-fi: haz clic en abrir. después puedes cerrar esta pestaña.'],

    /* organizar painéis */
    'organizar':['arrange','organizar'], 'mude os painéis de lugar do seu jeito':['move the panels around your way','mueve los paneles a tu manera'],
    'arraste os painéis ou use as setas':['drag the panels or use the arrows','arrastra los paneles o usa las flechas'], 'voltar ao padrão':['back to default','volver al orden original'],
    'Subir painel':['Move panel up','Subir panel'], 'Descer painel':['Move panel down','Bajar panel'], 'Mandar para a outra coluna':['Send to the other column','Enviar a la otra columna'],
    'painéis organizados!':['panels arranged!','¡paneles organizados!'], 'a ordem fica guardada neste aparelho.':['the order is saved on this device.','el orden queda guardado en este dispositivo.'],
    'organize do seu jeito':['arrange it your way','organiza a tu manera'],
    'com o botão 🧩 organizar, lá em cima, você muda os painéis de lugar: setas no celular, arrastar no computador.':['with the 🧩 arrange button at the top, you move the panels around: arrows on your phone, drag on a computer.','con el botón 🧩 organizar, arriba, cambias los paneles de lugar: flechas en el celular, arrastrar en la computadora.'],
    'você subiu para a {liga}!':['you moved up to the {liga}!','¡subiste a la {liga}!'], 'semana fechada!':['week closed!','¡semana cerrada!'], 'semana fechada':['week closed','semana cerrada'],
    'você continua na {liga}.':['you stay in the {liga}.','sigues en la {liga}.'], 'você caiu para a {liga}. bora recuperar esta semana!':['you dropped to the {liga}. let\'s bounce back this week!','bajaste a la {liga}. ¡a recuperarse esta semana!'],
    '✅ meta batida: na segunda você sobe para a {liga}!':['✅ goal reached: on Monday you move up to the {liga}!','✅ meta cumplida: ¡el lunes subes a la {liga}!'],
    'esta semana: {n} 🍅 · faltam {k} para subir':['this week: {n} 🍅 · {k} more to move up','esta semana: {n} 🍅 · faltan {k} para subir'],
    'esta semana: {n} 🍅 · você está no topo!':['this week: {n} 🍅 · you\'re at the top!','esta semana: {n} 🍅 · ¡estás en la cima!'],
    '⚠️ faça pelo menos {k} para não cair':['⚠️ do at least {k} to stay','⚠️ haz al menos {k} para no bajar'],
    'a semana fecha em {n} dias':['the week closes in {n} days','la semana cierra en {n} días'], 'a semana fecha hoje à meia-noite':['the week closes tonight at midnight','la semana cierra hoy a medianoche'],
    'sobe com {n} 🍅 na semana':['move up with {n} 🍅 in a week','subes con {n} 🍅 en la semana'], 'o topo!':['the top!','¡la cima!'],
    'toda segunda a semana fecha. bateu a meta da sua liga? sobe e ganha 50 🪙. ficou na mesma liga? +20 🪙. fez menos que o mínimo? cai uma liga. sua liga aparece no ranking para as amizades.':['every Monday the week closes. reached your league\'s goal? move up and get 50 🪙. stayed in the same league? +20 🪙. did less than the minimum? drop one league. your league shows in the ranking for your friends.','cada lunes cierra la semana. ¿cumpliste la meta de tu liga? subes y ganas 50 🪙. ¿te quedaste en la misma liga? +20 🪙. ¿hiciste menos del mínimo? bajas una liga. tu liga aparece en el ranking para tus amistades.'],
    'subindo de liga':['moving up','subiendo de liga'], 'chegue à liga prata':['reach the silver league','llega a la liga plata'],
    'brilho de diamante':['diamond shine','brillo de diamante'], 'chegue à liga diamante':['reach the diamond league','llega a la liga diamante'],

    /* contagem regressiva */
    'contagem regressiva':['countdown','cuenta regresiva'],
    'uma prova, uma entrega, uma viagem… o "hoje" mostra quantos dias faltam. se quiser, coloque quantas horas de foco você quer fazer até lá.':['an exam, a deadline, a trip… "today" shows how many days are left. if you want, add how many focus hours you want to do until then.','un examen, una entrega, un viaje… "hoy" muestra cuántos días faltan. si quieres, pon cuántas horas de enfoque quieres hacer hasta entonces.'],
    'o quê? ex.: prova da OAB':['what? e.g.: final exam','¿qué? ej.: examen final'], 'horas (opcional)':['hours (optional)','horas (opcional)'],
    'faltam {n} dias':['{n} days left','faltan {n} días'], 'é amanhã!':['it\'s tomorrow!','¡es mañana!'], 'é hoje! boa sorte 🍀':['it\'s today! good luck 🍀','¡es hoy! buena suerte 🍀'], 'já passou':['already passed','ya pasó'],
    '{a} de {b}h':['{a} of {b}h','{a} de {b}h'], '{t} por dia':['{t} per day','{t} por día'], 'meta: {n}h de foco':['goal: {n}h of focus','meta: {n}h de enfoque'], 'nenhuma contagem ainda.':['no countdowns yet.','ninguna cuenta todavía.'],
    'essa data já passou':['that date has passed','esa fecha ya pasó'], 'escolha hoje ou um dia que ainda vai chegar.':['pick today or a day that\'s still to come.','elige hoy o un día que todavía va a llegar.'],
    'até 10 contagens':['up to 10 countdowns','hasta 10 cuentas'], 'apague uma que já passou.':['delete one that has passed.','borra una que ya pasó.'],
    'de olho no calendário':['eye on the calendar','atenta al calendario'], 'crie uma contagem regressiva':['create a countdown','crea una cuenta regresiva'],

    /* sala de estudo em grupo */
    'sala de estudo':['study room','sala de estudio'], 'até 8 pessoas':['up to 8 people','hasta 8 personas'],
    'nome da sala (ex.: turma de direito)':['room name (e.g.: law class)','nombre de la sala (ej.: clase de derecho)'], 'criar sala':['create room','crear sala'],
    'código da sala':['room code','código de la sala'], 'entrar na sala':['join room','entrar en la sala'],
    'numa sala, o cronômetro é um só para todo mundo: quem começar, pausar ou pular, muda para todas. qualquer pessoa com conta entra com o código, mesmo sem ser amizade.':['in a room, there\'s one timer for everyone: whoever starts, pauses or skips changes it for all. anyone with an account can join with the code, even if they\'re not a friend.','en una sala, el reloj es uno solo para todas: quien empiece, pause o salte, cambia para todas. cualquier persona con cuenta entra con el código, aunque no sea amistad.'],
    '📚 {name} · {n} na sala':['📚 {name} · {n} in the room','📚 {name} · {n} en la sala'], 'código {c} · copiar convite':['code {c} · copy invite','código {c} · copiar invitación'],
    '🟢 aqui agora':['🟢 here now','🟢 aquí ahora'], '💤 saiu um pouquinho':['💤 stepped away','💤 salió un ratito'],
    'chegou gente!':['someone arrived!','¡llegó alguien!'], '{who} entrou na sala.':['{who} joined the room.','{who} entró en la sala.'],
    'a sala acabou':['the room ended','la sala terminó'], 'seu cronômetro continua normal.':['your timer keeps going as usual.','tu reloj sigue normal.'],
    'sala criada! mande o código {c} para quem vai estudar com você.':['room created! send the code {c} to whoever is studying with you.','¡sala creada! manda el código {c} a quien va a estudiar contigo.'],
    'o código da sala tem 6 letras e números.':['the room code has 6 letters and numbers.','el código de la sala tiene 6 letras y números.'],
    'não achei sala com esse código. confira com quem te mandou.':['couldn\'t find a room with that code. check with whoever sent it.','no encontré una sala con ese código. confirma con quien te lo mandó.'],
    'essa sala já está cheia ({n} pessoas).':['this room is already full ({n} people).','esta sala ya está llena ({n} personas).'],
    'você entrou na sala {name}! 📚':['you joined the room {name}! 📚','¡entraste en la sala {name}! 📚'],
    'não consegui entrar agora. tente de novo.':['couldn\'t join now. try again.','no pude entrar ahora. inténtalo de nuevo.'],
    'não consegui criar a sala agora. tente de novo.':['couldn\'t create the room now. try again.','no pude crear la sala ahora. inténtalo de nuevo.'],
    'saia do focar junto antes de abrir uma sala.':['leave focus-together before opening a room.','sal de enfocar juntas antes de abrir una sala.'],
    'saia do focar junto antes de entrar numa sala.':['leave focus-together before joining a room.','sal de enfocar juntas antes de entrar en una sala.'],
    'convite copiado! é só colar no WhatsApp ou onde quiser.':['invite copied! just paste it on WhatsApp or wherever you like.','¡invitación copiada! solo pégala en WhatsApp o donde quieras.'],
    'vem estudar comigo no Pomodoro Lo-fi! sala "{name}", código {c}: {link}':['come study with me on Pomodoro Lo-fi! room "{name}", code {c}: {link}','¡ven a estudiar conmigo en Pomodoro Lo-fi! sala "{name}", código {c}: {link}'],
    'convite para uma sala de estudo!':['invite to a study room!','¡invitación a una sala de estudio!'],
    'o código já está no ranking: com a conta aberta, é só clicar em "entrar na sala".':['the code is already in the ranking: with your account open, just click "join room".','el código ya está en el ranking: con tu cuenta abierta, solo haz clic en "entrar en la sala".'],
    'a sala de estudo precisa das regras novas do Firebase.':['the study room needs the new Firebase rules.','la sala de estudio necesita las reglas nuevas de Firebase.'],
    'sala de estudo · 8 pessoas':['study room · 8 people','sala de estudio · 8 personas'],
    'grupo de estudos':['study group','grupo de estudio'], 'termine um pomodoro numa sala de estudo com 3 pessoas ou mais':['finish a pomodoro in a study room with 3 or more people','termina un pomodoro en una sala de estudio con 3 personas o más'],

    /* novidades de 02/10 (2ª leva) */
    'estude em grupo, até 8 pessoas':['study as a group, up to 8 people','estudia en grupo, hasta 8 personas'],
    'no ranking, crie uma sala de estudo e mande o código (ou o convite) para a turma. o cronômetro fica igual para todo mundo.':['in the ranking, create a study room and send the code (or the invite) to your group. the timer is the same for everyone.','en el ranking, crea una sala de estudio y manda el código (o la invitación) al grupo. el reloj es igual para todas.'],
    'ligas semanais':['weekly leagues','ligas semanales'],
    'nas missões, aba 🏆 liga: bronze, prata, ouro, diamante e lendária. bata a meta da semana para subir e ganhar moedas.':['in missions, 🏆 league tab: bronze, silver, gold, diamond and legendary. hit the weekly goal to move up and earn coins.','en misiones, pestaña 🏆 liga: bronce, plata, oro, diamante y legendaria. cumple la meta de la semana para subir y ganar monedas.'],
    'no "hoje", conte os dias até a prova (ou a viagem!) e veja quantas horas de foco por dia faltam para chegar preparada.':['in "today", count the days until the exam (or the trip!) and see how many focus hours per day you need to be ready.','en "hoy", cuenta los días hasta el examen (¡o el viaje!) y mira cuántas horas de enfoque por día faltan para llegar preparada.'],
    'desafios do seu jeito':['challenges your way','retos a tu manera'],
    'agora tem desafio de minutos de foco, de tarefas e um que vocês mesmas criam (ler, correr, meditar…). e o placar começa do zero quando a outra pessoa aceita.':['now there are challenges for focus minutes, tasks, and one you create yourselves (reading, running, meditating…). and the score starts at zero when the other person accepts.','ahora hay retos de minutos de enfoque, de tareas y uno que ustedes mismas crean (leer, correr, meditar…). y el marcador empieza en cero cuando la otra persona acepta.'],
    'avisos no celular':['phone notifications','avisos en el celular'],
    'com o "aviso quando o tempo acabar" ligado nos ajustes (⚙), o celular avisa mesmo com o app minimizado.':['with "notify when time is up" on in settings (⚙), your phone notifies you even with the app minimized.','con el "aviso cuando termine el tiempo" activado en ajustes (⚙), el celular avisa aunque la app esté minimizada.']
  };
  const DAY_LETTERS = {pt:['D','S','T','Q','Q','S','S'], en:['S','M','T','W','T','F','S'], es:['D','L','M','X','J','V','S']};

  const col = () => lang === 'en' ? 0 : lang === 'es' ? 1 : -1;
  const EDGE = /^([^\p{L}]*)([\s\S]*?\p{L}[\s\S]*?)([^\p{L}]*)$/u;
  /* traduz o texto inteiro; se não achar, tenta sem os emojis e pontuação das pontas */
  function translate(src) {
    const c = col(); if (c < 0 || !src) return src;
    const full = src.trim(); if (!full) return src;
    if (D[full]) return src.replace(full, D[full][c]);
    const m = full.match(EDGE);
    if (!m || m[2] === full) return src;
    if (D[m[2]]) return src.replace(m[2], D[m[2]][c]);
    const tail = (m[2] + m[3]).trim(), head = (m[1] + m[2]).trim();
    if (D[tail]) return src.replace(tail, D[tail][c]);
    if (D[head]) return src.replace(head, D[head][c]);
    return src;
  }
  function t(s, vars) {
    let out = translate(s);
    if (vars) out = out.replace(/\{(\w+)\}/g, (all, k) => vars[k] != null ? vars[k] : all);
    return out;
  }

  /* tradução automática da página */
  const ATTRS = ['placeholder', 'aria-label', 'title'];
  const SKIP = 'script,style,textarea,[data-noi18n]';
  const texts = new WeakMap(), attrs = new WeakMap();
  function doText(node) {
    const p = node.parentElement; if (!p || p.closest(SKIP)) return;
    const cur = node.nodeValue, rec = texts.get(node);
    const src = rec && cur === rec.out ? rec.src : cur, out = translate(src);
    texts.set(node, {src, out});
    if (out !== cur) node.nodeValue = out;
  }
  function doAttr(el, a) {
    if (!el.hasAttribute || !el.hasAttribute(a) || el.closest('[data-noi18n]')) return;
    const cur = el.getAttribute(a); let m = attrs.get(el); if (!m) { m = {}; attrs.set(el, m); }
    const rec = m[a], src = rec && cur === rec.out ? rec.src : cur, out = translate(src);
    m[a] = {src, out};
    if (out !== cur) el.setAttribute(a, out);
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1 || root.matches(SKIP)) return;
    ATTRS.forEach(a => doAttr(root, a));
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else ATTRS.forEach(a => doAttr(n, a)); }
  }
  function start() {
    document.documentElement.lang = LOCALES[lang];
    walk(document.body);
    new MutationObserver(muts => muts.forEach(m => {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttr(m.target, m.attributeName);
      else m.addedNodes.forEach(walk);
    })).observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTRS});
  }
  function setLang(l) {
    if (!LOCALES[l] || l === lang) return;
    lang = l;
    try { localStorage.setItem('pomodoro-lang', l); } catch (e) {}
    document.documentElement.lang = LOCALES[l];
    walk(document.body);
    document.dispatchEvent(new CustomEvent('langchange', {detail:l}));
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  return {t, setLang, get lang() { return lang; }, get locale() { return LOCALES[lang]; }, get dayLetters() { return DAY_LETTERS[lang]; }};
})();
