import { useState, useEffect, useRef, useCallback } from "react";


import { supabase } from './lib/supabase'

async function saveCertificate(data) {
  const { data: result, error } = await supabase
    .from('certificates')
    .insert([data])
    .select()

  if (error) console.error('Supabase error:', error)
  return result
}
// ─── DATA ───
const PROFILES = {
  pragmatic: { name: "Pragmático/a", color: "#1A3A5C", emoji: "⚡" },
  idealist: { name: "Idealista", color: "#4A7C5E", emoji: "🌿" },
  relational: { name: "Relacional", color: "#A04A2F", emoji: "🤝" },
  systemic: { name: "Sistémico/a", color: "#5A4A7C", emoji: "🔭" },
};

const MODULES = [
  {
    id: 0, icon: "⚖️", title: "Liderazgo y Poder", tag: "Decisión ética",
    desc: "Cómo el poder moldea las decisiones cotidianas.",
    scenarios: [
      { title: "El ascenso que incomoda", body: "Tu mejor colaborador merece el ascenso, pero el director quiere a alguien más afín al equipo directivo.", context: "Hay presión implícita desde arriba. No es una orden directa.", options: [
        { text: "Propones al colaborador merecedor con argumentos de desempeño documentados.", profile: "idealist", outcome: "Tu recomendación genera tensión, pero el proceso queda bien fundamentado.", consequence: "+Integridad · Tensión con directivos" },
        { text: "Buscas un acuerdo: el merecedor recibe el ascenso pero con mentoría del favorito directivo.", profile: "relational", outcome: "Ambas partes quedan relativamente satisfechas.", consequence: "+Consenso · −Pureza del mérito" },
        { text: "Priorizas mantener la relación con el director y propones al favorito.", profile: "pragmatic", outcome: "Evitas el conflicto. Tu colaborador pierde confianza en el sistema.", consequence: "+Capital político · −Equidad" },
        { text: "Propones un proceso formal de evaluación por competencias para despersonalizar la decisión.", profile: "systemic", outcome: "El proceso tarda, pero establece un precedente institucional.", consequence: "+Sistema justo · −Velocidad" },
      ]},
      { title: "La información que queman", body: "Tienes datos que demuestran que la estrategia del director no está funcionando. Presentarlo podría salvarte o hundirte.", context: "El director tiene 15 años en la empresa. Tú llevas 2.", options: [
        { text: "Presentas los datos con contexto constructivo, sin atacar la estrategia directamente.", profile: "idealist", outcome: "El director se pone a la defensiva. A largo plazo te ve como alguien valioso y honesto.", consequence: "+Transparencia · Riesgo personal" },
        { text: "Compartes los datos solo con colegas de confianza para construir consenso antes de escalar.", profile: "relational", outcome: "El mensaje llega de forma más diluida, pero con más respaldo.", consequence: "+Respaldo · −Velocidad" },
        { text: "Guardas los datos y esperas a que la situación se haga evidente por sí misma.", profile: "pragmatic", outcome: "Evitas el conflicto. Cuando falla, tienes los datos pero ya es tarde.", consequence: "+Sin riesgo inmediato · −Impacto" },
        { text: "Propones una revisión trimestral formal de indicadores para que los datos hablen solos.", profile: "systemic", outcome: "El proceso se institucionaliza. La próxima vez habrá un canal claro.", consequence: "+Proceso · −Urgencia actual" },
      ]},
    ],
  },
  {
    id: 1, icon: "📜", title: "Normativa y Cumplimiento", tag: "Ética institucional",
    desc: "La brecha entre la norma escrita y la realidad operativa.",
    scenarios: [
      { title: "El atajo que todos conocen", body: "Hay un proceso informal que todos usan para agilizar aprobaciones. Funciona, pero no está en el reglamento.", context: "Documentar el atajo implicaría reconocer que se ha violado el proceso formal.", options: [
        { text: "Documentas el proceso real y propones formalizarlo como política oficial.", profile: "systemic", outcome: "El proceso se formaliza. Toma tiempo pero elimina la ambigüedad.", consequence: "+Claridad normativa · −Velocidad" },
        { text: "Continúas usándolo pero te aseguras de que haya un rastro documental de cada uso.", profile: "pragmatic", outcome: "La eficiencia se mantiene. El rastro documental mitiga el riesgo.", consequence: "+Eficiencia · Riesgo regulatorio latente" },
        { text: "Dejas de usarlo y sigues el proceso formal aunque sea más lento.", profile: "idealist", outcome: "Tu área pierde velocidad. Otros siguen usando el atajo.", consequence: "+Cumplimiento · −Competitividad interna" },
        { text: "Hablas con el equipo para entender por qué el proceso formal es tan lento y atacas la causa.", profile: "relational", outcome: "El diagnóstico revela cuellos de botella reales. La solución tarda pero es más duradera.", consequence: "+Causa raíz · −Impacto inmediato" },
      ]},
      { title: "La auditoría que llega", body: "Un auditor externo está revisando procesos. Tu área tiene un procedimiento que cumple el espíritu pero no la letra de la norma.", context: "Corregirlo antes de la auditoría podría verse como una confesión. No corregirlo, como negligencia.", options: [
        { text: "Corriges el procedimiento y lo documentas antes de la auditoría con fecha visible.", profile: "idealist", outcome: "El auditor lo nota. Lo interpreta positivamente como cultura de mejora continua.", consequence: "+Transparencia · Exposición voluntaria" },
        { text: "Dejas todo como está y esperas el resultado de la auditoría.", profile: "pragmatic", outcome: "El auditor puede o no detectarlo. El resultado es incierto.", consequence: "+Sin acción · Riesgo de observación" },
        { text: "Consultas con el área jurídica antes de tomar cualquier decisión.", profile: "systemic", outcome: "La consulta genera un memo que protege a tu área independientemente del resultado.", consequence: "+Respaldo legal · −Velocidad" },
        { text: "Hablas con el auditor antes de empezar para declarar proactivamente la situación.", profile: "relational", outcome: "El auditor aprecia la transparencia. La observación, si ocurre, es menor.", consequence: "+Relación auditor · Exposición directa" },
      ]},
    ],
  },
  {
    id: 2, icon: "🤝", title: "Comunidad e Impacto", tag: "Responsabilidad",
    desc: "El impacto de las decisiones corporativas en las comunidades.",
    scenarios: [
      { title: "El proyecto que contamina", body: "Un proyecto rentable tiene externalidades negativas sobre una comunidad cercana. No es ilegal, pero está en un área gris.", context: "La comunidad no ha presentado quejas formales. La empresa tiene buenas relaciones locales.", options: [
        { text: "Implementas controles adicionales para minimizar el impacto aunque no sean obligatorios.", profile: "idealist", outcome: "El costo sube un 8%. La comunidad y el equipo interno lo valoran.", consequence: "+Ética proactiva · −Margen" },
        { text: "Mantienes el proyecto como está y monitoras si aparecen quejas formales.", profile: "pragmatic", outcome: "Sin quejas en el corto plazo. El riesgo reputacional sigue latente.", consequence: "+Rentabilidad · Riesgo reputacional" },
        { text: "Organizas mesas de diálogo con la comunidad antes de tomar cualquier decisión.", profile: "relational", outcome: "La comunidad revela impactos que tu equipo no había medido.", consequence: "+Confianza · −Velocidad del proyecto" },
        { text: "Encargas una evaluación de impacto ambiental y social independiente.", profile: "systemic", outcome: "El informe provee una base objetiva para la decisión.", consequence: "+Evidencia · −Tiempo y costo" },
      ]},
      { title: "La compensación que divides", body: "Hay recursos limitados para invertir en la comunidad. Dos grupos tienen necesidades legítimas pero incompatibles.", context: "Uno de los grupos tiene más voz y acceso mediático. El otro tiene mayor necesidad objetiva.", options: [
        { text: "Priorizas al grupo con mayor necesidad objetiva según indicadores socioeconómicos.", profile: "systemic", outcome: "La decisión es técnicamente sólida. El grupo vocal genera ruido mediático.", consequence: "+Equidad técnica · Riesgo reputacional" },
        { text: "Divides los recursos equitativamente entre los dos grupos.", profile: "relational", outcome: "Ambos grupos quedan parcialmente satisfechos. El impacto se fragmenta.", consequence: "+Paz social · −Impacto focalizado" },
        { text: "Priorizas al grupo vocal para evitar el conflicto público.", profile: "pragmatic", outcome: "Evitas la crisis mediática. El grupo más vulnerable queda desatendido.", consequence: "+Control del daño · −Equidad" },
        { text: "Creas un comité mixto con representantes de ambos grupos para decidir el criterio.", profile: "idealist", outcome: "El proceso es legítimo y participativo. La decisión final es más aceptada.", consequence: "+Legitimidad · −Velocidad" },
      ]},
    ],
  },
  {
    id: 3, icon: "🔍", title: "Integridad Financiera", tag: "Transparencia",
    desc: "Dilemas sobre transparencia y errores en procesos financieros.",
    scenarios: [
      { title: "El error que nadie vio", body: "Descubres un error en el sistema de facturación que ha cobrado de más a clientes durante 3 meses. El monto es significativo.", context: "El error fue del sistema, no de mala fe. Corregirlo requiere revelar el fallo.", options: [
        { text: "Corriges el sistema y contactas proactivamente a todos los afectados antes de que reclamen.", profile: "idealist", outcome: "Genera ruido inmediato. A largo plazo la empresa gana reputación de transparencia.", consequence: "+Integridad · Exposición inmediata" },
        { text: "Corriges el sistema en silencio y compensas solo a quien reclame.", profile: "pragmatic", outcome: "El sistema se corrige. Meses después alguien descubre el patrón.", consequence: "+Control del daño · −Transparencia" },
        { text: "Contactas primero a los clientes más afectados antes de hacer cualquier comunicado.", profile: "relational", outcome: "Los clientes clave se sienten considerados individualmente.", consequence: "+Fidelización · −Velocidad" },
        { text: "Realizas una auditoría de todos los procesos automatizados antes de comunicar.", profile: "systemic", outcome: "La auditoría tarda tres semanas. El comunicado es más preciso.", consequence: "+Rigor · −Velocidad" },
      ]},
      { title: "El proveedor y el favor", body: "Un proveedor clave te ofrece un beneficio personal a cambio de priorizar su renovación de contrato.", context: "La calidad del proveedor es buena. El beneficio no es ilegal en tu país pero viola la política interna.", options: [
        { text: "Rechazas el beneficio y lo reportas al área de compliance.", profile: "idealist", outcome: "Compliance abre una investigación. La relación con el proveedor se enfría.", consequence: "+Integridad total · Tensión comercial" },
        { text: "Rechazas el beneficio sin reportarlo. Continúas la relación comercial normalmente.", profile: "relational", outcome: "Evitas escalar. El proveedor entiende el límite.", consequence: "+Relación preservada · Sin registro" },
        { text: "Aceptas el beneficio considerando que la calidad del proveedor lo justifica.", profile: "pragmatic", outcome: "La operación continúa sin cambios. El riesgo personal permanece latente.", consequence: "+Relación · Riesgo ético y legal" },
        { text: "Propones al área de compras revisar el proceso de renovación para hacerlo más transparente.", profile: "systemic", outcome: "El proceso mejora estructuralmente para todos los proveedores.", consequence: "+Sistema · −Respuesta inmediata" },
      ]},
    ],
  },
  {
    id: 4, icon: "🌱", title: "Cultura Viva", tag: "Clima organizacional",
    desc: "Las decisiones cotidianas que construyen o destruyen una cultura.",
    scenarios: [
      { title: "La reunión que sobrevive a su propósito", body: "Tu equipo tiene una reunión semanal de 2 horas que nadie quiere pero todos asisten. Podría hacerse en 20 minutos.", context: "Dos personas dicen que es su único espacio de conexión. El equipo trabaja híbrido.", options: [
        { text: "Reduces la reunión a lo estrictamente necesario. El tiempo es el recurso más escaso.", profile: "pragmatic", outcome: "La productividad sube. Dos personas sienten que perdieron su espacio de pertenencia.", consequence: "+Eficiencia · −Cohesión para algunos" },
        { text: "Preguntas al equipo qué valoran de la reunión y rediseñas el formato.", profile: "relational", outcome: "El proceso revela necesidades heterogéneas. El nuevo formato satisface mejor a más personas.", consequence: "+Diseño participativo · −Velocidad" },
        { text: "Eliminas la reunión y creas un protocolo escrito.", profile: "idealist", outcome: "El equipo adapta. Las conexiones ocurren de otras formas.", consequence: "+Estructura · −Espacio informal" },
        { text: "Propones un experimento de 4 semanas con formato reducido para evaluar con datos.", profile: "systemic", outcome: "Los datos muestran que la productividad sube pero la satisfacción baja.", consequence: "+Datos · −Tiempo del experimento" },
      ]},
      { title: "El chiste que no fue chiste", body: "En una reunión alguien hace un comentario que varios ríen pero que una persona recibe como ofensivo. Nadie más lo nota.", context: "El ambiente suele ser informal. No existe protocolo claro de conducta.", options: [
        { text: "Detienes la reunión y nombras que el comentario puede haber sido incómodo.", profile: "idealist", outcome: "Hay silencio incómodo. La persona afectada te agradece después. El estándar cambia.", consequence: "+Estándar de conducta · Tensión inmediata" },
        { text: "Hablas después con la persona afectada para ver cómo está y decidir juntos qué hacer.", profile: "relational", outcome: "La persona se siente acompañada. La confianza en ti aumenta.", consequence: "+Apoyo interpersonal · −Resolución colectiva" },
        { text: "No intervienes. Hablar podría generar más incomodidad.", profile: "pragmatic", outcome: "Nada pasa en esa reunión. La persona afectada empieza a participar menos.", consequence: "+Evitación del conflicto · −Seguridad psicológica" },
        { text: "Propones construir un acuerdo de conducta en la próxima reunión.", profile: "systemic", outcome: "El proceso genera un documento compartido que cambia la dinámica gradualmente.", consequence: "+Cambio cultural · −Acción inmediata" },
      ]},
      { title: "La rotación que duele", body: "Tu mejor colaborador recibió una oferta externa. No puedes igualar el salario.", context: "Perder esta persona afecta un proyecto crítico. El equipo ya está al límite.", options: [
        { text: "Tienes una conversación profunda con la persona sobre qué valora además del salario.", profile: "relational", outcome: "Descubres que hay otros factores. Juntos diseñan un acuerdo que la persona acepta.", consequence: "+Solución personalizada · −Escalabilidad" },
        { text: "Eres transparente: no puedes igualar el salario ni crear un rol que no existe.", profile: "idealist", outcome: "La persona se va. El equipo aprecia la honestidad sobre las posibilidades reales.", consequence: "+Honestidad · −Retención" },
        { text: "Creas el rol aunque no esté bien definido. Es mejor que perderlo.", profile: "pragmatic", outcome: "La persona se queda. El rol no está claro y genera fricción con el equipo.", consequence: "+Retención · −Claridad organizacional" },
        { text: "Propones revisar la política de retención para que no dependa de improvisación.", profile: "systemic", outcome: "La política tarda. Esta persona se va pero el siguiente caso tiene un protocolo.", consequence: "+Mejora estructural · −Impacto inmediato" },
      ]},
    ],
  },
];

// ─── HELPERS ───
function domProfile(counts) {
  return Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b), "pragmatic");
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── CHARACTER SVG ───
function CharSVG({ cfg, w = 80, h = 100, anim = false }) {
  const { skin = "#F0C27F", hair = "#1A0A00", outfit = "#1A3A5C", expression = "happy" } = cfg || {};
  const shade = (hex, pct) => {
    try {
      const n = parseInt(hex.replace("#", ""), 16), a = Math.round(2.55 * pct);
      const R = Math.max(0, Math.min(255, (n >> 16) + a));
      const G = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + a));
      const B = Math.max(0, Math.min(255, (n & 0xff) + a));
      return "#" + (0x1000000 + R * 65536 + G * 256 + B).toString(16).slice(1);
    } catch { return hex; }
  };
  const od = shade(outfit, -28), skd = shade(skin, -14);
  let mouth = "", eyeL = `<ellipse cx="34" cy="21" rx="3" ry="3.5" fill="${shade(skin,-55)}"/><circle cx="33.2" cy="20" r="1.2" fill="white"/>`;
  let eyeR = `<ellipse cx="46" cy="21" rx="3" ry="3.5" fill="${shade(skin,-55)}"/><circle cx="45.2" cy="20" r="1.2" fill="white"/>`;
  if (expression === "happy") mouth = `<path d="M35 30 Q40 35 45 30" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  else if (expression === "serious") { mouth = `<line x1="36" y1="31" x2="44" y2="31" stroke="${skd}" stroke-width="1.8" stroke-linecap="round"/>`; }
  else if (expression === "thinking") { mouth = `<path d="M36 31 Q39 30 43 31.5" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; }
  else mouth = `<path d="M35 30 Q40 35.5 45 30" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const svgContent = `
    <rect x="22" y="38" width="36" height="40" rx="8" fill="${outfit}"/>
    <rect x="10" y="41" width="12" height="28" rx="6" fill="${outfit}"/>
    <rect x="58" y="41" width="12" height="28" rx="6" fill="${outfit}"/>
    <rect x="30" y="76" width="8" height="18" rx="4" fill="${od}"/>
    <rect x="42" y="76" width="8" height="18" rx="4" fill="${od}"/>
    <rect x="35" y="33" width="10" height="10" rx="4" fill="${skin}"/>
    <path d="M27 20 Q40 6 53 20 L51 14 Q40 2 29 14Z" fill="${hair}"/>
    <circle cx="40" cy="22" r="18" fill="${skin}"/>
    ${eyeL}${eyeR}
    <ellipse cx="40" cy="26.5" rx="1.4" ry="0.9" fill="${skd}"/>
    ${mouth}
  `;
  return (
    <svg width={w} height={h} viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg"
      style={anim ? { animation: "bob 3s ease-in-out infinite" } : {}}>
      <style>{`@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
      <g dangerouslySetInnerHTML={{ __html: svgContent }} />
    </svg>
  );
}

// ─── CERTIFICATE COMPONENT ───
function CertificateView({ playerName, jobTitle, company, profile, scores, date, forPDF = false }) {
  const prof = PROFILES[profile] || PROFILES.pragmatic;
  const MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const d = date || new Date();
  const dateStr = `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

  return (
    <div id="certificate-render" style={{
      background: "#FDFCF8", border: "2px solid #C9A84C", padding: "2.5rem",
      position: "relative", maxWidth: 600, margin: "0 auto",
      fontFamily: forPDF ? "Georgia, serif" : "inherit",
    }}>
      {["tl","tr","bl","br"].map(pos => (
        <div key={pos} style={{
          position: "absolute", width: 20, height: 20,
          top: pos.includes("t") ? 8 : "auto", bottom: pos.includes("b") ? 8 : "auto",
          left: pos.includes("l") ? 8 : "auto", right: pos.includes("r") ? 8 : "auto",
          borderColor: "#0D0D14", borderStyle: "solid",
          borderWidth: pos === "tl" ? "2px 0 0 2px" : pos === "tr" ? "2px 2px 0 0" : pos === "bl" ? "0 0 2px 2px" : "0 2px 2px 0",
        }} />
      ))}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.62rem", letterSpacing: 4, textTransform: "uppercase", color: "#7A7060", marginBottom: "0.8rem" }}>
          Certificado de Liderazgo Ético · CiudadanoCorp
        </div>
        <div style={{ fontSize: "0.82rem", color: "#7A7060", marginBottom: "0.5rem" }}>Se certifica que</div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", color: "#0D0D14", fontWeight: 900, marginBottom: "0.3rem" }}>
          {playerName || "Participante"}
        </div>
        {jobTitle && <div style={{ fontSize: "0.9rem", color: "#1A3A5C", fontWeight: 600, marginBottom: "0.2rem" }}>{jobTitle}</div>}
        {company && <div style={{ fontSize: "0.82rem", color: "#7A7060", marginBottom: "0.5rem" }}>{company}</div>}
        <div style={{ width: 40, height: 1, background: "#C9A84C", margin: "0.8rem auto" }} />
        <div style={{ fontSize: "0.82rem", color: "#7A7060", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 0.8rem" }}>
          Ha completado el programa de capacitación en Liderazgo Ético, navegando dilemas organizacionales complejos con reflexión y criterio propio.
        </div>
        <div style={{ width: 40, height: 1, background: "#C9A84C", margin: "0.8rem auto" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center", marginBottom: "0.8rem" }}>
          {["⚖️ Liderazgo","📜 Normativa","🤝 Comunidad","🔍 Integridad","🌱 Cultura"].map(b => (
            <span key={b} style={{ padding: "0.15rem 0.6rem", fontSize: "0.68rem", letterSpacing: 1, textTransform: "uppercase", border: "1px solid #D4CCB8", color: "#7A7060", borderRadius: 2, fontWeight: 600 }}>{b}</span>
          ))}
        </div>
        <div style={{ width: 40, height: 1, background: "#C9A84C", margin: "0.8rem auto" }} />
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.5rem", color: prof.color, fontStyle: "italic", fontWeight: 700, marginBottom: "0.3rem" }}>
          {prof.emoji} {prof.name}
        </div>
        <div style={{ fontSize: "0.78rem", color: "#7A7060", marginBottom: "1rem" }}>Perfil de Liderazgo Dominante</div>
        <div style={{ marginBottom: "1rem" }}>
          {Object.entries(PROFILES).map(([key, p]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", maxWidth: 300, margin: "0 auto 0.3rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#7A7060", width: 90, textAlign: "right" }}>{p.name}</span>
              <div style={{ flex: 1, height: 4, background: "#E8E4DC", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(scores[key] || 0) / total * 100}%`, background: p.color, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: "#C9A84C", width: 18 }}>{scores[key] || 0}</span>
            </div>
          ))}
        </div>
        <div style={{ width: 40, height: 1, background: "#C9A84C", margin: "0.8rem auto" }} />
        <div style={{ fontSize: "0.68rem", letterSpacing: 2, color: "#7A7060" }}>{dateStr}</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function CiudadanoCorp() {
  const [screen, setScreen] = useState("title");
  const [pc, setPc] = useState({ name: "", jobTitle: "", company: "", skin: "#F0C27F", hair: "#1A0A00", outfit: "#1A3A5C", expression: "happy" });
  const [gameState, setGameState] = useState({ completedModules: [], moduleProfiles: {}, totalProfiles: { pragmatic: 0, idealist: 0, relational: 0, systemic: 0 }, currentModule: null, currentScenario: 0, answered: false, shuffledOptions: [] });
  const [dbSaved, setDbSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const certRef = useRef();

  const startModule = (idx) => {
    setGameState(g => ({ ...g, currentModule: idx, currentScenario: 0, answered: false,
      moduleProfiles: { ...g.moduleProfiles, [idx]: { pragmatic: 0, idealist: 0, relational: 0, systemic: 0 } },
      shuffledOptions: shuffle(MODULES[idx].scenarios[0].options),
    }));
    setScreen("game");
  };

  const selectOption = (opt) => {
    if (gameState.answered) return;
    setGameState(g => ({
      ...g, answered: true,
      moduleProfiles: { ...g.moduleProfiles, [g.currentModule]: { ...g.moduleProfiles[g.currentModule], [opt.profile]: (g.moduleProfiles[g.currentModule]?.[opt.profile] || 0) + 1 } },
      totalProfiles: { ...g.totalProfiles, [opt.profile]: g.totalProfiles[opt.profile] + 1 },
      selectedOption: opt,
    }));
  };

  const nextScenario = () => {
    const mod = MODULES[gameState.currentModule];
    const nextIdx = gameState.currentScenario + 1;
    if (nextIdx < mod.scenarios.length) {
      setGameState(g => ({ ...g, currentScenario: nextIdx, answered: false, selectedOption: null, shuffledOptions: shuffle(mod.scenarios[nextIdx].options) }));
    } else {
      const mi = gameState.currentModule;
      setGameState(g => ({ ...g, completedModules: g.completedModules.includes(mi) ? g.completedModules : [...g.completedModules, mi] }));
      setScreen("result");
    }
  };

  const handleFinal = async () => {
    setScreen("final");
    if (!dbSaved) {
      const profile = domProfile(gameState.totalProfiles);
      await saveCertificate({
        full_name: pc.name || "Participante",
        job_title: pc.jobTitle || "Sin especificar",
        company: pc.company || null,
        dominant_profile: profile,
        profile_scores: gameState.totalProfiles,
        modules_completed: gameState.completedModules.length,
        issued_at: new Date().toISOString(),
        session_id: Math.random().toString(36).slice(2),
      });
      setDbSaved(true);
    }
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const html2canvas = (await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")).default;
      const jsPDF = (await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")).jsPDF;
      const element = document.getElementById("certificate-render");
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#FDFCF8" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const x = (pdfWidth - canvas.width * ratio) / 2;
      const y = (pdfHeight - canvas.height * ratio) / 2;
      pdf.addImage(imgData, "PNG", x, y, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`Certificado_${(pc.name || "Participante").replace(/\s+/g, "_")}_CiudadanoCorp.pdf`);
    } catch (e) {
      alert("No se pudo generar el PDF en este momento. Intenta desde Chrome o Firefox.");
    }
    setPdfLoading(false);
  };

  const SKINS = ["#FDDBB4","#F0C27F","#D4956A","#B87041","#8D5524","#5C3317"];
  const HAIRS = ["#1A0A00","#3B1F00","#7B4A1E","#C49A6C","#E8C97E","#CCCCCC","#8B1A1A"];
  const OUTFITS = ["#1A3A5C","#2E5F8A","#4A7C5E","#A04A2F","#5A4A7C","#2C2C2C","#7A6010"];
  const EXPRESSIONS = [{ key: "happy", label: "😊 Feliz" },{ key: "serious", label: "😐 Serio/a" },{ key: "thinking", label: "🤔 Pensativo/a" },{ key: "wink", label: "😉 Cómplice" }];

  const currentMod = gameState.currentModule !== null ? MODULES[gameState.currentModule] : null;
  const currentSc = currentMod ? currentMod.scenarios[gameState.currentScenario] : null;
  const globalProfile = domProfile(gameState.totalProfiles);
  const allDone = gameState.completedModules.length === MODULES.length;

  // ── SCREENS ──
  const S = {
    title: (
      <div style={{ minHeight:"100vh", background:"#0D0D14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", textAlign:"center" }}>
        <div style={{ fontSize:"0.68rem", letterSpacing:4, textTransform:"uppercase", color:"#C9A84C", marginBottom:"1rem" }}>Programa de Capacitación</div>
        <CharSVG cfg={pc} w={100} h={120} anim />
        <h1 style={{ fontFamily:"Georgia, serif", fontSize:"clamp(3rem,8vw,5rem)", color:"#F5F0E8", lineHeight:0.95, fontWeight:900, marginBottom:"0.8rem", marginTop:"1rem" }}>CiudadanoCorp</h1>
        <div style={{ width:50, height:2, background:"#C9A84C", margin:"0 auto 1rem" }} />
        <p style={{ fontSize:"0.9rem", color:"rgba(245,240,232,0.6)", lineHeight:1.7, maxWidth:400, marginBottom:"2rem" }}>
          Navega dilemas éticos reales. Descubre tu perfil de liderazgo. Obtén tu certificado.
        </p>
        <button onClick={() => setScreen("customize")} style={{ background:"#C9A84C", color:"#0D0D14", padding:"0.85rem 2.2rem", borderRadius:2, fontWeight:700, fontSize:"0.95rem", border:"none", cursor:"pointer", letterSpacing:0.5 }}>
          Comenzar →
        </button>
      </div>
    ),
    customize: (
      <div style={{ minHeight:"100vh", background:"#0D0D14", padding:"2rem", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:"3rem", maxWidth:700, width:"100%" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem" }}>
            <div style={{ background:"linear-gradient(170deg,#0D1522,#101A0F)", border:"1px solid rgba(201,168,76,0.35)", borderRadius:10, padding:"1.5rem 1rem", display:"flex", justifyContent:"center" }}>
              <CharSVG cfg={pc} w={120} h={150} anim />
            </div>
            <div style={{ color:"#C9A84C", fontSize:"0.8rem" }}>{pc.name || "Tu Personaje"}</div>
          </div>
          <div>
            <div style={{ fontSize:"0.65rem", letterSpacing:3, textTransform:"uppercase", color:"#C9A84C", marginBottom:"1.5rem", fontWeight:600 }}>Personaliza tu personaje</div>
            {[["Nombre", <input key="n" placeholder="Tu nombre" value={pc.name} onChange={e => setPc(p => ({...p, name: e.target.value}))} style={{ background:"rgba(245,240,232,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:2, padding:"0.55rem 0.8rem", color:"#F5F0E8", fontFamily:"inherit", fontSize:"0.88rem", width:"100%", outline:"none" }} />],
              ["Cargo", <input key="j" placeholder="Tu cargo o posición" value={pc.jobTitle} onChange={e => setPc(p => ({...p, jobTitle: e.target.value}))} style={{ background:"rgba(245,240,232,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:2, padding:"0.55rem 0.8rem", color:"#F5F0E8", fontFamily:"inherit", fontSize:"0.88rem", width:"100%", outline:"none" }} />],
              ["Empresa (opcional)", <input key="c" placeholder="Tu empresa u organización" value={pc.company} onChange={e => setPc(p => ({...p, company: e.target.value}))} style={{ background:"rgba(245,240,232,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:2, padding:"0.55rem 0.8rem", color:"#F5F0E8", fontFamily:"inherit", fontSize:"0.88rem", width:"100%", outline:"none" }} />],
            ].map(([label, input]) => (
              <div key={label} style={{ marginBottom:"1rem" }}>
                <div style={{ color:"rgba(245,240,232,0.5)", fontSize:"0.75rem", marginBottom:"0.4rem" }}>{label}</div>
                {input}
              </div>
            ))}
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ color:"rgba(245,240,232,0.5)", fontSize:"0.75rem", marginBottom:"0.4rem" }}>Tono de piel</div>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                {SKINS.map(c => <div key={c} onClick={() => setPc(p => ({...p, skin: c}))} style={{ width:30, height:30, borderRadius:"50%", background:c, cursor:"pointer", border: pc.skin===c ? "3px solid #C9A84C" : "3px solid transparent", transform: pc.skin===c ? "scale(1.15)" : "scale(1)", transition:"all 0.15s" }} />)}
              </div>
            </div>
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ color:"rgba(245,240,232,0.5)", fontSize:"0.75rem", marginBottom:"0.4rem" }}>Cabello</div>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                {HAIRS.map(c => <div key={c} onClick={() => setPc(p => ({...p, hair: c}))} style={{ width:30, height:30, borderRadius:"50%", background:c, cursor:"pointer", border: pc.hair===c ? "3px solid #C9A84C" : "3px solid transparent", transform: pc.hair===c ? "scale(1.15)" : "scale(1)", transition:"all 0.15s" }} />)}
              </div>
            </div>
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ color:"rgba(245,240,232,0.5)", fontSize:"0.75rem", marginBottom:"0.4rem" }}>Atuendo</div>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                {OUTFITS.map(c => <div key={c} onClick={() => setPc(p => ({...p, outfit: c}))} style={{ width:30, height:20, borderRadius:3, background:c, cursor:"pointer", border: pc.outfit===c ? "3px solid #C9A84C" : "3px solid transparent", transform: pc.outfit===c ? "scale(1.15)" : "scale(1)", transition:"all 0.15s" }} />)}
              </div>
            </div>
            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ color:"rgba(245,240,232,0.5)", fontSize:"0.75rem", marginBottom:"0.4rem" }}>Expresión</div>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                {EXPRESSIONS.map(({ key, label }) => <button key={key} onClick={() => setPc(p => ({...p, expression: key}))} style={{ background: pc.expression===key ? "rgba(201,168,76,0.2)" : "rgba(245,240,232,0.06)", border: pc.expression===key ? "1px solid #C9A84C" : "1px solid rgba(245,240,232,0.15)", color: pc.expression===key ? "#C9A84C" : "rgba(245,240,232,0.5)", padding:"0.35rem 0.8rem", borderRadius:2, fontSize:"0.78rem", cursor:"pointer" }}>{label}</button>)}
              </div>
            </div>
            <button onClick={() => { if (!pc.name.trim()) { alert("Por favor ingresa tu nombre para continuar."); return; } if (!pc.jobTitle.trim()) { alert("Por favor ingresa tu cargo."); return; } setScreen("modules"); }} style={{ background:"#C9A84C", color:"#0D0D14", padding:"0.78rem 1.9rem", borderRadius:2, fontWeight:700, fontSize:"0.88rem", border:"none", cursor:"pointer" }}>
              Continuar →
            </button>
          </div>
        </div>
      </div>
    ),
    modules: (
      <div style={{ minHeight:"100vh", background:"#F5F0E8", padding:"2rem", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"3rem" }}>
        <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
          <h2 style={{ fontFamily:"Georgia, serif", fontSize:"2rem", color:"#0D0D14", fontWeight:900 }}>Módulos de Liderazgo</h2>
          <p style={{ color:"#7A7060", fontSize:"0.85rem", marginTop:"0.3rem" }}>Completa todos los módulos para obtener tu certificado</p>
        </div>
        <div style={{ width:"100%", maxWidth:860, height:3, background:"#D4CCB8", borderRadius:2, marginBottom:"0.4rem", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(gameState.completedModules.length/MODULES.length)*100}%`, background:"#C9A84C", borderRadius:2, transition:"width 0.5s" }} />
        </div>
        <div style={{ fontSize:"0.7rem", color:"#7A7060", letterSpacing:1.5, textTransform:"uppercase", marginBottom:"1.5rem" }}>
          {gameState.completedModules.length} de {MODULES.length} módulos completados
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:1, width:"100%", maxWidth:860, border:"1px solid #D4CCB8" }}>
          {MODULES.map((mod, i) => {
            const locked = i > 0 && !gameState.completedModules.includes(i - 1);
            const done = gameState.completedModules.includes(i);
            return (
              <div key={mod.id} onClick={() => !locked && startModule(i)} style={{ background: done ? "#EDE8DC" : "#FDFCF8", padding:"1.4rem", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.35 : 1, position:"relative", borderBottom:"1px solid #D4CCB8", transition:"background 0.2s" }}>
                <div style={{ fontSize:"1.6rem", marginBottom:"0.7rem" }}>{mod.icon}</div>
                <h3 style={{ fontFamily:"Georgia, serif", color:"#0D0D14", fontSize:"1rem", fontWeight:700, marginBottom:"0.3rem" }}>{mod.title}</h3>
                <p style={{ fontSize:"0.78rem", color:"#7A7060", lineHeight:1.5 }}>{mod.desc}</p>
                <span style={{ display:"inline-block", marginTop:"0.7rem", padding:"0.12rem 0.55rem", fontSize:"0.65rem", letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, border:"1px solid #D4CCB8", color:"#7A7060", borderRadius:1 }}>{mod.tag}</span>
                {done && <div style={{ position:"absolute", top:"0.9rem", right:"0.9rem", fontSize:"0.75rem", fontWeight:600, color:"#C9A84C" }}>✓ {mod.scenarios.length}/{mod.scenarios.length}</div>}
                {locked && <div style={{ position:"absolute", top:"0.9rem", right:"0.9rem", color:"#D4CCB8", fontSize:"0.9rem" }}>🔒</div>}
              </div>
            );
          })}
        </div>
        {allDone && (
          <button onClick={handleFinal} style={{ marginTop:"1.5rem", background:"#0D0D14", color:"#F5F0E8", padding:"0.78rem 1.9rem", borderRadius:2, fontWeight:700, fontSize:"0.88rem", border:"none", cursor:"pointer" }}>
            🏆 Ver mi Certificado
          </button>
        )}
      </div>
    ),
    game: currentSc && (
      <div style={{ height:"100vh", background:"#F5F0E8", display:"flex", flexDirection:"column" }}>
        <div style={{ background:"#0D0D14", padding:"0.7rem 1.4rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontFamily:"Georgia, serif", color:"#F5F0E8", fontWeight:700 }}>{currentMod.icon} {currentMod.title}</div>
          <div style={{ display:"flex", gap:"0.4rem" }}>
            {currentMod.scenarios.map((_, i) => (
              <div key={i} style={{ width:7, height:7, borderRadius:"50%", background: i < gameState.currentScenario ? "#C9A84C" : i === gameState.currentScenario ? "#F5F0E8" : "rgba(245,240,232,0.18)" }} />
            ))}
          </div>
          <button onClick={() => setScreen("modules")} style={{ background:"none", border:"1px solid rgba(245,240,232,0.25)", color:"rgba(245,240,232,0.6)", padding:"0.28rem 0.75rem", fontSize:"0.75rem", cursor:"pointer", borderRadius:1 }}>Salir</button>
        </div>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1.1fr", overflow:"hidden" }}>
          <div style={{ background:"#0D0D14", padding:"1.8rem", display:"flex", flexDirection:"column", gap:"1rem", overflowY:"auto" }}>
            <div>
              <div style={{ fontSize:"0.63rem", letterSpacing:3, textTransform:"uppercase", color:"#C9A84C", fontWeight:600, marginBottom:"0.4rem" }}>
                {currentSc.tag || currentMod.tag} · Dilema {gameState.currentScenario + 1}/{currentMod.scenarios.length}
              </div>
              <div style={{ fontFamily:"Georgia, serif", fontSize:"1.2rem", color:"#F5F0E8", fontWeight:700, lineHeight:1.3 }}>{currentSc.title}</div>
            </div>
            <p style={{ fontSize:"0.85rem", color:"rgba(245,240,232,0.68)", lineHeight:1.75 }}>{currentSc.body}</p>
            <div style={{ background:"rgba(201,168,76,0.07)", borderLeft:"2px solid rgba(201,168,76,0.5)", padding:"0.75rem 0.9rem", borderRadius:"0 2px 2px 0" }}>
              <div style={{ fontSize:"0.62rem", letterSpacing:2, textTransform:"uppercase", color:"#C9A84C", marginBottom:"0.28rem", fontWeight:600 }}>Contexto</div>
              <div style={{ fontSize:"0.8rem", color:"rgba(245,240,232,0.55)", lineHeight:1.55 }}>{currentSc.context}</div>
            </div>
            <div style={{ display:"flex", justifyContent:"center", marginTop:"auto" }}>
              <CharSVG cfg={pc} w={90} h={110} anim />
            </div>
          </div>
          <div style={{ background:"#F5F0E8", padding:"1.8rem", display:"flex", flexDirection:"column", gap:"0.7rem", overflowY:"auto" }}>
            <div style={{ fontSize:"0.62rem", letterSpacing:3, textTransform:"uppercase", color:"#7A7060", fontWeight:600, marginBottom:"0.2rem" }}>¿Cómo respondes a este dilema?</div>
            {gameState.shuffledOptions.map((opt, i) => (
              <button key={i} disabled={gameState.answered} onClick={() => selectOption(opt)} style={{
                background: gameState.answered && gameState.selectedOption === opt ? "#EDE8DC" : "#FDFCF8",
                border: gameState.answered && gameState.selectedOption === opt ? "2px solid #0D0D14" : "1.5px solid #D4CCB8",
                borderRadius:2, padding:"0.82rem 1rem", cursor: gameState.answered ? "default" : "pointer",
                fontFamily:"inherit", fontSize:"0.84rem", color:"#0D0D14", textAlign:"left", lineHeight:1.45,
                display:"flex", gap:"0.7rem", alignItems:"flex-start",
                opacity: gameState.answered && gameState.selectedOption !== opt ? 0.4 : 1,
                transition:"all 0.18s",
              }}>
                <span style={{ width:22, height:22, borderRadius:1, background: gameState.answered && gameState.selectedOption === opt ? "#0D0D14" : "#EDE8DC", color: gameState.answered && gameState.selectedOption === opt ? "#F5F0E8" : "#7A7060", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700, flexShrink:0, border:"1px solid #D4CCB8" }}>
                  {["A","B","C","D"][i]}
                </span>
                {opt.text}
              </button>
            ))}
            {gameState.answered && gameState.selectedOption && (
              <div style={{ animation:"slideUp 0.35s ease", background:"#EDE8DC", borderLeft:"3px solid #C9A84C", padding:"0.9rem 1.1rem", borderRadius:"0 2px 2px 0" }}>
                <div style={{ fontSize:"0.62rem", letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:"0.35rem", color:"#1A3A5C" }}>
                  Perfil revelado: {PROFILES[gameState.selectedOption.profile]?.name}
                </div>
                <div style={{ fontSize:"0.83rem", color:"#0D0D14", lineHeight:1.55 }}>{gameState.selectedOption.outcome}</div>
                <div style={{ marginTop:"0.5rem", fontSize:"0.77rem", color:"#7A7060", fontStyle:"italic" }}>{gameState.selectedOption.consequence}</div>
                <button onClick={nextScenario} style={{ marginTop:"0.8rem", background:"#0D0D14", color:"#F5F0E8", padding:"0.65rem 1.5rem", borderRadius:2, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>
                  {gameState.currentScenario >= currentMod.scenarios.length - 1 ? "Ver resultados →" : "Siguiente dilema →"}
                </button>
              </div>
            )}
          </div>
        </div>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    ),
    result: (() => {
      const mi = gameState.currentModule;
      const mp = gameState.moduleProfiles[mi] || {};
      const dom = domProfile(mp);
      const prof = PROFILES[dom];
      const total = Object.values(mp).reduce((a, b) => a + b, 0) || 1;
      const nextIdx = mi + 1;
      return (
        <div style={{ minHeight:"100vh", background:"#0D0D14", padding:"2rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ maxWidth:540, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:"0.65rem", letterSpacing:4, textTransform:"uppercase", color:"#C9A84C", marginBottom:"0.8rem", fontWeight:600 }}>Resultado del módulo</div>
            <h2 style={{ fontFamily:"Georgia, serif", fontSize:"2.2rem", color:"#F5F0E8", fontWeight:900, marginBottom:"0.4rem" }}>{prof.emoji} {prof.name}</h2>
            <p style={{ fontSize:"0.85rem", color:"rgba(245,240,232,0.55)", lineHeight:1.65, marginBottom:"1.5rem" }}>Tu decisiones en este módulo revelan un liderazgo predominantemente {prof.name.toLowerCase()}.</p>
            <div style={{ background:"rgba(245,240,232,0.04)", border:"1px solid rgba(201,168,76,0.18)", borderRadius:2, padding:"1.3rem", marginBottom:"1.5rem", textAlign:"left" }}>
              <div style={{ fontSize:"0.63rem", letterSpacing:3, textTransform:"uppercase", color:"#C9A84C", marginBottom:"0.9rem", fontWeight:600 }}>Tu distribución en este módulo</div>
              {Object.entries(PROFILES).map(([key, p]) => (
                <div key={key} style={{ display:"flex", alignItems:"center", gap:"0.7rem", marginBottom:"0.6rem" }}>
                  <span style={{ fontSize:"0.75rem", color:"rgba(245,240,232,0.65)", width:105, flexShrink:0 }}>{p.name}</span>
                  <div style={{ flex:1, height:4, background:"rgba(245,240,232,0.08)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(mp[key] || 0) / total * 100}%`, background:p.color, borderRadius:2, transition:"width 0.8s ease" }} />
                  </div>
                  <span style={{ fontSize:"0.72rem", color:"#C9A84C", width:18, textAlign:"right" }}>{mp[key] || 0}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"0.8rem", justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={() => setScreen("modules")} style={{ background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.2)", color:"rgba(245,240,232,0.6)", padding:"0.72rem 1.5rem", borderRadius:2, fontSize:"0.85rem", cursor:"pointer" }}>Ver módulos</button>
              {nextIdx < MODULES.length ? (
                <button onClick={() => startModule(nextIdx)} style={{ background:"#C9A84C", color:"#0D0D14", padding:"0.72rem 1.7rem", borderRadius:2, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>
                  {MODULES[nextIdx].icon} {MODULES[nextIdx].title} →
                </button>
              ) : (
                <button onClick={handleFinal} style={{ background:"#C9A84C", color:"#0D0D14", padding:"0.72rem 1.7rem", borderRadius:2, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>
                  🏆 Ver Certificado →
                </button>
              )}
            </div>
          </div>
        </div>
      );
    })(),
    final: (
      <div style={{ minHeight:"100vh", background:"#F5F0E8", padding:"2rem", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"2.5rem" }}>
        <div style={{ maxWidth:640, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:"0.65rem", letterSpacing:4, textTransform:"uppercase", color:"#7A7060", marginBottom:"1rem" }}>¡Felicitaciones!</div>
          <h2 style={{ fontFamily:"Georgia, serif", fontSize:"1.8rem", color:"#0D0D14", fontWeight:900, marginBottom:"0.5rem" }}>Tu Certificado de Liderazgo Ético</h2>
          <p style={{ fontSize:"0.85rem", color:"#7A7060", marginBottom:"1.5rem" }}>
            {dbSaved ? "✅ Registro guardado en la base de datos" : "Guardando registro..."}
          </p>
          <CertificateView playerName={pc.name} jobTitle={pc.jobTitle} company={pc.company} profile={globalProfile} scores={gameState.totalProfiles} date={new Date()} />
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", marginTop:"1.5rem", flexWrap:"wrap" }}>
            <button onClick={downloadPDF} disabled={pdfLoading} style={{ background:"#0D0D14", color:"#F5F0E8", padding:"0.78rem 1.9rem", borderRadius:2, fontWeight:700, fontSize:"0.88rem", border:"none", cursor: pdfLoading ? "wait" : "pointer", opacity: pdfLoading ? 0.7 : 1 }}>
              {pdfLoading ? "Generando PDF..." : "⬇ Descargar Certificado PDF"}
            </button>
            <button onClick={() => { setScreen("title"); setGameState({ completedModules:[], moduleProfiles:{}, totalProfiles:{pragmatic:0,idealist:0,relational:0,systemic:0}, currentModule:null, currentScenario:0, answered:false, shuffledOptions:[] }); setDbSaved(false); }} style={{ background:"transparent", color:"#7A7060", padding:"0.72rem 1.5rem", borderRadius:2, fontSize:"0.85rem", border:"1px solid #D4CCB8", cursor:"pointer" }}>
              Jugar de nuevo
            </button>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", width: "100%", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {S[screen] || S.title}
    </div>
  );
}