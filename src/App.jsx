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
  { id: 'char1', name: 'Femenino', skin: '#000000', hair: '#000000', outfit: '#1A3A5C', hairstyle: 'long', expression: 'happy', avatar: '/images/mujer.png' },
  { id: 'char2', name: 'Masculino', skin: '#000000', hair: '#000000', outfit: '#2E5F8A', hairstyle: 'short', expression: 'serious', avatar: '/images/hombre.png' },
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
    {id:0,icon:'📋',title:'Decreto 815 - Función Pública',tag:'Ética y Transparencia',desc:'Principios y valores en la administración pública.',showInGame:true,scenarios:[
    {tag:'Escenario 01',title:'La solicitud informal',body:'Un ciudadano acude a ti informalmente solicitando una gestión que debe hacer a través de canales formales. Dice que no entiende los procedimientos y que su necesidad es urgente.',context:'El procedimiento formal tarda 5 días hábiles. El ciudadano está frustrado. Saltarte los canales sería más rápido pero violaría el Decreto 815.',showInGame:true,options:[
      {text:'Le explicas claramente el procedimiento formal y lo acompañas en el proceso.',isCorrect:true,feedback:'El ciudadano aprende el camino correcto y se fortalece la transparencia en el trámite.'},
      {text:'Lo atiendes informalmente para agilizar. Al fin el resultado es lo que importa.',isCorrect:false,feedback:'Puede resolver el caso rápido, pero crea un precedente de arbitrariedad.'},
      {text:'Creas un documento simple que le orienta sobre cómo hacer el trámite, disponible para otros.',isCorrect:false,feedback:'Ayuda de manera indirecta, pero no aborda el caso urgente con el ciudadano presente.'},
      {text:'Revisas si el procedimiento formal puede optimizarse para reducir tiempos.',isCorrect:false,feedback:'Es una buena propuesta de mejora, pero no soluciona la urgencia inmediata.'},
    ]},
    {tag:'Escenario 02',title:'El favor al compañero',body:'Un colega de otra dependencia te pide que apruebes un documento sin que cumpla todos los requisitos. Dice que confía en ti y que lo necesita urgentemente.',context:'Se conocen desde hace años. El documento tiene la mayoría de requisitos. Una aprobación informal sería rápida.',showInGame:true,options:[
      {text:'Le explicas qué requisitos faltan y lo ayudas a completarlos rápidamente.',isCorrect:true,feedback:'Ayudas a tu colega sin comprometer la integridad del proceso.'},
      {text:'Lo apruebas como favor personal. La relación con tus colegas también importa.',isCorrect:false,feedback:'Resuelves el favor inmediato, pero pones en riesgo la integridad del procedimiento.'},
      {text:'Le dices que no puedes y lo reportas al protocolo formal.',isCorrect:false,feedback:'Mantienes el proceso, pero no ofreces apoyo para corregir el problema.'},
      {text:'Propones un protocolo de revisión rápida para casos excepcionales.',isCorrect:false,feedback:'Es una buena idea a futuro, pero no atiende la necesidad inmediata del documento.'},
    ]},
    {tag:'Escenario 03',title:'La información incómoda',body:'Descubres que un superior ha manejado datos de manera que beneficia un proyecto favorito, aunque técnicamente no es incorrecto. Pero la presentación oculta información relevante.',context:'El superior tiene autoridad sobre ti. Señalarlo podría verse como deslealtad. Pero la decisión podría ser equivocada.',showInGame:true,options:[
      {text:'Le planteas la inquietud en privado, con datos y respeto.',isCorrect:true,feedback:'Abordas la situación con responsabilidad y cuidas la transparencia sin confrontación innecesaria.'},
      {text:'No dices nada. No es tu responsabilidad cuestionar a tu superior.',isCorrect:false,feedback:'Evitas conflicto inmediato, pero permites que la falta de transparencia continúe.'},
      {text:'Consultas confidencialmente con un colega de confianza para validar tu preocupación.',isCorrect:false,feedback:'Buscas apoyo, pero retrasas la resolución directa del problema.'},
      {text:'Registras la información completa en el expediente del proyecto.',isCorrect:false,feedback:'Documentas el caso, pero no abordas el problema de transparencia de forma activa.'},
    ]},
    {tag:'Escenario 04',title:'El conflicto de intereses oculto',body:'Participas en una decisión sobre un contrato. Descubres que una empresa contratista tiene relación con la familia de un decisor clave. No lo ha declarado.',context:'Declararlo podría ser incómodo para varios. Pero el Decreto 815 exige transparencia en conflictos de interés.',showInGame:true,options:[
      {text:'Planteas la necesidad de que se declaren conflictos según el Decreto.',isCorrect:true,feedback:'Cumples con la norma y proteges la transparencia del proceso.'},
      {text:'No lo mencionas. Probablemente la relación no afecta la decisión.',isCorrect:false,feedback:'Ignoras un posible conflicto y pones en riesgo la legitimidad de la decisión.'},
      {text:'Hablas en privado con el decisor sobre la importancia de la declaración.',isCorrect:false,feedback:'Buscas una solución discreta, pero la situación requiere un registro formal.'},
      {text:'Documenta tu observación y la registra en el acta de la reunión.',isCorrect:false,feedback:'Tomas nota, pero no garantizas que se gestione el conflicto según la norma.'},
    ]},
    {tag:'Escenario 05',title:'El recurso limitado y la equidad',body:'Tienes presupuesto para una iniciativa de capacitación. Dos equipos compiten por él. Uno está mejor conectado políticamente; el otro tiene más necesidad real.',context:'El equipo conectado espera que lo favorezcas. El que tiene más necesidad es más discreto pero será más impactado.',showInGame:true,options:[
      {text:'Propones un criterio transparente de asignación de recursos que todos puedan ver.',isCorrect:true,feedback:'Fomenta equidad y transparencia en la decisión, lo cual fortalece la confianza institucional.'},
      {text:'Le das el recurso al que tiene más necesidad, aunque sea menos cómodo políticamente.',isCorrect:false,feedback:'Apoyas una causa justa, pero sin un criterio público es difícil sostener la decisión.'},
      {text:'Le das el recurso al mejor conectado. Así evitas conflictos políticos.',isCorrect:false,feedback:'Evitas tensión política, pero perpetúas desigualdad y favoritismo.'},
      {text:'Hablas con ambos para entender mejor sus necesidades y posibles alianzas.',isCorrect:false,feedback:'Buscas diálogo, pero no estableces un criterio claro ni transparente.'},
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

function loadQuestionsFromStorage() {
  try {
    const saved = localStorage.getItem('ethosfera_questions');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading questions:', e);
  }
  return [];
}

function saveQuestionsToStorage(questions) {
  try {
    localStorage.setItem('ethosfera_questions', JSON.stringify(questions));
    return true;
  } catch (e) {
    console.error('Error saving questions:', e);
    return false;
  }
}

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
    <div id="cert-render" style={{ background:'#ffffff', border:'2px solid rgba(11,86,64,0.18)', padding:'2.5rem 2.5rem 2rem', position:'relative', maxWidth:580, margin:'0 auto', fontFamily:'Poppins, sans-serif', color:'#0D2C1B' }}>
      {[['tl','2px 0 0 2px'],['tr','2px 2px 0 0'],['bl','0 0 2px 2px'],['br','0 2px 2px 0']].map(([k,bw])=>(
        <div key={k} style={{ position:'absolute', width:20, height:20, top:k.includes('t')?8:'auto', bottom:k.includes('b')?8:'auto', left:k.includes('l')?8:'auto', right:k.includes('r')?8:'auto', borderColor:'#0D2C1B', borderStyle:'solid', borderWidth:bw }} />
      ))}
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'0.62rem', letterSpacing:4, textTransform:'uppercase', color:'#0b5640', marginBottom:'0.7rem' }}>Certificado de Aprendizaje · ETHOSFERA</div>
        <div style={{ fontSize:'0.82rem', color:'#0D2C1B', marginBottom:'0.4rem' }}>Se certifica que</div>
        <div style={{ fontSize:'2rem', color:'#0D2C1B', fontWeight:900, marginBottom:'0.2rem' }}>{name||'Participante'}</div>
        {jobTitle && <div style={{ fontSize:'0.9rem', color:'#1A4C24', fontWeight:600, marginBottom:'0.15rem' }}>{jobTitle}</div>}
        {company && <div style={{ fontSize:'0.82rem', color:'#7A7A7A', marginBottom:'0.3rem' }}>{company}</div>}
        <div style={{ width:40, height:1, background:'#3af9a2', margin:'0.8rem auto' }}/>
        <div style={{ fontSize:'0.82rem', color:'#0D2C1B', lineHeight:1.6, maxWidth:360, margin:'0 auto 0.8rem' }}>Ha completado exitosamente el módulo de capacitación ETHOSFERA, demostrando compromiso con la ética y el liderazgo público.</div>
        <div style={{ width:40, height:1, background:'#3af9a2', margin:'0.8rem auto' }}/>
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
    score: 0,
  });
  const [adminMode, setAdminMode] = useState(false);
  const [adminAuth, setAdminAuth] = useState('');
  const [adminPassword] = useState('ethosfera2025'); // En producción usar variable de entorno
  const [dbSaved, setDbSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState('idle');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [modules, setModules] = useState(() => loadModulesFromStorage());
  const QUESTION_PASSWORD = 'ethosfera2025';
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModuleIdx, setEditingModuleIdx] = useState(null);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [questions, setQuestions] = useState(() => loadQuestionsFromStorage());
  const [authAccess, setAuthAccess] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [questionForm, setQuestionForm] = useState({ moduleId:'', text:'', correctAnswer:'', incorrectAnswers:['','',''], feedback:'' });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingModuleFormIdx, setEditingModuleFormIdx] = useState(null);
  const [formData, setFormData] = useState({
    moduleIcon: '📋',
    moduleTitle: '',
    moduleTag: '',
    moduleDesc: '',
    showInGame: true,
    scenarioShowInGame: true,
    scenarioTag: '',
    scenarioTitle: '',
    scenarioBody: '',
    scenarioContext: '',
    options: [
      {text:'',isCorrect:true,feedback:''},
      {text:'',isCorrect:false,feedback:''},
      {text:'',isCorrect:false,feedback:''},
      {text:'',isCorrect:false,feedback:''},
    ]
  });

  // Guardar módulos cuando cambian
  const updateModules = (newModules) => {
    setModules(newModules);
    saveModulesToStorage(newModules);
  };

  const authorizeUser = () => {
    if (authInput.trim() === QUESTION_PASSWORD) {
      setAuthAccess(true);
      setAuthInput('');
      alert('Acceso autorizado');
      setScreen('questions');
    } else {
      alert('Código de acceso incorrecto');
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({ moduleId:'', text:'', correctAnswer:'', incorrectAnswers:['','',''], feedback:'' });
    setEditingQuestionId(null);
  };

  const submitQuestion = () => {
    if (!questionForm.moduleId && modules.length > 0) {
      alert('Selecciona el módulo al que pertenece la pregunta');
      return;
    }
    if (!questionForm.text.trim()) {
      alert('Escribe la pregunta antes de enviar');
      return;
    }
    if (!questionForm.correctAnswer.trim()) {
      alert('Define la respuesta correcta');
      return;
    }
    if (!questionForm.incorrectAnswers.some(ans => ans.trim())) {
      alert('Agrega al menos una respuesta incorrecta');
      return;
    }

    const module = modules.find(m => m.id === Number(questionForm.moduleId));
    const moduleRef = module ? module.title : 'General';

    if (editingQuestionId !== null) {
      const updated = questions.map(q => q.id === editingQuestionId ? {
        ...q,
        moduleId: questionForm.moduleId ? Number(questionForm.moduleId) : null,
        moduleRef,
        text: questionForm.text.trim(),
        correctAnswer: questionForm.correctAnswer.trim(),
        incorrectAnswers: questionForm.incorrectAnswers.map(ans => ans.trim()).filter(Boolean),
        feedback: questionForm.feedback.trim(),
        updatedAt: new Date().toLocaleString('es-ES')
      } : q);
      setQuestions(updated);
      saveQuestionsToStorage(updated);
      resetQuestionForm();
      alert('Pregunta actualizada correctamente');
      return;
    }

    const newEntry = {
      id: Date.now(),
      moduleId: questionForm.moduleId ? Number(questionForm.moduleId) : null,
      moduleRef,
      text: questionForm.text.trim(),
      correctAnswer: questionForm.correctAnswer.trim(),
      incorrectAnswers: questionForm.incorrectAnswers.map(ans => ans.trim()).filter(Boolean),
      feedback: questionForm.feedback.trim(),
      createdAt: new Date().toLocaleString('es-ES')
    };
    const updated = [...questions, newEntry];
    setQuestions(updated);
    saveQuestionsToStorage(updated);
    resetQuestionForm();
    alert('Pregunta registrada correctamente');
  };

  const editQuestion = (question) => {
    setEditingQuestionId(question.id);
    setQuestionForm({
      moduleId: question.moduleId || '',
      text: question.text,
      correctAnswer: question.correctAnswer || '',
      incorrectAnswers: [
        ...(question.incorrectAnswers || []),
        '',
        '',
      ].slice(0,3),
      feedback: question.feedback || ''
    });
  };

  const deleteQuestion = (id) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    saveQuestionsToStorage(updated);
  };

  const editModuleMeta = (moduleIdx) => {
    const module = modules[moduleIdx];
    setEditingModuleFormIdx(moduleIdx);
    setShowModuleForm(true);
    setFormData({
      moduleIcon: module.icon,
      moduleTitle: module.title,
      moduleTag: module.tag,
      moduleDesc: module.desc,
      showInGame: module.showInGame ?? true,
      scenarioShowInGame: true,
      scenarioTag: '',
      scenarioTitle: '',
      scenarioBody: '',
      scenarioContext: '',
      options: [
        {text:'',isCorrect:true,feedback:''},
        {text:'',isCorrect:false,feedback:''},
        {text:'',isCorrect:false,feedback:''},
        {text:'',isCorrect:false,feedback:''},
      ]
    });
  };

  const saveEditedModule = () => {
    if (editingModuleFormIdx === null) return;
    if (!formData.moduleTitle.trim()) {
      alert('El módulo debe tener un título');
      return;
    }
    const updated = [...modules];
    updated[editingModuleFormIdx] = {
      ...updated[editingModuleFormIdx],
      icon: formData.moduleIcon,
      title: formData.moduleTitle,
      tag: formData.moduleTag,
      desc: formData.moduleDesc,
      showInGame: formData.showInGame,
    };
    updateModules(updated);
    setEditingModuleFormIdx(null);
    setShowModuleForm(false);
    resetForm();
    alert('Módulo actualizado correctamente');
  };

  const cancelModuleEdit = () => {
    setEditingModuleFormIdx(null);
    resetForm();
    setShowModuleForm(false);
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
      showInGame: formData.showInGame,
      scenarios: [{
        tag: formData.scenarioTag,
        title: formData.scenarioTitle,
        body: formData.scenarioBody,
        context: formData.scenarioContext,
        showInGame: formData.scenarioShowInGame,
        options: formData.options.filter(opt => opt.text.trim())
      }]
    };

    if (newModule.scenarios[0].options.length < 2) {
      alert('Cada escenario debe tener al menos 2 opciones');
      return;
    }
    if (!newModule.scenarios[0].options.some(opt => opt.isCorrect)) {
      alert('Marca una opción como correcta');
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
      showInGame: formData.scenarioShowInGame,
      options: formData.options.filter(opt => opt.text.trim())
    };

    if (newScenario.options.length < 2) {
      alert('Cada escenario debe tener al menos 2 opciones');
      return;
    }
    if (!newScenario.options.some(opt => opt.isCorrect)) {
      alert('Marca una opción como correcta');
      return;
    }

    const updated = [...modules];
    updated[moduleIdx].scenarios.push(newScenario);
    updateModules(updated);
    resetForm();
    setEditingModuleIdx(null);
    alert('Escenario agregado exitosamente');
  };

  const addExistingScenarioToModule = (targetModuleIdx, sourceModuleIdx, scenarioIdx) => {
    if (targetModuleIdx === sourceModuleIdx) return;
    const sourceScenario = modules[sourceModuleIdx].scenarios[scenarioIdx];
    const updated = [...modules];
    const targetModule = updated[targetModuleIdx];
    if (targetModule.scenarios.some(s => s.tag === sourceScenario.tag && s.title === sourceScenario.title)) {
      alert('Este juego ya existe en el módulo seleccionado');
      return;
    }
    targetModule.scenarios = [...targetModule.scenarios, { ...sourceScenario }];
    updateModules(updated);
    alert(`Juego "${sourceScenario.tag || sourceScenario.title}" agregado al módulo "${targetModule.title}"`);
  };

  const resetForm = () => {
    setFormData({
      moduleIcon: '📋',
      moduleTitle: '',
      moduleTag: '',
      moduleDesc: '',
      showInGame: true,
      scenarioShowInGame: true,
      scenarioTag: '',
      scenarioTitle: '',
      scenarioBody: '',
      scenarioContext: '',
      options: [
        {text:'',isCorrect:true,feedback:''},
        {text:'',isCorrect:false,feedback:''},
        {text:'',isCorrect:false,feedback:''},
        {text:'',isCorrect:false,feedback:''},
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

  const toggleScenarioVisibility = (moduleIdx, scenarioIdx) => {
    const updated = [...modules];
    updated[moduleIdx].scenarios[scenarioIdx].showInGame = !updated[moduleIdx].scenarios[scenarioIdx].showInGame;
    updateModules(updated);
  };

  const toggleModuleVisibility = (moduleIdx) => {
    const updated = [...modules];
    updated[moduleIdx].showInGame = !updated[moduleIdx].showInGame;
    updateModules(updated);
  };

  const startModule = (idx) => {
    const visibleScenarios = modules[idx].scenarios.filter(sc => sc.showInGame !== false);
    if (visibleScenarios.length === 0) {
      alert('Este módulo no tiene escenarios activos para el juego. Habilita al menos uno.');
      return;
    }
    const opts = shuffle(visibleScenarios[0].options);
    setGs(g=>({...g,currentModule:idx,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:opts}));
    setScreen('game');
  };

  const selectOpt = (opt) => {
    if (gs.answered) return;
    setGs(g => ({
      ...g,
      answered: true,
      selectedOpt: opt,
      score: g.score + (opt.isCorrect ? 1 : 0),
    }));
  };

  const nextScenario = () => {
    const mod = modules[gs.currentModule];
    const visibleScenarios = mod.scenarios.filter(sc => sc.showInGame !== false);
    const next = gs.currentScenario + 1;
    if (next < visibleScenarios.length) {
      const opts = shuffle(visibleScenarios[next].options);
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

  const allDone = modules.filter(m=>m.showInGame).every(m=>gs.completedModules.includes(m.id));
  const currentMod = gs.currentModule!==null ? modules[gs.currentModule] : null;
  const currentScenarios = currentMod ? currentMod.scenarios.filter(sc => sc.showInGame !== false) : [];
  const currentSc = currentScenarios[gs.currentScenario] || null;
  const availableScenarios = modules.flatMap((mod, midx) => mod.scenarios.map((sc, sidx) => ({
    ...sc,
    sourceModuleIdx: midx,
    sourceModuleTitle: mod.title,
    sourceScenarioIdx: sidx
  })));

  return (
    <div style={{fontFamily:"'Poppins',sans-serif",width:'100%',minHeight:'100vh',background:'#ffffff'}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;min-height:100vh;overflow-x:hidden;background:#ffffff;color:#000000;font-family:'Poppins',sans-serif}
        body{background:#ffffff;color:#000000;}
        button,input,textarea,select{font-family:'Poppins',sans-serif;color:#000000}
        h1,h2,h3,h4,h5,h6{color:#000000;font-family:'Poppins',sans-serif!important}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .opt-card:hover:not(:disabled){border-color:#0b5640!important;background:#e8f8f2!important;transform:translateX(3px)}
        .selection-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
        .info-grid{display:grid;grid-template-columns:220px 1fr;gap:2rem}
        .game-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:0}
        .module-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1px}
        .character-card{background:#ffffff;border:2px solid rgba(11,86,64,0.15);border-radius:12px;transition:all 0.3s ease}
        .button-primary{background:#3af9a2;color:#0b5640}
        .button-secondary{background:transparent;color:#0b5640;border:1px solid rgba(11,86,64,0.12)}
        .menu-bar{display:flex;justify-content:center;gap:0.65rem;padding:1rem 1.5rem;background:#ffffff;border-bottom:1px solid rgba(11,86,64,0.12);position:sticky;top:0;z-index:20}
        .menu-bar button{border-radius:4px;padding:0.55rem 0.9rem;cursor:pointer;font-size:0.82rem;border:1px solid rgba(11,86,64,0.18);background:transparent;color:#0b5640}
        .menu-bar button.active{background:#3af9a2;color:#ffffff;border-color:#0b5640}
        .menu-bar button.inactive{background:transparent;color:#0b5640}
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

      <div className="menu-bar">
        <button onClick={()=>setScreen('title')} className={screen==='title'?'active':'inactive'}>Inicio</button>
        <button onClick={()=>setScreen('modules')} className={screen==='modules'?'active':'inactive'}>Módulos</button>
        <button onClick={()=>setScreen('questions')} className={screen==='questions'?'active':'inactive'}>Preguntas</button>
      </div>

      {/* ── TITLE ── */}
      {screen==='title'&&(
        <div style={{minHeight:'100vh',background:'#ffffff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',animation:'fadeIn 0.5s ease'}}>
          <div style={{fontSize:'0.68rem',letterSpacing:4,textTransform:'uppercase',color:'#0b5640',marginBottom:'1rem',fontWeight:500}}>Herramienta de Capacitación</div>
          <h1 style={{fontSize:'clamp(3rem,8vw,5.5rem)',color:'#000000',lineHeight:0.95,fontWeight:900,margin:'0 0 0.5rem'}}>ETHOSFERA</h1>
          <p style={{fontSize:'0.9rem',color:'#018d38',fontWeight:600,marginBottom:'2rem',letterSpacing:1}}>Herramienta que forma líderes</p>
          <div style={{width:50,height:2,background:'#3af9a2',margin:'0 auto 1.2rem'}}/>
          <p style={{fontSize:'0.9rem',color:'#000000',lineHeight:1.7,maxWidth:450,marginBottom:'2rem'}}>Casos éticos reales en el contexto del Decreto 815. Desarrolla tu criterio de liderazgo a través de decisiones reflexivas.</p>
          <button onClick={()=>setScreen('character-select')} style={{background:'#3af9a2',color:'#0b5640',padding:'0.85rem 2.2rem',borderRadius:2,fontWeight:600,fontSize:'0.92rem',border:'none',cursor:'pointer',letterSpacing:0.5}}>Comenzar →</button>
          
          {/* Botón secreto para modo admin */}
          <button onClick={()=>setAdminMode(!adminMode)} style={{position:'fixed',bottom:'1rem',right:'1rem',background:'transparent',border:'1px solid rgba(11,86,64,0.2)',color:'#0b5640',padding:'0.3rem 0.6rem',borderRadius:2,fontSize:'0.65rem',cursor:'pointer',fontFamily:'monospace',opacity:0.3,transition:'opacity 0.3s'}} onMouseEnter={(e)=>e.target.style.opacity='1'} onMouseLeave={(e)=>e.target.style.opacity='0.3'}>admin</button>
        </div>
      )}

      {/* ── CHARACTER SELECT ── */}
      {screen==='character-select'&&(
        <div style={{minHeight:'100vh',background:'#ffffff',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto'}}>
          <div style={{maxWidth:900,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'0.65rem',letterSpacing:3,textTransform:'uppercase',color:'#0b5640',marginBottom:'1rem',fontWeight:600}}>Elige tu personaje</div>
            <h2 className="hero-title" style={{fontSize:'2rem',color:'#0b5640',fontWeight:700,marginBottom:'2rem'}}>¿Con cuál deseas participar?</h2>
            <div className="selection-grid" style={{marginBottom:'2rem'}}>
              {CHARACTERS.map(char=>(
                <div key={char.id} onClick={()=>{setPc({...char, fullName:'', jobTitle:'', company:''});setScreen('info');}} className="character-card" style={{padding:'2rem',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
                  <div style={{width:'100%',maxWidth:260,height:260,background:'linear-gradient(170deg,#0D2C1B,#0A361F,#163E1B)',border:'1px solid rgba(123,174,73,0.35)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    <img src={char.avatar} alt={char.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'1.1rem',fontWeight:700,color:'#000000'}}>{char.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INFO ── */}
      {screen==='info'&&pc&&(
        <div style={{minHeight:'100vh',background:'#ffffff',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:'3rem',maxWidth:780,width:'100%',alignItems:'start'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem',position:'sticky',top:'2rem'}}>
              <div style={{width:180,height:220,background:'#f6fcf8',border:'1px solid rgba(11,86,64,0.15)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',paddingBottom:0,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.08)'}}>
                <img src={pc.avatar} alt={pc.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
              <div style={{color:'#0b5640',fontSize:'0.78rem',fontWeight:500,letterSpacing:1}}>{pc.name}</div>
            </div>
            <div>
              <div style={{fontSize:'0.65rem',letterSpacing:3,textTransform:'uppercase',color:'#0b5640',marginBottom:'1.5rem',fontWeight:600}}>Información de participante</div>
              {[['Nombre Completo','fullName','Tu nombre y apellidos'],['Cargo','jobTitle','Tu cargo u posición'],['Organización (opcional)','company','Tu empresa u organización']].map(([label,field,ph])=>(
                <div key={field} style={{marginBottom:'1.3rem'}}>
                  <h3 style={{color:'#0b5640',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.6rem'}}>{label}</h3>
                  <input placeholder={ph} value={pc[field]||''} onChange={e=>setPc(p=>({...p,[field]:e.target.value}))} style={{background:'#ffffff',border:'1px solid rgba(11,86,64,0.15)',borderRadius:2,padding:'0.6rem 0.9rem',color:'#000000',fontFamily:'inherit',fontSize:'0.88rem',width:'100%',outline:'none'}}/>
                </div>
              ))}
              <div style={{display:'flex',gap:'0.8rem',flexWrap:'wrap',marginTop:'2rem'}}>
                <button onClick={()=>{if(!pc.fullName||!pc.fullName.trim()){alert('Por favor completa al menos tu nombre.');return;}setScreen('modules');}} style={{background:'#3af9a2',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>Continuar →</button>
                <button onClick={()=>setScreen('character-select')} style={{background:'transparent',border:'1px solid rgba(11,86,64,0.15)',color:'#0b5640',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.82rem',cursor:'pointer',fontFamily:'inherit'}}>← Cambiar personaje</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULES ── */}
      {screen==='modules'&&(
        <div style={{minHeight:'100vh',background:'#ffffff',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'2.5rem'}}>
          <div style={{textAlign:'center',marginBottom:'1.5rem',width:'100%',maxWidth:860}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',color:'#0D0D14',fontWeight:900}}>Módulos de Capacitación</h2>
            <p style={{color:'#0D0D14',fontSize:'0.85rem',marginTop:'0.3rem'}}>Completa el módulo para generar tu certificado</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem',width:'100%',maxWidth:860,border:'1px solid rgba(11,86,64,0.12)'}}>
            {modules.filter(mod=>mod.showInGame).map((mod,i)=>{
              const done=gs.completedModules.includes(mod.id);
              const realIndex = modules.findIndex(m=>m.id===mod.id);
              return (
                <div key={mod.id} onClick={()=>startModule(realIndex)} style={{background:done?'#f6fff6':'#ffffff',padding:'1.4rem',cursor:'pointer',position:'relative',borderBottom:'1px solid rgba(11,86,64,0.12)',transition:'all 0.2s',display:'flex',flexDirection:'column'}}>
                  <span style={{fontSize:'1.6rem',marginBottom:'0.7rem',display:'block'}}>{mod.icon}</span>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'#0D0D14',fontWeight:700,marginBottom:'0.3rem'}}>{mod.title}</h3>
                  <p style={{fontSize:'0.78rem',color:'#0D0D14',lineHeight:1.5,flexGrow:1}}>{mod.desc}</p>
                  <span style={{display:'inline-block',marginTop:'0.7rem',padding:'0.12rem 0.55rem',fontSize:'0.65rem',letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600,border:'1px solid rgba(11,86,64,0.12)',color:'#0b5640',borderRadius:1}}>{mod.tag}</span>
                  {done&&<div style={{position:'absolute',top:'0.9rem',right:'0.9rem',fontSize:'0.75rem',fontWeight:600,color:'#0b5640'}}>✓ Completado</div>}
                </div>
              );
            })}
          </div>
          {allDone&&<div style={{marginTop:'1.5rem'}}><button onClick={handleFinal} style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'#3af9a2',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>🎓 Ver Certificado Final</button></div>}
        </div>
      )}

      {/* ── PREGUNTAS AUTORIZADAS ── */}
      {screen==='questions'&&(
        <div style={{minHeight:'100vh',background:'#ffffff',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'1.5rem'}}>
          <div style={{width:'100%',maxWidth:960,textAlign:'center'}}>
            <div style={{fontSize:'0.65rem',letterSpacing:3,textTransform:'uppercase',color:'#0b5640',marginBottom:'1rem',fontWeight:600}}>Gestión autorizada de contenido</div>
            <h2 style={{fontFamily:'Poppins, sans-serif',fontSize:'2rem',color:'#0D0D0D',fontWeight:900,marginBottom:'0.6rem'}}>Administra módulos y preguntas del curso</h2>
            <p style={{color:'#1A1A1A',fontSize:'0.92rem',lineHeight:1.7,maxWidth:760,margin:'0 auto'}}>Solo personal autorizado puede crear, editar o eliminar módulos y preguntas del curso. Ingrese con el código autorizado para administrar el contenido que verán los participantes.</p>
          </div>

          {!authAccess ? (
            <div style={{background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10,padding:'1.5rem',width:'100%',maxWidth:520}}>
              <p style={{color:'#1A1A1A',marginBottom:'1rem'}}>Ingrese el código de acceso autorizado para gestionar módulos y preguntas.</p>
              <input type="password" value={authInput} onChange={e=>setAuthInput(e.target.value)} placeholder="Código de acceso" style={{width:'100%',padding:'0.9rem 1rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',marginBottom:'1rem',fontSize:'0.92rem'}}/>
              <button onClick={authorizeUser} style={{width:'100%',background:'#3af9a2',color:'#0D0D14',padding:'0.9rem 1rem',borderRadius:4,border:'none',cursor:'pointer',fontWeight:700}}>Ingresar</button>
            </div>
          ) : (
            <div style={{width:'100%',maxWidth:960,display:'grid',gridTemplateColumns:'1fr',gap:'1.2rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.2rem'}}>
                <div style={{background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10,padding:'1.4rem'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:'#0b5640',marginBottom:'1rem'}}>Registrar nueva pregunta</div>
                  <select value={questionForm.moduleId} onChange={e=>setQuestionForm(f=>({...f,moduleId:e.target.value}))} style={{width:'100%',padding:'0.85rem 1rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',marginBottom:'1rem',fontSize:'0.9rem'}}>
                    <option value="">Selecciona un módulo</option>
                    {modules.map(mod=>(
                      <option key={mod.id} value={mod.id}>{mod.title}</option>
                    ))}
                  </select>
                  <textarea placeholder="Escribe tu pregunta aquí" value={questionForm.text} onChange={e=>setQuestionForm(f=>({...f,text:e.target.value}))} style={{width:'100%',minHeight:'120px',padding:'1rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',fontSize:'0.9rem',resize:'vertical',marginBottom:'1rem'}}/>
                  <input placeholder="Respuesta correcta" value={questionForm.correctAnswer} onChange={e=>setQuestionForm(f=>({...f,correctAnswer:e.target.value}))} style={{width:'100%',padding:'0.85rem 1rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',marginBottom:'1rem',fontSize:'0.9rem'}}/>
                  {[0,1,2].map((idx)=>(
                    <input key={idx} placeholder={`Respuesta incorrecta ${idx+1}`} value={questionForm.incorrectAnswers[idx]} onChange={e=>setQuestionForm(f=>({...f,incorrectAnswers:f.incorrectAnswers.map((val,i)=>i===idx?e.target.value:val)}))} style={{width:'100%',padding:'0.85rem 1rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',marginBottom:'1rem',fontSize:'0.9rem'}}/>
                  ))}
                  <textarea placeholder="Retroalimentación para esta pregunta" value={questionForm.feedback} onChange={e=>setQuestionForm(f=>({...f,feedback:e.target.value}))} style={{width:'100%',minHeight:'100px',padding:'1rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',fontSize:'0.9rem',resize:'vertical',marginBottom:'1rem'}}/>
                  <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                    <button onClick={submitQuestion} style={{flex:1,background:'#3af9a2',color:'#0D0D14',padding:'0.95rem 1rem',borderRadius:4,border:'none',cursor:'pointer',fontWeight:700}}>{editingQuestionId!==null?'Guardar cambios':'Enviar pregunta'}</button>
                    {editingQuestionId!==null&&(
                      <button onClick={resetQuestionForm} style={{flex:1,background:'transparent',border:'1px solid rgba(11,86,64,0.18)',color:'#0D0D14',padding:'0.95rem 1rem',borderRadius:4,cursor:'pointer'}}>Cancelar</button>
                    )}
                  </div>
                </div>
                <div style={{background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10,padding:'1.4rem',maxHeight:'520px',overflowY:'auto'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:'#0b5640',marginBottom:'1rem'}}>Preguntas registradas</div>
                  {questions.length === 0 ? (
                    <p style={{color:'#7A7060'}}>No hay preguntas registradas aún.</p>
                  ) : (
                    questions.slice().reverse().map(question => (
                      <div key={question.id} style={{marginBottom:'1rem',padding:'0.9rem',borderRadius:4,background:'#ffffff',border:'1px solid rgba(11,86,64,0.12)'}}>
                        <div style={{display:'flex',justifyContent:'space-between',gap:'0.75rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
                          <span style={{fontSize:'0.78rem',fontWeight:700,color:'#0b5640'}}>{question.moduleRef}</span>
                          <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap'}}>
                            <button onClick={()=>editQuestion(question)} style={{background:'transparent',border:'1px solid rgba(11,86,64,0.18)',color:'#0D0D14',padding:'0.25rem 0.6rem',fontSize:'0.72rem',borderRadius:3,cursor:'pointer'}}>Editar</button>
                            <button onClick={()=>deleteQuestion(question.id)} style={{background:'transparent',border:'1px solid rgba(255,100,100,0.4)',color:'#c33',padding:'0.25rem 0.6rem',fontSize:'0.72rem',borderRadius:3,cursor:'pointer'}}>Eliminar</button>
                          </div>
                        </div>
                        <div style={{fontSize:'0.92rem',color:'#0D0D14',lineHeight:1.5,marginBottom:'0.65rem'}}>{question.text}</div>
                        <div style={{display:'grid',gap:'0.35rem',marginBottom:'0.65rem'}}>
                          <div style={{fontSize:'0.78rem',color:'#0b5640'}}>Correcta: {question.correctAnswer}</div>
                          {question.incorrectAnswers.map((wrong, idx)=>(
                            <div key={idx} style={{fontSize:'0.76rem',color:'#0D0D14'}}>Incorrecta {idx+1}: {wrong}</div>
                          ))}
                        </div>
                        <div style={{fontSize:'0.8rem',color:'#0D0D14',marginBottom:'0.55rem'}}>Retroalimentación: {question.feedback || 'Sin retroalimentación'}</div>
                        <div style={{fontSize:'0.72rem',color:'#0D0D14'}}>{question.createdAt}{question.updatedAt?` · editada ${question.updatedAt}`:''}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10,padding:'1.4rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',gap:'1rem'}}>
                  <div>
                    <div style={{fontSize:'0.85rem',fontWeight:700,color:'#0b5640'}}>Gestión de módulos</div>
                    <div style={{fontSize:'0.78rem',color:'#0D0D14'}}>Crea y edita el contenido que verá el curso.</div>
                  </div>
                  <button onClick={()=>{setShowModuleForm(!showModuleForm);setEditingModuleFormIdx(null);}} style={{background:'#3af9a2',color:'#0D0D14',padding:'0.75rem 1rem',borderRadius:4,border:'none',cursor:'pointer',fontWeight:700}}>+ Nuevo módulo</button>
                </div>

                {showModuleForm && (
                  <div style={{background:'#ffffff',border:'1px solid rgba(11,86,64,0.18)',borderRadius:10,padding:'1rem',marginBottom:'1rem'}}>
                    <div style={{fontSize:'0.82rem',fontWeight:700,color:'#0D0D14',marginBottom:'0.8rem'}}>{editingModuleFormIdx===null ? 'Crear módulo' : 'Editar módulo'}</div>
                    <input type="text" placeholder="Emoji del módulo" maxLength="2" value={formData.moduleIcon} onChange={e=>setFormData({...formData,moduleIcon:e.target.value})} style={{width:'100%',padding:'0.7rem',marginBottom:'0.6rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',fontSize:'0.9rem'}}/>
                    <input type="text" placeholder="Título del módulo" value={formData.moduleTitle} onChange={e=>setFormData({...formData,moduleTitle:e.target.value})} style={{width:'100%',padding:'0.7rem',marginBottom:'0.6rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',fontSize:'0.9rem'}}/>
                    <input type="text" placeholder="Etiqueta" value={formData.moduleTag} onChange={e=>setFormData({...formData,moduleTag:e.target.value})} style={{width:'100%',padding:'0.7rem',marginBottom:'0.6rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',fontSize:'0.9rem'}}/>
                    <textarea placeholder="Descripción del módulo" value={formData.moduleDesc} onChange={e=>setFormData({...formData,moduleDesc:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.8rem',borderRadius:4,border:'1px solid rgba(11,86,64,0.18)',background:'#ffffff',color:'#0D0D14',fontSize:'0.9rem',resize:'vertical',minHeight:'100px'}}/>
                    <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                      <button onClick={editingModuleFormIdx===null ? addModule : saveEditedModule} style={{flex:1,background:'#3af9a2',color:'#0D0D14',padding:'0.85rem 1rem',borderRadius:4,border:'none',cursor:'pointer',fontWeight:700}}>{editingModuleFormIdx===null ? 'Crear módulo' : 'Guardar módulo'}</button>
                      <button onClick={cancelModuleEdit} style={{flex:1,background:'transparent',border:'1px solid rgba(11,86,64,0.18)',color:'#0D0D14',padding:'0.85rem 1rem',borderRadius:4,cursor:'pointer'}}>Cancelar</button>
                    </div>
                  </div>
                )}

                <div style={{maxHeight:'420px',overflowY:'auto'}}>
                  {modules.length===0 ? (
                    <p style={{color:'#7A7060'}}>No hay módulos definidos aún.</p>
                  ) : modules.map((mod,midx)=>(
                    <div key={midx} style={{background:'#ffffff',border:'1px solid rgba(11,86,64,0.12)',borderRadius:10,padding:'1rem',marginBottom:'1rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap',marginBottom:'0.65rem'}}>
                        <div>
                          <div style={{fontSize:'1rem',fontWeight:700,color:'#0D0D14'}}>{mod.icon} {mod.title}</div>
                          <div style={{fontSize:'0.78rem',color:'#0D0D14',marginTop:'0.25rem'}}>{mod.tag}</div>
                          <div style={{fontSize:'0.72rem',color:mod.showInGame ? '#3af9a2' : '#A9B9A7',marginTop:'0.25rem'}}>{mod.showInGame ? 'Visible en juegos' : 'Oculto en juegos'}</div>
                        </div>
                        <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                          <button onClick={()=>toggleModuleVisibility(midx)} style={{background:'transparent',border:'1px solid rgba(11,86,64,0.18)',color:'#0D0D14',padding:'0.4rem 0.65rem',fontSize:'0.72rem',borderRadius:3,cursor:'pointer'}}>{mod.showInGame ? 'Ocultar en juego' : 'Mostrar en juego'}</button>
                          <button onClick={()=>editModuleMeta(midx)} style={{background:'transparent',border:'1px solid rgba(11,86,64,0.18)',color:'#0D0D14',padding:'0.4rem 0.65rem',fontSize:'0.72rem',borderRadius:3,cursor:'pointer'}}>Editar</button>
                          <button onClick={()=>{setEditingModuleIdx(midx);setShowModuleForm(false);}} style={{background:'transparent',border:'1px solid rgba(11,86,64,0.18)',color:'#0D0D14',padding:'0.4rem 0.65rem',fontSize:'0.72rem',borderRadius:3,cursor:'pointer'}}>+ Escenario</button>
                          <button onClick={()=>deleteModule(midx)} style={{background:'transparent',border:'1px solid rgba(255,100,100,0.4)',color:'#ff8b8b',padding:'0.4rem 0.65rem',fontSize:'0.72rem',borderRadius:3,cursor:'pointer'}}>Eliminar</button>
                        </div>
                      </div>
                      <p style={{fontSize:'0.85rem',color:'#0D0D14',marginBottom:'0.75rem'}}>{mod.desc}</p>
                      <div style={{display:'grid',gap:'0.55rem'}}>
                        {mod.scenarios.map((esc,sidx)=>(
                          <div key={sidx} style={{background:'#ffffff',border:'1px solid rgba(11,86,64,0.12)',borderRadius:8,padding:'0.8rem'}}>
                            <div style={{fontSize:'0.82rem',fontWeight:700,color:'#0D0D14',marginBottom:'0.35rem'}}>{esc.tag} · {esc.title}</div>
                            <div style={{fontSize:'0.78rem',color:'#0D0D14',lineHeight:1.4}}>{esc.body}</div>
                            <div style={{marginTop:'0.55rem',fontSize:'0.72rem',color:'#A9B9A7'}}>Opciones: {esc.options.length}</div>
                            <button onClick={()=>deleteScenario(midx,sidx)} style={{marginTop:'0.55rem',background:'transparent',border:'1px solid rgba(255,100,100,0.4)',color:'#ff8b8b',padding:'0.35rem 0.6rem',fontSize:'0.72rem',borderRadius:3,cursor:'pointer'}}>Eliminar escenario</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GAME ── */}
      {screen==='game'&&currentSc&&(
        <div style={{height:'100vh',background:'#ffffff',display:'flex',flexDirection:'column'}}>
          <div style={{background:'#f6fff6',padding:'0.7rem 1.4rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,gap:'0.5rem'}}>
            <div style={{fontFamily:"'Playfair Display',serif",color:'#0b5640',fontSize:'0.9rem',fontWeight:700}}>{currentMod.icon} {currentMod.title}</div>
            <div style={{display:'flex',gap:'0.38rem',alignItems:'center'}}>
              {currentScenarios.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:i<gs.currentScenario?'#3af9a2':i===gs.currentScenario?'#0b5640':'rgba(11,86,64,0.18)',transform:i===gs.currentScenario?'scale(1.35)':'scale(1)'}}/>)}
            </div>
            <button onClick={()=>setScreen('modules')} style={{background:'none',border:'1px solid rgba(11,86,64,0.18)',color:'#0b5640',padding:'0.28rem 0.75rem',fontSize:'0.75rem',cursor:'pointer',borderRadius:1,fontFamily:'inherit'}}>← Salir</button>
          </div>
          <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1.15fr',overflow:'hidden'}}>
            <div style={{background:'#ffffff',padding:'1.8rem',display:'flex',flexDirection:'column',gap:'1.3rem',overflowY:'auto'}}>
              <div style={{animation:'fadeIn 0.5s ease'}}>
                <div style={{fontSize:'0.63rem',letterSpacing:'3px',textTransform:'uppercase',color:'#0b5640',fontWeight:600}}>{currentSc.tag} · {gs.currentScenario+1}/{currentScenarios.length}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.25rem',color:'#0D0D14',fontWeight:700,lineHeight:1.3,marginTop:'0.3rem'}}>{currentSc.title}</div>
              </div>
              <p style={{fontSize:'0.85rem',color:'#0D0D14',lineHeight:1.75}}>{currentSc.body}</p>
              <div style={{background:'rgba(58,249,162,0.08)',borderLeft:'2px solid rgba(11,86,64,0.3)',padding:'0.75rem 0.9rem',borderRadius:'0 2px 2px 0'}}>
                <div style={{fontSize:'0.62rem',letterSpacing:'2px',textTransform:'uppercase',color:'#0b5640',marginBottom:'0.28rem',fontWeight:600}}>Contexto</div>
                <div style={{fontSize:'0.8rem',color:'#0D0D14',lineHeight:1.55}}>{currentSc.context}</div>
              </div>
              <div style={{display:'flex',justifyContent:'center',marginTop:'auto',paddingTop:'0.8rem'}}>
                  <div style={{width:120,height:140,background:'linear-gradient(170deg,#0b5640,#018d38,#3af9a2)',border:'2px solid rgba(11,86,64,0.22)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    <img src={pc.avatar} alt={pc.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
              </div>
            </div>
            <div style={{background:'#ffffff',padding:'1.8rem',display:'flex',flexDirection:'column',gap:'0.8rem',overflowY:'auto',borderLeft:'1px solid rgba(11,86,64,0.08)'}}>
              <div style={{fontSize:'0.62rem',letterSpacing:'3px',textTransform:'uppercase',color:'#0b5640',fontWeight:600,marginBottom:'0.2rem'}}>Selecciona la respuesta correcta</div>
              {gs.shuffledOpts.map((opt,i)=>(
                <button key={i} disabled={gs.answered} onClick={()=>selectOpt(opt)} className="opt-card" style={{background:gs.answered&&gs.selectedOpt===opt?'#f6fff6':'#ffffff',border:`1.5px solid ${gs.answered&&gs.selectedOpt===opt?'#0b5640':'rgba(11,86,64,0.12)'}`,borderRadius:2,padding:'0.82rem 1rem',cursor:gs.answered?'default':'pointer',fontFamily:'inherit',fontSize:'0.84rem',color:'#0D0D14',textAlign:'left',lineHeight:1.45,display:'flex',gap:'0.7rem',alignItems:'flex-start',width:'100%',opacity:gs.answered&&gs.selectedOpt!==opt?0.45:1,transition:'all 0.18s',boxShadow:gs.answered&&gs.selectedOpt===opt?'0 0 0 2px rgba(58,249,162,0.45)':'none'}}>
                  <span style={{width:22,height:22,borderRadius:1,background:gs.answered&&gs.selectedOpt===opt?'#0b5640':'#f6fff6',color:gs.answered&&gs.selectedOpt===opt?'#ffffff':'#0b5640',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,flexShrink:0,border:'1px solid rgba(11,86,64,0.12)'}}>{['A','B','C','D'][i]}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
              {gs.answered&&gs.selectedOpt&&(
                <div style={{borderRadius:2,padding:'0.9rem 1.1rem',animation:'slideUp 0.35s ease',background:'#f6fff6',borderLeft:'3px solid #3af9a2'}}>
                  <div style={{fontSize:'0.62rem',letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,marginBottom:'0.35rem',color:'#0b5640'}}>{gs.selectedOpt.isCorrect ? 'Respuesta correcta' : 'Respuesta incorrecta'}</div>
                  <div style={{fontSize:'0.83rem',color:'#0D0D14',lineHeight:1.55}}>{gs.selectedOpt.feedback}</div>
                  <button onClick={nextScenario} style={{background:'#3af9a2',color:'#0D0D14',padding:'0.72rem 1.7rem',borderRadius:2,fontWeight:600,fontSize:'0.85rem',border:'none',cursor:'pointer',marginTop:'0.8rem'}}>
                    {gs.currentScenario>=currentScenarios.length-1?'Ver resultados →':'Siguiente →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {screen==='result'&&(()=>{
        const total = currentMod ? currentMod.scenarios.length : 0;
        const correct = gs.score;
        return (
          <div style={{minHeight:'100vh',background:'#ffffff',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{maxWidth:540,width:'100%',textAlign:'center',animation:'fadeIn 0.5s ease'}}>
              <div style={{fontSize:'0.65rem',letterSpacing:'4px',textTransform:'uppercase',color:'#0b5640',marginBottom:'0.8rem',fontWeight:600}}>Resultado del módulo</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:'#0D0D14',fontWeight:900,marginBottom:'0.4rem'}}>{currentMod?.title || 'Módulo completado'}</h2>
              <p style={{fontSize:'0.85rem',color:'#0D0D14',lineHeight:1.65,marginBottom:'1.5rem'}}>Respondiste {correct} de {total} preguntas correctamente en este módulo.</p>
              <div style={{background:'#f6fff6',border:'1px solid rgba(11,86,64,0.12)',borderRadius:2,padding:'1.3rem',marginBottom:'1.5rem',textAlign:'left'}}>
                <div style={{fontSize:'0.75rem',letterSpacing:'2px',textTransform:'uppercase',color:'#0b5640',marginBottom:'0.8rem',fontWeight:600}}>Comentarios</div>
                <p style={{margin:0,color:'#0D0D14',lineHeight:1.7}}>{currentMod?.desc || 'Has completado el módulo y puedes continuar con el siguiente.'}</p>
              </div>
              <div style={{display:'flex',gap:'0.8rem',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>setScreen('modules')} style={{background:'transparent',color:'#0b5640',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.82rem',border:'1px solid rgba(11,86,64,0.12)',cursor:'pointer',fontFamily:'inherit'}}>← Volver a Módulos</button>
                <button onClick={handleFinal} style={{background:'#3af9a2',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:'pointer'}}>🎓 Ver Certificado →</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── FINAL ── */}
      {screen==='final'&&(
        <div style={{minHeight:'100vh',background:'#ffffff',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'2.5rem',overflowY:'auto'}}>
          <div style={{maxWidth:640,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'0.65rem',letterSpacing:'4px',textTransform:'uppercase',color:'#0b5640',marginBottom:'0.8rem'}}>Programa Completado</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:900,color:'#0D0D14',marginBottom:'0.5rem'}}>Tu Certificado ETHOSFERA</h2>
            <div style={{marginBottom:'1.2rem',padding:'0.6rem 1rem',borderRadius:2,background:dbStatus==='ok'?'rgba(58,249,162,0.12)':dbStatus==='error'?'rgba(160,74,47,0.1)':'rgba(58,249,162,0.08)',border:`1px solid ${dbStatus==='ok'?'rgba(58,249,162,0.3)':dbStatus==='error'?'rgba(160,74,47,0.3)':'rgba(58,249,162,0.2)'}`,fontSize:'0.78rem',color:dbStatus==='ok'?'#0b5640':dbStatus==='error'?'#A04A2F':'#0b5640',display:'inline-block'}}>
              {dbStatus==='saving'&&'⏳ Guardando en base de datos...'}
              {dbStatus==='ok'&&'✅ Registro guardado correctamente'}
              {dbStatus==='error'&&'⚠️ No se pudo guardar en BD'}
              {dbStatus==='idle'&&'📋 Certificado listo'}
            </div>
            <Certificate name={pc.fullName || pc.name} jobTitle={pc.jobTitle} company={pc.company} profile={globalProfile} scores={gs.totalProfiles}/>
            <div style={{display:'flex',gap:'1rem',justifyContent:'center',marginTop:'1.5rem',flexWrap:'wrap'}}>
              <button onClick={downloadPDF} disabled={pdfLoading} style={{background:'#3af9a2',color:'#0D0D14',padding:'0.78rem 1.9rem',borderRadius:2,fontWeight:600,fontSize:'0.88rem',border:'none',cursor:pdfLoading?'wait':'pointer',opacity:pdfLoading?0.7:1,display:'inline-flex',alignItems:'center',gap:'0.5rem'}}>
                {pdfLoading?'⏳ Generando PDF...':'⬇ Descargar Certificado PDF'}
              </button>
              <button onClick={()=>{setScreen('title');setGs({completedModules:[],currentModule:null,currentScenario:0,answered:false,selectedOpt:null,shuffledOpts:[],score:0});setDbSaved(false);setDbStatus('idle');}} style={{background:'transparent',color:'#7A7060',padding:'0.72rem 1.5rem',borderRadius:2,fontSize:'0.85rem',border:'1px solid #D4CCB8',cursor:'pointer',fontFamily:'inherit'}}>Nuevo intento</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PANEL ── */}
      {adminMode&&(
        <div style={{position:'fixed',bottom:'1rem',right:'1rem',background:'#ffffff',border:'2px solid #3af9a2',borderRadius:12,padding:'1.2rem',maxWidth:640,maxHeight:'90vh',overflowY:'auto',zIndex:9999,boxShadow:'0 10px 40px rgba(0,0,0,0.08)',fontFamily:'inherit'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',gap:'1rem',flexWrap:'wrap'}}>
            <h3 style={{color:'#0b5640',fontSize:'0.96rem',fontWeight:700,margin:0}}>PANEL ADMIN - GESTIÓN DE CONTENIDO</h3>
            <button onClick={()=>setAdminMode(false)} style={{background:'none',border:'none',color:'#0b5640',fontSize:'1.2rem',cursor:'pointer'}}>✕</button>
          </div>

          {!adminAuth?(
            <div style={{background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10,padding:'1rem'}}>
              <p style={{color:'#0D0D14',marginBottom:'1rem'}}>Ingrese el código de acceso autorizado para gestionar módulos y preguntas.</p>
              <input type="password" placeholder="Contraseña admin" value={adminAuth} onChange={(e)=>setAdminAuth(e.target.value)} onKeyPress={(e)=>{if(e.key==='Enter'&&adminAuth===adminPassword){setAdminAuth('AUTH');alert('Autenticado');}}} style={{width:'100%',padding:'0.75rem',borderRadius:8,marginBottom:'0.8rem',fontSize:'0.92rem',background:'#ffffff',border:'1px solid rgba(11,86,64,0.18)',color:'#0D0D14',boxSizing:'border-box'}}/>
              <button onClick={()=>{if(adminAuth===adminPassword){setAdminAuth('AUTH');alert('Autenticado');}else{alert('Contraseña incorrecta');}}} style={{width:'100%',background:'#3af9a2',color:'#0D0D14',padding:'0.9rem 1rem',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Ingresar</button>
            </div>
          ):(
            <div style={{display:'grid',gap:'1rem'}}>
              <div style={{display:'flex',gap:'0.65rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                <button onClick={()=>setAdminAuth('')} style={{flex:1,background:'transparent',border:'1px solid rgba(11,86,64,0.18)',color:'#0b5640',padding:'0.55rem 0.8rem',fontSize:'0.78rem',borderRadius:8,cursor:'pointer',fontWeight:600}}>Salir</button>
                <button onClick={()=>{setShowModuleForm(!showModuleForm);setEditingModuleIdx(null);}} style={{flex:1,background:'#3af9a2',color:'#0D0D14',padding:'0.55rem 0.8rem',fontSize:'0.78rem',borderRadius:8,cursor:'pointer',fontWeight:600}}>+ Nuevo Módulo</button>
              </div>

              {/* ESTADÍSTICAS */}
              <div style={{background:'#f6fff6',padding:'0.9rem 1rem',borderRadius:10,border:'1px solid rgba(11,86,64,0.16)',marginBottom:'1rem',fontSize:'0.85rem',color:'#0D0D14'}}>
                <p style={{margin:'0.2rem 0'}}>Módulos activos: <strong>{modules.length}</strong></p>
                <p style={{margin:'0.2rem 0'}}>Total escenarios: <strong>{modules.reduce((a,m)=>a+m.scenarios.length,0)}</strong></p>
                <p style={{margin:'0.2rem 0'}}>Almacenamiento: <strong>localStorage</strong></p>
              </div>

              {/* FORMULARIO - NUEVO MÓDULO */}
              {showModuleForm&&!editingModuleIdx&&(
                <div style={{background:'#ffffff',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10,padding:'1rem',marginBottom:'1rem'}}>
                  <h4 style={{color:'#0b5640',fontSize:'0.95rem',marginTop:0,marginBottom:'0.8rem'}}>Crear Nuevo Módulo</h4>
                  <input type="text" placeholder="Emoji del módulo (ej: 📋)" maxLength="2" value={formData.moduleIcon} onChange={(e)=>setFormData({...formData,moduleIcon:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.7rem',fontSize:'0.92rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Título del módulo" value={formData.moduleTitle} onChange={(e)=>setFormData({...formData,moduleTitle:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.7rem',fontSize:'0.92rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Etiqueta (ej: Ética y Transparencia)" value={formData.moduleTag} onChange={(e)=>setFormData({...formData,moduleTag:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.7rem',fontSize:'0.92rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box'}}/>
                  <textarea placeholder="Descripción del módulo" value={formData.moduleDesc} onChange={(e)=>setFormData({...formData,moduleDesc:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.7rem',fontSize:'0.92rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'120px',fontFamily:'inherit',resize:'vertical'}}/>
                  <label style={{display:'flex',alignItems:'center',gap:'0.45rem',marginBottom:'0.8rem',fontSize:'0.85rem',color:'#0D0D14'}}>
                    <input type="checkbox" checked={formData.showInGame} onChange={(e)=>setFormData({...formData,showInGame:e.target.checked})} style={{width:16,height:16,margin:0}}/>
                    Incluir módulo en juegos
                  </label>
                  <h5 style={{color:'#0b5640',fontSize:'0.85rem',marginBottom:'0.5rem',marginTop:0}}>Primer Escenario (Obligatorio)</h5>
                  <input type="text" placeholder="Etiqueta escenario (ej: Escenario 01)" value={formData.scenarioTag} onChange={(e)=>setFormData({...formData,scenarioTag:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.6rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Título del escenario" value={formData.scenarioTitle} onChange={(e)=>setFormData({...formData,scenarioTitle:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.6rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box'}}/>
                  <textarea placeholder="Descripción del escenario" value={formData.scenarioBody} onChange={(e)=>setFormData({...formData,scenarioBody:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.6rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'100px',fontFamily:'inherit',resize:'vertical'}}/>
                  <textarea placeholder="Contexto" value={formData.scenarioContext} onChange={(e)=>setFormData({...formData,scenarioContext:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.9rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'90px',fontFamily:'inherit',resize:'vertical'}}/>
                  <label style={{display:'flex',alignItems:'center',gap:'0.45rem',marginBottom:'1rem',fontSize:'0.85rem',color:'#0D0D14'}}>
                    <input type="checkbox" checked={formData.scenarioShowInGame} onChange={(e)=>setFormData({...formData,scenarioShowInGame:e.target.checked})} style={{width:16,height:16,margin:0}}/>
                    Incluir este escenario en juegos
                  </label>
                  <h5 style={{color:'#0b5640',fontSize:'0.85rem',marginBottom:'0.6rem',marginTop:0}}>4 Opciones de Respuesta</h5>
                  <div style={{maxHeight:'15rem',overflowY:'auto',marginBottom:'0.8rem',paddingRight:'0.4rem'}}>
                    {[0,1,2,3].map(i=>(
                      <div key={i} style={{background:'#f6fff6',padding:'0.85rem',marginBottom:'0.55rem',borderRadius:10,border:'1px solid rgba(11,86,64,0.16)'}}>
                        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.55rem',fontSize:'0.85rem',color:'#0D0D14'}}>
                          <input type="radio" name="correctAnswer" checked={formData.options[i].isCorrect} onChange={()=>setFormData({...formData,options:formData.options.map((o,idx)=>({...o,isCorrect:idx===i}))})} style={{width:16,height:16,margin:0}}/>
                          Marcar como respuesta correcta
                        </label>
                        <textarea placeholder="Opción de respuesta" value={formData.options[i].text} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,text:e.target.value}:o)})} style={{width:'100%',padding:'0.75rem',marginBottom:'0.5rem',fontSize:'0.88rem',borderRadius:10,background:'#ffffff',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'48px',fontFamily:'inherit',resize:'none'}}/>
                        <textarea placeholder="Retroalimentación" value={formData.options[i].feedback} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,feedback:e.target.value}:o)})} style={{width:'100%',padding:'0.75rem',marginBottom:'0',fontSize:'0.82rem',borderRadius:10,background:'#ffffff',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'48px',fontFamily:'inherit',resize:'none'}}/>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{display:'flex',gap:'0.55rem',flexWrap:'wrap'}}>
                    <button onClick={addModule} style={{flex:1,background:'#3af9a2',color:'#0D0D14',padding:'0.75rem',fontSize:'0.88rem',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700}}>Crear Módulo</button>
                    <button onClick={resetForm} style={{flex:1,background:'transparent',border:'1px solid rgba(11,86,64,0.16)',color:'#0b5640',padding:'0.75rem',fontSize:'0.88rem',borderRadius:10,cursor:'pointer'}}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* LISTA DE MÓDULOS EXISTENTES */}
              <div style={{marginBottom:'0.5rem'}}>
                <h4 style={{color:'#0b5640',fontSize:'0.95rem',marginBottom:'0.75rem'}}>Módulos Existentes</h4>
                <div style={{maxHeight:'25rem',overflowY:'auto',paddingRight:'0.25rem'}}>
                  {modules.map((mod, midx)=>(
                    <div key={midx} style={{background:'#f6fff6',border:'1px solid rgba(11,86,64,0.12)',borderRadius:12,padding:'1rem',marginBottom:'0.75rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem',gap:'1rem',flexWrap:'wrap'}}>
                        <div>
                          <div style={{fontSize:'1rem',color:'#0D0D14',fontWeight:700}}>{mod.icon} {mod.title}</div>
                          <div style={{fontSize:'0.82rem',color:'#0D0D14',marginTop:'0.35rem'}}>{mod.tag}</div>
                          <div style={{fontSize:'0.78rem',color:mod.showInGame ? '#3af9a2' : '#A9B9A7',marginTop:'0.35rem'}}>{mod.showInGame ? 'Visible en juegos' : 'Oculto en juegos'}</div>
                        </div>
                        <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap'}}>
                          <button onClick={()=>{setEditingModuleIdx(midx);setCurrentScenarioIdx(0);setShowModuleForm(false);}} style={{background:'transparent',border:'1px solid rgba(11,86,64,0.16)',color:'#0b5640',padding:'0.45rem 0.65rem',fontSize:'0.78rem',borderRadius:8,cursor:'pointer'}}>+ Escenario</button>
                          <button onClick={()=>deleteModule(midx)} style={{background:'transparent',border:'1px solid rgba(255,100,100,0.4)',color:'#ff6464',padding:'0.45rem 0.65rem',fontSize:'0.78rem',borderRadius:8,cursor:'pointer'}}>Eliminar</button>
                        </div>
                      </div>
                      <p style={{fontSize:'0.88rem',color:'#0D0D14',marginBottom:'0.85rem'}}>{mod.desc}</p>
                      <div style={{display:'grid',gap:'0.55rem'}}>
                        {mod.scenarios.map((esc,sidx)=>(
                          <div key={sidx} style={{background:'#ffffff',border:'1px solid rgba(11,86,64,0.12)',borderRadius:10,padding:'0.95rem'}}>
                            <div style={{fontSize:'0.9rem',fontWeight:700,color:'#0D0D14',marginBottom:'0.45rem'}}>{esc.tag} · {esc.title}</div>
                            <div style={{fontSize:'0.82rem',color:'#0D0D14',lineHeight:1.5}}>{esc.body}</div>
                            <div style={{marginTop:'0.65rem',fontSize:'0.78rem',color:'#A9B9A7'}}>Opciones: {esc.options.length}</div>
                            <div style={{display:'flex',alignItems:'center',gap:'0.55rem',marginTop:'0.55rem',flexWrap:'wrap'}}>
                              <span style={{fontSize:'0.78rem',color:esc.showInGame?'#3af9a2':'#A9B9A7'}}>{esc.showInGame ? 'Visible en juego' : 'Oculto en juego'}</span>
                              <button onClick={()=>toggleScenarioVisibility(midx,sidx)} style={{background:'transparent',border:'1px solid rgba(11,86,64,0.16)',color:'#0b5640',fontSize:'0.78rem',cursor:'pointer',padding:'0.35rem 0.55rem',borderRadius:8}}>Toggle</button>
                            </div>
                            <button onClick={()=>deleteScenario(midx,sidx)} style={{background:'transparent',border:'none',color:'#ff6464',fontSize:'0.78rem',cursor:'pointer',marginTop:'0.7rem',padding:0}}>Eliminar escenario</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FORMULARIO - AGREGAR ESCENARIO */}
              {editingModuleIdx!==null&&(
                <div style={{background:'#ffffff',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10,padding:'1rem'}}>
                  <h4 style={{color:'#0b5640',fontSize:'0.95rem',marginTop:0,marginBottom:'0.8rem'}}>Agregar Escenario a: {modules[editingModuleIdx].title}</h4>
                  <input type="text" placeholder="Etiqueta escenario (ej: Escenario 06)" value={formData.scenarioTag} onChange={(e)=>setFormData({...formData,scenarioTag:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.65rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box'}}/>
                  <input type="text" placeholder="Título del escenario" value={formData.scenarioTitle} onChange={(e)=>setFormData({...formData,scenarioTitle:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.65rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box'}}/>
                  <textarea placeholder="Descripción" value={formData.scenarioBody} onChange={(e)=>setFormData({...formData,scenarioBody:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.65rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'90px',fontFamily:'inherit',resize:'vertical'}}/>
                  <textarea placeholder="Contexto" value={formData.scenarioContext} onChange={(e)=>setFormData({...formData,scenarioContext:e.target.value})} style={{width:'100%',padding:'0.85rem',marginBottom:'0.85rem',fontSize:'0.88rem',borderRadius:10,background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'90px',fontFamily:'inherit',resize:'vertical'}}/>
                  <label style={{display:'flex',alignItems:'center',gap:'0.45rem',marginBottom:'1rem',fontSize:'0.85rem',color:'#0D0D14'}}>
                    <input type="checkbox" checked={formData.scenarioShowInGame} onChange={(e)=>setFormData({...formData,scenarioShowInGame:e.target.checked})} style={{width:16,height:16,margin:0}}/>
                    Incluir este escenario en juegos
                  </label>
                  <h5 style={{color:'#0b5640',fontSize:'0.85rem',marginBottom:'0.6rem',marginTop:0}}>4 Opciones</h5>
                  <div style={{maxHeight:'12rem',overflowY:'auto',marginBottom:'0.8rem',paddingRight:'0.4rem'}}>
                    {[0,1,2,3].map(i=>(
                      <div key={i} style={{background:'#f6fff6',padding:'0.85rem',marginBottom:'0.55rem',borderRadius:10,border:'1px solid rgba(11,86,64,0.16)'}}>
                        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.55rem',fontSize:'0.85rem',color:'#0D0D14'}}>
                          <input type="radio" name="correctAnswer" checked={formData.options[i].isCorrect} onChange={()=>setFormData({...formData,options:formData.options.map((o,idx)=>({...o,isCorrect:idx===i}))})} style={{width:16,height:16,margin:0}}/>
                          Marcar como respuesta correcta
                        </label>
                        <textarea placeholder="Opción" value={formData.options[i].text} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,text:e.target.value}:o)})} style={{width:'100%',padding:'0.75rem',marginBottom:'0.5rem',fontSize:'0.88rem',borderRadius:10,background:'#ffffff',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'48px',fontFamily:'inherit',resize:'none'}}/>
                        <textarea placeholder="Retroalimentación" value={formData.options[i].feedback} onChange={(e)=>setFormData({...formData,options:formData.options.map((o,idx)=>idx===i?{...o,feedback:e.target.value}:o)})} style={{width:'100%',padding:'0.75rem',marginBottom:'0',fontSize:'0.82rem',borderRadius:10,background:'#ffffff',border:'1px solid rgba(11,86,64,0.16)',color:'#0D0D14',boxSizing:'border-box',minHeight:'48px',fontFamily:'inherit',resize:'none'}}/>
                      </div>
                    ))}
                  </div>

                  <div style={{marginBottom:'0.8rem',padding:'0.9rem',background:'#f6fff6',border:'1px solid rgba(11,86,64,0.16)',borderRadius:10}}>
                    <h5 style={{color:'#0b5640',fontSize:'0.85rem',margin:'0 0 0.5rem'}}>Juegos disponibles para agregar</h5>
                    {availableScenarios.filter(s => s.sourceModuleIdx !== editingModuleIdx).length === 0 ? (
                      <div style={{color:'#0D0D14',fontSize:'0.82rem'}}>No hay juegos disponibles fuera de este módulo.</div>
                    ) : (
                      availableScenarios.filter(s => s.sourceModuleIdx !== editingModuleIdx).map((item) => (
                        <div key={`${item.sourceModuleIdx}-${item.sourceScenarioIdx}`} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.6rem',marginBottom:'0.55rem',padding:'0.75rem',borderRadius:10,background:'#ffffff',border:'1px solid rgba(11,86,64,0.12)'}}>
                          <div>
                            <div style={{fontSize:'0.82rem',color:'#0D0D14'}}>🕹️ {item.tag || 'Juego'}: {item.title}</div>
                            <div style={{fontSize:'0.75rem',color:'#7A7060'}}>Desde módulo "{item.sourceModuleTitle}"</div>
                          </div>
                          <button onClick={() => addExistingScenarioToModule(editingModuleIdx, item.sourceModuleIdx, item.sourceScenarioIdx)} style={{background:'#3af9a2',color:'#0D0D14',border:'none',padding:'0.55rem 0.8rem',fontSize:'0.82rem',borderRadius:10,cursor:'pointer'}}>Agregar</button>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{display:'flex',gap:'0.55rem',flexWrap:'wrap'}}>
                    <button onClick={()=>addScenarioToModule(editingModuleIdx)} style={{flex:1,background:'#3af9a2',color:'#0D0D14',padding:'0.75rem',fontSize:'0.88rem',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700}}>Agregar Escenario</button>
                    <button onClick={()=>{setEditingModuleIdx(null);resetForm();}} style={{flex:1,background:'transparent',border:'1px solid rgba(11,86,64,0.16)',color:'#0b5640',padding:'0.75rem',fontSize:'0.88rem',borderRadius:10,cursor:'pointer'}}>Cancelar</button>
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