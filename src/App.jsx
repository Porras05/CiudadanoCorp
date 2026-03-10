import { useState, useRef, useEffect, useCallback } from "react";

// ─── SUPABASE ───
async function saveCertificate(data) {
  const url = window.__SUPABASE_URL__ || import.meta?.env?.VITE_SUPABASE_URL;
  const key = window.__SUPABASE_KEY__ || import.meta?.env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) { console.warn("Supabase no configurado"); return null; }
  try {
    const res = await fetch(`${url}/rest/v1/certificates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { console.error("Supabase error:", res.status, await res.text()); return null; }
    return await res.json();
  } catch (e) { console.error("DB:", e); return null; }
}

// ─── DATA ───
const SKINS = ['#FDDBB4','#F0C27F','#D4956A','#B87041','#8D5524','#5C3317'];
const HAIRS = ['#1A0A00','#3B1F00','#7B4A1E','#C49A6C','#E8C97E','#CCCCCC','#EBEBEB','#8B1A1A','#1A1A4A'];
const OUTFITS = ['#1A3A5C','#2E5F8A','#4A7C5E','#A04A2F','#5A4A7C','#2C2C2C','#7A6010','#3D6B6B'];
const HAIRSTYLES = ['short','medium','long','curly'];
const HS_LABELS = {short:'Corto',medium:'Mediano',long:'Largo',curly:'Rizado'};
const EXPRESSIONS = ['happy','serious','surprised','thinking','wink'];
const EXPR_LABELS = {happy:'😊 Feliz',serious:'😐 Serio/a',surprised:'😮 Sorprendido/a',thinking:'🤔 Pensativo/a',wink:'😉 Cómplice'};

const PROFILES = {
  pragmatic:{ name:'Pragmático/a', desc:'Priorizas resultados medibles y eficiencia. Tomas decisiones basadas en impacto real más que en principios abstractos.', color:'#1A3A5C' },
  idealist:{ name:'Idealista', desc:'Guías tus decisiones por principios y valores. El proceso importa tanto como el resultado, y actúas con coherencia incluso cuando es incómodo.', color:'#4A7C5E' },
  relational:{ name:'Relacional', desc:'Las personas y las relaciones son tu centro. Buscas consenso, cuidas el tejido humano y priorizas que todos sean escuchados.', color:'#A04A2F' },
  systemic:{ name:'Sistémico/a', desc:'Piensas en estructuras, procesos y sostenibilidad a largo plazo. Cambias el sistema, no solo los síntomas.', color:'#5A4A7C' },
};

// Minigame per module: 0=snake, 1=minesweeper, 2=breakout, 3=runner, 4=flappy
const MG_TYPES = ['snake','minesweeper','breakout','runner','flappy'];
const MG_META = {
  snake:      { icon:'🐍', title:'Serpiente',        inst:'Usa las flechas del teclado (o desliza en móvil) para mover la serpiente. Come los puntos dorados para crecer y sumar puntos. ¡No choques con las paredes ni contigo mismo!' },
  minesweeper:{ icon:'💣', title:'Buscaminas',        inst:'Haz clic para revelar celdas. Los números indican cuántas minas hay alrededor. Clic derecho (o presión larga en móvil) para marcar una mina 🚩. ¡Revela todas las celdas seguras para ganar!' },
  breakout:   { icon:'🧱', title:'Rompe Bloques',     inst:'Mueve el mouse (o arrastra en móvil) para controlar la paleta. Rebota la pelota y destruye todos los bloques. Si la pelota cae pierdes una vida. ¡Tienes 3 vidas!' },
  runner:     { icon:'🏃', title:'Corredor Infinito', inst:'Presiona Espacio o haz clic en el canvas para saltar. Esquiva los obstáculos que llegan desde la derecha. ¡Cuanto más lejos llegues, más puntos!' },
  flappy:     { icon:'🦜', title:'Flappy Guacamaya',  inst:'Presiona Espacio, haz clic o toca la pantalla para que la guacamaya vuele. Esquiva los árboles. ¡Cada árbol pasado suma un punto!' },
};

const MODULES = [
  {id:0,icon:'⚖️',title:'Dilemas de Liderazgo',tag:'Ética aplicada',desc:'Situaciones reales donde no existe una única respuesta correcta.',scenarios:[
    {tag:'DILEMA 01',title:'El resultado vs. el proceso',body:'Tu equipo puede alcanzar la meta del trimestre saltándose un paso del protocolo de aprobación interno. El proceso fue diseñado para proyectos más grandes y nadie lo notaría. El cliente llevaría meses esperando si se sigue el proceso completo.',context:'El protocolo existe para prevenir errores del pasado. Tu equipo ha trabajado este proyecto con rigor. El cliente es estratégico y ha esperado mucho.',options:[
      {text:'Omites el paso. El protocolo no fue diseñado para este caso y el cliente no puede esperar más.',profile:'pragmatic',outcome:'Entregas a tiempo. El cliente queda satisfecho. Sin embargo, el equipo aprende que los procesos son opcionales bajo presión.',consequence:'+Eficiencia inmediata · −Cultura de proceso'},
      {text:'Sigues el protocolo completo aunque tome meses. La regla existe por algo.',profile:'idealist',outcome:'El cliente espera y muestra frustración. La siguiente auditoría interna muestra cero desviaciones.',consequence:'+Integridad normativa · −Relación con cliente'},
      {text:'Hablas directamente con el cliente para explicar la situación y negociar un plazo intermedio.',profile:'relational',outcome:'El cliente comprende y valora la transparencia. Acuerdan un cronograma ajustado.',consequence:'+Confianza relacional · Tiempo moderado'},
      {text:'Propones formalmente revisar el protocolo para incluir excepciones documentadas antes de proceder.',profile:'systemic',outcome:'El proceso se pausa. Documentas la propuesta de mejora. El cambio tarda pero beneficia proyectos futuros.',consequence:'+Mejora sistémica · −Velocidad inmediata'},
    ]},
    {tag:'DILEMA 02',title:'El talento difícil',body:'Tu mejor colaborador técnico tiene comportamientos que afectan el clima del equipo: interrumpe, no reconoce el trabajo ajeno y sus comentarios a veces incomodan. Sus resultados son excepcionales.',context:'Varios miembros del equipo han expresado malestar informalmente. Ninguno ha hecho queja formal. Hay una entrega crítica en 6 semanas.',options:[
      {text:'Priorizas la entrega. Abordarás los comportamientos después del proyecto, cuando haya menos presión.',profile:'pragmatic',outcome:'La entrega sale bien. Sin embargo, dos miembros renuncian a los tres meses.',consequence:'+Resultado inmediato · −Retención del equipo'},
      {text:'Le planteas directamente que sus comportamientos son inaceptables, independientemente de sus resultados.',profile:'idealist',outcome:'La conversación es difícil. Con tiempo y acompañamiento, hay mejora real.',consequence:'+Estándar de conducta · Tensión temporal'},
      {text:'Organizas conversaciones individuales con el equipo para entender el impacto real antes de actuar.',profile:'relational',outcome:'Descubres matices que no conocías. La intervención es más informada y menos reactiva.',consequence:'+Decisión informada · −Velocidad'},
      {text:'Propones un proceso de feedback 360° para todo el equipo, sin señalar directamente a nadie.',profile:'systemic',outcome:'El proceso revela patrones en todo el equipo. Los datos generan cambios más sostenidos.',consequence:'+Cultura de feedback · −Resolución rápida'},
    ]},
    {tag:'DILEMA 03',title:'La información incómoda',body:'En una reunión ejecutiva tienes datos que contradicen la dirección estratégica que el CEO acaba de anunciar. Compartirlos causaría incomodidad institucional, pero ocultarlos podría llevar a una decisión errónea.',context:'El CEO es carismático y tiene mucha autoridad. La sala incluye inversores y junta. Los datos son sólidos pero provienen de un piloto pequeño.',options:[
      {text:'Compartes los datos en privado con el CEO después de la reunión para no crear conflicto público.',profile:'pragmatic',outcome:'El CEO recibe la información receptivamente y ajusta la estrategia discretamente.',consequence:'+Gestión política · −Urgencia informacional'},
      {text:'Planteas los datos en la reunión con claridad y respeto, señalando la discrepancia.',profile:'idealist',outcome:'Hay tensión visible. El CEO considera los datos. La decisión mejora.',consequence:'+Verdad institucional · Incomodidad en sala'},
      {text:'Le preguntas al CEO si hay espacio para revisar supuestos antes de cerrar, sin revelar los datos aún.',profile:'relational',outcome:'Abres una puerta sin confrontar. La conversación posterior es más receptiva.',consequence:'+Navegación relacional · Complejidad del proceso'},
      {text:'Documentas los datos y los envías al canal de riesgo corporativo para que queden en registro.',profile:'systemic',outcome:'Los datos quedan trazados. Si la estrategia falla, hay evidencia.',consequence:'+Trazabilidad · −Impacto inmediato'},
    ]},
    {tag:'DILEMA 04',title:'La promesa imposible',body:'Para cerrar un contrato importante, tu equipo implícitamente prometió un plazo de entrega que internamente sabes que es inviable. El cliente firmó basándose en esa expectativa.',context:'El contrato es el mayor del año. El equipo ya está al límite de capacidad. Romper el plazo podría derivar en penalizaciones.',options:[
      {text:'Ejecutas al máximo y esperas cumplir. Si el equipo se esfuerza, quizás se logre.',profile:'pragmatic',outcome:'El equipo trabaja horas extra. Se entrega tarde de todos modos y hay dos bajas por agotamiento.',consequence:'+Intento de cumplir · −Bienestar del equipo'},
      {text:'Contactas al cliente de inmediato, admites la situación y propones un plazo realista.',profile:'idealist',outcome:'El cliente se molesta pero aprecia la honestidad. La relación sobrevive.',consequence:'+Integridad · Tensión con cliente'},
      {text:'Hablas primero con el equipo para entender qué es posible y luego vas al cliente con opciones.',profile:'relational',outcome:'El equipo se siente parte de la solución. La negociación con el cliente es más informada.',consequence:'+Participación del equipo · −Velocidad'},
      {text:'Revisas el proceso de estimación antes de hablar con el cliente para llegar con propuesta sólida.',profile:'systemic',outcome:'La conversación con el cliente se retrasa unos días pero la mejora evita situaciones similares ese año.',consequence:'+Mejora sistémica · −Urgencia inmediata'},
    ]},
    {tag:'DILEMA 05',title:'El éxito invisible',body:'Un proyecto silencioso que lideraste generó ahorros significativos, pero no fue visible ni reconocido institucionalmente. Hay una revisión de desempeño esta semana.',context:'Tu jefe no tiene contexto sobre ese proyecto. Otro colega hizo trabajo visible pero de menor impacto real.',options:[
      {text:'Preparas un resumen del impacto y lo presentas directamente en la reunión de desempeño.',profile:'pragmatic',outcome:'Tu jefe queda impresionado. El reconocimiento llega.',consequence:'+Visibilidad · Percepción de autopromoción'},
      {text:'No mencionas el proyecto si no preguntan. El trabajo habla por sí solo eventualmente.',profile:'idealist',outcome:'El proyecto no se reconoce ese año. Es frustrante pero mantienes coherencia.',consequence:'+Coherencia · −Reconocimiento'},
      {text:'Le cuentas a tu jefe informalmente antes de la reunión, sin hacerlo una confrontación.',profile:'relational',outcome:'Tu jefe tiene contexto cuando llega la revisión. La conversación fluye naturalmente.',consequence:'+Relación con liderazgo · Proceso bien manejado'},
      {text:'Propones un sistema de registro de impactos para que estas contribuciones queden documentadas.',profile:'systemic',outcome:'El sistema tarda en implementarse pero el siguiente año nadie pasa por lo mismo.',consequence:'+Mejora institucional · −Impacto inmediato'},
    ]},
  ]},
  {id:1,icon:'📜',title:'Normativa y Poder',tag:'Cumplimiento ético',desc:'Cuando las reglas chocan con la realidad operativa.',scenarios:[
    {tag:'DILEMA 01',title:'El atajo que todos conocen',body:'Hay un proceso informal que todos usan para agilizar aprobaciones. Funciona, pero no está en el reglamento. Documentarlo implicaría reconocer que se ha violado el proceso formal.',context:'El proceso formal tarda semanas. El informal tarda horas. Nadie ha reclamado por ello.',options:[
      {text:'Documentas el proceso real y propones formalizarlo como política oficial.',profile:'systemic',outcome:'El proceso se formaliza. Toma tiempo pero elimina la ambigüedad.',consequence:'+Claridad normativa · −Velocidad'},
      {text:'Continúas usándolo pero te aseguras de que haya un rastro documental de cada uso.',profile:'pragmatic',outcome:'La eficiencia se mantiene. El rastro documental mitiga el riesgo.',consequence:'+Eficiencia · Riesgo regulatorio latente'},
      {text:'Dejas de usarlo y sigues el proceso formal aunque sea más lento.',profile:'idealist',outcome:'Tu área pierde velocidad. Otros siguen usando el atajo.',consequence:'+Cumplimiento · −Competitividad interna'},
      {text:'Hablas con el equipo para entender por qué el proceso formal es tan lento y atacas la causa.',profile:'relational',outcome:'El diagnóstico revela cuellos de botella reales. La solución tarda pero es más duradera.',consequence:'+Causa raíz · −Impacto inmediato'},
    ]},
    {tag:'DILEMA 02',title:'La auditoría que llega',body:'Un auditor externo está revisando procesos. Tu área tiene un procedimiento que cumple el espíritu pero no la letra de la norma.',context:'Corregirlo antes de la auditoría podría verse como una confesión. No corregirlo, como negligencia.',options:[
      {text:'Corriges el procedimiento y lo documentas antes de la auditoría con fecha visible.',profile:'idealist',outcome:'El auditor lo nota. Lo interpreta positivamente como cultura de mejora continua.',consequence:'+Transparencia · Exposición voluntaria'},
      {text:'Dejas todo como está y esperas el resultado de la auditoría.',profile:'pragmatic',outcome:'El auditor puede o no detectarlo. El resultado es incierto.',consequence:'+Sin acción · Riesgo de observación'},
      {text:'Consultas con el área jurídica antes de tomar cualquier decisión.',profile:'systemic',outcome:'La consulta genera un memo que protege a tu área independientemente del resultado.',consequence:'+Respaldo legal · −Velocidad'},
      {text:'Hablas con el auditor antes de empezar para declarar proactivamente la situación.',profile:'relational',outcome:'El auditor aprecia la transparencia. La observación, si ocurre, es menor.',consequence:'+Relación auditor · Exposición directa'},
    ]},
    {tag:'DILEMA 03',title:'La norma y la excepción',body:'Una política interna prohíbe hacer excepciones en plazos de pago a proveedores. Un proveedor estratégico pasa por dificultades financieras temporales y pide una extensión.',context:'El proveedor lleva 8 años con la empresa. La política existe para evitar preferencias. Otros proveedores podrían pedir lo mismo.',options:[
      {text:'Aplicas la política sin excepción. Las reglas son para todos.',profile:'idealist',outcome:'El proveedor entra en crisis. La empresa pierde al proveedor más confiable en un momento crítico.',consequence:'+Aplicación uniforme · −Relación estratégica'},
      {text:'Apruebas la extensión. La relación de ocho años lo justifica.',profile:'pragmatic',outcome:'El proveedor supera la crisis. Internamente se genera la duda de si las políticas son reales.',consequence:'+Relación preservada · Precedente de excepción'},
      {text:'Buscas con el equipo jurídico si existe un mecanismo formal para casos excepcionales.',profile:'systemic',outcome:'Encuentran una cláusula de fuerza mayor. La extensión se aprueba con respaldo.',consequence:'+Proceso formal · −Velocidad'},
      {text:'Hablas con el proveedor para entender la magnitud real y explorás soluciones conjuntas.',profile:'relational',outcome:'El diálogo revela que la empresa también puede adelantar algunos pagos ya vencidos.',consequence:'+Solución colaborativa · −Tiempo'},
    ]},
    {tag:'DILEMA 04',title:'El poder informal',body:'Una persona con mucha antigüedad en la empresa opera fuera de los procesos formales y usa su red para saltar jerarquías. Es efectivo, pero crea resentimiento y confusión.',context:'Esta persona no es tu reporte directo. Su jefe evita el conflicto. Los resultados son buenos pero el equipo está frustrado.',options:[
      {text:'No intervienes. No es tu área y el resultado habla por sí solo.',profile:'pragmatic',outcome:'La fricción continúa. Eventualmente explota en un conflicto más difícil de resolver.',consequence:'+Sin riesgo personal · −Cultura del equipo'},
      {text:'Hablas directamente con la persona sobre el impacto de operar fuera de los canales formales.',profile:'idealist',outcome:'La conversación es incómoda. La persona lo recibe con resistencia pero algo cambia.',consequence:'+Confrontación directa · Tensión personal'},
      {text:'Hablas con el jefe de esa persona para compartir tu observación sin acusaciones.',profile:'relational',outcome:'El jefe se siente acompañado en algo que ya sabía. Toma acción gradualmente.',consequence:'+Canal correcto · −Velocidad del cambio'},
      {text:'Propones al área de RRHH revisar los canales de comunicación para hacerlos más ágiles.',profile:'systemic',outcome:'El cambio estructural reduce el incentivo de operar informalmente.',consequence:'+Mejora sistémica · −Impacto inmediato'},
    ]},
  ]},
  {id:2,icon:'🤝',title:'Impacto y Comunidad',tag:'Responsabilidad social',desc:'Cuando las decisiones corporativas afectan a quienes no están en la sala.',scenarios:[
    {tag:'DILEMA 01',title:'El proyecto que contamina',body:'Un proyecto rentable tiene externalidades negativas sobre una comunidad cercana. No es ilegal, pero está en un área gris.',context:'La comunidad no ha presentado quejas formales. La empresa tiene buenas relaciones locales.',options:[
      {text:'Implementas controles adicionales para minimizar el impacto aunque no sean obligatorios.',profile:'idealist',outcome:'El costo sube un 8%. La comunidad y el equipo interno lo valoran.',consequence:'+Ética proactiva · −Margen'},
      {text:'Mantienes el proyecto como está y monitoras si aparecen quejas formales.',profile:'pragmatic',outcome:'Sin quejas en el corto plazo. El riesgo reputacional sigue latente.',consequence:'+Rentabilidad · Riesgo reputacional'},
      {text:'Organizas mesas de diálogo con la comunidad antes de tomar cualquier decisión.',profile:'relational',outcome:'La comunidad revela impactos que tu equipo no había medido.',consequence:'+Confianza · −Velocidad del proyecto'},
      {text:'Encargas una evaluación de impacto ambiental y social independiente.',profile:'systemic',outcome:'El informe provee una base objetiva para la decisión.',consequence:'+Evidencia · −Tiempo y costo'},
    ]},
    {tag:'DILEMA 02',title:'El voluntariado y sus límites',body:'Una iniciativa de voluntariado corporativo en escuelas locales se ha vuelto tan popular que los empleados dedican tiempo de trabajo. Los resultados comunitarios son evidentes. El impacto en productividad también.',context:'El 30% del equipo participa. Dos empleados dicen que es lo más significativo de su trabajo. Los resultados están levemente por debajo.',options:[
      {text:'Limitas el voluntariado a tiempo extralaboral. La empresa tiene objetivos que cumplir.',profile:'pragmatic',outcome:'La productividad se recupera. Dos empleados que participaban activamente renuncian.',consequence:'+Productividad · −Compromiso y retención'},
      {text:'Estableces que el voluntariado nunca puede interferir con responsabilidades laborales, sin excepciones.',profile:'idealist',outcome:'La política es clara y justa. La participación baja 40% pero sin tensión sobre límites.',consequence:'+Claridad normativa · −Escala de impacto'},
      {text:'Conversas individualmente con cada empleado activo para acordar balances personalizados.',profile:'relational',outcome:'Casi nadie abandona el programa y la productividad se recupera gradualmente.',consequence:'+Retención · −Escalabilidad'},
      {text:'Propones formalizar el voluntariado como estrategia de RSE con horas asignadas oficialmente.',profile:'systemic',outcome:'Al aprobarse, el programa se escala y se convierte en diferencial de atracción de talento.',consequence:'+Sostenibilidad del programa · −Velocidad'},
    ]},
    {tag:'DILEMA 03',title:'La crisis y la transparencia',body:'Tu empresa cometió un error que afectó a clientes. Fue menor, está corregido, y no hay obligación de comunicarlo. Pero si se sabe por otro medio, el daño reputacional será mayor.',context:'Afectó a 120 clientes temporalmente. Nadie presentó queja formal. Tienes 48 horas antes de que probablemente salga por redes.',options:[
      {text:'Comunicas proactivamente a los 120 clientes con una disculpa y compensación.',profile:'pragmatic',outcome:'Algunos clientes ni sabían del error. Controlaste el mensaje.',consequence:'+Control narrativo · Costo compensatorio'},
      {text:'Haces una declaración pública completa aunque no estés obligado, por principio de transparencia.',profile:'idealist',outcome:'A largo plazo tu empresa es citada como ejemplo de transparencia.',consequence:'+Reputación de integridad · Exposición mediática'},
      {text:'Priorizas llamar personalmente a los clientes más afectados antes de cualquier comunicado masivo.',profile:'relational',outcome:'Los clientes se sienten considerados individualmente.',consequence:'+Fidelización · −Velocidad de cobertura'},
      {text:'Revisas primero tus procesos de monitoreo para evitar recurrencia, luego comunicas.',profile:'systemic',outcome:'La comunicación llega un poco tarde. El proceso de mejora es real.',consequence:'+Mejora sistémica · −Gestión oportuna'},
    ]},
    {tag:'DILEMA 04',title:'El proveedor local vs. el eficiente',body:'Puedes elegir entre un proveedor local de menor escala pero con alto impacto social en la región, o un proveedor externo más eficiente y barato.',context:'La empresa tiene compromisos públicos de desarrollo local. El proveedor externo tiene mejor historial de calidad.',options:[
      {text:'Eliges el proveedor externo. Los costos son reales y el impacto social no es tu responsabilidad principal.',profile:'pragmatic',outcome:'Los costos bajan. El proveedor local pierde su mayor contrato y reduce personal.',consequence:'+Eficiencia económica · −Impacto social comprometido'},
      {text:'Eliges el proveedor local aunque sea más caro. El compromiso público no es negociable.',profile:'idealist',outcome:'El costo impacta el presupuesto. El compromiso social se honra.',consequence:'+Coherencia con compromisos · −Eficiencia económica'},
      {text:'Propones al proveedor local un plan de 12 meses para alcanzar estándares competitivos con acompañamiento.',profile:'relational',outcome:'Al año, el proveedor local es competitivo y la relación es sólida.',consequence:'+Desarrollo de proveedor · −Velocidad'},
      {text:'Propones un contrato mixto: parte al proveedor local, parte al externo, con evaluación a 18 meses.',profile:'systemic',outcome:'Los datos del período permiten tomar una decisión más informada.',consequence:'+Decisión basada en evidencia · −Simplicidad'},
    ]},
  ]},
  {id:3,icon:'🔍',title:'Integridad y Zonas Grises',tag:'Anticorrupción',desc:'Donde la integridad se prueba en los matices, no en los extremos.',scenarios:[
    {tag:'DILEMA 01',title:'El regalo y su contexto',body:'Un proveedor clave te envía un regalo de fin de año de valor moderado después de cerrar exitosamente un contrato. La política prohíbe regalos. La relación es genuina y el gesto parece sincero.',context:'El proveedor ha sido excelente. La relación tiene tres años. Devolver el regalo podría sentirse como un insulto cultural.',options:[
      {text:'Aceptas el regalo. La política es genérica y la relación y el contexto lo justifican.',profile:'pragmatic',outcome:'La relación se mantiene. Pero has establecido que la política es negociable según la relación.',consequence:'+Relación de proveedor · Precedente personal'},
      {text:'Devuelves el regalo con una nota amable explicando la política de la empresa.',profile:'idealist',outcome:'El proveedor comprende y respeta la posición. Tienes certeza absoluta sobre tu integridad.',consequence:'+Claridad ética · Incomodidad puntual'},
      {text:'Le agradeces personalmente y le explicas por qué no puedes aceptarlo, enfatizando que valoras la relación.',profile:'relational',outcome:'El proveedor aprecia el gesto de explicar en vez de solo devolver.',consequence:'+Relación preservada · Gestión del momento'},
      {text:'Reportas el regalo a compliance para que te orienten según la política exacta.',profile:'systemic',outcome:'Lo devuelves con respaldo institucional. El proceso establece un precedente documentado.',consequence:'+Precedente institucional · Proceso más largo'},
    ]},
    {tag:'DILEMA 02',title:'La ventaja no buscada',body:'En una licitación, una cláusula ambigua podría interpretarse a tu favor, pero probablemente no fue la intención del evaluador. Si preguntas, cierras esa ventaja.',context:'La licitación es estratégica. Tu propuesta es competitiva incluso sin la ventaja.',options:[
      {text:'No preguntas. La ambigüedad es parte del proceso y aprovecharla es legítimo.',profile:'pragmatic',outcome:'Ganas la licitación. Meses después el evaluador menciona la cláusula. La relación queda marcada.',consequence:'+Resultado de licitación · −Confianza relacional'},
      {text:'Preguntas al evaluador para aclarar, sabiendo que perderás la ventaja.',profile:'idealist',outcome:'Pierdes la ventaja pero tu propuesta sigue siendo competitiva.',consequence:'+Reputación de integridad · Sin ventaja táctica'},
      {text:'Conversas con el evaluador sobre la cláusula de manera informal, sin revelar tu interpretación.',profile:'relational',outcome:'La conversación es ambigua. No queda claro si lograste aclaración.',consequence:'Resultado ambiguo · Zona gris'},
      {text:'Consultas internamente con tu equipo legal antes de cualquier acción externa.',profile:'systemic',outcome:'Legal determina que preguntar es lo correcto. Lo haces formalmente y queda documentado.',consequence:'+Proceso documentado · −Velocidad'},
    ]},
    {tag:'DILEMA 03',title:'El testigo incómodo',body:'Ves a un colega de otra área haciendo algo que podría ser una irregularidad, pero también podría tener una explicación legítima. No te incumbe directamente y no tienes certeza.',context:'Ambos tienen el mismo nivel jerárquico. No tienen relación cercana. El área tiene un ambiente político complicado.',options:[
      {text:'No haces nada. Sin certeza y sin incumbencia, actuar puede generarte problemas sin justificación.',profile:'pragmatic',outcome:'Nadie sabe que lo viste. Meses después una auditoría detecta la irregularidad.',consequence:'+Sin riesgo personal · Incomodidad retrospectiva'},
      {text:'Lo reportas al canal de denuncias con lo que observaste, dejando la investigación a quien corresponde.',profile:'idealist',outcome:'El canal investiga. La irregularidad resulta ser menor con explicación razonable.',consequence:'+Uso correcto del canal · Resultado incierto'},
      {text:'Te acercas directamente al colega y le preguntas sobre lo que observaste.',profile:'relational',outcome:'La conversación es tensa. Hay una explicación razonable. La situación se aclara sin escalar.',consequence:'+Diálogo directo · Relación afectada'},
      {text:'Documentas lo que observaste sin actuar de inmediato, para tener registro si el patrón continúa.',profile:'systemic',outcome:'Acumulas más observaciones. Ahora sí tienes evidencia suficiente para reportar con solidez.',consequence:'+Evidencia sólida · −Acción temprana'},
    ]},
    {tag:'DILEMA 04',title:'El dato conveniente',body:'Un análisis que presentarás mañana tiene un dato que, si lo incluyes tal cual, debilita tu argumento. No es incorrecto, pero su contexto cambia el panorama.',context:'La decisión que impulsa la presentación es estratégica. El dato proviene de un estudio pequeño.',options:[
      {text:'Omites el dato. No es determinante y la presentación debe ser clara y convincente.',profile:'pragmatic',outcome:'La decisión se toma en la dirección que propones. Meses después alguien encuentra el estudio.',consequence:'+Claridad del argumento · −Trazabilidad'},
      {text:'Incluyes el dato con su contexto completo, aunque debilite la presentación.',profile:'idealist',outcome:'La presentación es más matizada. La decisión tarda más pero está mejor fundamentada.',consequence:'+Rigor analítico · −Fuerza del argumento'},
      {text:'Mencionas el dato pero lo enmarcan junto al equipo como una limitación conocida del análisis.',profile:'relational',outcome:'La audiencia aprecia la honestidad. La confianza en tu equipo como fuente confiable aumenta.',consequence:'+Credibilidad · −Simplicidad del mensaje'},
      {text:'Propones separar la presentación ejecutiva del análisis técnico completo con todos los datos.',profile:'systemic',outcome:'Los tomadores de decisión tienen un resumen claro y los técnicos tienen el análisis completo.',consequence:'+Estructura de información · −Tiempo de preparación'},
    ]},
  ]},
  {id:4,icon:'🌱',title:'Cultura Viva',tag:'Clima organizacional',desc:'Las decisiones cotidianas que construyen o destruyen una cultura.',scenarios:[
    {tag:'DILEMA 01',title:'La reunión que sobrevive a su propósito',body:'Tu equipo tiene una reunión semanal de 2 horas que nadie quiere pero todos asisten. Podría hacerse en 20 minutos. Sin embargo, dos personas dicen que es su único espacio de conexión.',context:'El equipo trabaja en modalidad híbrida. Las conexiones informales son escasas. Hay presión de productividad.',options:[
      {text:'Reduces la reunión a lo estrictamente necesario. El tiempo es el recurso más escaso.',profile:'pragmatic',outcome:'La productividad sube. Dos personas sienten que perdieron su espacio de pertenencia.',consequence:'+Eficiencia · −Cohesión para algunos'},
      {text:'Eliminas la reunión y creas un protocolo escrito. Las relaciones se construyen trabajando.',profile:'idealist',outcome:'El equipo adapta. Las conexiones ocurren de otras formas para quienes las buscan.',consequence:'+Estructura · −Espacio informal'},
      {text:'Preguntas al equipo qué valoran de la reunión y rediseñas el formato basándote en eso.',profile:'relational',outcome:'El proceso revela necesidades heterogéneas. El nuevo formato satisface mejor a más personas.',consequence:'+Diseño participativo · −Velocidad'},
      {text:'Propones un experimento de 4 semanas con formato reducido para evaluar con datos el impacto.',profile:'systemic',outcome:'Los datos muestran que la productividad sube pero la satisfacción baja. La decisión final es más informada.',consequence:'+Decisión basada en datos · −Tiempo de experimento'},
    ]},
    {tag:'DILEMA 02',title:'El reconocimiento y sus dilemas',body:'Tienes que reconocer a alguien del equipo por un logro. La persona más contribuyente técnicamente es introvertida y pidió explícitamente no ser destacada públicamente.',context:'Ambas contribuciones fueron esenciales. El equipo de 12 personas observará cómo lo manejas.',options:[
      {text:'Reconoces a quien lideró la coordinación. El liderazgo visible necesita refuerzo cultural.',profile:'pragmatic',outcome:'La coordinadora queda satisfecha. La técnica observa que su petición fue respetada pero su contribución quedó invisible.',consequence:'+Cultura de liderazgo visible · −Reconocimiento técnico'},
      {text:'Reconoces públicamente a ambas, respetando la petición de la técnica tanto como sea posible.',profile:'idealist',outcome:'Buscas el equilibrio. La persona queda moderadamente incómoda pero comprende el intento.',consequence:'+Reconocimiento equitativo · Incomodidad moderada'},
      {text:'Hablas primero con la persona técnica para encontrar juntos una forma de reconocerla que le sea cómoda.',profile:'relational',outcome:'Encuentran una fórmula: reconocimiento escrito interno.',consequence:'+Respeto a la persona · −Visibilidad pública'},
      {text:'Usas el caso para introducir un sistema de reconocimiento diversificado que no dependa del elogio público.',profile:'systemic',outcome:'El sistema cambia estructuralmente cómo el equipo entiende y celebra el valor.',consequence:'+Cambio cultural · −Respuesta inmediata'},
    ]},
    {tag:'DILEMA 03',title:'Los valores en la pared',body:'El proceso de definición de valores produjo una lista que nadie vive. Cambiarlos requiere un proceso largo. Ignorarlos crea cinismo.',context:'El proceso costó tiempo y dinero hace dos años. Hay personas que trabajaron en él con genuino compromiso.',options:[
      {text:'Te enfocas en comportamientos concretos esperados, sin mencionar los valores formales.',profile:'pragmatic',outcome:'Los comportamientos esperados son claros. Con el tiempo hay una brecha entre lo oficial y lo real.',consequence:'+Claridad práctica · −Coherencia institucional'},
      {text:'Propones formalmente revisar y actualizar los valores, aunque genere fricción.',profile:'idealist',outcome:'El proceso reabre debates. El resultado final es más auténtico.',consequence:'+Autenticidad · Conflicto del proceso'},
      {text:'Comienzas a referirte a los valores en conversaciones cotidianas de forma genuina, sin forzarlos.',profile:'relational',outcome:'Poco a poco las conversaciones sobre valores se vuelven orgánicas.',consequence:'+Adopción natural · −Velocidad'},
      {text:'Propones medir trimestralmente el nivel de identificación de los empleados con los valores.',profile:'systemic',outcome:'Los datos revelan que menos del 30% se identifica. El argumento para una revisión se vuelve objetivo.',consequence:'+Evidencia para el cambio · −Acción inmediata'},
    ]},
    {tag:'DILEMA 04',title:'El chiste que no fue chiste',body:'En una reunión, alguien hace un comentario que varios ríen pero que una persona recibe como ofensivo. Nadie más lo nota.',context:'El ambiente del equipo suele ser informal. No existe un protocolo claro de conducta.',options:[
      {text:'No intervienes. Hablar podría generar más incomodidad que la broma misma.',profile:'pragmatic',outcome:'La persona afectada empieza a participar menos. Nadie lo conecta con ese día.',consequence:'+Evitación del conflicto · −Seguridad psicológica'},
      {text:'Detienes la reunión y nombras que el comentario puede haber sido incómodo para algunos.',profile:'idealist',outcome:'Hay silencio incómodo. La persona afectada te agradece después en privado.',consequence:'+Estándar de conducta · Tensión inmediata'},
      {text:'Hablas después con la persona afectada para ver cómo está y decidir juntos si quiere que se haga algo.',profile:'relational',outcome:'La persona se siente acompañada. Decide no escalar. La confianza en ti aumenta.',consequence:'+Apoyo interpersonal · −Resolución colectiva'},
      {text:'Propones al equipo construir un acuerdo de conducta en la próxima reunión.',profile:'systemic',outcome:'El proceso genera un documento compartido que cambia la dinámica del equipo gradualmente.',consequence:'+Cambio cultural · −Acción inmediata'},
    ]},
    {tag:'DILEMA 05',title:'La rotación que duele',body:'Tu mejor colaborador recibió una oferta externa. No puedes igualar el salario. Puedes ofrecerle un rol de mayor responsabilidad que aún no está del todo definido.',context:'Perder esta persona afecta un proyecto crítico. El equipo ya está al límite.',options:[
      {text:'Creas el rol aunque no esté definido completamente. Es mejor que perderlo.',profile:'pragmatic',outcome:'La persona se queda. El rol no está claro y genera fricción con el equipo en los siguientes meses.',consequence:'+Retención · −Claridad organizacional'},
      {text:'Eres transparente: no puedes igualar el salario ni crear un rol que no existe realmente.',profile:'idealist',outcome:'La persona se va. El equipo siente el impacto pero aprecia la honestidad.',consequence:'+Honestidad · −Retención'},
      {text:'Tienes una conversación profunda con la persona sobre qué valora además del salario.',profile:'relational',outcome:'Descubres que hay otros factores. Juntos diseñan un acuerdo que la persona acepta.',consequence:'+Solución personalizada · −Escalabilidad'},
      {text:'Propones revisar la política de retención para que este tipo de situaciones no dependan de improvisación.',profile:'systemic',outcome:'La política tarda. Esta persona se va pero el siguiente caso tiene un protocolo claro.',consequence:'+Mejora estructural · −Impacto inmediato'},
    ]},
  ]},
];

// ─── HELPERS ───
function shade(hex, pct) {
  try {
    const n = parseInt(hex.replace('#',''), 16), a = Math.round(2.55 * pct);
    const R = Math.max(0,Math.min(255,(n>>16)+a)), G = Math.max(0,Math.min(255,((n>>8)&0xFF)+a)), B = Math.max(0,Math.min(255,(n&0xFF)+a));
    return '#'+(0x1000000+R*65536+G*256+B).toString(16).slice(1);
  } catch(e) { return hex; }
}
function shuffle(arr) {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;
}
function domProfile(counts) {
  return Object.keys(counts).reduce((a,b)=>counts[a]>=counts[b]?a:b,'pragmatic');
}

// ─── FIX 1: CHARACTER SVG — pelo integrado al personaje, no como capa flotante ───
function charSVG(cfg, w, h, anim) {
  const { skin=SKINS[1], hair=HAIRS[0], outfit=OUTFITS[0], hairstyle='short', expression='happy' } = cfg;
  const od = shade(outfit,-28), skd = shade(skin,-20), hd = shade(hair,-30);

  // Pelo DETRÁS del cuerpo (strands detallados por estilo)
  let hairBack = '';
  if (hairstyle === 'medium') {
    hairBack = `
      <path d="M27 42 Q23 55 23 68 Q23 76 27 80" stroke="${hd}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M25 42 Q20 58 21 72 Q22 78 26 84" stroke="${hair}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M53 42 Q57 55 57 68 Q57 76 53 80" stroke="${hd}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M55 42 Q60 58 59 72 Q58 78 54 84" stroke="${hair}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (hairstyle === 'long') {
    hairBack = `
      <path d="M27 42 Q20 60 18 76 Q17 88 22 96" stroke="${hd}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M25 42 Q17 64 16 80 Q15 92 20 100" stroke="${hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M53 42 Q60 60 62 76 Q63 88 58 96" stroke="${hd}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M55 42 Q63 64 64 80 Q65 92 60 100" stroke="${hair}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }

  // Pelo ENCIMA de la cara (tope)
  let hairTop = '';
  if (hairstyle === 'short') {
    hairTop = `<path d="M24 22 Q26 8 40 6 Q54 8 56 22 L54 15 Q50 4 40 3 Q30 4 26 15Z" fill="${hair}"/>
      <ellipse cx="40" cy="7" rx="14" ry="5" fill="${hair}"/>`;
  } else if (hairstyle === 'medium') {
    hairTop = `<path d="M24 24 Q26 4 40 3 Q54 4 56 24 L56 30 Q52 38 40 39 Q28 38 24 30Z" fill="${hair}"/>
      <path d="M24 28 Q23 18 26 12 Q30 5 40 4 Q50 5 54 12 Q57 18 56 28" fill="${hd}" opacity="0.5"/>`;
  } else if (hairstyle === 'long') {
    hairTop = `<path d="M24 26 Q26 4 40 3 Q54 4 56 26 L56 34 Q52 42 40 43 Q28 42 24 34Z" fill="${hair}"/>
      <path d="M25 30 Q24 16 28 10 Q33 4 40 3 Q47 4 52 10 Q56 16 55 30" fill="${hd}" opacity="0.45"/>`;
  } else { // curly
    hairTop = `
      <circle cx="27" cy="16" r="7.5" fill="${hair}"/>
      <circle cx="33" cy="9"  r="7.5" fill="${hair}"/>
      <circle cx="40" cy="6"  r="8"   fill="${hair}"/>
      <circle cx="47" cy="9"  r="7.5" fill="${hair}"/>
      <circle cx="53" cy="16" r="7.5" fill="${hair}"/>
      <circle cx="29" cy="23" r="6"   fill="${hair}"/>
      <circle cx="51" cy="23" r="6"   fill="${hair}"/>
      <circle cx="40" cy="11" r="6"   fill="${hd}" opacity="0.4"/>`;
  }

  // Ojos y boca por expresión
  let eyeL = `<ellipse cx="34" cy="27" rx="3" ry="3.5" fill="${shade(skin,-60)}"/><circle cx="33.2" cy="26" r="1.2" fill="white"/>`;
  let eyeR = `<ellipse cx="46" cy="27" rx="3" ry="3.5" fill="${shade(skin,-60)}"/><circle cx="45.2" cy="26" r="1.2" fill="white"/>`;
  let mouth = '', extra = '';

  if (expression==='happy') {
    mouth = `<path d="M35 35 Q40 40 45 35" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  } else if (expression==='serious') {
    eyeL = `<ellipse cx="34" cy="27.5" rx="3" ry="2.8" fill="${shade(skin,-60)}"/><circle cx="33.2" cy="27" r="1.1" fill="white"/>`;
    eyeR = `<ellipse cx="46" cy="27.5" rx="3" ry="2.8" fill="${shade(skin,-60)}"/><circle cx="45.2" cy="27" r="1.1" fill="white"/>`;
    extra = `<path d="M31 23 L36 25" stroke="${skd}" stroke-width="1.2" stroke-linecap="round"/><path d="M49 23 L44 25" stroke="${skd}" stroke-width="1.2" stroke-linecap="round"/>`;
    mouth = `<line x1="36" y1="36" x2="44" y2="36" stroke="${skd}" stroke-width="1.8" stroke-linecap="round"/>`;
  } else if (expression==='surprised') {
    eyeL = `<circle cx="34" cy="27" r="4" fill="${shade(skin,-60)}"/><circle cx="33" cy="26" r="1.5" fill="white"/>`;
    eyeR = `<circle cx="46" cy="27" r="4" fill="${shade(skin,-60)}"/><circle cx="45" cy="26" r="1.5" fill="white"/>`;
    mouth = `<ellipse cx="40" cy="37" rx="3.5" ry="3" fill="${skd}"/>`;
  } else if (expression==='thinking') {
    eyeL = `<ellipse cx="34" cy="27" rx="3" ry="3.5" fill="${shade(skin,-60)}"/><circle cx="34.8" cy="26.5" r="1.2" fill="white"/>`;
    eyeR = `<ellipse cx="46" cy="27" rx="3" ry="3.5" fill="${shade(skin,-60)}"/><circle cx="46.8" cy="26.5" r="1.2" fill="white"/>`;
    mouth = `<path d="M36 36 Q39 35 43 36.5" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    extra = `<circle cx="53" cy="14" r="2.2" fill="${skd}" opacity="0.4"/><circle cx="57" cy="11" r="1.5" fill="${skd}" opacity="0.25"/>`;
  } else if (expression==='wink') {
    eyeR = `<path d="M43.5 28 Q46 25 48.5 28" stroke="${shade(skin,-60)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    mouth = `<path d="M35 35 Q40 40.5 45 35" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }

  const nose = `<ellipse cx="40" cy="31.5" rx="1.4" ry="0.9" fill="${skd}"/>`;
  const animAttr = anim ? 'style="animation:charBob 3s ease-in-out infinite"' : '';

  return `<svg width="${w}" height="${h}" viewBox="0 0 80 105" ${animAttr} xmlns="http://www.w3.org/2000/svg">
    <style>@keyframes charBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}</style>
    ${hairBack}
    <rect x="22" y="44" width="36" height="38" rx="8" fill="${outfit}"/>
    <rect x="10" y="47" width="12" height="26" rx="6" fill="${outfit}"/>
    <rect x="58" y="47" width="12" height="26" rx="6" fill="${outfit}"/>
    <rect x="30" y="78" width="8" height="16" rx="4" fill="${od}"/>
    <rect x="42" y="78" width="8" height="16" rx="4" fill="${od}"/>
    <rect x="35" y="38" width="10" height="9" rx="4" fill="${skin}"/>
    ${hairTop}
    <circle cx="40" cy="27" r="16" fill="${skin}"/>
    ${eyeL}${eyeR}${nose}${mouth}${extra}
  </svg>`;
}

// ─── MINIGAME ENGINE (snake, minesweeper, breakout, runner) ───
const CV_SIZE = 440;

function useCanvasMinigame(canvasRef, type, onEnd) {
  const stateRef = useRef({});
  const intervalRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    document.onkeydown = null;
  }, []);

  const start = useCallback(() => {
    stop();
    runningRef.current = true;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const clear = (col='#0D0D14') => { ctx.fillStyle=col; ctx.fillRect(0,0,CV_SIZE,CV_SIZE); };
    const end = (won, score) => { stop(); onEnd(score||0); };

    if (type==='snake') {
      const COLS=16, CELL=CV_SIZE/COLS;
      let snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}];
      let dir={x:1,y:0}, dirNext={x:1,y:0}, food, score=0;
      const place=()=>{let p;do{p={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*COLS)};}while(snake.some(s=>s.x===p.x&&s.y===p.y));food=p;};
      place();
      document.onkeydown=e=>{const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};if(m[e.key]){const d=m[e.key];if(d.x!==-dir.x||d.y!==-dir.y)dirNext=d;e.preventDefault();}};
      let tx=null,ty=null;
      cv.ontouchstart=e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;};
      cv.ontouchend=e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy))dirNext=dx>0?{x:1,y:0}:{x:-1,y:0};else dirNext=dy>0?{x:0,y:1}:{x:0,y:-1};tx=null;ty=null;};
      const draw=()=>{clear();ctx.strokeStyle='rgba(201,168,76,0.07)';ctx.lineWidth=0.5;for(let i=0;i<=COLS;i++){ctx.beginPath();ctx.moveTo(i*CELL,0);ctx.lineTo(i*CELL,CV_SIZE);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*CELL);ctx.lineTo(CV_SIZE,i*CELL);ctx.stroke();}ctx.fillStyle='#C9A84C';ctx.beginPath();ctx.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,CELL/2-3,0,Math.PI*2);ctx.fill();snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#F5F0E8':'rgba(245,240,232,0.68)';ctx.fillRect(s.x*CELL+1,s.y*CELL+1,CELL-2,CELL-2);});};
      intervalRef.current=setInterval(()=>{if(!runningRef.current)return;dir=dirNext;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.x>=COLS||h.y<0||h.y>=COLS||snake.some(s=>s.x===h.x&&s.y===h.y)){draw();end(false,score);return;}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;place();}else snake.pop();draw();},200);

    } else if (type==='minesweeper') {
      const ROWS=11,COLS=11,MINES=10,CELL=Math.floor(CV_SIZE/COLS);
      let board=Array.from({length:ROWS},()=>new Array(COLS).fill(0));
      let revealed=new Set(),flagged=new Set(),firstClick=true,minePos=null;
      // FIX: Draw flags as red triangles (no emoji rendering issues)
      const draw=()=>{
        ctx.fillStyle='#13131C';ctx.fillRect(0,0,CV_SIZE,CV_SIZE);
        for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
          const k=r*COLS+c,x=c*CELL,y=r*CELL;
          if(revealed.has(k)){
            ctx.fillStyle=minePos&&minePos.has(k)?'rgba(160,74,47,0.45)':'rgba(245,240,232,0.09)';
            ctx.fillRect(x+1,y+1,CELL-2,CELL-2);
            if(minePos&&minePos.has(k)){
              // draw mine as circle with lines
              ctx.fillStyle='#333';ctx.beginPath();ctx.arc(x+CELL/2,y+CELL/2,CELL*0.28,0,Math.PI*2);ctx.fill();
              ctx.strokeStyle='#555';ctx.lineWidth=1.5;
              for(let a=0;a<8;a++){const aa=a*Math.PI/4;ctx.beginPath();ctx.moveTo(x+CELL/2+Math.cos(aa)*CELL*0.28,y+CELL/2+Math.sin(aa)*CELL*0.28);ctx.lineTo(x+CELL/2+Math.cos(aa)*CELL*0.42,y+CELL/2+Math.sin(aa)*CELL*0.42);ctx.stroke();}
              ctx.fillStyle='rgba(255,80,40,0.7)';ctx.beginPath();ctx.arc(x+CELL/2,y+CELL/2,CELL*0.28,0,Math.PI*2);ctx.fill();
            } else if(board[r][c]>0){
              const NC=['','#4A90D9','#4A7C5E','#A04A2F','#5A4A7C','#8B1A1A','#2E7777','#111','#888'];
              ctx.fillStyle=NC[board[r][c]]||'#C9A84C';ctx.font=`bold ${CELL-8}px DM Sans`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(board[r][c],x+CELL/2,y+CELL/2+1);
            }
          } else {
            ctx.fillStyle='rgba(245,240,232,0.055)';ctx.fillRect(x+1,y+1,CELL-2,CELL-2);
            if(flagged.has(k)){
              // FIX: Draw flag as geometric shape (no emoji) — red triangle + pole
              const px=x+CELL*0.35, py=y+CELL*0.22, pw=CELL*0.32;
              ctx.strokeStyle='#aaa';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,y+CELL*0.76);ctx.stroke();
              ctx.fillStyle='#E53935';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+pw,py+pw*0.4);ctx.lineTo(px,py+pw*0.8);ctx.closePath();ctx.fill();
              ctx.fillStyle='#F5F0E8';ctx.beginPath();ctx.arc(px,y+CELL*0.78,1.5,0,Math.PI*2);ctx.fill();
            }
          }
          ctx.strokeStyle='rgba(201,168,76,0.1)';ctx.lineWidth=0.5;ctx.strokeRect(x,y,CELL,CELL);
        }
      };
      const placeMines=(sr,sc)=>{minePos=new Set();while(minePos.size<MINES){const r=Math.floor(Math.random()*ROWS),c=Math.floor(Math.random()*COLS);if(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1)continue;minePos.add(r*COLS+c);}for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(minePos.has(r*COLS+c)){board[r][c]=-1;continue;}let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&minePos.has(nr*COLS+nc))n++;}board[r][c]=n;}};
      const flood=(r,c)=>{const k=r*COLS+c;if(revealed.has(k)||flagged.has(k))return;revealed.add(k);if(board[r][c]===0)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS)flood(nr,nc);}};
      const checkWin=()=>{const safe=ROWS*COLS-MINES;if([...revealed].filter(k=>!minePos||!minePos.has(k)).length>=safe){draw();end(true,safe*5);}};
      const cellAt=(e)=>{const rect=cv.getBoundingClientRect();const sc=CV_SIZE/rect.width;const c=Math.floor((e.clientX-rect.left)*sc/CELL),r=Math.floor((e.clientY-rect.top)*sc/CELL);if(r<0||r>=ROWS||c<0||c>=COLS)return null;return{r,c};};
      cv.onclick=(e)=>{if(!runningRef.current)return;const pos=cellAt(e);if(!pos)return;const{r,c}=pos;if(flagged.has(r*COLS+c))return;if(firstClick){firstClick=false;placeMines(r,c);}if(minePos&&minePos.has(r*COLS+c)){[...minePos].forEach(k=>revealed.add(k));draw();end(false,[...revealed].length*3);return;}flood(r,c);checkWin();draw();};
      cv.oncontextmenu=(e)=>{e.preventDefault();const pos=cellAt(e);if(!pos)return;const{r,c}=pos;const k=r*COLS+c;if(!revealed.has(k)){flagged.has(k)?flagged.delete(k):flagged.add(k);draw();}};
      draw();

    } else if (type==='breakout') {
      const BW=CV_SIZE,BH=CV_SIZE,PW=90,PH=13,PY=BH-36;
      const BCOLS=8,BROWS=5,BKW=Math.floor((BW-12)/BCOLS),BKH=22;
      const COLORS=['#C9A84C','#4A7C5E','#1A3A5C','#A04A2F','#5A4A7C'];
      let padX=BW/2-PW/2,ballX=BW/2,ballY=PY-18,bdx=3.2,bdy=-3.2,lives=3,score=0;
      let blocks=[];
      for(let r=0;r<BROWS;r++)for(let c=0;c<BCOLS;c++)blocks.push({x:6+c*BKW,y:36+r*(BKH+5),w:BKW-4,h:BKH,alive:true,color:COLORS[r%COLORS.length]});
      cv.onmousemove=e=>{const rect=cv.getBoundingClientRect();padX=Math.max(0,Math.min(BW-PW,(e.clientX-rect.left)*(CV_SIZE/rect.width)-PW/2));};
      cv.ontouchmove=e=>{e.preventDefault();const rect=cv.getBoundingClientRect();padX=Math.max(0,Math.min(BW-PW,(e.touches[0].clientX-rect.left)*(CV_SIZE/rect.width)-PW/2));};
      const draw=()=>{clear();blocks.forEach(b=>{if(!b.alive)return;ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(b.x,b.y,b.w,4);});ctx.fillStyle='#C9A84C';ctx.fillRect(padX,PY,PW,PH);ctx.fillStyle='#F5F0E8';ctx.beginPath();ctx.arc(ballX,ballY,8,0,Math.PI*2);ctx.fill();for(let i=0;i<lives;i++){ctx.fillStyle='#C9A84C';ctx.beginPath();ctx.arc(14+i*22,BH-14,6,0,Math.PI*2);ctx.fill();}};
      intervalRef.current=setInterval(()=>{
        if(!runningRef.current)return;ballX+=bdx;ballY+=bdy;
        if(ballX<=7||ballX>=BW-7)bdx*=-1;if(ballY<=7)bdy*=-1;
        if(ballY>=BH+12){lives--;if(lives<=0){draw();end(false,score);return;}ballX=BW/2;ballY=PY-18;bdy=-Math.abs(bdy);}
        if(ballY+8>=PY&&ballY<=PY+PH&&ballX>=padX-6&&ballX<=padX+PW+6){bdy=-Math.abs(bdy);bdx=((ballX-(padX+PW/2))/(PW/2))*4.5;}
        let alive=0;
        for(const b of blocks){if(!b.alive)continue;alive++;if(ballX+8>b.x&&ballX-8<b.x+b.w&&ballY+8>b.y&&ballY-8<b.y+b.h){b.alive=false;score+=10;const ol=ballX+8-b.x,or2=b.x+b.w-(ballX-8),ot=ballY+8-b.y,ob=b.y+b.h-(ballY-8);if(Math.min(ol,or2)<Math.min(ot,ob))bdx*=-1;else bdy*=-1;break;}}
        if(alive===0){draw();end(true,score+lives*50);return;}draw();
      },14);

    } else if (type==='runner') {
      // ══════════════════════════════════════════════════
      // 🌙 ZARIGÜEYA RUNNER — entorno nocturno detallado
      // ══════════════════════════════════════════════════
      const W=CV_SIZE, H=CV_SIZE;
      const GROUND_Y = H - 80;   // where ground surface is
      const POSSUM_X = 70;       // fixed horizontal position

      let possumY = GROUND_Y;    // feet position
      let vy = 0;
      let onGround = true;
      let speed = 3.8;
      let score = 0;
      let frame = 0;
      let dead = false;
      let groundOffset = 0;
      let legPhase = 0;           // for walking animation
      let tailWag = 0;            // tail oscillation
      let blinkTimer = 0;         // eye blink

      // Obstacles: rocks, logs, thorny bushes, trash cans (3 types)
      let obs = [];
      let spawnTimer = 0;
      let spawnInterval = 95;

      // Background parallax layers
      const stars = Array.from({length:60}, () => ({
        x: Math.random()*W, y: Math.random()*(GROUND_Y*0.75),
        r: Math.random()*1.8+0.3, twinkle: Math.random()*Math.PI*2
      }));
      const bgTrees = Array.from({length:8}, (_, i) => ({
        x: i*(W/7)+Math.random()*40,
        h: 80+Math.random()*120,
        w: 18+Math.random()*22,
        speed: 0.4+Math.random()*0.3
      }));
      const midTrees = Array.from({length:5}, (_, i) => ({
        x: i*(W/4)+Math.random()*50,
        h: 55+Math.random()*70,
        w: 12+Math.random()*16,
        speed: 0.9+Math.random()*0.4
      }));
      // Fireflies
      const fireflies = Array.from({length:12}, () => ({
        x: Math.random()*W, y: Math.random()*(GROUND_Y-40)+20,
        vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.4,
        phase: Math.random()*Math.PI*2
      }));

      const jump = () => {
        if (!runningRef.current || dead) return;
        if (onGround) { vy = -13.5; onGround = false; }
      };
      document.onkeydown = e => { if (e.code==='Space'||e.key===' ') { e.preventDefault(); jump(); } };
      cv.onclick = jump;
      cv.ontouchstart = e => { e.preventDefault(); jump(); };

      // ── DRAW BACKGROUND ──────────────────────────────
      function drawBG() {
        // Night sky gradient
        const sky = ctx.createLinearGradient(0,0,0,GROUND_Y);
        sky.addColorStop(0, '#050814');
        sky.addColorStop(0.5, '#0D1128');
        sky.addColorStop(1, '#1A1C35');
        ctx.fillStyle = sky; ctx.fillRect(0,0,W,GROUND_Y);

        // Moon with halo
        const mx=W*0.82, my=55;
        ctx.save();
        const halo = ctx.createRadialGradient(mx,my,18,mx,my,55);
        halo.addColorStop(0,'rgba(255,248,200,0.18)');
        halo.addColorStop(1,'rgba(255,248,200,0)');
        ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(mx,my,55,0,Math.PI*2); ctx.fill();
        // moon glow
        ctx.shadowColor='#fffaaa'; ctx.shadowBlur=22;
        ctx.fillStyle='#FFF8C0'; ctx.beginPath(); ctx.arc(mx,my,24,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#FFFDE8'; ctx.beginPath(); ctx.arc(mx,my,18,0,Math.PI*2); ctx.fill();
        // crater details
        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(200,190,120,0.35)';
        ctx.beginPath(); ctx.arc(mx+7,my-6,5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(mx-8,my+5,3.5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(mx+3,my+9,2.5,0,Math.PI*2); ctx.fill();
        ctx.restore();

        // Stars with twinkle
        stars.forEach(s => {
          s.twinkle += 0.04;
          const alpha = 0.4 + Math.sin(s.twinkle)*0.55;
          ctx.globalAlpha = Math.max(0,alpha);
          ctx.fillStyle = '#FFFDE8';
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Distant tree silhouettes (slowest layer)
        bgTrees.forEach(t => {
          if (dead) return; // freeze when dead
          t.x -= t.speed;
          if (t.x + t.w < 0) t.x = W + t.w + Math.random()*60;
          ctx.globalAlpha = 0.22;
          drawTreeSil(t.x, GROUND_Y, t.w, t.h, '#1A1535');
          ctx.globalAlpha = 1;
        });

        // Mid tree silhouettes
        midTrees.forEach(t => {
          if (dead) return;
          t.x -= t.speed;
          if (t.x + t.w < 0) t.x = W + t.w + Math.random()*40;
          ctx.globalAlpha = 0.45;
          drawTreeSil(t.x, GROUND_Y, t.w, t.h, '#110E2A');
          ctx.globalAlpha = 1;
        });

        // Fireflies
        fireflies.forEach(f => {
          if (!dead) { f.x+=f.vx; f.y+=f.vy; f.phase+=0.07; }
          if (f.x<0) f.x=W; if (f.x>W) f.x=0;
          if (f.y<10) f.y=10; if (f.y>GROUND_Y-20) f.y=GROUND_Y-20;
          const g2 = Math.abs(Math.sin(f.phase));
          ctx.save();
          ctx.globalAlpha = g2*0.9;
          ctx.fillStyle='#CCFF66'; ctx.shadowColor='#88FF00'; ctx.shadowBlur=8;
          ctx.beginPath(); ctx.arc(f.x, f.y, 2, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        });

        // Moon reflection / mist band
        ctx.save();
        ctx.globalAlpha=0.07;
        const mist=ctx.createLinearGradient(0,GROUND_Y-30,0,GROUND_Y);
        mist.addColorStop(0,'rgba(180,180,255,0)');
        mist.addColorStop(1,'rgba(180,180,255,0.5)');
        ctx.fillStyle=mist; ctx.fillRect(0,GROUND_Y-30,W,30);
        ctx.restore();
      }

      // Silhouette pine/oak tree
      function drawTreeSil(x, baseY, trunkW, totalH, col) {
        ctx.fillStyle=col;
        const trunkH=totalH*0.4, trunkX=x+trunkW*0.3;
        ctx.fillRect(trunkX, baseY-trunkH, trunkW*0.4, trunkH);
        // layered triangles for pine
        for (let i=0;i<3;i++) {
          const ly=baseY-trunkH-totalH*0.22*i;
          const lw=(trunkW*1.6)*(1-i*0.22);
          ctx.beginPath();
          ctx.moveTo(x+trunkW/2, ly-totalH*0.28);
          ctx.lineTo(x+trunkW/2-lw/2, ly);
          ctx.lineTo(x+trunkW/2+lw/2, ly);
          ctx.closePath(); ctx.fill();
        }
      }

      // ── DRAW GROUND ──────────────────────────────────
      function drawGround() {
        // Dirt base
        const dirt=ctx.createLinearGradient(0,GROUND_Y,0,H);
        dirt.addColorStop(0,'#1C1008'); dirt.addColorStop(1,'#0D0805');
        ctx.fillStyle=dirt; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);

        // Grass strip
        const grass=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+14);
        grass.addColorStop(0,'#1A4A10'); grass.addColorStop(1,'#0D2808');
        ctx.fillStyle=grass; ctx.fillRect(0,GROUND_Y,W,14);

        // Grass tufts scrolling
        ctx.fillStyle='#266618';
        for (let i=0; i<W+20; i+=18) {
          const gx=((i-groundOffset%18+W)%W);
          const gh=5+Math.sin(gx*0.5)*3;
          ctx.beginPath(); ctx.moveTo(gx,GROUND_Y); ctx.quadraticCurveTo(gx+3,GROUND_Y-gh,gx+5,GROUND_Y); ctx.fill();
          ctx.beginPath(); ctx.moveTo(gx+6,GROUND_Y); ctx.quadraticCurveTo(gx+9,GROUND_Y-gh*0.7,gx+11,GROUND_Y); ctx.fill();
        }
        // Pebbles
        ctx.fillStyle='#2A1A0A';
        for(let i=0;i<6;i++){
          const px=((i*73-groundOffset*0.4+W*3)%W);
          ctx.beginPath(); ctx.ellipse(px, GROUND_Y+7, 5, 3, 0, 0, Math.PI*2); ctx.fill();
        }
      }

      // ── DRAW OBSTACLE ────────────────────────────────
      function drawObstacle(o) {
        const bx=o.x, by=GROUND_Y-o.h;
        ctx.save();
        if (o.type===0) {
          // Rock cluster — 2-3 rounded stones
          ctx.fillStyle='#3A3040';
          ctx.beginPath(); ctx.ellipse(bx+o.w*0.5,by+o.h*0.6,o.w*0.52,o.h*0.55,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#4A3E55';
          ctx.beginPath(); ctx.ellipse(bx+o.w*0.25,by+o.h*0.7,o.w*0.32,o.h*0.42,-0.3,0,Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(bx+o.w*0.75,by+o.h*0.65,o.w*0.28,o.h*0.38,0.3,0,Math.PI*2); ctx.fill();
          // highlight
          ctx.fillStyle='rgba(180,160,200,0.18)';
          ctx.beginPath(); ctx.ellipse(bx+o.w*0.38,by+o.h*0.42,o.w*0.18,o.h*0.14,-0.4,0,Math.PI*2); ctx.fill();
        } else if (o.type===1) {
          // Log — fallen tree trunk with rings
          const lh=o.h*0.55, ly=by+o.h*0.2;
          const lg=ctx.createLinearGradient(bx,ly,bx,ly+lh);
          lg.addColorStop(0,'#5C3A1E'); lg.addColorStop(0.5,'#7A4E28'); lg.addColorStop(1,'#3D2410');
          ctx.fillStyle=lg;
          ctx.beginPath(); ctx.roundRect(bx,ly,o.w,lh,6); ctx.fill();
          // bark lines
          ctx.strokeStyle='#3A2010'; ctx.lineWidth=1.2;
          for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(bx+4,ly+lh*i*0.25);ctx.lineTo(bx+o.w-4,ly+lh*i*0.25+2);ctx.stroke();}
          // end ring
          const rg=ctx.createRadialGradient(bx+3,ly+lh/2,1,bx+3,ly+lh/2,8);
          rg.addColorStop(0,'#C49A6C'); rg.addColorStop(1,'#5C3A1E');
          ctx.fillStyle=rg; ctx.beginPath(); ctx.ellipse(bx+3,ly+lh/2,7,lh/2-2,0,0,Math.PI*2); ctx.fill();
          // moss on top
          ctx.fillStyle='rgba(60,120,30,0.5)'; ctx.beginPath(); ctx.ellipse(bx+o.w/2,ly,o.w*0.46,5,0,0,Math.PI); ctx.fill();
        } else {
          // Thorny bush — dark spiky shrub
          ctx.fillStyle='#1A2E10';
          ctx.beginPath(); ctx.ellipse(bx+o.w/2,by+o.h*0.6,o.w*0.5,o.h*0.5,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#142208';
          ctx.beginPath(); ctx.ellipse(bx+o.w*0.3,by+o.h*0.55,o.w*0.32,o.h*0.38,-0.3,0,Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(bx+o.w*0.7,by+o.h*0.5,o.w*0.3,o.h*0.36,0.3,0,Math.PI*2); ctx.fill();
          // thorns
          ctx.strokeStyle='#4A6A20'; ctx.lineWidth=1.5;
          const thorns=[[0.15,0.2],[0.5,0.05],[0.82,0.15],[0.1,0.5],[0.9,0.45]];
          thorns.forEach(([tx,ty])=>{
            const ox=bx+o.w*tx, oy=by+o.h*ty;
            const ang=Math.atan2(oy-(by+o.h*0.55),ox-(bx+o.w/2));
            ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(ang)*8,oy+Math.sin(ang)*8); ctx.stroke();
          });
          // moonlight sheen
          ctx.fillStyle='rgba(100,200,60,0.08)';
          ctx.beginPath(); ctx.ellipse(bx+o.w*0.38,by+o.h*0.3,o.w*0.22,o.h*0.14,-0.3,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      // ── DRAW POSSUM ──────────────────────────────────
      function drawPossum(py, fr) {
        const cx=POSSUM_X, cy=py; // cy = ground contact (feet)
        const airborne = cy < GROUND_Y - 2;
        ctx.save();

        // Body height/width
        const BW=44, BH=28;
        // Lean forward slightly when jumping
        const lean = airborne ? -0.18 : 0;
        ctx.translate(cx, cy - BH*0.5);
        ctx.rotate(lean);

        // ── TAIL (behind body) ──
        tailWag = Math.sin(fr*0.08)*18;
        ctx.save();
        ctx.strokeStyle='#D8D0CC'; ctx.lineWidth=5; ctx.lineCap='round';
        ctx.shadowColor='rgba(255,255,200,0.1)'; ctx.shadowBlur=4;
        ctx.beginPath();
        ctx.moveTo(-BW*0.55, BH*0.1);
        ctx.bezierCurveTo(
          -BW*1.1, BH*0.4 + tailWag*0.3,
          -BW*1.4, -BH*0.3 + tailWag*0.5,
          -BW*1.2+tailWag*0.4, -BH*0.9+tailWag*0.3
        );
        ctx.stroke();
        // Lighter tip
        ctx.strokeStyle='#F0EDE8'; ctx.lineWidth=3;
        ctx.beginPath();
        ctx.moveTo(-BW*1.1, BH*0.1+tailWag*0.2);
        ctx.bezierCurveTo(-BW*1.3,-BH*0.1+tailWag*0.4,-BW*1.3,-BH*0.7+tailWag*0.3,-BW*1.2+tailWag*0.4,-BH*0.9+tailWag*0.3);
        ctx.stroke();
        ctx.shadowBlur=0;
        ctx.restore();

        // ── LEGS (animated walk or jump) ──
        if (!airborne) legPhase = fr * 0.22;
        const legColors = ['#B0A8A0','#C8C0B8'];
        // Back legs
        for (let side=0;side<2;side++){
          const phase=legPhase+(side*Math.PI);
          const kx=-BW*0.15+Math.sin(phase)*8;
          const ky=BH*0.5+Math.abs(Math.cos(phase))*7;
          ctx.strokeStyle=legColors[0]; ctx.lineWidth=5; ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(-BW*0.15,BH*0.4);
          ctx.quadraticCurveTo(kx,ky,kx+Math.sin(phase)*5,BH*0.55+Math.abs(Math.cos(phase))*4);
          ctx.stroke();
        }
        // Front legs
        for (let side=0;side<2;side++){
          const phase=legPhase+Math.PI+(side*Math.PI);
          const kx=BW*0.22+Math.sin(phase)*7;
          const ky=BH*0.4+Math.abs(Math.cos(phase))*8;
          ctx.strokeStyle=legColors[0]; ctx.lineWidth=5; ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(BW*0.22,BH*0.45);
          ctx.quadraticCurveTo(kx,ky,kx+Math.sin(phase)*5,BH*0.55+Math.abs(Math.cos(phase))*5);
          ctx.stroke();
        }

        // ── BODY ──
        const bodyG=ctx.createRadialGradient(-4,-4,4,0,0,BW*0.7);
        bodyG.addColorStop(0,'#D8D5D0');
        bodyG.addColorStop(0.5,'#B8B4B0');
        bodyG.addColorStop(1,'#888480');
        ctx.fillStyle=bodyG;
        ctx.beginPath();
        ctx.ellipse(0, 0, BW*0.55, BH*0.5, 0, 0, Math.PI*2);
        ctx.fill();
        // Belly lighter patch
        ctx.fillStyle='rgba(245,242,238,0.7)';
        ctx.beginPath();
        ctx.ellipse(6, 5, BW*0.28, BH*0.3, 0.15, 0, Math.PI*2);
        ctx.fill();

        // ── NECK + HEAD ──
        ctx.fillStyle='#C8C4C0';
        ctx.beginPath();
        ctx.ellipse(BW*0.42, -BH*0.1, 10, 9, -0.3, 0, Math.PI*2);
        ctx.fill();

        // Head
        const hx=BW*0.55, hy=-BH*0.28;
        const headG=ctx.createRadialGradient(hx-3,hy-3,3,hx,hy,18);
        headG.addColorStop(0,'#E8E4E0');
        headG.addColorStop(1,'#B0ACA8');
        ctx.fillStyle=headG;
        ctx.beginPath();
        ctx.ellipse(hx, hy, 18, 15, 0.15, 0, Math.PI*2);
        ctx.fill();

        // Dark mask around eyes
        ctx.fillStyle='rgba(60,40,50,0.35)';
        ctx.beginPath(); ctx.ellipse(hx+4, hy-1, 14, 8, 0.1, 0, Math.PI*2); ctx.fill();

        // Ears — rounded pointy
        for(let side=-1;side<=1;side+=2){
          const ex=hx+side*9, ey=hy-13;
          ctx.fillStyle='#888480';
          ctx.beginPath(); ctx.ellipse(ex,ey,5.5,7,side*0.35,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#D4A0A0';  // pink inside
          ctx.beginPath(); ctx.ellipse(ex,ey,3,4.5,side*0.35,0,Math.PI*2); ctx.fill();
        }

        // Eyes — blink logic
        blinkTimer++;
        const blinking = (blinkTimer%140 < 5);
        if (dead) {
          // X eyes
          ctx.strokeStyle='#333'; ctx.lineWidth=2;
          for(let side=-1;side<=1;side+=2){
            const ex=hx+side*5.5, ey=hy-1;
            ctx.beginPath(); ctx.moveTo(ex-3,ey-3); ctx.lineTo(ex+3,ey+3); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex+3,ey-3); ctx.lineTo(ex-3,ey+3); ctx.stroke();
          }
        } else {
          for(let side=-1;side<=1;side+=2){
            const ex=hx+side*5.5, ey=hy-1;
            // white sclera
            ctx.fillStyle='#F0EDE8';
            ctx.beginPath(); ctx.ellipse(ex,ey, 4, blinking?1:3.5, 0,0,Math.PI*2); ctx.fill();
            if (!blinking){
              // iris — bright for night vision
              ctx.fillStyle='#E8D020';
              ctx.beginPath(); ctx.arc(ex,ey,2.5,0,Math.PI*2); ctx.fill();
              // pupil
              ctx.fillStyle='#111';
              ctx.beginPath(); ctx.ellipse(ex,ey,1.2,2.2,0,0,Math.PI*2); ctx.fill();
              // shine
              ctx.fillStyle='#FFF';
              ctx.beginPath(); ctx.arc(ex+1,ey-1,0.8,0,Math.PI*2); ctx.fill();
            }
          }
        }

        // Snout / nose
        ctx.fillStyle='#D8B0A8';
        ctx.beginPath(); ctx.ellipse(hx+15, hy+2, 7, 5.5, 0.15, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle='#4A2028';
        ctx.beginPath(); ctx.ellipse(hx+17, hy+1, 3.5, 2.5, 0,0,Math.PI*2); ctx.fill();
        // nostrils
        ctx.fillStyle='#3A1820';
        ctx.beginPath(); ctx.ellipse(hx+15.5, hy+0.5,1.2,0.8,0,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(hx+18.5, hy+0.5,1.2,0.8,0,0,Math.PI*2); ctx.fill();

        // Whiskers
        ctx.strokeStyle='rgba(240,236,230,0.7)'; ctx.lineWidth=0.8;
        for(let i=-1;i<=1;i++){
          ctx.beginPath(); ctx.moveTo(hx+12, hy+i*2.5); ctx.lineTo(hx+24, hy+i*2.5+i*1.5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(hx+12, hy+i*2.5); ctx.lineTo(hx+0, hy+i*2.5+i*1.5); ctx.stroke();
        }

        // Mouth (slight smile when alive, open when dead)
        ctx.strokeStyle='#6A3040'; ctx.lineWidth=1.2; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(hx+13, hy+5);
        if (dead) {
          ctx.bezierCurveTo(hx+15,hy+10,hx+18,hy+10,hx+20,hy+5);
        } else {
          ctx.bezierCurveTo(hx+15,hy+8,hx+18,hy+7,hx+20,hy+4);
        }
        ctx.stroke();

        ctx.restore();
      }

      // ── SCORE HUD ────────────────────────────────────
      function drawHUD() {
        ctx.save();
        ctx.font='bold 15px monospace';
        ctx.textAlign='left';
        ctx.fillStyle='rgba(255,250,220,0.9)';
        ctx.shadowColor='#FFEE88'; ctx.shadowBlur=6;
        ctx.fillText(`🌙 ${Math.floor(score/8)}`, 14, 26);
        ctx.shadowBlur=0;
        // speed indicator
        const speedBar = Math.min((speed-3.8)/7.2, 1);
        ctx.fillStyle='rgba(255,255,255,0.1)';
        ctx.fillRect(W-74, 14, 60, 7);
        ctx.fillStyle=`rgba(${Math.floor(speedBar*255)},${Math.floor((1-speedBar)*200)},50,0.8)`;
        ctx.fillRect(W-74, 14, speedBar*60, 7);
        ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
        ctx.strokeRect(W-74, 14, 60, 7);
        ctx.fillStyle='rgba(255,250,220,0.5)'; ctx.font='8px monospace';
        ctx.textAlign='right'; ctx.fillText('VELOCIDAD', W-8, 13);
        ctx.restore();
      }

      // ── DEATH / START OVERLAY ────────────────────────
      function drawOverlay() {
        ctx.save();
        ctx.fillStyle='rgba(5,8,20,0.75)';
        ctx.fillRect(0,0,W,H);
        // Moon shimmer effect on overlay
        const og=ctx.createRadialGradient(W*0.82,55,0,W*0.82,55,200);
        og.addColorStop(0,'rgba(255,248,180,0.06)'); og.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=og; ctx.fillRect(0,0,W,H);

        ctx.textAlign='center';
        ctx.fillStyle='#E0C860';
        ctx.font='bold 22px monospace';
        ctx.shadowColor='#FFE040'; ctx.shadowBlur=18;
        ctx.fillText('¡CHOQUE! 💥', W/2, H/2-55);
        ctx.shadowBlur=0;

        ctx.fillStyle='rgba(255,252,230,0.9)';
        ctx.font='bold 16px monospace';
        ctx.fillText('🌙  ' + Math.floor(score/8) + '  puntos', W/2, H/2-16);

        ctx.fillStyle='rgba(180,220,140,0.7)';
        ctx.font='11px monospace';
        ctx.fillText('La zarigüeya descansará un momento...', W/2, H/2+18);
        ctx.restore();
      }

      // ── MAIN LOOP ────────────────────────────────────
      const loop = () => {
        if (!runningRef.current) return;
        rafRef.current = requestAnimationFrame(loop);
        frame++;
        score++;
        if (!dead) groundOffset += speed*0.7;

        // Physics
        if (!dead) {
          vy += 0.72;
          possumY += vy;
          if (possumY >= GROUND_Y) { possumY = GROUND_Y; vy = 0; onGround = true; }
          else onGround = false;

          // Speed ramp
          if (frame % 380 === 0) speed = Math.min(speed + 0.45, 11);

          // Spawn obstacles
          spawnTimer++;
          if (spawnTimer >= spawnInterval) {
            const type = Math.floor(Math.random()*3);
            const h = type===0 ? 22+Math.random()*20  // rocks
                    : type===1 ? 18+Math.random()*14  // logs
                    : 28+Math.random()*16;             // bushes
            const w = type===0 ? 28+Math.random()*18
                    : type===1 ? 34+Math.random()*20
                    : 24+Math.random()*16;
            obs.push({x:W+20, w, h, type});
            spawnInterval = Math.max(45, Math.floor(100/speed*3.2));
            spawnTimer = 0;
          }
          obs.forEach(o => o.x -= speed);
          obs = obs.filter(o => o.x + o.w > -10);

          // Collision — tight hitbox
          for (const o of obs) {
            const px=POSSUM_X, py=possumY;
            const bodyL=px-16, bodyR=px+20, bodyT=py-24, bodyB=py-2;
            const obsL=o.x+3, obsR=o.x+o.w-3, obsT=GROUND_Y-o.h+4;
            if (bodyR>obsL && bodyL<obsR && bodyB>obsT) {
              dead=true;
              draw();
              end(false, Math.floor(score/8));
              return;
            }
          }
        }
        draw();
      };

      function draw() {
        ctx.clearRect(0,0,W,H);
        drawBG();
        drawGround();
        obs.forEach(o => drawObstacle(o));
        drawPossum(possumY, frame);
        drawHUD();
        if (dead) drawOverlay();
      }

      rafRef.current = requestAnimationFrame(loop);
    }
  }, [type, canvasRef, onEnd, stop]);

  return { start, stop };
}

// ─── FLAPPY GUACAMAYA MINIGAME ───
function FlappyMinigame({ onEnd, onRestart }) {
  const canvasRef = useRef();
  const gameRef = useRef({state:'idle',score:0,best:0,frame:0,pipes:[],particles:[],groundX:0,pipeInterval:90,pipeTimer:0});
  const rafRef = useRef();
  const bird = useRef({x:80,y:250,vy:0,gravity:0.36,jump:-7.2,r:16,trail:[]});
  const [scoreDisp, setScoreDisp] = useState(0);
  const [gameState, setGameState] = useState('idle');
  const [finalScore, setFinalScore] = useState(0);
  const endCalledRef = useRef(false);

  const TREE_W=58, TREE_GAP=132, TREE_SPEED=2.4, GROUND_H=62, W=360, H=500;

  const resetGame = useCallback(() => {
    bird.current = {x:80,y:H/2,vy:0,gravity:0.36,jump:-7.2,r:16,trail:[]};
    gameRef.current = {...gameRef.current, state:'idle', score:0, frame:0, pipes:[], particles:[], groundX:0, pipeInterval:90, pipeTimer:0};
    endCalledRef.current = false;
    setScoreDisp(0);
    setGameState('idle');
  }, []);

  function spawnParticles(x,y,color,count,feather=false){
    for(let i=0;i<count;i++) gameRef.current.particles.push({x,y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*4-1,life:1,color,r:Math.random()*4+2,feather});
  }

  const flap = useCallback(()=>{
    const g = gameRef.current;
    if(g.state==='dead') return;
    if(g.state==='idle') { g.state='playing'; setGameState('playing'); }
    bird.current.vy = bird.current.jump;
    spawnParticles(bird.current.x-10, bird.current.y,'#ff5500',5,true);
    spawnParticles(bird.current.x-10, bird.current.y,'#ffcc00',4,true);
  }, []);

  const handleInput = useCallback(()=>{
    const g = gameRef.current;
    if(g.state==='dead') { resetGame(); return; }
    flap();
  }, [flap, resetGame]);

  useEffect(()=>{
    const cv = canvasRef.current;
    if(!cv) return;
    const ctx = cv.getContext('2d');

    // bg trees
    const bgTrees = Array.from({length:12},()=>({x:Math.random()*W,h:60+Math.random()*100,w:20+Math.random()*30,layer:Math.random()<0.5?1:2}));
    const fireflies = Array.from({length:18},()=>({x:Math.random()*W,y:Math.random()*(H-GROUND_H),vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.3,phase:Math.random()*Math.PI*2,r:Math.random()*2+1}));

    function drawJungleTree(x,baseY,trunkW,totalH,cc,dc){
      const tg=ctx.createLinearGradient(x,0,x+trunkW,0);tg.addColorStop(0,'#3d2000');tg.addColorStop(0.5,'#5a3300');tg.addColorStop(1,'#2a1500');ctx.fillStyle=tg;
      const trunkH=totalH*0.45;ctx.fillRect(x+trunkW*0.3,baseY-trunkH,trunkW*0.4,trunkH);
      ctx.fillStyle=cc;ctx.beginPath();ctx.ellipse(x+trunkW/2,baseY-trunkH-totalH*0.25,trunkW*1.1,totalH*0.25,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=dc;ctx.beginPath();ctx.ellipse(x+trunkW/2+4,baseY-trunkH-totalH*0.15,trunkW*0.8,totalH*0.18,0,0,Math.PI*2);ctx.fill();
    }

    function drawTreeObs(pipe){
      const{x,topH}=pipe,botY=topH+TREE_GAP,botH=H-GROUND_H-botY,tw=TREE_W;
      const drawOne=(startY,height,upsideDown)=>{
        ctx.save();
        if(upsideDown){ctx.translate(x+tw/2,startY+height/2);ctx.scale(1,-1);ctx.translate(-(x+tw/2),-(startY+height/2));}
        const baseY=startY+height,trunkW=tw*0.38,trunkX=x+(tw-trunkW)/2;
        const tg=ctx.createLinearGradient(trunkX,0,trunkX+trunkW,0);tg.addColorStop(0,'#3b1f00');tg.addColorStop(0.5,'#6b3a00');tg.addColorStop(1,'#2a1500');ctx.fillStyle=tg;
        ctx.beginPath();ctx.moveTo(trunkX,baseY);ctx.bezierCurveTo(trunkX-4,baseY-height*0.3,trunkX+2,baseY-height*0.6,trunkX+2,startY);ctx.lineTo(trunkX+trunkW-2,startY);ctx.bezierCurveTo(trunkX+trunkW+2,baseY-height*0.6,trunkX+trunkW+4,baseY-height*0.3,trunkX+trunkW,baseY);ctx.closePath();ctx.fill();
        const cY=startY+height*0.08,cH=height*0.38,cW=tw*0.9;
        ['#0d5a00','#157a00','#1da000','#12700a','#0a4a00'].forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();const bdx2=[0,-14,16,0,-8],bdy2=[0,8,6,14,-8],brx=[cW*0.7,cW*0.45,cW*0.48,cW*0.55,cW*0.4],bry=[cH*0.55,cH*0.42,cH*0.40,cH*0.38,cH*0.3];ctx.ellipse(x+tw/2+bdx2[i],cY+bdy2[i],brx[i],bry[i],0,0,Math.PI*2);ctx.fill();});
        ctx.restore();
      };
      drawOne(0,topH,true);
      drawOne(botY,botH,false);
    }

    function drawBg(){
      const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#1a4a10');grad.addColorStop(0.5,'#2a7a1a');grad.addColorStop(1,'#1a3a0a');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
      ctx.save();ctx.globalAlpha=0.07;for(let i=0;i<8;i++){ctx.fillStyle='#ffffaa';ctx.beginPath();ctx.moveTo(W*0.7,0);const a1=(i/8)*Math.PI*2,a2=((i+0.4)/8)*Math.PI*2;ctx.arc(W*0.7,0,400,a1,a2);ctx.closePath();ctx.fill();}ctx.restore();
      ctx.save();ctx.fillStyle='#ffe566';ctx.shadowColor='#ffdd00';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(W*0.75,40,28,0,Math.PI*2);ctx.fill();ctx.restore();
      const g2=gameRef.current;
      bgTrees.forEach(t=>{const spd=t.layer===1?0.3:0.6;t.x-=spd*(g2.state==='playing'?1:0);if(t.x+t.w<0)t.x=W+t.w;ctx.globalAlpha=t.layer===1?0.18:0.28;drawJungleTree(t.x,H-GROUND_H,t.w,t.h,'#1a6600','#0d4400');ctx.globalAlpha=1;});
      fireflies.forEach(f=>{f.x+=f.vx;f.y+=f.vy;f.phase+=0.06;if(f.x<0)f.x=W;if(f.x>W)f.x=0;if(f.y<0)f.y=H-GROUND_H;if(f.y>H-GROUND_H)f.y=0;const glow=(Math.sin(f.phase)*0.5+0.5);ctx.save();ctx.globalAlpha=glow*0.8;ctx.fillStyle='#ccff66';ctx.shadowColor='#88ff00';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();ctx.restore();});
    }

    function drawGround(g2){
      const dg=ctx.createLinearGradient(0,H-GROUND_H,0,H);dg.addColorStop(0,'#3d2200');dg.addColorStop(1,'#1a0e00');ctx.fillStyle=dg;ctx.fillRect(0,H-GROUND_H,W,GROUND_H);
      const mg=ctx.createLinearGradient(0,H-GROUND_H,0,H-GROUND_H+18);mg.addColorStop(0,'#2d8a00');mg.addColorStop(1,'#1a5500');ctx.fillStyle=mg;ctx.fillRect(0,H-GROUND_H,W,16);
      ctx.fillStyle='#44cc00';const step=14;
      for(let i=0;i<W+step;i+=step){const gx=((i-g2.groundX%step+W)%W);const gh=8+Math.sin(gx*0.3)*4;ctx.beginPath();ctx.moveTo(gx,H-GROUND_H);ctx.quadraticCurveTo(gx+3,H-GROUND_H-gh,gx+6,H-GROUND_H);ctx.fill();}
    }

    function drawMacaw(frame){
      const b=bird.current;
      ctx.save();ctx.translate(b.x,b.y);
      const tilt=Math.min(Math.max(b.vy*3.2,-35),75);ctx.rotate(tilt*Math.PI/180);
      b.trail.forEach((t,i)=>{const alpha=(i/b.trail.length)*0.35;ctx.globalAlpha=alpha;ctx.fillStyle=`rgba(255,${100+i*15},0,${alpha})`;ctx.beginPath();ctx.ellipse(t.x-b.x,t.y-b.y,b.r*(i/b.trail.length)*0.7,4,0,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
      const r=b.r;
      const tailColors=['#0044ff','#0088ff','#00aaff','#ff4400'];
      for(let ti=0;ti<4;ti++){const ta=(-15+ti*10)*Math.PI/180,tlen=22+ti*3;ctx.save();ctx.rotate(ta);ctx.fillStyle=tailColors[ti];ctx.beginPath();ctx.moveTo(-r+2,0);ctx.bezierCurveTo(-r-tlen*0.5,-3,-r-tlen*0.8,2,-r-tlen,ti-2);ctx.bezierCurveTo(-r-tlen*0.7,4,-r-tlen*0.3,3,-r+2,2);ctx.closePath();ctx.fill();ctx.restore();}
      const wa=Math.sin(frame*0.3)*30;ctx.save();ctx.rotate(wa*Math.PI/180);ctx.fillStyle='#0066dd';ctx.beginPath();ctx.ellipse(-2,2,r*0.95,r*0.55,0.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0099ff';ctx.beginPath();ctx.ellipse(-4,0,r*0.5,r*0.25,0.3,0,Math.PI*2);ctx.fill();ctx.restore();
      const bg2=ctx.createRadialGradient(-3,-4,2,0,0,r);bg2.addColorStop(0,'#ff6633');bg2.addColorStop(0.5,'#dd1100');bg2.addColorStop(1,'#880000');ctx.fillStyle=bg2;ctx.beginPath();ctx.ellipse(0,0,r,r*0.88,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.ellipse(3,4,r*0.45,r*0.35,0.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffe8cc';ctx.beginPath();ctx.ellipse(7,-2,r*0.45,r*0.38,-0.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#222';ctx.beginPath();ctx.arc(8,-5,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.arc(8,-5,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(8,-5,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(9,-6,0.9,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#eecc00';ctx.beginPath();ctx.moveTo(10,-3);ctx.bezierCurveTo(20,-5,22,0,18,3);ctx.bezierCurveTo(16,5,12,4,10,3);ctx.closePath();ctx.fill();
      ctx.restore();
    }

    function drawParticles(particles){
      particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;if(p.feather){ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*p.life,p.r*0.3*p.life,p.vx*0.5,0,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);ctx.fill();}});ctx.globalAlpha=1;
    }

    function drawOverlay(g2){
      if(g2.state==='idle'){
        ctx.fillStyle='rgba(0,20,0,0.5)';ctx.fillRect(0,0,W,H-GROUND_H);
        ctx.fillStyle='#aaff44';ctx.font='12px monospace';ctx.textAlign='center';ctx.shadowColor='#00ff00';ctx.shadowBlur=10;
        ctx.fillText('PRESIONA ESPACIO',W/2,H/2-20);ctx.fillText('O HAZ CLIC',W/2,H/2+10);ctx.shadowBlur=0;
        ctx.font='9px monospace';ctx.fillStyle='#669944';ctx.fillText('PARA VOLAR 🦜',W/2,H/2+40);
      }
      if(g2.state==='dead'){
        ctx.fillStyle='rgba(0,10,0,0.65)';ctx.fillRect(0,0,W,H-GROUND_H);
        ctx.fillStyle='#ff3300';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.shadowColor='#ff0000';ctx.shadowBlur=20;
        ctx.fillText('¡GAME OVER!',W/2,H/2-50);ctx.shadowBlur=0;
        ctx.fillStyle='#aaff44';ctx.font='10px monospace';ctx.fillText(`PUNTOS: ${g2.score}`,W/2,H/2-10);
        ctx.fillStyle='#66ffaa';ctx.fillText(`MEJOR: ${g2.best}`,W/2,H/2+18);
        if(g2.score>0&&g2.score===g2.best){ctx.fillStyle='#ffdd00';ctx.font='9px monospace';ctx.fillText('¡NUEVO RECORD! 🏆',W/2,H/2+42);}
        ctx.fillStyle='#fff';ctx.font='8px monospace';ctx.fillText('CLIC PARA REINTENTAR',W/2,H/2+68);
      }
    }

    function checkCollision(g2){
      const b=bird.current;
      if(b.y+b.r>=H-GROUND_H||b.y-b.r<=0)return true;
      for(const p of g2.pipes){const br=b.r-4;if(b.x+br>p.x-4&&b.x-br<p.x+TREE_W+4){if(b.y-br<p.topH||b.y+br>p.topH+TREE_GAP)return true;}}
      return false;
    }

    const loop=()=>{
      const g2=gameRef.current;
      const b=bird.current;
      g2.frame++;
      g2.groundX+=TREE_SPEED*0.7;
      if(g2.state==='playing'){
        b.vy+=b.gravity;b.y+=b.vy;
        b.trail.push({x:b.x,y:b.y});if(b.trail.length>12)b.trail.shift();
        g2.pipeTimer++;if(g2.pipeTimer>=g2.pipeInterval){const minY=70,maxY=H-GROUND_H-TREE_GAP-70;g2.pipes.push({x:W+TREE_W,topH:Math.floor(Math.random()*(maxY-minY)+minY),scored:false});g2.pipeTimer=0;}
        g2.pipes.forEach(p=>p.x-=TREE_SPEED);g2.pipes=g2.pipes.filter(p=>p.x+TREE_W>-30);
        g2.pipes.forEach(p=>{if(!p.scored&&p.x+TREE_W<b.x){p.scored=true;g2.score++;setScoreDisp(g2.score);if(g2.score>g2.best)g2.best=g2.score;spawnParticles(b.x,b.y-20,'#ffcc00',8,true);spawnParticles(b.x,b.y-20,'#ff3300',6,false);if(g2.score%5===0)g2.pipeInterval=Math.max(55,g2.pipeInterval-3);}});
        g2.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.life-=0.035;});g2.particles=g2.particles.filter(p=>p.life>0);
        if(checkCollision(g2)){
          g2.state='dead';setGameState('dead');setFinalScore(g2.score);
          spawnParticles(b.x,b.y,'#ff2200',18,false);spawnParticles(b.x,b.y,'#0066ff',12,true);
          if(!endCalledRef.current){ endCalledRef.current=true; onEnd(g2.score); }
        }
      }
      ctx.clearRect(0,0,W,H);drawBg();g2.pipes.forEach(drawTreeObs);drawParticles(g2.particles);drawMacaw(g2.frame);drawGround(g2);drawOverlay(g2);
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return ()=>{ if(rafRef.current)cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(()=>{
    const handler=(e)=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();handleInput();}};
    window.addEventListener('keydown',handler);
    return ()=>window.removeEventListener('keydown',handler);
  },[handleInput]);

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'}}>
      <div style={{color:'#aaff55',fontSize:'0.72rem',fontFamily:'monospace',letterSpacing:1}}>
        PUNTOS: {scoreDisp} &nbsp;|&nbsp; MEJOR: {gameRef.current.best}
      </div>
      <canvas ref={canvasRef} width={W} height={H}
        onClick={handleInput}
        onTouchStart={e=>{e.preventDefault();handleInput();}}
        style={{border:'3px solid #2d8a00',borderRadius:6,boxShadow:'0 0 20px #00ff4433',cursor:'pointer',display:'block',maxWidth:'100%'}}
      />
      {gameState==='dead'&&(
        <button onClick={()=>{resetGame();onRestart&&onRestart();}}
          style={{background:'#C9A84C',color:'#0D0D14',padding:'0.55rem 1.4rem',borderRadius:2,fontWeight:700,fontSize:'0.82rem',border:'none',cursor:'pointer',marginTop:'0.3rem'}}>
          🔄 Reintentar
        </button>
      )}
      <div style={{fontSize:'0.65rem',color:'rgba(245,240,232,0.3)',fontFamily:'monospace',letterSpacing:1}}>
        ESPACIO / CLIC / TAP → ¡VUELA!
      </div>
    </div>
  );
}

// ─── CERTIFICATE ───
function Certificate({ name, jobTitle, company, profile, scores }) {
  const prof = PROFILES[profile]||PROFILES.pragmatic;
  const MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d=new Date(), dateStr=`${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  const total=Math.max(1,Object.values(scores).reduce((a,b)=>a+b,0));
  return (
    <div id="cert-render" style={{background:'#FDFCF8',border:'2px solid #C9A84C',padding:'2.5rem 2.5rem 2rem',position:'relative',maxWidth:580,margin:'0 auto',fontFamily:'Georgia,serif'}}>
      {[['tl','2px 0 0 2px'],['tr','2px 2px 0 0'],['bl','0 0 2px 2px'],['br','0 2px 2px 0']].map(([k,bw])=>(
        <div key={k} style={{position:'absolute',width:20,height:20,top:k.includes('t')?8:'auto',bottom:k.includes('b')?8:'auto',left:k.includes('l')?8:'auto',right:k.includes('r')?8:'auto',borderColor:'#0D0D14',borderStyle:'solid',borderWidth:bw}}/>
      ))}
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'0.62rem',letterSpacing:4,textTransform:'uppercase',color:'#7A7060',marginBottom:'0.7rem'}}>Certificado de Liderazgo Ético · CiudadanoCorp</div>
        <div style={{fontSize:'0.82rem',color:'#7A7060',marginBottom:'0.4rem'}}>Se certifica que</div>
        <div style={{fontFamily:'Georgia,serif',fontSize:'2rem',color:'#0D0D14',fontWeight:900,marginBottom:'0.2rem'}}>{name||'Participante'}</div>
        {jobTitle&&<div style={{fontSize:'0.9rem',color:'#1A3A5C',fontWeight:600,marginBottom:'0.15rem'}}>{jobTitle}</div>}
        {company&&<div style={{fontSize:'0.82rem',color:'#7A7060',marginBottom:'0.3rem'}}>{company}</div>}
        <div style={{width:40,height:1,background:'#C9A84C',margin:'0.8rem auto'}}/>
        <div style={{fontSize:'0.82rem',color:'#7A7060',lineHeight:1.6,maxWidth:360,margin:'0 auto 0.8rem'}}>Ha completado el programa de capacitación en Liderazgo Ético, navegando dilemas organizacionales complejos con reflexión y criterio propio.</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'0.35rem',justifyContent:'center',margin:'0.8rem 0'}}>
          {['⚖️ Liderazgo','📜 Normativa','🤝 Comunidad','🔍 Integridad','🌱 Cultura'].map(b=>(
            <span key={b} style={{padding:'0.15rem 0.6rem',fontSize:'0.68rem',letterSpacing:1,textTransform:'uppercase',border:'1px solid #D4CCB8',color:'#7A7060',borderRadius:2,fontWeight:600}}>{b}</span>
          ))}
        </div>
        <div style={{width:40,height:1,background:'#C9A84C',margin:'0.8rem auto'}}/>
        <div style={{fontFamily:'Georgia,serif',fontSize:'1.5rem',color:prof.color,fontStyle:'italic',fontWeight:700,marginBottom:'0.3rem'}}>{prof.name}</div>
        <div style={{fontSize:'0.78rem',color:'#7A7060',marginBottom:'1rem'}}>Perfil de Liderazgo Dominante</div>
        <div style={{maxWidth:320,margin:'0 auto 1rem'}}>
          {Object.entries(PROFILES).map(([k,p])=>(
            <div key={k} style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.3rem'}}>
              <span style={{fontSize:'0.72rem',color:'#7A7060',width:90,textAlign:'right',flexShrink:0}}>{p.name}</span>
              <div style={{flex:1,height:4,background:'#E8E4DC',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(scores[k]||0)/total*100}%`,background:p.color,borderRadius:2}}/>
              </div>
              <span style={{fontSize:'0.7rem',color:'#C9A84C',width:18}}>{scores[k]||0}</span>
            </div>
          ))}
        </div>
        <div style={{width:40,height:1,background:'#C9A84C',margin:'0.8rem auto'}}/>
        <div style={{fontSize:'0.68rem',letterSpacing:2,color:'#7A7060'}}>{dateStr}</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function CiudadanoCorp() {
  const [screen, setScreen] = useState('title');
  const [pc, setPc] = useState({name:'',jobTitle:'',company:'',skin:SKINS[1],hair:HAIRS[0],outfit:OUTFITS[0],hairstyle:'short',expression:'happy'});
  const [gs, setGs] = useState({completedModules:[],moduleProfiles:{},totalProfiles:{pragmatic:0,idealist:0,relational:0,systemic:0},currentModule:null,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:[]});
  const [mgScreen, setMgScreen] = useState({show:false,started:false,score:0,done:false,type:'snake'});
  const [dbSaved, setDbSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState('idle'); // idle | saving | ok | error
  const [pdfLoading, setPdfLoading] = useState(false);
  const canvasRef = useRef();

  const mgOnEnd = useCallback((score) => {
    setMgScreen(m=>({...m,done:true,score}));
  }, []);

  const { start: mgStart, stop: mgStop } = useCanvasMinigame(canvasRef, mgScreen.type, mgOnEnd);

  const startModule = (idx) => {
    const opts = shuffle(MODULES[idx].scenarios[0].options);
    setGs(g=>({...g,currentModule:idx,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:opts,moduleProfiles:{...g.moduleProfiles,[idx]:{pragmatic:0,idealist:0,relational:0,systemic:0}}}));
    setScreen('game');
  };

  const selectOpt = (opt) => {
    if (gs.answered) return;
    setGs(g=>({...g,answered:true,selectedOpt:opt,
      moduleProfiles:{...g.moduleProfiles,[g.currentModule]:{...g.moduleProfiles[g.currentModule],[opt.profile]:(g.moduleProfiles[g.currentModule]?.[opt.profile]||0)+1}},
      totalProfiles:{...g.totalProfiles,[opt.profile]:g.totalProfiles[opt.profile]+1},
    }));
  };

  const afterMinigame = () => {
    mgStop();
    const mod = MODULES[gs.currentModule];
    const next = Math.floor(mod.scenarios.length/2);
    if (next < mod.scenarios.length) {
      const opts = shuffle(mod.scenarios[next].options);
      setGs(g=>({...g,currentScenario:next,answered:false,selectedOpt:null,shuffledOpts:opts}));
      setScreen('game');
    } else {
      const mi = gs.currentModule;
      setGs(g=>({...g,completedModules:g.completedModules.includes(mi)?g.completedModules:[...g.completedModules,mi]}));
      setScreen('result');
    }
  };

  const nextScenario = () => {
    const mod = MODULES[gs.currentModule];
    const next = gs.currentScenario + 1;
    if (next === Math.floor(mod.scenarios.length/2)) {
      const mgType = MG_TYPES[gs.currentModule%MG_TYPES.length];
      setMgScreen({show:true,started:false,score:0,done:false,type:mgType});
      setScreen('minigame');
      return;
    }
    if (next < mod.scenarios.length) {
      const opts = shuffle(mod.scenarios[next].options);
      setGs(g=>({...g,currentScenario:next,answered:false,selectedOpt:null,shuffledOpts:opts}));
    } else {
      const mi = gs.currentModule;
      setGs(g=>({...g,completedModules:g.completedModules.includes(mi)?g.completedModules:[...g.completedModules,mi]}));
      setScreen('result');
    }
  };

  const handleFinal = async () => {
    setScreen('final');
    if (!dbSaved) {
      setDbStatus('saving');
      const profile = domProfile(gs.totalProfiles);
      const result = await saveCertificate({full_name:pc.name||'Participante',job_title:pc.jobTitle||'Sin especificar',company:pc.company||null,dominant_profile:profile,profile_scores:gs.totalProfiles,modules_completed:gs.completedModules.length,issued_at:new Date().toISOString(),session_id:Math.random().toString(36).slice(2)});
      setDbSaved(true);
      setDbStatus(result ? 'ok' : 'error');
    }
  };

  function loadScript(src) {
    return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`)){res();return;}const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  }

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const el = document.getElementById('cert-render');
      if (!el) { alert('Certificado no encontrado'); setPdfLoading(false); return; }
      const canvas = await window.html2canvas(el,{scale:2,backgroundColor:'#FDFCF8',useCORS:true,logging:false});
      const imgData = canvas.toDataURL('image/png');
      const {jsPDF} = window.jspdf;
      const pdf = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
      const W=pdf.internal.pageSize.getWidth(), H2=pdf.internal.pageSize.getHeight();
      const ratio=Math.min(W/canvas.width,H2/canvas.height)*0.92;
      pdf.addImage(imgData,'PNG',(W-canvas.width*ratio)/2,(H2-canvas.height*ratio)/2,canvas.width*ratio,canvas.height*ratio);
      pdf.save(`Certificado_${(pc.name||'Participante').replace(/\s+/g,'_')}_CiudadanoCorp.pdf`);
    } catch(e) { console.error(e); alert('Error al generar PDF. Revisa la consola.'); }
    setPdfLoading(false);
  };

  const allDone = gs.completedModules.length===MODULES.length;
  const globalProfile = domProfile(gs.totalProfiles);
  const currentMod = gs.currentModule!==null ? MODULES[gs.currentModule] : null;
  const currentSc = currentMod ? currentMod.scenarios[gs.currentScenario] : null;
  const isFlappy = mgScreen.type==='flappy';

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",width:'100%',minHeight:'100vh',background:'#0D0D14'}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}html,body,#root{width:100%;min-height:100vh;overflow-x:hidden}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.opt-card:hover:not(:disabled){border-color:#0D0D14!important;background:#EDE8DC!important;transform:translateX(3px)}.mod-card:hover{background:#EDE8DC!important}`}</style>

      {/* ── TITLE ── */}
      {screen==='title'&&(
        <div style={{minHeight:'100vh',background:'#0D0D14',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',animation:'fadeIn 0.5s ease'}}>
          <div style={{fontSize:'0.68rem',letterSpacing:4,textTransform:'uppercase',color:'#C9A84C',marginBottom:'1rem',fontWeight:500}}>Capacitación Corporativa · 2025</div>
          <div dangerouslySetInnerHTML={{__html:charSVG(pc,100,120,true)}}/>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(3rem,8vw,5.5rem)',color:'#F5F0E8',lineHeight:0.95,fontWeight:900,margin:'1rem 0'}}>CiudadanoCorp</h1>
          <div style={{width:50,height:2,background:'#C9A84C',margin:'0 auto 1.2rem'}}/>
          <p style={{fontSize:'0.9rem',color:'rgba(245,240,232,0.6)',lineHeight:1.7,maxWidth:400,marginBottom:'2rem'}}>Dilemas éticos reales. Sin respuestas correctas o incorrectas. Solo perfiles de liderazgo distintos.</p>
          <button onClick={()=>setScreen('customize')} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.85rem 2.2rem',borderRadius:2,fontWeight:600,fontSize:'0.92rem',border:'none',cursor:'pointer',letterSpacing:0.5}}>Crear tu perfil →</button>
          <p style={{marginTop:'1rem',fontSize:'0.72rem',color:'rgba(245,240,232,0.25)',letterSpacing:1}}>5 módulos · ~30 min · Perfil de liderazgo al final</p>
        </div>
      )}

      {/* ── CUSTOMIZE ── */}
      {screen==='customize'&&(
        <div style={{minHeight:'100vh',background:'#0D0D14',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:'3rem',maxWidth:780,width:'100%',alignItems:'start'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem',position:'sticky',top:'2rem'}}>
              <div style={{width:180,height:220,background:'linear-gradient(170deg,#0D1522,#101A0F,#1A1209)',border:'1px solid rgba(201,168,76,0.35)',borderRadius:10,display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:14,overflow:'hidden',boxShadow:'0 16px 48px rgba(0,0,0,0.65)'}}>
                <div dangerouslySetInnerHTML={{__html:charSVG(pc,110,145,true)}}/>
              </div>
              <div style={{color:'#C9A84C',fontSize:'0.78rem',fontWeight:500,letterSpacing:1}}>{pc.name||'Tu Personaje'}</div>
            </div>
            <div>
              <div style={{fontSize:'0.65rem',letterSpacing:3,textTransform:'uppercase',color:'#C9A84C',marginBottom:'1.5rem',fontWeight:600}}>Personaliza tu avatar</div>
              {[['Nombre','name','text','Ej: Alejandro Reyes'],['Cargo','jobTitle','text','Tu cargo o posición'],['Empresa (opcional)','company','text','Tu empresa u organización']].map(([label,field,type,ph])=>(
                <div key={field} style={{marginBottom:'1.3rem'}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>{label}</h3>
                  <input placeholder={ph} value={pc[field]} onChange={e=>setPc(p=>({...p,[field]:e.target.value}))} style={{background:'rgba(245,240,232,0.07)',border:'1px solid rgba(201,168,76,0.22)',borderRadius:2,padding:'0.6rem 0.9rem',color:'#F5F0E8',fontFamily:'inherit',fontSize:'0.88rem',width:'100%',outline:'none'}}/>
                </div>
              ))}
              {[['Tono de piel','skin',SKINS,'circle'],['Color de cabello','hair',HAIRS,'circle'],['Vestimenta','outfit',OUTFITS,'square']].map(([label,field,arr,shape])=>(
                <div key={field} style={{marginBottom:'1.3rem'}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>{label}</h3>
                  <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                    {arr.map(c=><div key={c} onClick={()=>setPc(p=>({...p,[field]:c}))} style={{width:34,height:34,borderRadius:shape==='circle'?'50%':4,background:c,cursor:'pointer',border:`3px solid ${pc[field]===c?'#C9A84C':'transparent'}`,transform:pc[field]===c?'scale(1.18)':'scale(1)',transition:'all 0.18s'}}/>)}
                  </div>
                </div>
              ))}
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Estilo de cabello</h3>
                <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                  {HAIRSTYLES.map(s=><button key={s} onClick={()=>setPc(p=>({...p,hairstyle:s}))} style={{background:pc.hairstyle===s?'rgba(201,168,76,0.15)':'rgba(245,240,232,0.05)',border:`1px solid ${pc.hairstyle===s?'#C9A84C':'rgba(245,240,232,0.15)'}`,color:pc.hairstyle===s?'#C9A84C':'rgba(245,240,232,0.5)',padding:'0.38rem 0.9rem',borderRadius:2,fontSize:'0.78rem',cursor:'pointer',fontFamily:'inherit'}}>{HS_LABELS[s]}</button>)}
                </div>
              </div>
              <div style={{marginBottom:'1.5rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Expresión</h3>
                <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                  {EXPRESSIONS.map(e=><button key={e} onClick={()=>setPc(p=>({...p,expression:e}))} style={{background:pc.expression===e?'rgba(201,168,76,0.15)':'rgba(245,240,232,0.05)',border:`1px solid ${pc.expression===e?'#C9A84C':'rgba(245,240,232,0.15)'}`,color:pc.expression===e?'#C9A84C':'rgba(245,240,232,0.5)',padding:'0.38rem 0.9rem',borderRadius:2,fontSize:'0.78rem',cursor:'pointer',fontFamily:'inherit'}}>{EXPR_LABELS[e]}</button>)}
                </div>
              </div>
              <div style={{display:'flex',gap:'0.8rem',flexWrap:'wrap'}}>
                <button onClick={()=>{if(!pc.name.trim()){alert('Por favor ingresa tu nombre.');return;}if(!pc.jobTitle.trim()){alert('Por favor ingresa tu cargo.');return;}setScreen('modules');}} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>Comenzar →</button>
                <button onClick={()=>setScreen('title')} style={{background:'transparent',border:'1px solid rgba(245,240,232,0.14)',color:'rgba(245,240,232,0.45)',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.82rem',cursor:'pointer',fontFamily:'inherit'}}>← Volver</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULES ── */}
      {screen==='modules'&&(
        <div style={{minHeight:'100vh',background:'#F5F0E8',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'2.5rem'}}>
          <div style={{textAlign:'center',marginBottom:'1.5rem',width:'100%',maxWidth:860}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',color:'#0D0D14',fontWeight:900}}>Módulos de Capacitación</h2>
            <p style={{color:'#7A7060',fontSize:'0.85rem',marginTop:'0.3rem'}}>Completa todos para descubrir tu perfil de liderazgo completo</p>
          </div>
          <div style={{width:'100%',maxWidth:860,height:3,background:'#D4CCB8',borderRadius:2,marginBottom:'0.4rem',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${(gs.completedModules.length/MODULES.length)*100}%`,background:'#C9A84C',transition:'width 0.5s ease'}}/>
          </div>
          <p style={{fontSize:'0.7rem',color:'#7A7060',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'1.2rem'}}>{gs.completedModules.length} de {MODULES.length} módulos completados</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:1,width:'100%',maxWidth:860,border:'1px solid #D4CCB8'}}>
            {MODULES.map((mod,i)=>{
              const locked=i>0&&!gs.completedModules.includes(i-1);
              const done=gs.completedModules.includes(i);
              return (
                <div key={mod.id} className="mod-card" onClick={()=>!locked&&startModule(i)} style={{background:done?'#EDE8DC':'#FDFCF8',padding:'1.4rem',cursor:locked?'not-allowed':'pointer',opacity:locked?0.35:1,position:'relative',borderBottom:'1px solid #D4CCB8',transition:'all 0.2s'}}>
                  <span style={{fontSize:'1.6rem',marginBottom:'0.7rem',display:'block'}}>{mod.icon}</span>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'#0D0D14',fontWeight:700,marginBottom:'0.3rem'}}>{mod.title}</h3>
                  <p style={{fontSize:'0.78rem',color:'#7A7060',lineHeight:1.5}}>{mod.desc}</p>
                  <span style={{display:'inline-block',marginTop:'0.7rem',padding:'0.12rem 0.55rem',fontSize:'0.65rem',letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600,border:'1px solid #D4CCB8',color:'#7A7060',borderRadius:1}}>{mod.tag}</span>
                  <div style={{fontSize:'0.7rem',color:'#7A7060',marginTop:'0.4rem'}}>🎮 {MG_META[MG_TYPES[i]].title}</div>
                  {done&&<div style={{position:'absolute',top:'0.9rem',right:'0.9rem',fontSize:'0.75rem',fontWeight:600,color:'#C9A84C'}}>✓ Completado</div>}
                  {locked&&<div style={{position:'absolute',top:'0.9rem',right:'0.9rem',color:'#D4CCB8',fontSize:'0.9rem'}}>🔒</div>}
                </div>
              );
            })}
          </div>
          {allDone&&<div style={{marginTop:'1.5rem'}}><button onClick={handleFinal} style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'#0D0D14',color:'#F5F0E8',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>🎓 Ver Certificado Final</button></div>}
        </div>
      )}

      {/* ── GAME ── */}
      {screen==='game'&&currentSc&&(
        <div style={{height:'100vh',background:'#F5F0E8',display:'flex',flexDirection:'column'}}>
          <div style={{background:'#0D0D14',padding:'0.7rem 1.4rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,gap:'0.5rem'}}>
            <div style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.9rem',fontWeight:700}}>{currentMod.icon} {currentMod.title}</div>
            <div style={{display:'flex',gap:'0.38rem',alignItems:'center'}}>
              {currentMod.scenarios.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:i<gs.currentScenario?'#C9A84C':i===gs.currentScenario?'#F5F0E8':'rgba(245,240,232,0.18)',transform:i===gs.currentScenario?'scale(1.35)':'scale(1)'}}/>)}
            </div>
            <div style={{display:'flex',gap:'0.8rem',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.45rem',background:'rgba(245,240,232,0.07)',borderRadius:50,padding:'0.18rem 0.7rem 0.18rem 0.25rem'}}>
                <div dangerouslySetInnerHTML={{__html:charSVG(pc,28,35,false)}}/>
                <span style={{color:'#F5F0E8',fontSize:'0.75rem',fontWeight:500}}>{pc.name||'Participante'}</span>
              </div>
              <button onClick={()=>setScreen('modules')} style={{background:'none',border:'1px solid rgba(245,240,232,0.18)',color:'rgba(245,240,232,0.55)',padding:'0.28rem 0.75rem',fontSize:'0.75rem',cursor:'pointer',borderRadius:1,fontFamily:'inherit'}}>← Salir</button>
            </div>
          </div>
          <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1.15fr',overflow:'hidden'}}>
            <div style={{background:'#0D0D14',padding:'1.8rem',display:'flex',flexDirection:'column',gap:'1.3rem',overflowY:'auto'}}>
              <div style={{animation:'fadeIn 0.5s ease'}}>
                <div style={{fontSize:'0.63rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',fontWeight:600}}>{currentSc.tag} · {gs.currentScenario+1}/{currentMod.scenarios.length}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.25rem',color:'#F5F0E8',fontWeight:700,lineHeight:1.3,marginTop:'0.3rem'}}>{currentSc.title}</div>
              </div>
              <p style={{fontSize:'0.85rem',color:'rgba(245,240,232,0.68)',lineHeight:1.75}}>{currentSc.body}</p>
              <div style={{background:'rgba(201,168,76,0.07)',borderLeft:'2px solid rgba(201,168,76,0.5)',padding:'0.75rem 0.9rem',borderRadius:'0 2px 2px 0'}}>
                <div style={{fontSize:'0.62rem',letterSpacing:'2px',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.28rem',fontWeight:600}}>Contexto</div>
                <div style={{fontSize:'0.8rem',color:'rgba(245,240,232,0.55)',lineHeight:1.55}}>{currentSc.context}</div>
              </div>
              <div style={{display:'flex',justifyContent:'center',marginTop:'auto',paddingTop:'0.8rem'}}>
                <div dangerouslySetInnerHTML={{__html:charSVG(pc,90,110,true)}}/>
              </div>
            </div>
            <div style={{background:'#F5F0E8',padding:'1.8rem',display:'flex',flexDirection:'column',gap:'0.8rem',overflowY:'auto'}}>
              <div style={{fontSize:'0.62rem',letterSpacing:'3px',textTransform:'uppercase',color:'#7A7060',fontWeight:600,marginBottom:'0.2rem'}}>¿Cómo respondes a este dilema?</div>
              {gs.shuffledOpts.map((opt,i)=>(
                <button key={i} disabled={gs.answered} onClick={()=>selectOpt(opt)} className="opt-card" style={{background:gs.answered&&gs.selectedOpt===opt?'#EDE8DC':'#FDFCF8',border:`1.5px solid ${gs.answered&&gs.selectedOpt===opt?'#0D0D14':'#D4CCB8'}`,borderRadius:2,padding:'0.82rem 1rem',cursor:gs.answered?'default':'pointer',fontFamily:'inherit',fontSize:'0.84rem',color:'#0D0D14',textAlign:'left',lineHeight:1.45,display:'flex',gap:'0.7rem',alignItems:'flex-start',width:'100%',opacity:gs.answered&&gs.selectedOpt!==opt?0.35:1,transition:'all 0.18s',boxShadow:gs.answered&&gs.selectedOpt===opt?'0 0 0 2px #0D0D14':'none'}}>
                  <span style={{width:22,height:22,borderRadius:1,background:gs.answered&&gs.selectedOpt===opt?'#0D0D14':'#EDE8DC',color:gs.answered&&gs.selectedOpt===opt?'#F5F0E8':'#7A7060',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,flexShrink:0,border:'1px solid #D4CCB8'}}>{['A','B','C','D'][i]}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
              {gs.answered&&gs.selectedOpt&&(
                <div style={{borderRadius:2,padding:'0.9rem 1.1rem',animation:'slideUp 0.35s ease',background:'#EDE8DC',borderLeft:'3px solid #C9A84C'}}>
                  <div style={{fontSize:'0.62rem',letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,marginBottom:'0.35rem',color:'#1A3A5C'}}>Perfil: {PROFILES[gs.selectedOpt.profile]?.name}</div>
                  <div style={{fontSize:'0.83rem',color:'#0D0D14',lineHeight:1.55}}>{gs.selectedOpt.outcome}</div>
                  <div style={{marginTop:'0.5rem',fontSize:'0.77rem',color:'#7A7060',fontStyle:'italic'}}>{gs.selectedOpt.consequence}</div>
                  <button onClick={nextScenario} style={{background:'#0D0D14',color:'#F5F0E8',padding:'0.72rem 1.7rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer',marginTop:'0.8rem'}}>
                    {gs.currentScenario>=currentMod.scenarios.length-1?'Ver resultados →':'Siguiente dilema →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MINIGAME ── */}
      {screen==='minigame'&&(()=>{
        const mgInfo = MG_META[mgScreen.type];
        return (
          <div style={{minHeight:'100vh',background:'#0D0D14',display:'flex',flexDirection:'column'}}>
            <div style={{background:'rgba(245,240,232,0.04)',borderBottom:'1px solid rgba(201,168,76,0.15)',padding:'0.65rem 1.4rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.88rem',fontWeight:700}}>{mgInfo.icon} {mgInfo.title}</div>
              <button onClick={afterMinigame} style={{background:'none',border:'1px solid rgba(245,240,232,0.18)',color:'rgba(245,240,232,0.45)',padding:'0.28rem 0.75rem',fontSize:'0.75rem',cursor:'pointer',borderRadius:1,fontFamily:'inherit'}}>Omitir → continuar módulo</button>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',gap:'0.8rem',padding:'1rem',overflowY:'auto'}}>
              <div style={{background:'rgba(245,240,232,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:2,padding:'0.6rem 1rem',maxWidth:680,width:'100%'}}>
                <div style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.25rem',fontWeight:600}}>Instrucciones</div>
                <div style={{fontSize:'0.78rem',color:'rgba(245,240,232,0.5)',lineHeight:1.45}}>{mgInfo.inst}</div>
              </div>

              {/* FLAPPY — usa su propio componente */}
              {isFlappy?(
                <FlappyMinigame
                  onEnd={(score)=>setMgScreen(m=>({...m,done:true,score}))}
                  onRestart={()=>setMgScreen(m=>({...m,done:false,score:0}))}
                />
              ):(
                <div style={{display:'flex',alignItems:'flex-start',gap:'1.2rem',flexWrap:'wrap',justifyContent:'center'}}>
                  <div style={{position:'relative',lineHeight:0}}>
                    <canvas ref={canvasRef} width={CV_SIZE} height={CV_SIZE} style={{border:'1px solid rgba(201,168,76,0.25)',borderRadius:2,display:'block',width:Math.min(440,typeof window!=='undefined'?window.innerWidth-32:440),height:Math.min(440,typeof window!=='undefined'?window.innerWidth-32:440)}}/>
                    {!mgScreen.started&&(
                      <div style={{position:'absolute',inset:0,background:'rgba(13,13,20,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.9rem',borderRadius:2}}>
                        <div style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'1.35rem',fontWeight:700}}>¿Listo/a?</div>
                        <div style={{fontSize:'0.78rem',color:'rgba(245,240,232,0.5)',textAlign:'center',maxWidth:260}}>Presiona para comenzar</div>
                        <button onClick={()=>{setMgScreen(m=>({...m,started:true}));mgStart();}} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.65rem 1.6rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer'}}>Jugar</button>
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',alignItems:'center',minWidth:120,paddingTop:'0.5rem'}}>
                    <div style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',fontWeight:600}}>Puntuación</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:'#F5F0E8',fontWeight:700,textAlign:'center',lineHeight:1}}>{mgScreen.score}</div>
                    <div style={{fontSize:'0.78rem',color:'rgba(245,240,232,0.45)',textAlign:'center',lineHeight:1.5,maxWidth:130}}>{mgScreen.done?(mgScreen.score>0?'¡Muy bien! 🎉':'Juego terminado'):mgScreen.started?'En juego...':''}</div>
                    {/* FIX: Botón reinicio visible siempre que el juego haya iniciado */}
                    {mgScreen.started&&!mgScreen.done&&(
                      <button onClick={()=>{mgStop();setMgScreen(m=>({...m,started:false,score:0,done:false}));}} style={{background:'transparent',border:'1px solid rgba(245,240,232,0.2)',color:'rgba(245,240,232,0.45)',padding:'0.45rem 1rem',borderRadius:2,fontSize:'0.75rem',cursor:'pointer',fontFamily:'inherit',marginTop:'0.3rem'}}>🔄 Reiniciar</button>
                    )}
                    {mgScreen.done&&(
                      <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',width:'100%',alignItems:'center'}}>
                        <button onClick={()=>{mgStop();setMgScreen(m=>({...m,started:false,score:0,done:false}));}} style={{background:'transparent',border:'1px solid rgba(201,168,76,0.4)',color:'#C9A84C',padding:'0.5rem 1.1rem',borderRadius:2,fontSize:'0.78rem',cursor:'pointer',fontFamily:'inherit',width:'100%'}}>🔄 Reiniciar</button>
                        <button onClick={afterMinigame} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.65rem 1.3rem',borderRadius:2,fontWeight:600,fontSize:'0.82rem',border:'none',cursor:'pointer',width:'100%'}}>Continuar →</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Continuar después de Flappy */}
              {isFlappy&&mgScreen.done&&(
                <button onClick={afterMinigame} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.72rem 2rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>Continuar al módulo →</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── RESULT ── */}
      {screen==='result'&&(()=>{
        const mi=gs.currentModule, mp=gs.moduleProfiles[mi]||{}, dom=domProfile(mp), prof=PROFILES[dom];
        const total=Math.max(1,Object.values(mp).reduce((a,b)=>a+b,0));
        const nextIdx=mi+1;
        return (
          <div style={{minHeight:'100vh',background:'#0D0D14',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{maxWidth:540,width:'100%',textAlign:'center',animation:'fadeIn 0.5s ease'}}>
              <div style={{fontSize:'0.65rem',letterSpacing:'4px',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.8rem',fontWeight:600}}>Resultado del Módulo</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:'#F5F0E8',fontWeight:900,marginBottom:'0.4rem'}}>{prof.name}</h2>
              <p style={{fontSize:'0.85rem',color:'rgba(245,240,232,0.55)',lineHeight:1.65,marginBottom:'1.5rem'}}>{prof.desc}</p>
              <div style={{background:'rgba(245,240,232,0.04)',border:'1px solid rgba(201,168,76,0.18)',borderRadius:2,padding:'1.3rem',marginBottom:'1.5rem',textAlign:'left'}}>
                <div style={{fontSize:'0.63rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.9rem',fontWeight:600}}>Tu distribución en este módulo</div>
                {Object.entries(PROFILES).map(([k,p])=>(
                  <div key={k} style={{display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'0.6rem'}}>
                    <span style={{fontSize:'0.75rem',color:'rgba(245,240,232,0.65)',width:115,flexShrink:0}}>{p.name}</span>
                    <div style={{flex:1,height:4,background:'rgba(245,240,232,0.08)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${(mp[k]||0)/total*100}%`,background:p.color,borderRadius:2,transition:'width 0.8s ease'}}/>
                    </div>
                    <span style={{fontSize:'0.72rem',color:'#C9A84C',width:18,textAlign:'right'}}>{mp[k]||0}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'0.8rem',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>setScreen('modules')} style={{background:'transparent',color:'rgba(245,240,232,0.45)',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.82rem',border:'1px solid rgba(245,240,232,0.14)',cursor:'pointer',fontFamily:'inherit'}}>Módulos</button>
                {nextIdx<MODULES.length
                  ?<button onClick={()=>startModule(nextIdx)} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>{MODULES[nextIdx].icon} {MODULES[nextIdx].title} →</button>
                  :<button onClick={handleFinal} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>🏆 Ver Certificado</button>
                }
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── FINAL ── */}
      {screen==='final'&&(
        <div style={{minHeight:'100vh',background:'#F5F0E8',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'2.5rem',overflowY:'auto'}}>
          <div style={{maxWidth:640,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'0.65rem',letterSpacing:'4px',textTransform:'uppercase',color:'#7A7060',marginBottom:'0.8rem'}}>Programa Completado</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:900,color:'#0D0D14',marginBottom:'0.5rem'}}>Tu Certificado</h2>
            {/* DB STATUS con info para verificar */}
            <div style={{marginBottom:'1.2rem',padding:'0.6rem 1rem',borderRadius:2,background:dbStatus==='ok'?'rgba(74,124,94,0.1)':dbStatus==='error'?'rgba(160,74,47,0.1)':'rgba(201,168,76,0.08)',border:`1px solid ${dbStatus==='ok'?'rgba(74,124,94,0.3)':dbStatus==='error'?'rgba(160,74,47,0.3)':'rgba(201,168,76,0.2)'}`,fontSize:'0.78rem',color:dbStatus==='ok'?'#4A7C5E':dbStatus==='error'?'#A04A2F':'#7A7060',display:'inline-block'}}>
              {dbStatus==='saving'&&'⏳ Guardando en base de datos...'}
              {dbStatus==='ok'&&'✅ Registro guardado en Supabase correctamente'}
              {dbStatus==='error'&&'⚠️ No se pudo guardar en BD. Verifica las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local — y que la tabla "certificates" exista (ver consola F12 para el error exacto)'}
              {dbStatus==='idle'&&'📋 Certificado listo'}
            </div>
            <Certificate name={pc.name} jobTitle={pc.jobTitle} company={pc.company} profile={globalProfile} scores={gs.totalProfiles}/>
            <div style={{display:'flex',gap:'1rem',justifyContent:'center',marginTop:'1.5rem',flexWrap:'wrap'}}>
              <button onClick={downloadPDF} disabled={pdfLoading} style={{background:'#0D0D14',color:'#F5F0E8',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:pdfLoading?'wait':'pointer',opacity:pdfLoading?0.7:1,display:'inline-flex',alignItems:'center',gap:'0.5rem'}}>
                {pdfLoading?'⏳ Generando PDF...':'⬇ Descargar Certificado PDF'}
              </button>
              <button onClick={()=>{setScreen('title');setGs({completedModules:[],moduleProfiles:{},totalProfiles:{pragmatic:0,idealist:0,relational:0,systemic:0},currentModule:null,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:[]});setDbSaved(false);setDbStatus('idle');}} style={{background:'transparent',color:'#7A7060',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.85rem',border:'1px solid #D4CCB8',cursor:'pointer',fontFamily:'inherit'}}>Jugar de nuevo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}