import { useState, useRef, useEffect, useCallback } from "react";

// ─── SUPABASE ───
async function saveCertificate(data) {
  const url = typeof window !== "undefined" && window.__SUPABASE_URL__;
  const key = typeof window !== "undefined" && window.__SUPABASE_KEY__;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/certificates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
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

const MG_TYPES = ['snake','minesweeper','breakout','runner','guess'];
const MG_META = {
  snake:      { icon:'🐍', title:'Serpiente',          inst:'Usa las flechas del teclado (o desliza en móvil) para mover la serpiente. Come los puntos dorados para crecer y sumar puntos. ¡No choques con las paredes ni contigo mismo!' },
  minesweeper:{ icon:'💣', title:'Buscaminas',          inst:'Haz clic para revelar celdas. Los números indican cuántas minas hay alrededor. Clic derecho (o presión larga en móvil) para marcar una mina 🚩. ¡Revela todas las celdas seguras para ganar!' },
  breakout:   { icon:'🧱', title:'Rompe Bloques',       inst:'Mueve el mouse (o arrastra en móvil) para controlar la paleta. Rebota la pelota y destruye todos los bloques. Si la pelota cae pierdes una vida. ¡Tienes 3 vidas!' },
  runner:     { icon:'🏃', title:'Corredor Infinito',   inst:'Presiona Espacio o haz clic en el canvas para saltar. Esquiva los obstáculos que llegan desde la derecha. ¡Cuanto más lejos llegues, más puntos!' },
  guess:      { icon:'🔢', title:'Adivina el Número',   inst:'Estoy pensando en un número del 1 al 50. Tienes 7 intentos. Después de cada intento te digo si el número es mayor o menor.' },
};

const MODULES = [
  {id:0,icon:'⚖️',title:'Dilemas de Liderazgo',tag:'Ética aplicada',desc:'Situaciones reales donde no existe una única respuesta correcta.',scenarios:[
    {tag:'DILEMA 01',title:'El resultado vs. el proceso',body:'Tu equipo puede alcanzar la meta del trimestre saltándose un paso del protocolo de aprobación interno. El proceso fue diseñado para proyectos más grandes y nadie lo notaría. El cliente llevaría meses esperando si se sigue el proceso completo.',context:'El protocolo existe para prevenir errores del pasado. Tu equipo ha trabajado este proyecto con rigor. El cliente es estratégico y ha esperado mucho.',options:[
      {text:'Omites el paso. El protocolo no fue diseñado para este caso y el cliente no puede esperar más.',profile:'pragmatic',outcome:'Entregas a tiempo. El cliente queda satisfecho. Sin embargo, el equipo aprende que los procesos son opcionales bajo presión.',consequence:'+Eficiencia inmediata · −Cultura de proceso'},
      {text:'Sigues el protocolo completo aunque tome meses. La regla existe por algo, y las excepciones crean precedentes.',profile:'idealist',outcome:'El cliente espera y muestra frustración. La siguiente auditoría interna muestra cero desviaciones.',consequence:'+Integridad normativa · −Relación con cliente'},
      {text:'Hablas directamente con el cliente para explicar la situación y negociar un plazo intermedio.',profile:'relational',outcome:'El cliente comprende y valora la transparencia. Acuerdan un cronograma ajustado. La relación se fortalece.',consequence:'+Confianza relacional · Tiempo moderado'},
      {text:'Propones formalmente revisar el protocolo para incluir excepciones documentadas antes de proceder.',profile:'systemic',outcome:'El proceso se pausa. Documentas la propuesta de mejora. El cambio tarda pero beneficia proyectos futuros.',consequence:'+Mejora sistémica · −Velocidad inmediata'},
    ]},
    {tag:'DILEMA 02',title:'El talento difícil',body:'Tu mejor colaborador técnico tiene comportamientos que afectan el clima del equipo: interrumpe, no reconoce el trabajo ajeno y sus comentarios a veces incomodan. Sus resultados son excepcionales.',context:'Varios miembros del equipo han expresado malestar informalmente. Ninguno ha hecho queja formal. Hay una entrega crítica en 6 semanas.',options:[
      {text:'Priorizas la entrega. Abordarás los comportamientos después del proyecto, cuando haya menos presión.',profile:'pragmatic',outcome:'La entrega sale bien. Sin embargo, dos miembros renuncian a los tres meses. El costo de reemplazo supera el valor de la entrega.',consequence:'+Resultado inmediato · −Retención del equipo'},
      {text:'Le planteas directamente que sus comportamientos son inaceptables, independientemente de sus resultados.',profile:'idealist',outcome:'La conversación es difícil. Con tiempo y acompañamiento, hay mejora real. El equipo aprecia la valentía del liderazgo.',consequence:'+Estándar de conducta · Tensión temporal'},
      {text:'Organizas conversaciones individuales con el equipo para entender el impacto real antes de actuar.',profile:'relational',outcome:'Descubres matices que no conocías. La intervención es más informada y menos reactiva.',consequence:'+Decisión informada · −Velocidad'},
      {text:'Propones un proceso de feedback 360° para todo el equipo, sin señalar directamente a nadie.',profile:'systemic',outcome:'El proceso revela patrones en todo el equipo. Los datos generan cambios más sostenidos.',consequence:'+Cultura de feedback · −Resolución rápida'},
    ]},
    {tag:'DILEMA 03',title:'La información incómoda',body:'En una reunión ejecutiva tienes datos que contradicen la dirección estratégica que el CEO acaba de anunciar. Compartirlos causaría incomodidad institucional, pero ocultarlos podría llevar a una decisión errónea.',context:'El CEO es carismático y tiene mucha autoridad. La sala incluye inversores y junta. Los datos son sólidos pero provienen de un piloto pequeño.',options:[
      {text:'Compartes los datos en privado con el CEO después de la reunión para no crear conflicto público.',profile:'pragmatic',outcome:'El CEO recibe la información receptivamente y ajusta la estrategia discretamente.',consequence:'+Gestión política · −Urgencia informacional'},
      {text:'Planteas los datos en la reunión con claridad y respeto, señalando la discrepancia.',profile:'idealist',outcome:'Hay tensión visible. El CEO, a regañadientes, considera los datos. La decisión mejora.',consequence:'+Verdad institucional · Incomodidad en sala'},
      {text:'Le preguntas al CEO si hay espacio para revisar supuestos antes de cerrar, sin revelar los datos aún.',profile:'relational',outcome:'Abres una puerta sin confrontar. La conversación posterior es más receptiva y la relación se mantiene.',consequence:'+Navegación relacional · Complejidad del proceso'},
      {text:'Documentas los datos y los envías al canal de riesgo corporativo para que queden en registro.',profile:'systemic',outcome:'Los datos quedan trazados. Si la estrategia falla, hay evidencia.',consequence:'+Trazabilidad · −Impacto inmediato'},
    ]},
    {tag:'DILEMA 04',title:'La promesa imposible',body:'Para cerrar un contrato importante, tu equipo implícitamente prometió un plazo de entrega que internamente sabes que es inviable. El cliente firmó basándose en esa expectativa.',context:'El contrato es el mayor del año. El equipo ya está al límite de capacidad. Romper el plazo podría derivar en penalizaciones.',options:[
      {text:'Ejecutas al máximo y esperas cumplir. Si el equipo se esfuerza, quizás se logre.',profile:'pragmatic',outcome:'El equipo trabaja horas extra. Se entrega tarde de todos modos y hay dos bajas por agotamiento.',consequence:'+Intento de cumplir · −Bienestar del equipo'},
      {text:'Contactas al cliente de inmediato, admites la situación y propones un plazo realista.',profile:'idealist',outcome:'El cliente se molesta pero aprecia la honestidad. La relación sobrevive. El equipo respira.',consequence:'+Integridad · Tensión con cliente'},
      {text:'Hablas primero con el equipo para entender qué es posible y luego vas al cliente con opciones.',profile:'relational',outcome:'El equipo se siente parte de la solución. La negociación con el cliente es más informada.',consequence:'+Participación del equipo · −Velocidad'},
      {text:'Revisas el proceso de estimación antes de hablar con el cliente para llegar con propuesta sólida.',profile:'systemic',outcome:'La conversación con el cliente se retrasa unos días pero la mejora evita situaciones similares ese año.',consequence:'+Mejora sistémica · −Urgencia inmediata'},
    ]},
    {tag:'DILEMA 05',title:'El éxito invisible',body:'Un proyecto silencioso que lideraste generó ahorros significativos, pero no fue visible ni reconocido institucionalmente. Hay una revisión de desempeño esta semana.',context:'Tu jefe no tiene contexto sobre ese proyecto. Otro colega hizo trabajo visible pero de menor impacto real.',options:[
      {text:'Preparas un resumen del impacto y lo presentas directamente en la reunión de desempeño.',profile:'pragmatic',outcome:'Tu jefe queda impresionado. El reconocimiento llega. Algunos colegas lo perciben como autopromoción.',consequence:'+Visibilidad · Percepción de autopromoción'},
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
      {text:'Hablas con el proveedor para entender la magnitud real y explorás soluciones conjuntas.',profile:'relational',outcome:'El diálogo revela que la empresa también puede adelantar algunos pagos ya vencidos. Se resuelve sin romper la política.',consequence:'+Solución colaborativa · −Tiempo'},
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
      {text:'Comunicas proactivamente a los 120 clientes con una disculpa y compensación.',profile:'pragmatic',outcome:'Algunos clientes ni sabían del error. Controlaste el mensaje. La cobertura fue mínima y positiva.',consequence:'+Control narrativo · Costo compensatorio'},
      {text:'Haces una declaración pública completa aunque no estés obligado, por principio de transparencia.',profile:'idealist',outcome:'A largo plazo tu empresa es citada como ejemplo de transparencia.',consequence:'+Reputación de integridad · Exposición mediática'},
      {text:'Priorizas llamar personalmente a los clientes más afectados antes de cualquier comunicado masivo.',profile:'relational',outcome:'Los clientes se sienten considerados individualmente. La retención es superior al promedio.',consequence:'+Fidelización · −Velocidad de cobertura'},
      {text:'Revisas primero tus procesos de monitoreo para evitar recurrencia, luego comunicas.',profile:'systemic',outcome:'La comunicación llega un poco tarde. El proceso de mejora es real y documenta el aprendizaje.',consequence:'+Mejora sistémica · −Gestión oportuna'},
    ]},
    {tag:'DILEMA 04',title:'El proveedor local vs. el eficiente',body:'Puedes elegir entre un proveedor local de menor escala pero con alto impacto social en la región, o un proveedor externo más eficiente y barato.',context:'La empresa tiene compromisos públicos de desarrollo local. El proveedor externo tiene mejor historial de calidad.',options:[
      {text:'Eliges el proveedor externo. Los costos son reales y el impacto social no es tu responsabilidad principal.',profile:'pragmatic',outcome:'Los costos bajan. El proveedor local pierde su mayor contrato y reduce personal.',consequence:'+Eficiencia económica · −Impacto social comprometido'},
      {text:'Eliges el proveedor local aunque sea más caro. El compromiso público no es negociable.',profile:'idealist',outcome:'El costo impacta el presupuesto. El compromiso social se honra.',consequence:'+Coherencia con compromisos · −Eficiencia económica'},
      {text:'Propones al proveedor local un plan de 12 meses para alcanzar estándares competitivos con acompañamiento.',profile:'relational',outcome:'Al año, el proveedor local es competitivo y la relación es sólida.',consequence:'+Desarrollo de proveedor · −Velocidad'},
      {text:'Propones un contrato mixto: parte al proveedor local, parte al externo, con evaluación a 18 meses.',profile:'systemic',outcome:'Los datos del período permiten tomar una decisión más informada. Ambos proveedores mejoran.',consequence:'+Decisión basada en evidencia · −Simplicidad'},
    ]},
  ]},
  {id:3,icon:'🔍',title:'Integridad y Zonas Grises',tag:'Anticorrupción',desc:'Donde la integridad se prueba en los matices, no en los extremos.',scenarios:[
    {tag:'DILEMA 01',title:'El regalo y su contexto',body:'Un proveedor clave te envía un regalo de fin de año de valor moderado después de cerrar exitosamente un contrato. La política prohíbe regalos. La relación es genuina y el gesto parece sincero.',context:'El proveedor ha sido excelente. La relación tiene tres años. Devolver el regalo podría sentirse como un insulto cultural.',options:[
      {text:'Aceptas el regalo. La política es genérica y la relación y el contexto lo justifican.',profile:'pragmatic',outcome:'La relación se mantiene. Pero has establecido que la política es negociable según la relación.',consequence:'+Relación de proveedor · Precedente personal'},
      {text:'Devuelves el regalo con una nota amable explicando la política de la empresa.',profile:'idealist',outcome:'El proveedor comprende y respeta la posición. Tienes certeza absoluta sobre tu integridad.',consequence:'+Claridad ética · Incomodidad puntual'},
      {text:'Le agradeces personalmente y le explicas por qué no puedes aceptarlo, enfatizando que valoras la relación.',profile:'relational',outcome:'El proveedor aprecia el gesto de explicar en vez de solo devolver. La relación se mantiene con respeto mutuo.',consequence:'+Relación preservada · Gestión del momento'},
      {text:'Reportas el regalo a compliance para que te orienten según la política exacta.',profile:'systemic',outcome:'Lo devuelves con respaldo institucional. El proceso establece un precedente documentado.',consequence:'+Precedente institucional · Proceso más largo'},
    ]},
    {tag:'DILEMA 02',title:'La ventaja no buscada',body:'En una licitación, una cláusula ambigua podría interpretarse a tu favor, pero probablemente no fue la intención del evaluador. Si preguntas, cierras esa ventaja. Si no, la tienes.',context:'La licitación es estratégica. Tu propuesta es competitiva incluso sin la ventaja. El evaluador es alguien con quien tendrás relación de largo plazo.',options:[
      {text:'No preguntas. La ambigüedad es parte del proceso y aprovecharla es legítimo.',profile:'pragmatic',outcome:'Ganas la licitación. Meses después el evaluador menciona la cláusula. La relación queda marcada por una duda tácita.',consequence:'+Resultado de licitación · −Confianza relacional'},
      {text:'Preguntas al evaluador para aclarar, sabiendo que perderás la ventaja.',profile:'idealist',outcome:'Pierdes la ventaja pero tu propuesta sigue siendo competitiva. El evaluador te reconoce como oferente íntegro.',consequence:'+Reputación de integridad · Sin ventaja táctica'},
      {text:'Conversas con el evaluador sobre la cláusula de manera informal, sin revelar tu interpretación.',profile:'relational',outcome:'La conversación es ambigua. No queda claro si lograste aclaración.',consequence:'Resultado ambiguo · Zona gris'},
      {text:'Consultas internamente con tu equipo legal antes de cualquier acción externa.',profile:'systemic',outcome:'Legal determina que preguntar es lo correcto. Lo haces formalmente y queda documentado.',consequence:'+Proceso documentado · −Velocidad'},
    ]},
    {tag:'DILEMA 03',title:'El testigo incómodo',body:'Ves a un colega de otra área haciendo algo que podría ser una irregularidad, pero también podría tener una explicación legítima. No te incumbe directamente y no tienes certeza.',context:'Ambos tienen el mismo nivel jerárquico. No tienen relación cercana. El área tiene un ambiente político complicado.',options:[
      {text:'No haces nada. Sin certeza y sin incumbencia, actuar puede generarte problemas sin justificación.',profile:'pragmatic',outcome:'Nadie sabe que lo viste. Meses después una auditoría detecta la irregularidad.',consequence:'+Sin riesgo personal · Incomodidad retrospectiva'},
      {text:'Lo reportas al canal de denuncias con lo que observaste, dejando la investigación a quien corresponde.',profile:'idealist',outcome:'El canal investiga. La irregularidad resulta ser menor con explicación razonable. El sistema funcionó.',consequence:'+Uso correcto del canal · Resultado incierto'},
      {text:'Te acercas directamente al colega y le preguntas sobre lo que observaste.',profile:'relational',outcome:'La conversación es tensa. Hay una explicación razonable. La situación se aclara sin escalar.',consequence:'+Diálogo directo · Relación afectada'},
      {text:'Documentas lo que observaste sin actuar de inmediato, para tener registro si el patrón continúa.',profile:'systemic',outcome:'Acumulas más observaciones. Ahora sí tienes evidencia suficiente para reportar con solidez.',consequence:'+Evidencia sólida · −Acción temprana'},
    ]},
    {tag:'DILEMA 04',title:'El dato conveniente',body:'Un análisis que presentarás mañana tiene un dato que, si lo incluyes tal cual, debilita tu argumento. No es incorrecto, pero su contexto cambia el panorama.',context:'La decisión que impulsa la presentación es estratégica. El dato proviene de un estudio pequeño. Tu audiencia no lo conoce.',options:[
      {text:'Omites el dato. No es determinante y la presentación debe ser clara y convincente.',profile:'pragmatic',outcome:'La decisión se toma en la dirección que propones. Meses después alguien encuentra el estudio y cuestiona el análisis.',consequence:'+Claridad del argumento · −Trazabilidad'},
      {text:'Incluyes el dato con su contexto completo, aunque debilite la presentación.',profile:'idealist',outcome:'La presentación es más matizada. La decisión tarda más pero está mejor fundamentada.',consequence:'+Rigor analítico · −Fuerza del argumento'},
      {text:'Mencionas el dato pero lo enmarcan junto al equipo como una limitación conocida del análisis.',profile:'relational',outcome:'La audiencia aprecia la honestidad. La confianza en tu equipo como fuente confiable aumenta.',consequence:'+Credibilidad · −Simplicidad del mensaje'},
      {text:'Propones separar la presentación ejecutiva del análisis técnico completo con todos los datos.',profile:'systemic',outcome:'Los tomadores de decisión tienen un resumen claro y los técnicos tienen el análisis completo.',consequence:'+Estructura de información · −Tiempo de preparación'},
    ]},
  ]},
  {id:4,icon:'🌱',title:'Cultura Viva',tag:'Clima organizacional',desc:'Las decisiones cotidianas que construyen o destruyen una cultura.',scenarios:[
    {tag:'DILEMA 01',title:'La reunión que sobrevive a su propósito',body:'Tu equipo tiene una reunión semanal de 2 horas que nadie quiere pero todos asisten. Podría hacerse en 20 minutos. Sin embargo, dos personas dicen que es su único espacio de conexión.',context:'El equipo trabaja en modalidad híbrida. Las conexiones informales son escasas. Hay presión de productividad.',options:[
      {text:'Reduces la reunión a lo estrictamente necesario. El tiempo es el recurso más escaso.',profile:'pragmatic',outcome:'La productividad sube. Dos personas sienten que perdieron su espacio de pertenencia y uno empieza a desconectarse.',consequence:'+Eficiencia · −Cohesión para algunos'},
      {text:'Eliminas la reunión y creas un protocolo escrito. Las relaciones se construyen trabajando.',profile:'idealist',outcome:'El equipo adapta. Las conexiones ocurren de otras formas para quienes las buscan.',consequence:'+Estructura · −Espacio informal'},
      {text:'Preguntas al equipo qué valoran de la reunión y rediseñas el formato basándote en eso.',profile:'relational',outcome:'El proceso revela necesidades heterogéneas. El nuevo formato satisface mejor a más personas.',consequence:'+Diseño participativo · −Velocidad'},
      {text:'Propones un experimento de 4 semanas con formato reducido para evaluar con datos el impacto.',profile:'systemic',outcome:'Los datos muestran que la productividad sube pero la satisfacción baja. La decisión final es más informada.',consequence:'+Decisión basada en datos · −Tiempo de experimento'},
    ]},
    {tag:'DILEMA 02',title:'El reconocimiento y sus dilemas',body:'Tienes que reconocer a alguien del equipo por un logro. La persona más contribuyente técnicamente es introvertida y pidió explícitamente no ser destacada públicamente.',context:'Ambas contribuciones fueron esenciales. El equipo de 12 personas observará cómo lo manejas.',options:[
      {text:'Reconoces a quien lideró la coordinación. El liderazgo visible necesita refuerzo cultural.',profile:'pragmatic',outcome:'La coordinadora queda satisfecha. La técnica observa que su petición fue respetada pero su contribución quedó invisible.',consequence:'+Cultura de liderazgo visible · −Reconocimiento técnico'},
      {text:'Reconoces públicamente a ambas, respetando la petición de la técnica tanto como sea posible.',profile:'idealist',outcome:'Buscas el equilibrio. La persona queda moderadamente incómoda pero comprende el intento.',consequence:'+Reconocimiento equitativo · Incomodidad moderada'},
      {text:'Hablas primero con la persona técnica para encontrar juntos una forma de reconocerla que le sea cómoda.',profile:'relational',outcome:'Encuentran una fórmula: reconocimiento escrito interno. Se siente escuchada y el equipo aprende que hay formas distintas de ser valorado.',consequence:'+Respeto a la persona · −Visibilidad pública'},
      {text:'Usas el caso para introducir un sistema de reconocimiento diversificado que no dependa del elogio público.',profile:'systemic',outcome:'El sistema cambia estructuralmente cómo el equipo entiende y celebra el valor.',consequence:'+Cambio cultural · −Respuesta inmediata'},
    ]},
    {tag:'DILEMA 03',title:'Los valores en la pared',body:'El proceso de definición de valores produjo una lista que nadie vive. Cambiarlos requiere un proceso largo. Ignorarlos crea cinismo.',context:'El proceso costó tiempo y dinero hace dos años. Hay personas que trabajaron en él con genuino compromiso.',options:[
      {text:'Te enfocas en comportamientos concretos esperados, sin mencionar los valores formales.',profile:'pragmatic',outcome:'Los comportamientos esperados son claros. Con el tiempo hay una brecha entre lo oficial y lo real.',consequence:'+Claridad práctica · −Coherencia institucional'},
      {text:'Propones formalmente revisar y actualizar los valores, aunque genere fricción.',profile:'idealist',outcome:'El proceso reabre debates. El resultado final es más auténtico.',consequence:'+Autenticidad · Conflicto del proceso'},
      {text:'Comienzas a referirte a los valores en conversaciones cotidianas de forma genuina, sin forzarlos.',profile:'relational',outcome:'Poco a poco las conversaciones sobre valores se vuelven orgánicas. Cambio lento pero sin resistencia.',consequence:'+Adopción natural · −Velocidad'},
      {text:'Propones medir trimestralmente el nivel de identificación de los empleados con los valores.',profile:'systemic',outcome:'Los datos revelan que menos del 30% se identifica. El argumento para una revisión se vuelve objetivo.',consequence:'+Evidencia para el cambio · −Acción inmediata'},
    ]},
    {tag:'DILEMA 04',title:'El chiste que no fue chiste',body:'En una reunión, alguien hace un comentario que varios ríen pero que una persona recibe como ofensivo. Nadie más lo nota.',context:'El ambiente del equipo suele ser informal. No existe un protocolo claro de conducta.',options:[
      {text:'No intervienes. Hablar podría generar más incomodidad que la broma misma.',profile:'pragmatic',outcome:'Nada pasa en esa reunión. La persona afectada empieza a participar menos. Nadie lo conecta con ese día.',consequence:'+Evitación del conflicto · −Seguridad psicológica'},
      {text:'Detienes la reunión y nombras que el comentario puede haber sido incómodo para algunos.',profile:'idealist',outcome:'Hay silencio incómodo. La persona afectada te agradece después en privado. El estándar del equipo cambia.',consequence:'+Estándar de conducta · Tensión inmediata'},
      {text:'Hablas después con la persona afectada para ver cómo está y decidir juntos si quiere que se haga algo.',profile:'relational',outcome:'La persona se siente acompañada. Decide no escalar. La confianza en ti aumenta.',consequence:'+Apoyo interpersonal · −Resolución colectiva'},
      {text:'Propones al equipo construir un acuerdo de conducta en la próxima reunión.',profile:'systemic',outcome:'El proceso genera un documento compartido que cambia la dinámica del equipo gradualmente.',consequence:'+Cambio cultural · −Acción inmediata'},
    ]},
    {tag:'DILEMA 05',title:'La rotación que duele',body:'Tu mejor colaborador recibió una oferta externa. No puedes igualar el salario. Puedes ofrecerle un rol de mayor responsabilidad que aún no está del todo definido.',context:'Perder esta persona afecta un proyecto crítico. El equipo ya está al límite. Crear un rol inflado puede generar expectativas difíciles.',options:[
      {text:'Creas el rol aunque no esté definido completamente. Es mejor que perderlo.',profile:'pragmatic',outcome:'La persona se queda. El rol no está claro y genera fricción con el equipo en los siguientes meses.',consequence:'+Retención · −Claridad organizacional'},
      {text:'Eres transparente: no puedes igualar el salario ni crear un rol que no existe realmente.',profile:'idealist',outcome:'La persona se va. El equipo siente el impacto pero aprecia la honestidad sobre las posibilidades reales.',consequence:'+Honestidad · −Retención'},
      {text:'Tienes una conversación profunda con la persona sobre qué valora además del salario.',profile:'relational',outcome:'Descubres que hay otros factores. Juntos diseñan un acuerdo que la persona acepta.',consequence:'+Solución personalizada · −Escalabilidad'},
      {text:'Propones revisar la política de retención para que este tipo de situaciones no dependan de improvisación.',profile:'systemic',outcome:'La política tarda. Esta persona se va pero el siguiente caso tiene un protocolo claro.',consequence:'+Mejora estructural · −Impacto inmediato'},
    ]},
  ]},
];

// ─── HELPERS ───
function shade(hex, pct) {
  try {
    const n = parseInt(hex.replace('#',''), 16), a = Math.round(2.55 * pct);
    const R = Math.max(0, Math.min(255, (n >> 16) + a));
    const G = Math.max(0, Math.min(255, ((n >> 8) & 0xFF) + a));
    const B = Math.max(0, Math.min(255, (n & 0xFF) + a));
    return '#' + (0x1000000 + R*65536 + G*256 + B).toString(16).slice(1);
  } catch(e) { return hex; }
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function domProfile(counts) {
  return Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b, 'pragmatic');
}

// ─── CHARACTER SVG ───
function charSVG(cfg, w, h, anim) {
  const { skin = SKINS[1], hair = HAIRS[0], outfit = OUTFITS[0], hairstyle = 'short', expression = 'happy' } = cfg;
  const od = shade(outfit, -28), skd = shade(skin, -14), hd = shade(hair, -25);
  let hBack = '', hTop = '';
  if (hairstyle === 'short') {
    hTop = `<path d="M27 20 Q40 6 53 20 L51 14 Q40 2 29 14Z" fill="${hair}"/>`;
  } else if (hairstyle === 'medium') {
    hBack = `<path d="M25 36 Q21 46 21 58 Q22 66 26 72L22 78V40Q22 36 25 36Z" fill="${hd}"/><path d="M55 36 Q59 46 59 58 Q58 66 54 72L58 78V40Q58 36 55 36Z" fill="${hd}"/>`;
    hTop = `<path d="M24 24 Q27 4 40 3 Q53 4 56 24L56 38 Q52 44 40 45 Q28 44 24 38Z" fill="${hair}"/>`;
  } else if (hairstyle === 'long') {
    hBack = `<path d="M24 35 Q18 48 18 62 Q18 76 24 86 Q27 92 30 96L22 96Q16 78 16 62Q16 46 24 35Z" fill="${hd}"/><path d="M56 35 Q62 48 62 62 Q62 76 56 86 Q53 92 50 96L58 96Q64 78 64 62Q64 46 56 35Z" fill="${hd}"/>`;
    hTop = `<path d="M24 24 Q27 4 40 3 Q53 4 56 24L56 38 Q52 45 40 46 Q28 45 24 38Z" fill="${hair}"/>`;
  } else {
    hTop = `<g fill="${hair}"><circle cx="28" cy="15" r="8"/><circle cx="36" cy="9" r="8"/><circle cx="40" cy="7" r="8"/><circle cx="44" cy="9" r="8"/><circle cx="52" cy="15" r="8"/><circle cx="30" cy="23" r="6"/><circle cx="50" cy="23" r="6"/></g>`;
  }
  let eyeL = `<ellipse cx="34" cy="21" rx="3" ry="3.5" fill="${shade(skin,-55)}"/><circle cx="33.2" cy="20" r="1.2" fill="white"/>`;
  let eyeR = `<ellipse cx="46" cy="21" rx="3" ry="3.5" fill="${shade(skin,-55)}"/><circle cx="45.2" cy="20" r="1.2" fill="white"/>`;
  let mouth = '', extra = '';
  if (expression === 'happy') {
    mouth = `<path d="M35 30 Q40 35 45 30" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  } else if (expression === 'serious') {
    eyeL = `<ellipse cx="34" cy="21.5" rx="3" ry="2.8" fill="${shade(skin,-55)}"/><circle cx="33.2" cy="21" r="1.1" fill="white"/>`;
    eyeR = `<ellipse cx="46" cy="21.5" rx="3" ry="2.8" fill="${shade(skin,-55)}"/><circle cx="45.2" cy="21" r="1.1" fill="white"/>`;
    extra = `<path d="M31 18 L36 20" stroke="${skd}" stroke-width="1.2" stroke-linecap="round"/><path d="M49 18 L44 20" stroke="${skd}" stroke-width="1.2" stroke-linecap="round"/>`;
    mouth = `<line x1="36" y1="31" x2="44" y2="31" stroke="${skd}" stroke-width="1.8" stroke-linecap="round"/>`;
  } else if (expression === 'surprised') {
    eyeL = `<circle cx="34" cy="21" r="4" fill="${shade(skin,-55)}"/><circle cx="33" cy="20" r="1.5" fill="white"/>`;
    eyeR = `<circle cx="46" cy="21" r="4" fill="${shade(skin,-55)}"/><circle cx="45" cy="20" r="1.5" fill="white"/>`;
    mouth = `<ellipse cx="40" cy="31.5" rx="3.5" ry="3" fill="${skd}"/>`;
  } else if (expression === 'thinking') {
    eyeL = `<ellipse cx="34" cy="21" rx="3" ry="3.5" fill="${shade(skin,-55)}"/><circle cx="34.8" cy="20.5" r="1.2" fill="white"/>`;
    eyeR = `<ellipse cx="46" cy="21" rx="3" ry="3.5" fill="${shade(skin,-55)}"/><circle cx="46.8" cy="20.5" r="1.2" fill="white"/>`;
    mouth = `<path d="M36 31 Q39 30 43 31.5" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    extra = `<circle cx="53" cy="11" r="2.2" fill="${skd}" opacity="0.4"/><circle cx="57" cy="8" r="1.5" fill="${skd}" opacity="0.25"/>`;
  } else if (expression === 'wink') {
    eyeR = `<path d="M43.5 22 Q46 19 48.5 22" stroke="${shade(skin,-55)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    mouth = `<path d="M35 30 Q40 35.5 45 30" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }
  const nose = `<ellipse cx="40" cy="26.5" rx="1.4" ry="0.9" fill="${skd}"/>`;
  const animAttr = anim ? 'style="animation:charBob 3s ease-in-out infinite"' : '';
  return `<svg width="${w}" height="${h}" viewBox="0 0 80 100" ${animAttr} xmlns="http://www.w3.org/2000/svg">
    <style>@keyframes charBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}</style>
    ${hBack}
    <rect x="22" y="38" width="36" height="40" rx="8" fill="${outfit}"/>
    <rect x="10" y="41" width="12" height="28" rx="6" fill="${outfit}"/>
    <rect x="58" y="41" width="12" height="28" rx="6" fill="${outfit}"/>
    <rect x="30" y="76" width="8" height="18" rx="4" fill="${od}"/>
    <rect x="42" y="76" width="8" height="18" rx="4" fill="${od}"/>
    <rect x="35" y="33" width="10" height="10" rx="4" fill="${skin}"/>
    ${hTop}
    <circle cx="40" cy="22" r="18" fill="${skin}"/>
    ${eyeL}${eyeR}${nose}${mouth}${extra}
  </svg>`;
}

// ─── MINIGAME ENGINE ───
const CV_SIZE = 440;
function useMinigame(canvasRef, type, onEnd) {
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
    const clear = (col = '#0D0D14') => { ctx.fillStyle = col; ctx.fillRect(0, 0, CV_SIZE, CV_SIZE); };
    const end = (won, score) => { stop(); onEnd(score || 0); };

    if (type === 'snake') {
      const SN_COLS = 16, SN_CELL = CV_SIZE / SN_COLS;
      let snake = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
      let dir = {x:1,y:0}, dirNext = {x:1,y:0}, food, score = 0;
      const placeFood = () => { let p; do { p = {x:Math.floor(Math.random()*SN_COLS),y:Math.floor(Math.random()*SN_COLS)}; } while(snake.some(s=>s.x===p.x&&s.y===p.y)); food=p; };
      placeFood();
      document.onkeydown = e => { const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}}; if(m[e.key]){const d=m[e.key];if(d.x!==-dir.x||d.y!==-dir.y)dirNext=d;e.preventDefault();} };
      let tx=null,ty=null;
      cv.ontouchstart=e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;};
      cv.ontouchend=e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy))dirNext=dx>0?{x:1,y:0}:{x:-1,y:0};else dirNext=dy>0?{x:0,y:1}:{x:0,y:-1};tx=null;ty=null;};
      const draw = () => { clear(); ctx.strokeStyle='rgba(201,168,76,0.07)';ctx.lineWidth=0.5; for(let i=0;i<=SN_COLS;i++){ctx.beginPath();ctx.moveTo(i*SN_CELL,0);ctx.lineTo(i*SN_CELL,CV_SIZE);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*SN_CELL);ctx.lineTo(CV_SIZE,i*SN_CELL);ctx.stroke();} ctx.fillStyle='#C9A84C';ctx.beginPath();ctx.arc(food.x*SN_CELL+SN_CELL/2,food.y*SN_CELL+SN_CELL/2,SN_CELL/2-3,0,Math.PI*2);ctx.fill(); snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#F5F0E8':'rgba(245,240,232,0.68)';ctx.fillRect(s.x*SN_CELL+1,s.y*SN_CELL+1,SN_CELL-2,SN_CELL-2);}); };
      stateRef.current.score = 0;
      intervalRef.current = setInterval(() => {
        if(!runningRef.current)return;
        dir=dirNext;
        const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
        if(h.x<0||h.x>=SN_COLS||h.y<0||h.y>=SN_COLS||snake.some(s=>s.x===h.x&&s.y===h.y)){draw();end(false,score);return;}
        snake.unshift(h);
        if(h.x===food.x&&h.y===food.y){score+=10;stateRef.current.score=score;placeFood();}else{snake.pop();}
        draw();
      }, 200);

    } else if (type === 'minesweeper') {
      const MS_ROWS=11,MS_COLS=11,MS_MINES=10,MS_CELL=Math.floor(CV_SIZE/MS_COLS);
      let board=Array.from({length:MS_ROWS},()=>new Array(MS_COLS).fill(0));
      let revealed=new Set(),flagged=new Set(),firstClick=true,minePos=null;
      const draw = () => { ctx.fillStyle='#13131C';ctx.fillRect(0,0,CV_SIZE,CV_SIZE); for(let r=0;r<MS_ROWS;r++)for(let c=0;c<MS_COLS;c++){const k=r*MS_COLS+c,x=c*MS_CELL,y=r*MS_CELL; if(revealed.has(k)){ctx.fillStyle=minePos&&minePos.has(k)?'rgba(160,74,47,0.35)':'rgba(245,240,232,0.08)';ctx.fillRect(x,y,MS_CELL,MS_CELL); if(minePos&&minePos.has(k)){ctx.font=`${MS_CELL-4}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💣',x+MS_CELL/2,y+MS_CELL/2+1);}else if(board[r][c]>0){const NC=['','#4A90D9','#4A7C5E','#A04A2F','#5A4A7C','#8B1A1A','#2E7777','#111','#888'];ctx.fillStyle=NC[board[r][c]]||'#C9A84C';ctx.font=`bold ${MS_CELL-8}px DM Sans`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(board[r][c],x+MS_CELL/2,y+MS_CELL/2+1);}}else{ctx.fillStyle='rgba(245,240,232,0.06)';ctx.fillRect(x,y,MS_CELL,MS_CELL);if(flagged.has(k)){ctx.font=`${MS_CELL-6}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🚩',x+MS_CELL/2,y+MS_CELL/2+1);}} ctx.strokeStyle='rgba(201,168,76,0.1)';ctx.lineWidth=0.5;ctx.strokeRect(x,y,MS_CELL,MS_CELL);} };
      const placeMines=(sr,sc)=>{minePos=new Set();while(minePos.size<MS_MINES){const r=Math.floor(Math.random()*MS_ROWS),c=Math.floor(Math.random()*MS_COLS);if(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1)continue;minePos.add(r*MS_COLS+c);}for(let r=0;r<MS_ROWS;r++)for(let c=0;c<MS_COLS;c++){if(minePos.has(r*MS_COLS+c)){board[r][c]=-1;continue;}let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<MS_ROWS&&nc>=0&&nc<MS_COLS&&minePos.has(nr*MS_COLS+nc))n++;}board[r][c]=n;}};
      const flood=(r,c)=>{const k=r*MS_COLS+c;if(revealed.has(k)||flagged.has(k))return;revealed.add(k);if(board[r][c]===0)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<MS_ROWS&&nc>=0&&nc<MS_COLS)flood(nr,nc);}};
      const checkWin=()=>{const safe=MS_ROWS*MS_COLS-MS_MINES;if([...revealed].filter(k=>!minePos||!minePos.has(k)).length>=safe){draw();end(true,safe*5);}};
      const cellAt=(e)=>{const rect=cv.getBoundingClientRect();const c=Math.floor((e.clientX-rect.left)*(CV_SIZE/rect.width)/MS_CELL),r=Math.floor((e.clientY-rect.top)*(CV_SIZE/rect.height)/MS_CELL);if(r<0||r>=MS_ROWS||c<0||c>=MS_COLS)return null;return{r,c};};
      cv.onclick=(e)=>{if(!runningRef.current)return;const pos=cellAt(e);if(!pos)return;const{r,c}=pos;if(flagged.has(r*MS_COLS+c))return;if(firstClick){firstClick=false;placeMines(r,c);}if(minePos&&minePos.has(r*MS_COLS+c)){[...minePos].forEach(k=>revealed.add(k));draw();end(false,[...revealed].length*3);return;}flood(r,c);checkWin();draw();};
      cv.oncontextmenu=(e)=>{e.preventDefault();const pos=cellAt(e);if(!pos)return;const{r,c}=pos;const k=r*MS_COLS+c;if(!revealed.has(k)){flagged.has(k)?flagged.delete(k):flagged.add(k);draw();}};
      draw();

    } else if (type === 'breakout') {
      const BK_W=CV_SIZE,BK_H=CV_SIZE,BK_PAD_W=90,BK_PAD_H=13,BK_PAD_Y=BK_H-36;
      const BK_BCOLS=8,BK_BROWS=5,BK_BW=Math.floor((BK_W-12)/BK_BCOLS),BK_BH=22;
      const COLORS=['#C9A84C','#4A7C5E','#1A3A5C','#A04A2F','#5A4A7C'];
      let padX=BK_W/2-BK_PAD_W/2,ballX=BK_W/2,ballY=BK_PAD_Y-18,bdx=3.2,bdy=-3.2,lives=3,score=0;
      let blocks=[];
      for(let r=0;r<BK_BROWS;r++)for(let c=0;c<BK_BCOLS;c++)blocks.push({x:6+c*BK_BW,y:36+r*(BK_BH+5),w:BK_BW-4,h:BK_BH,alive:true,color:COLORS[r%COLORS.length]});
      cv.onmousemove=e=>{const rect=cv.getBoundingClientRect();padX=Math.max(0,Math.min(BK_W-BK_PAD_W,(e.clientX-rect.left)*(CV_SIZE/rect.width)-BK_PAD_W/2));};
      cv.ontouchmove=e=>{e.preventDefault();const rect=cv.getBoundingClientRect();padX=Math.max(0,Math.min(BK_W-BK_PAD_W,(e.touches[0].clientX-rect.left)*(CV_SIZE/rect.width)-BK_PAD_W/2));};
      const draw=()=>{clear();blocks.forEach(b=>{if(!b.alive)return;ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(b.x,b.y,b.w,4);});ctx.fillStyle='#C9A84C';ctx.fillRect(padX,BK_PAD_Y,BK_PAD_W,BK_PAD_H);ctx.fillStyle='#F5F0E8';ctx.beginPath();ctx.arc(ballX,ballY,8,0,Math.PI*2);ctx.fill();for(let i=0;i<lives;i++){ctx.fillStyle='#C9A84C';ctx.beginPath();ctx.arc(14+i*22,BK_H-14,6,0,Math.PI*2);ctx.fill();}};
      intervalRef.current = setInterval(()=>{
        if(!runningRef.current)return;
        ballX+=bdx;ballY+=bdy;
        if(ballX<=7||ballX>=BK_W-7)bdx*=-1;
        if(ballY<=7)bdy*=-1;
        if(ballY>=BK_H+12){lives--;if(lives<=0){draw();end(false,score);return;}ballX=BK_W/2;ballY=BK_PAD_Y-18;bdy=-Math.abs(bdy);}
        if(ballY+8>=BK_PAD_Y&&ballY<=BK_PAD_Y+BK_PAD_H&&ballX>=padX-6&&ballX<=padX+BK_PAD_W+6){bdy=-Math.abs(bdy);bdx=((ballX-(padX+BK_PAD_W/2))/(BK_PAD_W/2))*4.5;}
        let alive=0;
        for(const b of blocks){if(!b.alive)continue;alive++;if(ballX+8>b.x&&ballX-8<b.x+b.w&&ballY+8>b.y&&ballY-8<b.y+b.h){b.alive=false;score+=10;stateRef.current.score=score;const ol=ballX+8-b.x,or2=b.x+b.w-(ballX-8),ot=ballY+8-b.y,ob=b.y+b.h-(ballY-8);if(Math.min(ol,or2)<Math.min(ot,ob))bdx*=-1;else bdy*=-1;break;}}
        if(alive===0){draw();end(true,score+lives*50);return;}
        draw();
      }, 14);

    } else if (type === 'runner') {
      let dinoY=CV_SIZE-75,vy=0,obs=[],speed=4.5,score=0,frame=0,dead=false,cloudX=CV_SIZE;
      const jump=()=>{if(runningRef.current&&!dead&&dinoY>=CV_SIZE-75-2){vy=-15;}};
      document.onkeydown=e=>{if(e.code==='Space'||e.key===' '){e.preventDefault();jump();}};
      cv.onclick=jump; cv.ontouchstart=e=>{e.preventDefault();jump();};
      const draw=()=>{
        const grd=ctx.createLinearGradient(0,0,0,CV_SIZE);grd.addColorStop(0,'#060A14');grd.addColorStop(1,'#1A2030');ctx.fillStyle=grd;ctx.fillRect(0,0,CV_SIZE,CV_SIZE);
        ctx.fillStyle='rgba(240,217,140,0.9)';ctx.beginPath();ctx.arc(CV_SIZE-60,55,22,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#1A2E10';ctx.fillRect(0,CV_SIZE-75+50,CV_SIZE,25);
        obs.forEach(o=>{const gy=CV_SIZE-75+50-o.h;ctx.fillStyle=o.type===0?'#5C3A1E':'#4A4A5A';ctx.fillRect(o.x,gy,o.w,o.h);});
        // possum
        const PX=54,PY=dinoY,PW=38,PH=50;
        ctx.fillStyle='#B0B0C0';ctx.beginPath();ctx.ellipse(PX+PW/2,PY+PH*0.55,PW/2,PH*0.4,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#E8E4DC';ctx.beginPath();ctx.ellipse(PX+PW+2,PY+PH*0.25,16,13,0.15,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#1A1020';ctx.beginPath();ctx.arc(PX+PW+5,PY+PH*0.18,4,0,Math.PI*2);ctx.fill();
        if(dead){ctx.fillStyle='rgba(6,10,20,0.72)';ctx.fillRect(0,0,CV_SIZE,CV_SIZE);ctx.fillStyle='#F5F0E8';ctx.font='bold 24px DM Sans';ctx.textAlign='center';ctx.fillText('¡La zarigüeya chocó! 🌙',CV_SIZE/2,CV_SIZE/2-12);ctx.fillStyle='#C9A84C';ctx.font='18px DM Sans';ctx.fillText('Puntos: '+Math.floor(score/8),CV_SIZE/2,CV_SIZE/2+20);}
      };
      const loop=()=>{if(!runningRef.current)return;rafRef.current=requestAnimationFrame(loop);frame++;score++;vy+=0.75;dinoY+=vy;if(dinoY>=CV_SIZE-75){dinoY=CV_SIZE-75;vy=0;}if(frame%400===0)speed=Math.min(speed+0.4,11);const spawnInt=Math.max(38,Math.floor(110/speed*3));if(frame%spawnInt===0)obs.push({x:CV_SIZE+10,w:18+Math.random()*22,h:28+Math.random()*32,type:Math.floor(Math.random()*2)});obs.forEach(o=>o.x-=speed);obs=obs.filter(o=>o.x+o.w>-5);stateRef.current.score=Math.floor(score/8);for(const o of obs){const gy=CV_SIZE-75+50-o.h;if(54+38-10>o.x+5&&54+10<o.x+o.w-5&&dinoY+50-8>gy+5){dead=true;draw();end(false,Math.floor(score/8));return;}}draw();};
      rafRef.current=requestAnimationFrame(loop);
    }
  }, [type, canvasRef, onEnd, stop]);

  return { start, stop, getScore: () => stateRef.current.score || 0 };
}

// ─── CERTIFICATE COMPONENT ───
function Certificate({ name, jobTitle, company, profile, scores }) {
  const prof = PROFILES[profile] || PROFILES.pragmatic;
  const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date();
  const dateStr = `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  const total = Math.max(1, Object.values(scores).reduce((a,b)=>a+b,0));
  return (
    <div id="cert-render" style={{background:'#FDFCF8',border:'2px solid #C9A84C',padding:'2.5rem 2.5rem 2rem',position:'relative',maxWidth:580,margin:'0 auto',fontFamily:'Georgia, serif'}}>
      {[['tl','2px 0 0 2px'],['tr','2px 2px 0 0'],['bl','0 0 2px 2px'],['br','0 2px 2px 0']].map(([k,bw])=>(
        <div key={k} style={{position:'absolute',width:20,height:20,top:k.includes('t')?8:'auto',bottom:k.includes('b')?8:'auto',left:k.includes('l')?8:'auto',right:k.includes('r')?8:'auto',borderColor:'#0D0D14',borderStyle:'solid',borderWidth:bw}}/>
      ))}
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'0.62rem',letterSpacing:4,textTransform:'uppercase',color:'#7A7060',marginBottom:'0.7rem'}}>Certificado de Liderazgo Ético · CiudadanoCorp</div>
        <div style={{fontSize:'0.82rem',color:'#7A7060',marginBottom:'0.4rem'}}>Se certifica que</div>
        <div style={{fontFamily:'Georgia, serif',fontSize:'2rem',color:'#0D0D14',fontWeight:900,marginBottom:'0.2rem'}}>{name||'Participante'}</div>
        {jobTitle && <div style={{fontSize:'0.9rem',color:'#1A3A5C',fontWeight:600,marginBottom:'0.15rem'}}>{jobTitle}</div>}
        {company && <div style={{fontSize:'0.82rem',color:'#7A7060',marginBottom:'0.3rem'}}>{company}</div>}
        <div style={{width:40,height:1,background:'#C9A84C',margin:'0.8rem auto'}}/>
        <div style={{fontSize:'0.82rem',color:'#7A7060',lineHeight:1.6,maxWidth:360,margin:'0 auto 0.8rem'}}>Ha completado el programa de capacitación en Liderazgo Ético, navegando dilemas organizacionales complejos con reflexión y criterio propio.</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'0.35rem',justifyContent:'center',margin:'0.8rem 0'}}>
          {['⚖️ Liderazgo','📜 Normativa','🤝 Comunidad','🔍 Integridad','🌱 Cultura'].map(b=>(
            <span key={b} style={{padding:'0.15rem 0.6rem',fontSize:'0.68rem',letterSpacing:1,textTransform:'uppercase',border:'1px solid #D4CCB8',color:'#7A7060',borderRadius:2,fontWeight:600}}>{b}</span>
          ))}
        </div>
        <div style={{width:40,height:1,background:'#C9A84C',margin:'0.8rem auto'}}/>
        <div style={{fontFamily:'Georgia, serif',fontSize:'1.5rem',color:prof.color,fontStyle:'italic',fontWeight:700,marginBottom:'0.3rem'}}>{prof.name}</div>
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [guessState, setGuessState] = useState({secret:0,attempts:0,hint:'',inputVal:'',done:false,won:false});
  const canvasRef = useRef();

  const mgOnEnd = useCallback((score) => {
    setMgScreen(m => ({...m, done:true, score}));
  }, []);

  const { start: mgStart, stop: mgStop } = useMinigame(canvasRef, mgScreen.type, mgOnEnd);

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

  const nextScenario = () => {
    const mod = MODULES[gs.currentModule];
    const next = gs.currentScenario + 1;
    // show minigame at midpoint
    if (next === Math.floor(mod.scenarios.length / 2)) {
      const mgType = MG_TYPES[gs.currentModule % MG_TYPES.length];
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

  const skipMinigame = () => {
    mgStop();
    const mod = MODULES[gs.currentModule];
    const next = Math.floor(mod.scenarios.length / 2);
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

  const continueAfterMg = () => {
    mgStop();
    skipMinigame();
  };

  const handleFinal = async () => {
    setScreen('final');
    if (!dbSaved) {
      const profile = domProfile(gs.totalProfiles);
      await saveCertificate({full_name:pc.name||'Participante',job_title:pc.jobTitle||'Sin especificar',company:pc.company||null,dominant_profile:profile,profile_scores:gs.totalProfiles,modules_completed:gs.completedModules.length,issued_at:new Date().toISOString(),session_id:Math.random().toString(36).slice(2)});
      setDbSaved(true);
    }
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const el = document.getElementById('cert-render');
      if (!el) { alert('Certificado no encontrado'); setPdfLoading(false); return; }
      // dynamic import via script tags
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const canvas = await window.html2canvas(el, {scale:2,backgroundColor:'#FDFCF8',useCORS:true,logging:false});
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(W/canvas.width, H/canvas.height) * 0.92;
      const x = (W - canvas.width*ratio)/2;
      const y = (H - canvas.height*ratio)/2;
      pdf.addImage(imgData,'PNG',x,y,canvas.width*ratio,canvas.height*ratio);
      pdf.save(`Certificado_${(pc.name||'Participante').replace(/\s+/g,'_')}_CiudadanoCorp.pdf`);
    } catch(e) {
      console.error(e);
      alert('Error al generar PDF. Abre la consola para más detalles.');
    }
    setPdfLoading(false);
  };

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // Guess minigame
  const startGuess = () => {
    const secret = Math.floor(Math.random()*50)+1;
    setGuessState({secret,attempts:0,hint:'¿Cuál es el número del 1 al 50?',inputVal:'',done:false,won:false});
  };
  const submitGuess = () => {
    const v = parseInt(guessState.inputVal);
    if (isNaN(v)||v<1||v>50) { setGuessState(g=>({...g,hint:'⚠️ Ingresa un número entre 1 y 50'})); return; }
    const attempts = guessState.attempts + 1;
    const MAX = 7;
    if (v === guessState.secret) {
      const sc = Math.max(10,(MAX-attempts+1)*15);
      setGuessState(g=>({...g,attempts,hint:`✅ ¡Correcto! Era el ${g.secret} 🎉`,done:true,won:true,inputVal:''}));
      setMgScreen(m=>({...m,done:true,score:sc}));
    } else if (attempts >= MAX) {
      setGuessState(g=>({...g,attempts,hint:`❌ Era el ${g.secret}. ¡Suerte la próxima!`,done:true,won:false,inputVal:''}));
      setMgScreen(m=>({...m,done:true,score:0}));
    } else {
      const left = MAX - attempts;
      const hint = v < guessState.secret ? `⬆️ Mayor que ${v}  (${left} intentos restantes)` : `⬇️ Menor que ${v}  (${left} intentos restantes)`;
      setGuessState(g=>({...g,attempts,hint,inputVal:''}));
    }
  };

  const allDone = gs.completedModules.length === MODULES.length;
  const globalProfile = domProfile(gs.totalProfiles);
  const currentMod = gs.currentModule !== null ? MODULES[gs.currentModule] : null;
  const currentSc = currentMod ? currentMod.scenarios[gs.currentScenario] : null;
  const V = { '--ink':'#0D0D14','--paper':'#F5F0E8','--cream':'#EDE8DC','--gold':'#C9A84C','--blue':'#1A3A5C','--muted':'#7A7060','--border':'#D4CCB8','--white':'#FDFCF8' };

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",width:'100%',minHeight:'100vh',...V}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}html,body,#root{width:100%;min-height:100vh}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.opt-card:hover:not(:disabled){border-color:#0D0D14!important;background:#EDE8DC!important;transform:translateX(3px)}.mod-card:hover{background:#EDE8DC!important}`}</style>

      {/* ── TITLE ── */}
      {screen==='title' && (
        <div style={{minHeight:'100vh',background:'#0D0D14',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',animation:'fadeIn 0.5s ease'}}>
          <div style={{fontSize:'0.68rem',letterSpacing:4,textTransform:'uppercase',color:'#C9A84C',marginBottom:'1rem',fontWeight:500}}>Capacitación Corporativa · 2025</div>
          <div dangerouslySetInnerHTML={{__html:charSVG(pc,100,120,true)}}/>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(3rem,8vw,5.5rem)',color:'#F5F0E8',lineHeight:0.95,fontWeight:900,margin:'1rem 0 1rem'}}>CiudadanoCorp</h1>
          <div style={{width:50,height:2,background:'#C9A84C',margin:'0 auto 1.2rem'}}/>
          <p style={{fontSize:'0.9rem',color:'rgba(245,240,232,0.6)',lineHeight:1.7,maxWidth:400,marginBottom:'2rem'}}>Dilemas éticos reales. Sin respuestas correctas o incorrectas. Solo perfiles de liderazgo distintos.</p>
          <button onClick={()=>setScreen('customize')} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.85rem 2.2rem',borderRadius:2,fontWeight:600,fontSize:'0.92rem',border:'none',cursor:'pointer',letterSpacing:0.5}}>Crear tu perfil →</button>
          <p style={{marginTop:'1rem',fontSize:'0.72rem',color:'rgba(245,240,232,0.25)',letterSpacing:1}}>5 módulos · ~30 min · Perfil de liderazgo al final</p>
        </div>
      )}

      {/* ── CUSTOMIZE ── */}
      {screen==='customize' && (
        <div style={{minHeight:'100vh',background:'#0D0D14',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:'3rem',maxWidth:780,width:'100%',alignItems:'start'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'}}>
              <div style={{width:180,height:220,background:'linear-gradient(170deg,#0D1522,#101A0F,#1A1209)',border:'1px solid rgba(201,168,76,0.35)',borderRadius:10,display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:14,overflow:'hidden',boxShadow:'0 16px 48px rgba(0,0,0,0.65)'}}>
                <div dangerouslySetInnerHTML={{__html:charSVG(pc,110,140,true)}}/>
              </div>
              <div style={{color:'#C9A84C',fontSize:'0.78rem',fontWeight:500,letterSpacing:1}}>{pc.name||'Tu Personaje'}</div>
            </div>
            <div>
              <div style={{fontSize:'0.65rem',letterSpacing:3,textTransform:'uppercase',color:'#C9A84C',marginBottom:'1.5rem',fontWeight:600}}>Personaliza tu avatar</div>
              {/* Name */}
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Nombre</h3>
                <input placeholder="Ej: Alejandro Reyes" maxLength={24} value={pc.name} onChange={e=>setPc(p=>({...p,name:e.target.value}))} style={{background:'rgba(245,240,232,0.07)',border:'1px solid rgba(201,168,76,0.22)',borderRadius:2,padding:'0.6rem 0.9rem',color:'#F5F0E8',fontFamily:'inherit',fontSize:'0.88rem',width:'100%',outline:'none'}}/>
              </div>
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Cargo</h3>
                <input placeholder="Tu cargo o posición" value={pc.jobTitle} onChange={e=>setPc(p=>({...p,jobTitle:e.target.value}))} style={{background:'rgba(245,240,232,0.07)',border:'1px solid rgba(201,168,76,0.22)',borderRadius:2,padding:'0.6rem 0.9rem',color:'#F5F0E8',fontFamily:'inherit',fontSize:'0.88rem',width:'100%',outline:'none'}}/>
              </div>
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Empresa (opcional)</h3>
                <input placeholder="Tu empresa u organización" value={pc.company} onChange={e=>setPc(p=>({...p,company:e.target.value}))} style={{background:'rgba(245,240,232,0.07)',border:'1px solid rgba(201,168,76,0.22)',borderRadius:2,padding:'0.6rem 0.9rem',color:'#F5F0E8',fontFamily:'inherit',fontSize:'0.88rem',width:'100%',outline:'none'}}/>
              </div>
              {/* Skin */}
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Tono de piel</h3>
                <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                  {SKINS.map(c=><div key={c} onClick={()=>setPc(p=>({...p,skin:c}))} style={{width:34,height:34,borderRadius:'50%',background:c,cursor:'pointer',border:`3px solid ${pc.skin===c?'#C9A84C':'transparent'}`,transform:pc.skin===c?'scale(1.18)':'scale(1)',transition:'all 0.18s'}}/>)}
                </div>
              </div>
              {/* Hair color */}
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Color de cabello</h3>
                <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                  {HAIRS.map(c=><div key={c} onClick={()=>setPc(p=>({...p,hair:c}))} style={{width:34,height:34,borderRadius:'50%',background:c,cursor:'pointer',border:`3px solid ${pc.hair===c?'#C9A84C':'transparent'}`,transform:pc.hair===c?'scale(1.18)':'scale(1)',transition:'all 0.18s'}}/>)}
                </div>
              </div>
              {/* Outfit */}
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Vestimenta</h3>
                <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                  {OUTFITS.map(c=><div key={c} onClick={()=>setPc(p=>({...p,outfit:c}))} style={{width:34,height:34,borderRadius:4,background:c,cursor:'pointer',border:`3px solid ${pc.outfit===c?'#C9A84C':'transparent'}`,transform:pc.outfit===c?'scale(1.18)':'scale(1)',transition:'all 0.18s'}}/>)}
                </div>
              </div>
              {/* Hairstyle */}
              <div style={{marginBottom:'1.3rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Estilo de cabello</h3>
                <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                  {HAIRSTYLES.map(s=><button key={s} onClick={()=>setPc(p=>({...p,hairstyle:s}))} style={{background:pc.hairstyle===s?'rgba(201,168,76,0.15)':'rgba(245,240,232,0.05)',border:`1px solid ${pc.hairstyle===s?'#C9A84C':'rgba(245,240,232,0.15)'}`,color:pc.hairstyle===s?'#C9A84C':'rgba(245,240,232,0.5)',padding:'0.38rem 0.9rem',borderRadius:2,fontSize:'0.78rem',cursor:'pointer',fontFamily:'inherit'}}>{HS_LABELS[s]}</button>)}
                </div>
              </div>
              {/* Expression */}
              <div style={{marginBottom:'1.5rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>Expresión</h3>
                <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                  {EXPRESSIONS.map(e=><button key={e} onClick={()=>setPc(p=>({...p,expression:e}))} style={{background:pc.expression===e?'rgba(201,168,76,0.15)':'rgba(245,240,232,0.05)',border:`1px solid ${pc.expression===e?'#C9A84C':'rgba(245,240,232,0.15)'}`,color:pc.expression===e?'#C9A84C':'rgba(245,240,232,0.5)',padding:'0.38rem 0.9rem',borderRadius:2,fontSize:'0.78rem',cursor:'pointer',fontFamily:'inherit'}}>{EXPR_LABELS[e]}</button>)}
                </div>
              </div>
              <div style={{display:'flex',gap:'0.8rem',flexWrap:'wrap'}}>
                <button onClick={()=>{if(!pc.name.trim()){alert('Por favor ingresa tu nombre.');return;}if(!pc.jobTitle.trim()){alert('Por favor ingresa tu cargo.');return;}setScreen('modules');}} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer',letterSpacing:0.5}}>Comenzar →</button>
                <button onClick={()=>setScreen('title')} style={{background:'transparent',border:'1px solid rgba(245,240,232,0.14)',color:'rgba(245,240,232,0.45)',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.82rem',cursor:'pointer',fontFamily:'inherit'}}>← Volver</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULES ── */}
      {screen==='modules' && (
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
                  {done&&<div style={{position:'absolute',top:'0.9rem',right:'0.9rem',fontSize:'0.75rem',fontWeight:600,color:'#C9A84C'}}>✓ {mod.scenarios.length}/{mod.scenarios.length}</div>}
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
                <div style={{fontSize:'0.63rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',fontWeight:600}}>{currentSc.tag} · Dilema {gs.currentScenario+1}/{currentMod.scenarios.length}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.25rem',color:'#F5F0E8',fontWeight:700,lineHeight:1.3,marginTop:'0.3rem'}}>{currentSc.title}</div>
              </div>
              <p style={{fontSize:'0.85rem',color:'rgba(245,240,232,0.68)',lineHeight:1.75,animation:'fadeIn 0.5s ease'}}>{currentSc.body}</p>
              <div style={{background:'rgba(201,168,76,0.07)',borderLeft:'2px solid rgba(201,168,76,0.5)',padding:'0.75rem 0.9rem',borderRadius:'0 2px 2px 0',animation:'fadeIn 0.5s ease'}}>
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
                  <div style={{fontSize:'0.62rem',letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,marginBottom:'0.35rem',color:'#1A3A5C'}}>Perfil revelado: {PROFILES[gs.selectedOpt.profile]?.name}</div>
                  <div style={{fontSize:'0.83rem',color:'#0D0D14',lineHeight:1.55}}>{gs.selectedOpt.outcome}</div>
                  <div style={{marginTop:'0.5rem',fontSize:'0.77rem',color:'#7A7060',fontStyle:'italic'}}>{gs.selectedOpt.consequence}</div>
                  <button onClick={nextScenario} style={{background:'#0D0D14',color:'#F5F0E8',padding:'0.72rem 1.7rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer',letterSpacing:0.5,transition:'all 0.2s',marginTop:'0.8rem',alignSelf:'flex-start'}}>
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
        const isGuess = mgScreen.type === 'guess';
        return (
          <div style={{height:'100vh',background:'#0D0D14',display:'flex',flexDirection:'column'}}>
            <div style={{width:'100%',background:'rgba(245,240,232,0.04)',borderBottom:'1px solid rgba(201,168,76,0.15)',padding:'0.65rem 1.4rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.88rem',fontWeight:700}}>{mgInfo.icon} {mgInfo.title}</div>
              <button onClick={skipMinigame} style={{background:'none',border:'1px solid rgba(245,240,232,0.18)',color:'rgba(245,240,232,0.45)',padding:'0.28rem 0.75rem',fontSize:'0.75rem',cursor:'pointer',borderRadius:1,fontFamily:'inherit'}}>Omitir → continuar módulo</button>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.8rem',padding:'0.8rem 1rem',overflowY:'auto'}}>
              <div style={{background:'rgba(245,240,232,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:2,padding:'0.6rem 1rem',maxWidth:680,width:'100%'}}>
                <div style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.25rem',fontWeight:600}}>{mgInfo.icon} {mgInfo.title}</div>
                <div style={{fontSize:'0.78rem',color:'rgba(245,240,232,0.5)',lineHeight:1.45}}>{mgInfo.inst}</div>
              </div>
              <div style={{display:'flex',alignItems:'flex-start',gap:'1.2rem',flexWrap:'wrap',justifyContent:'center'}}>
                <div style={{position:'relative',lineHeight:0}}>
                  {!isGuess&&<canvas ref={canvasRef} width={CV_SIZE} height={CV_SIZE} style={{border:'1px solid rgba(201,168,76,0.25)',borderRadius:2,display:'block',width:Math.min(440,window.innerWidth-32),height:Math.min(440,window.innerWidth-32)}}/>}
                  {isGuess&&(
                    <div style={{width:Math.min(440,window.innerWidth-32),minHeight:300,background:'rgba(245,240,232,0.04)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1.1rem',padding:'2rem'}}>
                      <div style={{fontSize:'3rem',lineHeight:1}}>🔢</div>
                      <p style={{fontSize:'0.82rem',color:'rgba(245,240,232,0.45)',textAlign:'center'}}>Estoy pensando en un número del 1 al 50</p>
                      <div style={{fontSize:'1rem',color:'#F5F0E8',fontWeight:600,minHeight:'1.5rem',textAlign:'center',letterSpacing:0.5}}>{guessState.hint||'—'}</div>
                      <div style={{display:'flex',gap:'0.6rem',alignItems:'center'}}>
                        <input type="number" min={1} max={50} placeholder="?" value={guessState.inputVal} disabled={guessState.done} onChange={e=>setGuessState(g=>({...g,inputVal:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&!guessState.done&&submitGuess()} style={{width:90,background:'rgba(245,240,232,0.1)',border:'1px solid rgba(201,168,76,0.35)',borderRadius:2,padding:'0.6rem 0.8rem',color:'#F5F0E8',fontSize:'1.2rem',textAlign:'center',outline:'none',fontFamily:'inherit'}}/>
                        {!guessState.done&&<button onClick={submitGuess} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.65rem 1.6rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer'}}>Adivinar</button>}
                      </div>
                      <div style={{fontSize:'0.72rem',color:'rgba(245,240,232,0.3)',letterSpacing:'1.5px',textTransform:'uppercase'}}>Intentos: {guessState.attempts} / 7</div>
                    </div>
                  )}
                  {!mgScreen.started&&!isGuess&&(
                    <div style={{position:'absolute',inset:0,background:'rgba(13,13,20,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.9rem',borderRadius:2}}>
                      <div style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'1.35rem',fontWeight:700}}>¿Listo/a?</div>
                      <div style={{fontSize:'0.78rem',color:'rgba(245,240,232,0.5)',textAlign:'center',maxWidth:260}}>Presiona para comenzar</div>
                      <button onClick={()=>{ setMgScreen(m=>({...m,started:true})); mgStart(); }} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.65rem 1.6rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer'}}>Jugar</button>
                    </div>
                  )}
                  {!mgScreen.started&&isGuess&&(
                    <div style={{position:'absolute',inset:0,background:'rgba(13,13,20,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.9rem',borderRadius:2}}>
                      <div style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'1.35rem',fontWeight:700}}>¿Listo/a?</div>
                      <button onClick={()=>{ setMgScreen(m=>({...m,started:true})); startGuess(); }} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.65rem 1.6rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer'}}>Jugar</button>
                    </div>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',alignItems:'center',minWidth:110,paddingTop:'0.5rem'}}>
                  <div style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',fontWeight:600}}>Puntuación</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',color:'#F5F0E8',fontWeight:700,textAlign:'center',lineHeight:1}}>{mgScreen.score}</div>
                  <div style={{fontSize:'0.78rem',color:'rgba(245,240,232,0.45)',textAlign:'center',lineHeight:1.5,maxWidth:130}}>{mgScreen.done?(mgScreen.score>0?'¡Muy bien! 🎉':'Juego terminado'):''}</div>
                  {mgScreen.done&&<button onClick={continueAfterMg} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.65rem 1.6rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer',marginTop:'0.5rem'}}>Continuar →</button>}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── RESULT ── */}
      {screen==='result'&&(()=>{
        const mi = gs.currentModule;
        const mp = gs.moduleProfiles[mi]||{};
        const dom = domProfile(mp);
        const prof = PROFILES[dom];
        const total = Math.max(1, Object.values(mp).reduce((a,b)=>a+b,0));
        const nextIdx = mi+1;
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
            <p style={{fontSize:'0.85rem',color:'#7A7060',marginBottom:'1.5rem'}}>{dbSaved?'✅ Registro guardado en la base de datos':'⏳ Guardando registro...'}</p>
            <Certificate name={pc.name} jobTitle={pc.jobTitle} company={pc.company} profile={globalProfile} scores={gs.totalProfiles}/>
            <div style={{display:'flex',gap:'1rem',justifyContent:'center',marginTop:'1.5rem',flexWrap:'wrap'}}>
              <button onClick={downloadPDF} disabled={pdfLoading} style={{background:'#0D0D14',color:'#F5F0E8',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:pdfLoading?'wait':'pointer',opacity:pdfLoading?0.7:1,display:'inline-flex',alignItems:'center',gap:'0.5rem'}}>
                {pdfLoading?'⏳ Generando PDF...':'⬇ Descargar Certificado PDF'}
              </button>
              <button onClick={()=>{setScreen('title');setGs({completedModules:[],moduleProfiles:{},totalProfiles:{pragmatic:0,idealist:0,relational:0,systemic:0},currentModule:null,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:[]});setDbSaved(false);}} style={{background:'transparent',color:'#7A7060',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.85rem',border:'1px solid #D4CCB8',cursor:'pointer',fontFamily:'inherit'}}>Jugar de nuevo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}