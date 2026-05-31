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
const CHARACTERS = [
  { id: 'char1', name: 'Femenino', skin: '#F0C27F', hair: '#1A0A00', outfit: '#1A3A5C', hairstyle: 'long', expression: 'happy', avatar: '/images/mujer.png' },
  { id: 'char2', name: 'Masculino', skin: '#D4956A', hair: '#3B1F00', outfit: '#2E5F8A', hairstyle: 'short', expression: 'serious', avatar: '/images/hombre.png' },
];

// Función para cargar módulos desde localStorage
function loadModulesFromStorage() {
  try {
    const saved = localStorage.getItem('ethosfera_modules');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : getDefaultModules();
    }
  } catch (e) {
    console.error('Error loading modules:', e);
  }
  return getDefaultModules();
}

function getDefaultModules() {
  return [
    {id:0,icon:'📋',title:'Decreto 815 - Función Pública',tag:'Ética y Transparencia',desc:'Principios y valores en la administración pública.',scenarios:[
    {tag:'DILEMA 01',title:'La solicitud informal',body:'Un ciudadano acude a ti informalmente solicitando una gestión que debe hacer a través de canales formales. Dice que no entiende los procedimientos y que su necesidad es urgente.',context:'El procedimiento formal tarda 5 días hábiles. El ciudadano está frustrado. Saltarte los canales sería más rápido pero violaría el Decreto 815.',options:[
      {text:'Lo atiendes informalmente para agilizar. Al fin el resultado es lo que importa.',profile:'pragmatic',outcome:'El ciudadano queda satisfecho. Sin embargo, estableces un precedente de arbitrariedad.',consequence:'+Satisfacción inmediata · −Transparencia'},
      {text:'Le explicas claramente el procedimiento formal y lo acompañas en el proceso.',profile:'idealist',outcome:'El ciudadano entiende y sigue los canales. Aprende cómo funciona la administración.',consequence:'+Cumplimiento · +Educación al ciudadano'},
      {text:'Creas un documento simple que le orienta sobre cómo hacer el trámite, disponible para otros.',profile:'relational',outcome:'Ayudas sin saltarte normas. Otros ciudadanos se benefician de la guía.',consequence:'+Solución inclusiva · Tiempo invertido'},
      {text:'Revisas si el procedimiento formal puede optimizarse para reducir tiempos.',profile:'systemic',outcome:'Documenta mejoras. El proceso es más ágil para todos los ciudadanos futuros.',consequence:'+Mejora sistémica · −Velocidad inmediata'},
    ]},
    {tag:'DILEMA 02',title:'El favor al compañero',body:'Un colega de otra dependencia te pide que apruebes un documento sin que cumpla todos los requisitos. Dice que confía en ti y que lo necesita urgentemente.',context:'Se conocen desde hace años. El documento tiene la mayoría de requisitos. Una aprobación informal sería rápida.',options:[
      {text:'Lo apruebas como favor personal. La relación con tus colegas también importa.',profile:'pragmatic',outcome:'Tu colega queda en deuda. Pero creas un precedente de flexibilidad.',consequence:'+Relación · −Integridad del proceso'},
      {text:'Le dices que no puedes y lo reportas al protocolo formal.',profile:'idealist',outcome:'Tu colega se molesta. Pero el proceso se mantiene íntegro.',consequence:'+Ética · −Relación laboral'},
      {text:'Le explicas qué requisitos faltan y lo ayudas a completarlos rápidamente.',profile:'relational',outcome:'Tu colega agradece la ayuda. El documento se aprueba correctamente.',consequence:'+Colaboración · Compromiso mutuo'},
      {text:'Propones un protocolo de revisión rápida para casos excepcionales.',profile:'systemic',outcome:'Se crea un sistema que beneficia a todos sin comprometer la integridad.',consequence:'+Procedimiento mejorado · −Resolución rápida'},
    ]},
    {tag:'DILEMA 03',title:'La información incómoda',body:'Descubres que un superior ha manejado datos de manera que beneficia un proyecto favorito, aunque técnicamente no es incorrecto. Pero la presentación oculta información relevante.',context:'El superior tiene autoridad sobre ti. Señalarlo podría verse como deslealtad. Pero la decisión podría ser equivocada.',options:[
      {text:'No dices nada. No es tu responsabilidad cuestionar a tu superior.',profile:'pragmatic',outcome:'La situación continúa. Pero evitas conflicto.',consequence:'+Estabilidad laboral · −Integridad informacional'},
      {text:'Le planteas la inquietud en privado, con datos y respeto.',profile:'idealist',outcome:'Hay tensión pero se hace corrección. La decisión mejora.',consequence:'+Verdad institucional · Tensión temporal'},
      {text:'Consultas confidencialmente con un colega de confianza para validar tu preocupación.',profile:'relational',outcome:'Confirmas que tu inquietud es válida. Abordar el tema es más seguro.',consequence:'+Validación · Complejidad del proceso'},
      {text:'Registras la información completa en el expediente del proyecto.',profile:'systemic',outcome:'Queda documentado. Si hay auditoría, los datos completos están disponibles.',consequence:'+Trazabilidad · Sin acción inmediata'},
    ]},
    {tag:'DILEMA 04',title:'El conflicto de intereses oculto',body:'Participas en una decisión sobre un contrato. Descubres que una empresa contratista tiene relación con la familia de un decisor clave. No lo ha declarado.',context:'Declararlo podría ser incómodo para varios. Pero el Decreto 815 exige transparencia en conflictos de interés.',options:[
      {text:'No lo mencionas. Probablemente la relación no afecta la decisión.',profile:'pragmatic',outcome:'El proceso continúa. Pero el conflicto queda latente.',consequence:'+Ausencia de confrontación · Riesgo reputacional'},
      {text:'Planteas la necesidad de que se declaren conflictos según el Decreto.',profile:'idealist',outcome:'Hay incomodidad. Se hace declaración. La decisión se toma transparentemente.',consequence:'+Cumplimiento normativo · Tensión visible'},
      {text:'Hablas en privado con el decisor sobre la importancia de la declaración.',profile:'relational',outcome:'El decisor agradece la oportunidad de aclarar. Hace la declaración discretamente.',consequence:'+Relación preservada · Cumplimiento'},
      {text:'Documenta tu observación y la registra en el acta de la reunión.',profile:'systemic',outcome:'Queda constancia. El conflicto es público y se maneja según protocolo.',consequence:'+Transparencia · −Incomodidad directa'},
    ]},
    {tag:'DILEMA 05',title:'El recurso limitado y la equidad',body:'Tienes presupuesto para una iniciativa de capacitación. Dos equipos compiten por él. Uno está mejor conectado políticamente; el otro tiene más necesidad real.',context:'El equipo conectado espera que lo favorezcas. El que tiene más necesidad es más discreto pero será más impactado.',options:[
      {text:'Le das el recurso al mejor conectado. Así evitas conflictos políticos.',profile:'pragmatic',outcome:'El equipo conectado está satisfecho. Pero la desigualdad se perpetúa.',consequence:'+Estabilidad política · −Equidad'},
      {text:'Se lo das al que tiene más necesidad, aunque sea menos cómodo políticamente.',profile:'idealist',outcome:'Hay molestia del equipo conectado. Pero el impacto es mayor donde se necesita.',consequence:'+Equidad · Tensión política'},
      {text:'Hablas con ambos para entender mejor sus necesidades y posibles alianzas.',profile:'relational',outcome:'Descubres que podrían co-crear una solución conjunta con el presupuesto.',consequence:'+Colaboración · Solución expandida'},
      {text:'Propones un criterio transparente de asignación de recursos que todos puedan ver.',profile:'systemic',outcome:'La decisión se toma con transparencia. Establece precedente para futuras asignaciones.',consequence:'+Transparencia sistémica · Debate inicial'},
    ]},
  ]},
  ];
}

function saveModulesToStorage(modules) {
  try {
    localStorage.setItem('ethosfera_modules', JSON.stringify(modules));
    return true;
  } catch (e) {
    console.error('Error saving modules:', e);
    return false;
  }
}

const PROFILES = {
  pragmatic: { name: 'Pragmático', desc: 'Decisiones centradas en resultados y consecución de objetivos.', color: '#C9A84C' },
  idealist: { name: 'Idealista', desc: 'Apuestas por la ética y el cumplimiento normativo por encima de todo.', color: '#4A6AB8' },
  relational: { name: 'Relacional', desc: 'Busca consenso y apoyo entre las personas involucradas.', color: '#C57D3A' },
  systemic: { name: 'Sistémico', desc: 'Piensa en soluciones de largo plazo y mejora de procesos.', color: '#6F4C9B' },
};

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
function domProfile(counts = {pragmatic:0,idealist:0,relational:0,systemic:0}) {
  const keys = Object.keys(counts);
  if (!keys.length) return 'pragmatic';
  return keys.reduce((a,b)=> (counts[a]||0) >= (counts[b]||0) ? a : b, keys[0]);
}

// ─── CHARACTER SVG ───
function charSVG(cfg, w, h, anim) {
  const { skin=CHARACTERS[0].skin, hair=CHARACTERS[0].hair, outfit=CHARACTERS[0].outfit, hairstyle='short', expression='happy' } = cfg;
  const od = shade(outfit,-28), skd = shade(skin,-20), hd = shade(hair,-30);

  let hairBack = '';
  if (hairstyle === 'long') {
    hairBack = `
      <path d="M27 42 Q20 60 18 76 Q17 88 22 96" stroke="${hd}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M25 42 Q17 64 16 80 Q15 92 20 100" stroke="${hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M53 42 Q60 60 62 76 Q63 88 58 96" stroke="${hd}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M55 42 Q63 64 64 80 Q65 92 60 100" stroke="${hair}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }

  let hairTop = '';
  if (hairstyle === 'short') {
    hairTop = `<path d="M24 22 Q26 8 40 6 Q54 8 56 22 L54 15 Q50 4 40 3 Q30 4 26 15Z" fill="${hair}"/>
      <ellipse cx="40" cy="7" rx="14" ry="5" fill="${hair}"/>`;
  } else if (hairstyle === 'long') {
    hairTop = `<path d="M24 26 Q26 4 40 3 Q54 4 56 26 L56 34 Q52 42 40 43 Q28 42 24 34Z" fill="${hair}"/>
      <path d="M25 30 Q24 16 28 10 Q33 4 40 3 Q47 4 52 10 Q56 16 55 30" fill="${hd}" opacity="0.45"/>`;
  }

  let eyeL = `<ellipse cx="34" cy="27" rx="3" ry="3.5" fill="${shade(skin,-60)}"/><circle cx="33.2" cy="26" r="1.2" fill="white"/>`;
  let eyeR = `<ellipse cx="46" cy="27" rx="3" ry="3.5" fill="${shade(skin,-60)}"/><circle cx="45.2" cy="26" r="1.2" fill="white"/>`;
  let mouth = '', extra = '';

  if (expression==='happy') {
    mouth = `<path d="M35 35 Q40 40 45 35" stroke="${skd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  } else if (expression==='serious') {
    eyeL = `<ellipse cx="34" cy="27.5" rx="3" ry="2.8" fill="${shade(skin,-60)}"/><circle cx="33.2" cy="27" r="1.1" fill="white"/>`;
    eyeR = `<ellipse cx="46" cy="27.5" rx="3" ry="2.8" fill="${shade(skin,-60)}"/><circle cx="45.2" cy="27" r="1.1" fill="white"/>`;
    mouth = `<line x1="36" y1="36" x2="44" y2="36" stroke="${skd}" stroke-width="1.8" stroke-linecap="round"/>`;
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

// ─── CERTIFICATE ───
function Certificate({ name, jobTitle, company }) {
  const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date();
  const dateStr = `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;

  return (
    <div id="cert-render" style={{ background:'#F4F6E7', border:'2px solid #7BAE49', padding:'2.5rem 2.5rem 2rem', position:'relative', maxWidth:580, margin:'0 auto', fontFamily:'Georgia,serif', color:'#0D2C1B' }}>
      {[['tl','2px 0 0 2px'],['tr','2px 2px 0 0'],['bl','0 0 2px 2px'],['br','0 2px 2px 0']].map(([k,bw])=>(
        <div key={k} style={{ position:'absolute', width:20, height:20, top:k.includes('t')?8:'auto', bottom:k.includes('b')?8:'auto', left:k.includes('l')?8:'auto', right:k.includes('r')?8:'auto', borderColor:'#0D2C1B', borderStyle:'solid', borderWidth:bw }} />
      ))}
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'0.62rem', letterSpacing:4, textTransform:'uppercase', color:'#7BAE49', marginBottom:'0.7rem' }}>Certificado de Aprendizaje · ETHOSFERA</div>
        <div style={{ fontSize:'0.82rem', color:'#0D2C1B', marginBottom:'0.4rem' }}>Se certifica que</div>
        <div style={{ fontFamily:'Georgia,serif', fontSize:'2rem', color:'#0D2C1B', fontWeight:900, marginBottom:'0.2rem' }}>{name||'Participante'}</div>
        {jobTitle && <div style={{ fontSize:'0.9rem', color:'#1A4C24', fontWeight:600, marginBottom:'0.15rem' }}>{jobTitle}</div>}
        {company && <div style={{ fontSize:'0.82rem', color:'#7A7A7A', marginBottom:'0.3rem' }}>{company}</div>}
        <div style={{ width:40, height:1, background:'#7BAE49', margin:'0.8rem auto' }}/>
        <div style={{ fontSize:'0.82rem', color:'#0D2C1B', lineHeight:1.6, maxWidth:360, margin:'0 auto 0.8rem' }}>Ha completado exitosamente el módulo de capacitación ETHOSFERA, demostrando compromiso con la ética y el liderazgo público.</div>
        <div style={{ width:40, height:1, background:'#7BAE49', margin:'0.8rem auto' }}/>
        <div style={{ fontSize:'1rem', color:'#0D2C1B', fontWeight:700, marginBottom:'0.6rem' }}>Herramienta que forma líderes</div>
        <div style={{ fontSize:'0.68rem', letterSpacing:2, color:'#7A7A7A' }}>{dateStr}</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function ETHOSFERA() {
  const [screen, setScreen] = useState('title');
  const [pc, setPc] = useState(null); // null hasta elegir personaje
  const [gs, setGs] = useState({
    completedModules: [],
    currentModule: null,
    currentScenario: 0,
    answered: false,
    selectedOpt: null,
    shuffledOpts: [],
    moduleProfiles: {},
    totalProfiles: {pragmatic:0,idealist:0,relational:0,systemic:0}
  });
  const [adminMode, setAdminMode] = useState(false);
  const [adminAuth, setAdminAuth] = useState('');
  const [modules, setModules] = useState(MODULES);
  const [newModule, setNewModule] = useState({title:'',tag:'',description:'',scenarios:[]});
  const [newScenario, setNewScenario] = useState({tag:'',title:'',body:'',context:'',options:[]});
  const [adminPassword] = useState('ethosfera2025'); // En producción usar variable de entorno
  const [dbSaved, setDbSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState('idle');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [modules, setModules] = useState(() => loadModulesFromStorage());
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModuleIdx, setEditingModuleIdx] = useState(null);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [formData, setFormData] = useState({
    moduleIcon: '📋',
    moduleTitle: '',
    moduleTag: '',
    moduleDesc: '',
    scenarioTag: '',
    scenarioTitle: '',
    scenarioBody: '',
    scenarioContext: '',
    options: [
      {text:'',profile:'pragmatic',outcome:'',consequence:''},
      {text:'',profile:'idealist',outcome:'',consequence:''},
      {text:'',profile:'relational',outcome:'',consequence:''},
      {text:'',profile:'systemic',outcome:'',consequence:''},
    ]
  });

  // Guardar módulos cuando cambian
  const updateModules = (newModules) => {
    setModules(newModules);
    saveModulesToStorage(newModules);
  };

  const addModule = () => {
    if (!formData.moduleTitle.trim() || !formData.scenarioTitle.trim()) {
      alert('Por favor completa título del módulo y al menos un escenario');
      return;
    }

    const newModule = {
      id: modules.length,
      icon: formData.moduleIcon,
      title: formData.moduleTitle,
      tag: formData.moduleTag,
      desc: formData.moduleDesc,
      scenarios: [{
        tag: formData.scenarioTag,
        title: formData.scenarioTitle,
        body: formData.scenarioBody,
        context: formData.scenarioContext,
        options: formData.options.filter(opt => opt.text.trim())
      }]
    };

    if (newModule.scenarios[0].options.length < 2) {
      alert('Cada escenario debe tener al menos 2 opciones');
      return;
    }

    const updated = [...modules, newModule];
    updateModules(updated);
    resetForm();
    alert('Módulo agregado exitosamente');
  };

  const addScenarioToModule = (moduleIdx) => {
    if (!formData.scenarioTitle.trim()) {
      alert('Por favor completa el título del escenario');
      return;
    }

    const newScenario = {
      tag: formData.scenarioTag,
      title: formData.scenarioTitle,
      body: formData.scenarioBody,
      context: formData.scenarioContext,
      options: formData.options.filter(opt => opt.text.trim())
    };

    if (newScenario.options.length < 2) {
      alert('Cada escenario debe tener al menos 2 opciones');
      return;
    }

    const updated = [...modules];
    updated[moduleIdx].scenarios.push(newScenario);
    updateModules(updated);
    resetForm();
    setEditingModuleIdx(null);
    alert('Escenario agregado exitosamente');
  };

  const resetForm = () => {
    setFormData({
      moduleIcon: '📋',
      moduleTitle: '',
      moduleTag: '',
      moduleDesc: '',
      scenarioTag: '',
      scenarioTitle: '',
      scenarioBody: '',
      scenarioContext: '',
      options: [
        {text:'',profile:'pragmatic',outcome:'',consequence:''},
        {text:'',profile:'idealist',outcome:'',consequence:''},
        {text:'',profile:'relational',outcome:'',consequence:''},
        {text:'',profile:'systemic',outcome:'',consequence:''},
      ]
    });
    setShowModuleForm(false);
  };

  const deleteModule = (idx) => {
    if (window.confirm('¿Eliminar este módulo y todos sus escenarios?')) {
      const updated = modules.filter((_, i) => i !== idx).map((m, i) => ({...m, id: i}));
      updateModules(updated);
    }
  };

  const deleteScenario = (moduleIdx, scenarioIdx) => {
    if (modules[moduleIdx].scenarios.length <= 1) {
      alert('Cada módulo debe tener al menos un escenario');
      return;
    }
    if (window.confirm('¿Eliminar este escenario?')) {
      const updated = [...modules];
      updated[moduleIdx].scenarios.splice(scenarioIdx, 1);
      updateModules(updated);
    }
  };

  const startModule = (idx) => {
    const opts = shuffle(modules[idx].scenarios[0].options);
    setGs(g=>({...g,currentModule:idx,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:opts}));
    setScreen('game');
  };

  const selectOpt = (opt) => {
    if (gs.answered) return;
    setGs(g => {
      const profile = opt.profile;
      return {
        ...g,
        answered: true,
        selectedOpt: opt,
        totalProfiles: {
          ...g.totalProfiles,
          [profile]: (g.totalProfiles?.[profile] || 0) + 1,
        },
        moduleProfiles: {
          ...g.moduleProfiles,
          [g.currentModule]: {
            ...g.moduleProfiles?.[g.currentModule],
            [profile]: (g.moduleProfiles?.[g.currentModule]?.[profile] || 0) + 1,
          },
        },
      };
    });
  };

  const nextScenario = () => {
    const mod = modules[gs.currentModule];
    const next = gs.currentScenario + 1;
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
      const result = await saveCertificate({
        full_name: pc.fullName || pc.name,
        job_title: pc.jobTitle || null,
        company: pc.company || null,
        modules_completed: gs.completedModules.length,
        issued_at: new Date().toISOString(),
        session_id: Math.random().toString(36).slice(2)
      });
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
      pdf.save(`Certificado_${(pc.name||'Participante').replace(/\s+/g,'_')}_ETHOSFERA.pdf`);
    } catch(e) { console.error(e); alert('Error al generar PDF. Revisa la consola.'); }
    setPdfLoading(false);
  };

  const allDone = gs.completedModules.length===modules.length;
  const globalProfile = domProfile(gs.totalProfiles);
  const currentMod = gs.currentModule!==null ? modules[gs.currentModule] : null;
  const currentSc = currentMod ? currentMod.scenarios[gs.currentScenario] : null;

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",width:'100%',minHeight:'100vh',background:'#0D0D14'}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;min-height:100vh;overflow-x:hidden;background:#042712;color:#F4F6E7;font-family:'DM Sans',system-ui,sans-serif}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .opt-card:hover:not(:disabled){border-color:#0D2B1B!important;background:#E8E4D8!important;transform:translateX(3px)}
        .selection-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
        .info-grid{display:grid;grid-template-columns:220px 1fr;gap:2rem}
        .game-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:0}
        .module-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1px}
        .character-card{background:rgba(244,246,231,0.12);border:2px solid rgba(123,174,73,0.25);border-radius:12px;transition:all 0.3s ease}
        .button-primary{background:#7BAE49;color:#F4F6E7}
        .button-secondary{background:transparent;color:rgba(244,246,231,0.9);border:1px solid rgba(244,246,231,0.24)}
        @media (max-width:860px){
          .info-grid,.game-grid{grid-template-columns:1fr}
          .info-grid > div,.game-grid > div{width:100%}
        }
        @media (max-width:640px){
          .hero-title{font-size:2.6rem}
          .character-card{padding:1.25rem}
          .button-primary,.button-secondary{width:100%;justify-content:center}
        }
      `}</style>

      {/* ── TITLE ── */}
      {screen==='title'&&(
        <div style={{minHeight:'100vh',background:'#0D0D14',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',animation:'fadeIn 0.5s ease'}}>
          <div style={{fontSize:'0.68rem',letterSpacing:4,textTransform:'uppercase',color:'#C9A84C',marginBottom:'1rem',fontWeight:500}}>Capacitación en Ética Pública</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(3rem,8vw,5.5rem)',color:'#F5F0E8',lineHeight:0.95,fontWeight:900,margin:'0 0 0.5rem'}}>ETHOSFERA</h1>
          <p style={{fontSize:'0.9rem',color:'#C9A84C',fontWeight:600,marginBottom:'2rem',letterSpacing:1}}>Herramienta que forma líderes</p>
          <div style={{width:50,height:2,background:'#C9A84C',margin:'0 auto 1.2rem'}}/>
          <p style={{fontSize:'0.9rem',color:'rgba(245,240,232,0.6)',lineHeight:1.7,maxWidth:450,marginBottom:'2rem'}}>Dilemas éticos reales en el contexto del Decreto 815. Desarrolla tu perfil de liderazgo a través de decisiones reflexivas.</p>
          <button onClick={()=>setScreen('character-select')} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.85rem 2.2rem',borderRadius:2,fontWeight:600,fontSize:'0.92rem',border:'none',cursor:'pointer',letterSpacing:0.5}}>Comenzar →</button>
          
          {/* Botón secreto para modo admin */}
          <button onClick={()=>setAdminMode(!adminMode)} style={{position:'fixed',bottom:'1rem',right:'1rem',background:'transparent',border:'1px solid rgba(201,168,76,0.2)',color:'rgba(201,168,76,0.3)',padding:'0.3rem 0.6rem',borderRadius:2,fontSize:'0.65rem',cursor:'pointer',fontFamily:'monospace',opacity:0.3,transition:'opacity 0.3s'}} onMouseEnter={(e)=>e.target.style.opacity='1'} onMouseLeave={(e)=>e.target.style.opacity='0.3'}>admin</button>
        </div>
      )}

      {/* ── CHARACTER SELECT ── */}
      {screen==='character-select'&&(
        <div style={{minHeight:'100vh',background:'#042712',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto'}}>
          <div style={{maxWidth:900,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'0.65rem',letterSpacing:3,textTransform:'uppercase',color:'#7BAE49',marginBottom:'1rem',fontWeight:600}}>Elige tu personaje</div>
            <h2 className="hero-title" style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',color:'#F4F6E7',fontWeight:700,marginBottom:'2rem'}}>¿Con cuál deseas participar?</h2>
            <div className="selection-grid" style={{marginBottom:'2rem'}}>
              {CHARACTERS.map(char=>(
                <div key={char.id} onClick={()=>{setPc({...char, fullName:'', jobTitle:'', company:''});setScreen('info');}} className="character-card" style={{padding:'2rem',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
                  <div style={{width:'100%',maxWidth:260,height:260,background:'linear-gradient(170deg,#0D2C1B,#0A361F,#163E1B)',border:'1px solid rgba(123,174,73,0.35)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    <img src={char.avatar} alt={char.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'1.1rem',fontWeight:700,color:'#F4F6E7'}}>{char.name}</div>
                    <div style={{fontSize:'0.85rem',color:'#C9A84C',marginTop:'0.4rem'}}>{char.outfit === '#2E5F8A' ? 'Masculino' : 'Femenino'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INFO ── */}
      {screen==='info'&&pc&&(
        <div style={{minHeight:'100vh',background:'#0D0D14',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:'3rem',maxWidth:780,width:'100%',alignItems:'start'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem',position:'sticky',top:'2rem'}}>
              <div style={{width:180,height:220,background:'linear-gradient(170deg,#0D1522,#101A0F,#1A1209)',border:'1px solid rgba(201,168,76,0.35)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',paddingBottom:0,overflow:'hidden',boxShadow:'0 16px 48px rgba(0,0,0,0.65)'}}>
                <img src={pc.avatar} alt={pc.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
              <div style={{color:'#C9A84C',fontSize:'0.78rem',fontWeight:500,letterSpacing:1}}>{pc.name}</div>
            </div>
            <div>
              <div style={{fontSize:'0.65rem',letterSpacing:3,textTransform:'uppercase',color:'#C9A84C',marginBottom:'1.5rem',fontWeight:600}}>Información de participante</div>
              {[['Nombre Completo','fullName','Tu nombre y apellidos'],['Cargo','jobTitle','Tu cargo u posición'],['Organización (opcional)','company','Tu empresa u organización']].map(([label,field,ph])=>(
                <div key={field} style={{marginBottom:'1.3rem'}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",color:'#F5F0E8',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>{label}</h3>
                  <input placeholder={ph} value={pc[field]||''} onChange={e=>setPc(p=>({...p,[field]:e.target.value}))} style={{background:'rgba(245,240,232,0.07)',border:'1px solid rgba(201,168,76,0.22)',borderRadius:2,padding:'0.6rem 0.9rem',color:'#F5F0E8',fontFamily:'inherit',fontSize:'0.88rem',width:'100%',outline:'none'}}/>
                </div>
              ))}
              <div style={{display:'flex',gap:'0.8rem',flexWrap:'wrap',marginTop:'2rem'}}>
                <button onClick={()=>{if(!pc.fullName||!pc.fullName.trim()){alert('Por favor completa al menos tu nombre.');return;}setScreen('modules');}} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>Continuar →</button>
                <button onClick={()=>setScreen('character-select')} style={{background:'transparent',border:'1px solid rgba(245,240,232,0.14)',color:'rgba(245,240,232,0.45)',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.82rem',cursor:'pointer',fontFamily:'inherit'}}>← Cambiar personaje</button>
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
            <p style={{color:'#7A7060',fontSize:'0.85rem',marginTop:'0.3rem'}}>Completa el módulo para generar tu certificado</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:1,width:'100%',maxWidth:860,border:'1px solid #D4CCB8'}}>
            {modules.map((mod,i)=>{
              const done=gs.completedModules.includes(i);
              return (
                <div key={mod.id} onClick={()=>startModule(i)} style={{background:done?'#EDE8DC':'#FDFCF8',padding:'1.4rem',cursor:'pointer',position:'relative',borderBottom:'1px solid #D4CCB8',transition:'all 0.2s',display:'flex',flexDirection:'column'}}>
                  <span style={{fontSize:'1.6rem',marginBottom:'0.7rem',display:'block'}}>{mod.icon}</span>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'#0D0D14',fontWeight:700,marginBottom:'0.3rem'}}>{mod.title}</h3>
                  <p style={{fontSize:'0.78rem',color:'#7A7060',lineHeight:1.5,flexGrow:1}}>{mod.desc}</p>
                  <span style={{display:'inline-block',marginTop:'0.7rem',padding:'0.12rem 0.55rem',fontSize:'0.65rem',letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600,border:'1px solid #D4CCB8',color:'#7A7060',borderRadius:1}}>{mod.tag}</span>
                  {done&&<div style={{position:'absolute',top:'0.9rem',right:'0.9rem',fontSize:'0.75rem',fontWeight:600,color:'#C9A84C'}}>✓ Completado</div>}
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
            <button onClick={()=>setScreen('modules')} style={{background:'none',border:'1px solid rgba(245,240,232,0.18)',color:'rgba(245,240,232,0.55)',padding:'0.28rem 0.75rem',fontSize:'0.75rem',cursor:'pointer',borderRadius:1,fontFamily:'inherit'}}>← Salir</button>
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

      {/* ── RESULT ── */}
      {screen==='result'&&(()=>{
        const mi=gs.currentModule, mp=gs.moduleProfiles[mi]||{}, dom=domProfile(mp), prof=PROFILES[dom];
        const total=Math.max(1,Object.values(mp).reduce((a,b)=>a+b,0));
        return (
          <div style={{minHeight:'100vh',background:'#0D0D14',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{maxWidth:540,width:'100%',textAlign:'center',animation:'fadeIn 0.5s ease'}}>
              <div style={{fontSize:'0.65rem',letterSpacing:'4px',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.8rem',fontWeight:600}}>Resultado del Módulo</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:'#F5F0E8',fontWeight:900,marginBottom:'0.4rem'}}>{prof.name}</h2>
              <p style={{fontSize:'0.85rem',color:'rgba(245,240,232,0.55)',lineHeight:1.65,marginBottom:'1.5rem'}}>{prof.desc}</p>
              <div style={{background:'rgba(245,240,232,0.04)',border:'1px solid rgba(201,168,76,0.18)',borderRadius:2,padding:'1.3rem',marginBottom:'1.5rem',textAlign:'left'}}>
                <div style={{fontSize:'0.63rem',letterSpacing:'3px',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.9rem',fontWeight:600}}>Tu distribución</div>
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
                <button onClick={()=>setScreen('modules')} style={{background:'transparent',color:'rgba(245,240,232,0.45)',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.82rem',border:'1px solid rgba(245,240,232,0.14)',cursor:'pointer',fontFamily:'inherit'}}>← Volver a Módulos</button>
                <button onClick={handleFinal} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>🎓 Ver Certificado →</button>
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
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:900,color:'#0D0D14',marginBottom:'0.5rem'}}>Tu Certificado ETHOSFERA</h2>
            <div style={{marginBottom:'1.2rem',padding:'0.6rem 1rem',borderRadius:2,background:dbStatus==='ok'?'rgba(74,124,94,0.1)':dbStatus==='error'?'rgba(160,74,47,0.1)':'rgba(201,168,76,0.08)',border:`1px solid ${dbStatus==='ok'?'rgba(74,124,94,0.3)':dbStatus==='error'?'rgba(160,74,47,0.3)':'rgba(201,168,76,0.2)'}`,fontSize:'0.78rem',color:dbStatus==='ok'?'#4A7C5E':dbStatus==='error'?'#A04A2F':'#7A7060',display:'inline-block'}}>
              {dbStatus==='saving'&&'⏳ Guardando en base de datos...'}
              {dbStatus==='ok'&&'✅ Registro guardado correctamente'}
              {dbStatus==='error'&&'⚠️ No se pudo guardar en BD'}
              {dbStatus==='idle'&&'📋 Certificado listo'}
            </div>
            <Certificate name={pc.fullName || pc.name} jobTitle={pc.jobTitle} company={pc.company} profile={globalProfile} scores={gs.totalProfiles}/>
            <div style={{display:'flex',gap:'1rem',justifyContent:'center',marginTop:'1.5rem',flexWrap:'wrap'}}>
              <button onClick={downloadPDF} disabled={pdfLoading} style={{background:'#0D0D14',color:'#F5F0E8',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:pdfLoading?'wait':'pointer',opacity:pdfLoading?0.7:1,display:'inline-flex',alignItems:'center',gap:'0.5rem'}}>
                {pdfLoading?'⏳ Generando PDF...':'⬇ Descargar Certificado PDF'}
              </button>
              <button onClick={()=>{setScreen('title');setGs({completedModules:[],moduleProfiles:{},totalProfiles:{pragmatic:0,idealist:0,relational:0,systemic:0},currentModule:null,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:[]});setDbSaved(false);setDbStatus('idle');}} style={{background:'transparent',color:'#7A7060',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.85rem',border:'1px solid #D4CCB8',cursor:'pointer',fontFamily:'inherit'}}>Nuevo intento</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PANEL ── */}
      {adminMode&&(
        <div style={{position:'fixed',bottom:'1rem',right:'1rem',background:'#1A1A2E',border:'2px solid #C9A84C',borderRadius:8,padding:'1.2rem',maxWidth:600,maxHeight:'90vh',overflowY:'auto',zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.8)',fontFamily:'inherit'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h3 style={{color:'#C9A84C',fontSize:'0.95rem',fontWeight:700,margin:0}}>PANEL ADMIN - GESTIÓN DE CONTENIDO</h3>
            <button onClick={()=>setAdminMode(false)} style={{background:'none',border:'none',color:'#C9A84C',fontSize:'1.2rem',cursor:'pointer'}}>✕</button>
          </div>

          {!adminAuth?(
            <div>
              <input type="password" placeholder="Contraseña admin" value={adminAuth} onChange={(e)=>setAdminAuth(e.target.value)} onKeyPress={(e)=>{if(e.key==='Enter'&&adminAuth===adminPassword){setAdminAuth('AUTH');alert('Autenticado');}}} style={{width:'100%',padding:'0.5rem',borderRadius:2,marginBottom:'0.5rem',fontSize:'0.8rem',background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.3)',color:'#F5F0E8',boxSizing:'border-box'}}/>
              <button onClick={()=>{if(adminAuth===adminPassword){setAdminAuth('AUTH');alert('Autenticado');}else{alert('Contraseña incorrecta');}}} style={{background:'#C9A84C',color:'#0D0D14',padding:'0.4rem 0.8rem',fontSize:'0.75rem',border:'none',borderRadius:2,cursor:'pointer',width:'100%',fontWeight:600}}>Ingresar</button>
            </div>
          ):(
            <div>
              <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
                <button onClick={()=>setAdminAuth('')} style={{flex:1,background:'transparent',border:'1px solid #C9A84C',color:'#C9A84C',padding:'0.3rem 0.6rem',fontSize:'0.7rem',borderRadius:2,cursor:'pointer',fontWeight:600}}>Salir</button>
                <button onClick={()=>{setShowModuleForm(!showModuleForm);setEditingModuleIdx(null);}} style={{flex:1,background:'#C9A84C',color:'#0D0D14',padding:'0.3rem 0.6rem',fontSize:'0.7rem',borderRadius:2,cursor:'pointer',fontWeight:600}}>+ Nuevo Módulo</button>
              </div>

              {/* ESTADÍSTICAS */}
              <div style={{background:'rgba(201,168,76,0.1)',padding:'0.7rem',borderRadius:2,marginBottom:'1rem',fontSize:'0.75rem',color:'#F5F0E8'}}>
                <p style={{margin:'0.2rem 0'}}>📊 Módulos activos: <strong>{modules.length}</strong></p>
                <p style={{margin:'0.2rem 0'}}>🎯 Total escenarios: <strong>{modules.reduce((a,m)=>a+m.scenarios.length,0)}</strong></p>
                <p style={{margin:'0.2rem 0'}}>💾 Almacenamiento: <strong>localStorage</strong></p>
              </div>

              {/* FORMULARIO - NUEVO MÓDULO */}
              {showModuleForm&&!editingModuleIdx&&(
                <div style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.3)',borderRadius:4,padding:'0.8rem',marginBottom:'1rem'}}>
                  <h4 style={{color:'#C9A84C',fontSize:'0.8rem',marginTop:0,marginBottom:'0.6rem'}}>Crear Nuevo Módulo</h4>
                  <input type="text" placeholder="Emoji del módulo (ej: 📋)" maxLength="2" value={formData.moduleIcon} onChange={(e)=>setFormData({...formData,moduleIcon:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.5rem',fontSize:'0.75rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Título del módulo" value={formData.moduleTitle} onChange={(e)=>setFormData({...formData,moduleTitle:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.5rem',fontSize:'0.75rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Etiqueta (ej: Ética y Transparencia)" value={formData.moduleTag} onChange={(e)=>setFormData({...formData,moduleTag:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.5rem',fontSize:'0.75rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box'}}/>
                  <textarea placeholder="Descripción del módulo" value={formData.moduleDesc} onChange={(e)=>setFormData({...formData,moduleDesc:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.8rem',fontSize:'0.75rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'3rem',fontFamily:'inherit',resize:'vertical'}}/>
                  
                  <h5 style={{color:'#C9A84C',fontSize:'0.75rem',marginBottom:'0.5rem',marginTop:0}}>Primer Escenario (Obligatorio)</h5>
                  <input type="text" placeholder="Etiqueta escenario (ej: DILEMA 01)" value={formData.scenarioTag} onChange={(e)=>setFormData({...formData,scenarioTag:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.4rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Título del escenario/dilema" value={formData.scenarioTitle} onChange={(e)=>setFormData({...formData,scenarioTitle:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.4rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box'}}/>
                  <textarea placeholder="Descripción del dilema" value={formData.scenarioBody} onChange={(e)=>setFormData({...formData,scenarioBody:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.4rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'2.5rem',fontFamily:'inherit',resize:'vertical'}}/>
                  <textarea placeholder="Contexto" value={formData.scenarioContext} onChange={(e)=>setFormData({...formData,scenarioContext:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.6rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'2rem',fontFamily:'inherit',resize:'vertical'}}/>
                  
                  <h5 style={{color:'#C9A84C',fontSize:'0.75rem',marginBottom:'0.4rem',marginTop:0}}>4 Opciones de Respuesta</h5>
                  <div style={{maxHeight:'15rem',overflowY:'auto',marginBottom:'0.6rem',paddingRight:'0.4rem'}}>
                    {[0,1,2,3].map(i=>(
                      <div key={i} style={{background:'rgba(20,20,30,0.5)',padding:'0.5rem',marginBottom:'0.4rem',borderRadius:2,border:'1px solid rgba(201,168,76,0.15)'}}>
                        <select value={formData.options[i].profile} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,profile:e.target.value}:o)})} style={{width:'100%',padding:'0.25rem',marginBottom:'0.3rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8'}}>
                          <option value="pragmatic">Pragmático</option>
                          <option value="idealist">Idealista</option>
                          <option value="relational">Relacional</option>
                          <option value="systemic">Sistémico</option>
                        </select>
                        <textarea placeholder="Opción de respuesta" value={formData.options[i].text} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,text:e.target.value}:o)})} style={{width:'100%',padding:'0.3rem',marginBottom:'0.3rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'1.8rem',fontFamily:'inherit',resize:'none'}}/>
                        <textarea placeholder="Resultado/explicación" value={formData.options[i].outcome} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,outcome:e.target.value}:o)})} style={{width:'100%',padding:'0.3rem',marginBottom:'0.3rem',fontSize:'0.65rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'1.5rem',fontFamily:'inherit',resize:'none'}}/>
                        <input type="text" placeholder="Consecuencias (ej: +Ética · -Eficiencia)" value={formData.options[i].consequence} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,consequence:e.target.value}:o)})} style={{width:'100%',padding:'0.3rem',fontSize:'0.65rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#F5F0E8',boxSizing:'border-box',fontFamily:'inherit'}}/>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{display:'flex',gap:'0.4rem'}}>
                    <button onClick={addModule} style={{flex:1,background:'#7BAE49',color:'#F5F0E8',padding:'0.4rem',fontSize:'0.7rem',borderRadius:2,border:'none',cursor:'pointer',fontWeight:600}}>Crear Módulo</button>
                    <button onClick={resetForm} style={{flex:1,background:'transparent',border:'1px solid rgba(201,168,76,0.5)',color:'rgba(201,168,76,0.8)',padding:'0.4rem',fontSize:'0.7rem',borderRadius:2,cursor:'pointer'}}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* LISTA DE MÓDULOS EXISTENTES */}
              <div style={{marginBottom:'0.5rem'}}>
                <h4 style={{color:'#C9A84C',fontSize:'0.8rem',marginBottom:'0.6rem'}}>Módulos Existentes</h4>
                <div style={{maxHeight:'25rem',overflowY:'auto'}}>
                  {modules.map((mod, midx)=>(
                    <div key={midx} style={{background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:3,padding:'0.6rem',marginBottom:'0.6rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'0.5rem'}}>
                        <div>
                          <div style={{fontSize:'0.85rem',color:'#F5F0E8',fontWeight:600}}>{mod.icon} {mod.title}</div>
                          <div style={{fontSize:'0.7rem',color:'rgba(245,240,232,0.6)',marginTop:'0.2rem'}}>{mod.tag}</div>
                        </div>
                        <div style={{display:'flex',gap:'0.3rem'}}>
                          <button onClick={()=>{setEditingModuleIdx(midx);setCurrentScenarioIdx(0);setShowModuleForm(false);}} style={{background:'transparent',border:'1px solid rgba(201,168,76,0.4)',color:'#C9A84C',padding:'0.2rem 0.5rem',fontSize:'0.65rem',borderRadius:2,cursor:'pointer'}}>+Escenario</button>
                          <button onClick={()=>deleteModule(midx)} style={{background:'transparent',border:'1px solid rgba(255,100,100,0.4)',color:'#ff6464',padding:'0.2rem 0.5rem',fontSize:'0.65rem',borderRadius:2,cursor:'pointer'}}>Eliminar</button>
                        </div>
                      </div>
                      
                      {/* Escenarios del módulo */}
                      <div style={{fontSize:'0.7rem',color:'rgba(245,240,232,0.5)',marginBottom:'0.4rem'}}>
                        {mod.scenarios.length} escenario{mod.scenarios.length!==1?'s':''}
                      </div>
                      {mod.scenarios.map((esc,sidx)=>(
                        <div key={sidx} style={{background:'rgba(0,0,0,0.3)',padding:'0.4rem',borderRadius:2,marginBottom:'0.3rem',fontSize:'0.7rem'}}>
                          <div style={{color:'#F5F0E8'}}>📝 {esc.tag}: {esc.title}</div>
                          <div style={{color:'rgba(245,240,232,0.5)',fontSize:'0.65rem',marginTop:'0.15rem'}}>{esc.options.length} opciones</div>
                          <button onClick={()=>deleteScenario(midx,sidx)} style={{background:'transparent',border:'none',color:'#ff8888',fontSize:'0.65rem',cursor:'pointer',marginTop:'0.3rem',padding:0}}>Eliminar escenario</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* FORMULARIO - AGREGAR ESCENARIO */}
              {editingModuleIdx!==null&&(
                <div style={{background:'rgba(74,106,184,0.1)',border:'1px solid rgba(74,106,184,0.3)',borderRadius:4,padding:'0.8rem'}}>
                  <h4 style={{color:'#4A6AB8',fontSize:'0.8rem',marginTop:0,marginBottom:'0.6rem'}}>Agregar Escenario a: {modules[editingModuleIdx].title}</h4>
                  <input type="text" placeholder="Etiqueta escenario (ej: DILEMA 06)" value={formData.scenarioTag} onChange={(e)=>setFormData({...formData,scenarioTag:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.4rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Título del dilema" value={formData.scenarioTitle} onChange={(e)=>setFormData({...formData,scenarioTitle:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.4rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8',boxSizing:'border-box'}}/>
                  <textarea placeholder="Descripción" value={formData.scenarioBody} onChange={(e)=>setFormData({...formData,scenarioBody:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.4rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'2.5rem',fontFamily:'inherit',resize:'vertical'}}/>
                  <textarea placeholder="Contexto" value={formData.scenarioContext} onChange={(e)=>setFormData({...formData,scenarioContext:e.target.value})} style={{width:'100%',padding:'0.35rem',marginBottom:'0.6rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'2rem',fontFamily:'inherit',resize:'vertical'}}/>
                  
                  <h5 style={{color:'#4A6AB8',fontSize:'0.75rem',marginBottom:'0.4rem',marginTop:0}}>4 Opciones</h5>
                  <div style={{maxHeight:'12rem',overflowY:'auto',marginBottom:'0.6rem',paddingRight:'0.4rem'}}>
                    {[0,1,2,3].map(i=>(
                      <div key={i} style={{background:'rgba(20,20,30,0.5)',padding:'0.5rem',marginBottom:'0.4rem',borderRadius:2,border:'1px solid rgba(74,106,184,0.15)'}}>
                        <select value={formData.options[i].profile} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,profile:e.target.value}:o)})} style={{width:'100%',padding:'0.25rem',marginBottom:'0.3rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8'}}>
                          <option value="pragmatic">Pragmático</option>
                          <option value="idealist">Idealista</option>
                          <option value="relational">Relacional</option>
                          <option value="systemic">Sistémico</option>
                        </select>
                        <textarea placeholder="Opción" value={formData.options[i].text} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,text:e.target.value}:o)})} style={{width:'100%',padding:'0.3rem',marginBottom:'0.3rem',fontSize:'0.7rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'1.8rem',fontFamily:'inherit',resize:'none'}}/>
                        <textarea placeholder="Resultado" value={formData.options[i].outcome} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,outcome:e.target.value}:o)})} style={{width:'100%',padding:'0.3rem',marginBottom:'0.3rem',fontSize:'0.65rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8',boxSizing:'border-box',minHeight:'1.5rem',fontFamily:'inherit',resize:'none'}}/>
                        <input type="text" placeholder="Consecuencias" value={formData.options[i].consequence} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,consequence:e.target.value}:o)})} style={{width:'100%',padding:'0.3rem',fontSize:'0.65rem',borderRadius:2,background:'rgba(245,240,232,0.08)',border:'1px solid rgba(74,106,184,0.2)',color:'#F5F0E8',boxSizing:'border-box',fontFamily:'inherit'}}/>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{display:'flex',gap:'0.4rem'}}>
                    <button onClick={()=>addScenarioToModule(editingModuleIdx)} style={{flex:1,background:'#4A6AB8',color:'#F5F0E8',padding:'0.4rem',fontSize:'0.7rem',borderRadius:2,border:'none',cursor:'pointer',fontWeight:600}}>Agregar Escenario</button>
                    <button onClick={()=>{setEditingModuleIdx(null);resetForm();}} style={{flex:1,background:'transparent',border:'1px solid rgba(74,106,184,0.5)',color:'rgba(74,106,184,0.8)',padding:'0.4rem',fontSize:'0.7rem',borderRadius:2,cursor:'pointer'}}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}