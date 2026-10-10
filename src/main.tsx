import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { portfolio } from './data/portfolio';
import { externalUrl, resumeUrl } from './lib/urls';
import './styles.css';

type AppId = 'computer' | 'about' | 'projects' | 'resume' | 'profiles' | 'works' | `project-${string}` | 'settings';
type Win = { id: AppId; title: string; icon: string; x: number; y: number; minimized: boolean; maximized: boolean; z: number };
const apps = [
  { id: 'computer' as const, label: 'Computer', icon: '🖥️' }, { id: 'about' as const, label: 'About Me', icon: '👤' },
  { id: 'projects' as const, label: 'Projects', icon: '📁' }, { id: 'resume' as const, label: 'Resume.docx', icon: '📄' },
  { id: 'profiles' as const, label: 'Profiles', icon: '🌐' }, { id: 'works' as const, label: 'Works', icon: '💼' },
];
const appTitle = (id: AppId) => id.startsWith('project-') ? portfolio.projects.find(p => `project-${p.id}` === id)?.name || 'Project' : apps.find(a => a.id === id)?.label || (id === 'settings' ? 'Personalize' : 'Desktop');
const appIcon = (id: AppId) => id.startsWith('project-') ? '📁' : apps.find(a => a.id === id)?.icon || '⚙️';

function App() {
  const [wins, setWins] = useState<Win[]>([]); const [menu, setMenu] = useState(false); const [context, setContext] = useState<{x:number;y:number}|null>(null); const [clock, setClock] = useState(''); const [message, setMessage] = useState(false); const [largeIcons, setLargeIcons] = useState(false); const z = useRef(10);
  const wasMessageOpen = useRef(false);
  const startRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (menu) menuRef.current?.querySelector('button')?.focus(); }, [menu]);
  useEffect(() => { if (!message && wasMessageOpen.current) startRef.current?.focus(); wasMessageOpen.current = message; }, [message]);
  const dismissMenu = () => { setMenu(false); setContext(null); startRef.current?.focus(); };
  useEffect(() => { const tick=()=>setClock(new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date())); tick(); const t=setInterval(tick, 30000); return ()=>clearInterval(t); }, []);
  const open=(id:AppId)=>{ setMenu(false); setContext(null); setWins(old=>{const found=old.find(w=>w.id===id); if(found) return old.map(w=>w.id===id?{...w,minimized:false,z:++z.current}:w); return [...old,{id,title:appTitle(id),icon:appIcon(id),x:90+(old.length%4)*36,y:72+(old.length%3)*30,minimized:false,maximized:false,z:++z.current}];}); };
  const mutate=(id:AppId, fn:(w:Win)=>Win)=>setWins(ws=>ws.map(w=>w.id===id?fn(w):w));
  const close=(id:AppId)=>{setWins(ws=>ws.filter(w=>w.id!==id));startRef.current?.focus();};
  useEffect(()=>{ const key=(e:KeyboardEvent)=>{ if(e.key==='Escape'){setMenu(false);setContext(null);setMessage(false);startRef.current?.focus();} }; window.addEventListener('keydown',key); return()=>window.removeEventListener('keydown',key);},[]);
  return <main className={`desktop ${largeIcons?'large-icons':''}`} onContextMenu={e=>{if((e.target as HTMLElement).closest('.window, .taskbar, .start-menu, .modal-shade'))return;e.preventDefault();setMenu(false);setContext({x:Math.max(0,Math.min(e.clientX,window.innerWidth-186)),y:Math.max(0,Math.min(e.clientY,window.innerHeight-130))})}} onClick={()=>{setContext(null);setMenu(false);}}>
    <div className="desktop-content" inert={message}>
    <section className="icons" aria-label="Desktop applications">{apps.map(a=><button className="desktop-icon" key={a.id} onClick={e=>{e.stopPropagation();if(e.detail===0||window.matchMedia('(pointer: coarse)').matches)open(a.id)}} onDoubleClick={()=>open(a.id)} aria-label={`Open ${a.label}`}><span className="big-icon" aria-hidden="true">{a.icon}</span><span>{a.label}</span></button>)}</section>
    {wins.map(w=><Window key={w.id} w={w} focus={()=>mutate(w.id,x=>({...x,z:++z.current}))} move={(x,y)=>mutate(w.id,win=>({...win,x,y}))} close={()=>close(w.id)} minimize={()=>{mutate(w.id,x=>({...x,minimized:true}));startRef.current?.focus();}} maximize={()=>mutate(w.id,x=>({...x,maximized:!x.maximized,z:++z.current}))}>{w.id==='settings'?<Settings largeIcons={largeIcons} setLargeIcons={setLargeIcons}/>:content(w.id,open)}</Window>)}
    {menu&&<div ref={menuRef} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')dismissMenu();}}><StartMenu open={open} shutdown={()=>{setMenu(false);setMessage(true)}} /></div>}
    {context&&<div className="context-menu" aria-label="Desktop options" style={{left:context.x,top:context.y}} onClick={e=>e.stopPropagation()}><button autoFocus onClick={()=>{setWins([]);dismissMenu();}}>Refresh desktop</button><button onClick={()=>open('settings')}>Personalize</button></div>}
    <footer className="taskbar"><button ref={startRef} className="start" onClick={e=>{e.stopPropagation();setMenu(!menu)}} aria-expanded={menu} aria-controls="start-menu">⊞ <b>Start</b></button><div className="task-items">{wins.map(w=><button key={w.id} aria-label={`${w.minimized?'Restore':'Minimize'} ${w.title}`} className={w.minimized?'':'active-task'} onClick={()=>mutate(w.id,x=>x.minimized?{...x,minimized:false,z:++z.current}:{...x,minimized:true})}>{w.icon} {w.title}</button>)}</div><div className="tray"><span aria-hidden="true">◒</span><span aria-hidden="true">♬</span><span aria-hidden="true">▰</span><time aria-label={`Current time: ${clock}`}>{clock}</time></div></footer>
    </div>
    {message&&<div className="modal-shade" role="dialog" aria-modal="true" aria-label="Desktop message" onKeyDown={e=>{if(e.key==='Tab')e.preventDefault();}}><div className="message-box"><h2>⚠ Browser Desktop</h2><p>This desktop cannot be shut down. It is running safely inside your browser.</p><button autoFocus onClick={()=>{setMessage(false);startRef.current?.focus();}}>OK</button></div></div>}
  </main>;
}

function StartMenu({open,shutdown}:{open:(id:AppId)=>void;shutdown:()=>void}) { return <aside id="start-menu" className="start-menu" aria-label="Start menu"><div className="start-profile"><span>👩‍💻</span><div><strong>{portfolio.personal.name}</strong><small>{portfolio.personal.title}</small></div></div>{apps.map(a=><button key={a.id} onClick={()=>open(a.id)}>{a.icon} {a.label}</button>)}<hr/><button onClick={()=>open('settings')}>⚙️ Personalize</button><button onClick={shutdown}>⏻ Close Desktop</button></aside> }

function Window({w,children,focus,close,minimize,maximize,move}:{w:Win;children:ReactNode;focus:()=>void;close:()=>void;minimize:()=>void;maximize:()=>void;move:(x:number,y:number)=>void}) {
  const ref=useRef<HTMLElement>(null);
  const drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);
  const clamp=(x:number,y:number)=>({x:Math.max(0,Math.min(x,window.innerWidth-(ref.current?.offsetWidth??680))),y:Math.max(0,Math.min(y,window.innerHeight-100))});
  useEffect(()=>{if(!w.minimized)ref.current?.focus();},[w.minimized]);
  useEffect(()=>{const resize=()=>{const position=clamp(w.x,w.y);if(position.x!==w.x||position.y!==w.y)move(position.x,position.y);};resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[w.x,w.y,w.minimized]);
  const onMove=(e:PointerEvent<HTMLElement>)=>{if(drag.current&&!w.maximized){const position=clamp(drag.current.left+e.clientX-drag.current.x,drag.current.top+e.clientY-drag.current.y);move(position.x,position.y);}};
  if(w.minimized)return null;
  return <section ref={ref} tabIndex={-1} className={`window ${w.maximized?'maximized':''}`} style={{left:w.x,top:w.y,zIndex:w.z,maxHeight:w.maximized?undefined:`calc(100dvh - ${w.y+47}px)`}} role="dialog" aria-label={w.title} onPointerDown={focus} onFocus={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))focus();}}>
    <header className="window-title" onDoubleClick={e=>{if(!(e.target as HTMLElement).closest('button'))maximize();}} onPointerDown={e=>{if(e.button!==0||w.maximized||window.innerWidth<=650)return;drag.current={x:e.clientX,y:e.clientY,left:w.x,top:w.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={onMove} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null} onLostPointerCapture={()=>drag.current=null}>
      <span>{w.icon} {w.title}</span><div className="controls"><button onPointerDown={e=>e.stopPropagation()} onClick={minimize} aria-label="Minimize">−</button><button onPointerDown={e=>e.stopPropagation()} onClick={maximize} aria-label="Maximize or restore">□</button><button className="close" onPointerDown={e=>e.stopPropagation()} onClick={close} aria-label="Close">×</button></div>
    </header><div className="window-body">{children}</div>
  </section>;
}

function content(id:AppId,open:(id:AppId)=>void) { if(id==='computer')return <Info/>; if(id==='about')return <About/>; if(id==='projects')return <Projects open={open}/>; if(id==='resume')return <Resume/>; if(id==='profiles')return <Profiles/>; if(id==='works')return <Works/>; const p=portfolio.projects.find(x=>`project-${x.id}`===id); return p?<Project p={p}/>:null; }
function Info(){return <div className="system"><div className="computer-illustration">🖥️</div><h1>My Computer</h1><p>Personal developer workspace</p><dl><dt>Developer</dt><dd>{portfolio.personal.name}</dd><dt>Location</dt><dd>{portfolio.personal.location}</dd><dt>Primary stack</dt><dd>{portfolio.personal.languages.join(' / ')}</dd><dt>Interests</dt><dd>AI / ML / MLOps / Software</dd></dl></div>}
function About(){return <article><h1>About Me</h1><div className="about-lead"><div className="avatar">K</div><p>Hello, I’m <strong>{portfolio.personal.name}</strong>.<br/>{portfolio.personal.intro}</p></div><h2>Education</h2>{portfolio.education.map(e=><div className="entry" key={e.degree}><strong>{e.degree}</strong><span>{e.focus}</span><small>{e.school} · {e.years}</small></div>)}<h2>Technical interests</h2><div className="chips">{portfolio.personal.interests.map(i=><span key={i}>{i}</span>)}</div><h2>Languages</h2><div className="chips">{portfolio.personal.languages.map(i=><span key={i}>{i}</span>)}</div></article>}
function Projects({open}:{open:(id:AppId)=>void}){return <article><div className="explorer-top">Portfolio › Projects <span>{portfolio.projects.length} items</span></div><div className="file-grid">{portfolio.projects.map(p=><button className="file" key={p.id} onClick={e=>{if(e.detail===0||window.matchMedia('(pointer: coarse)').matches)open(`project-${p.id}`)}} onDoubleClick={()=>open(`project-${p.id}`)}><b>📁</b><span>{p.name}</span><small>{p.year}</small></button>)}</div></article>}
function Project({p}:{p:typeof portfolio.projects[number]}){const href=externalUrl(p.github);return <article><div className="project-head"><span>📁</span><div><h1>{p.name}</h1><small>Project folder · {p.year}</small></div></div><h2>Description</h2><p>{p.description}</p><h2>Technologies</h2><div className="chips">{p.technologies.map(t=><span key={t}>{t}</span>)}</div><div className="actions">{href?<a href={href} target="_blank" rel="noopener noreferrer">Open GitHub ↗</a>:<span className="muted">Project link unavailable</span>}</div></article>}
const resumeFiles=import.meta.glob('/public/resume/*', {eager:true,query:'?url',import:'default'});
function availableResume(value:string,extension:'pdf'|'docx') {const relative=value.replace(/^\//,'');return Object.prototype.hasOwnProperty.call(resumeFiles,`/public/${relative}`)?resumeUrl(relative,import.meta.env.BASE_URL,extension):undefined;}
function Resume(){const pdf=availableResume(portfolio.resume.pdf,'pdf');const docx=availableResume(portfolio.resume.docx,'docx');return <article><h1>Resume</h1><div className="document-preview"><div className="doc-mark">K</div><h2>{portfolio.personal.name}</h2><p>{portfolio.personal.title}</p><hr/><p>{pdf||docx?'View or download my resume below.':'My resume will be available here soon.'}</p></div><div className="actions">{pdf&&<><a href={pdf} target="_blank" rel="noopener noreferrer">Preview PDF</a><a href={pdf} download>Download PDF</a></>}{docx&&<a href={docx} download>Download DOCX</a>}{!pdf&&!docx&&<span className="muted">Resume files have not been added.</span>}</div></article>}
function Profiles(){return <article><h1>Profiles</h1>{portfolio.profiles.length?<div className="profiles">{portfolio.profiles.map(p=>{const href=externalUrl(p.url);return href?<a href={href} target="_blank" rel="noopener noreferrer" key={p.platform}>🌐 <strong>{p.platform}</strong><small>{p.username}</small></a>:<p key={p.platform}>{p.platform}: link unavailable</p>;})}</div>:<Empty text="Profile links will be available here soon."/>}</article>}
function Works(){return <article><h1>Works</h1>{portfolio.works.length?portfolio.works.map((work,i)=>{const href=externalUrl(work.url??'');return <section className="entry" key={i}><h2>{work.title}</h2><strong>{work.organization}</strong><small>{work.period}</small><p>{work.description}</p>{href&&<a href={href} target="_blank" rel="noopener noreferrer">View work ↗</a>}</section>;}):<Empty text="Professional work will appear here once available."/>}</article>}
function Settings({largeIcons,setLargeIcons}:{largeIcons:boolean;setLargeIcons:(value:boolean)=>void}){return <article><h1>Personalize</h1><p>Choose an experience that suits you.</p><p className="muted">Interface sounds are off.</p><label className="setting"><input type="checkbox" checked={largeIcons} onChange={e=>setLargeIcons(e.target.checked)}/> Large desktop icons</label></article>}
function Empty({text}:{text:string}){return <div className="empty"><span>ℹ️</span><p>{text}</p></div>}
createRoot(document.getElementById('root')!).render(<App/>);
