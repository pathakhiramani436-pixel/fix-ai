import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Wrench, Image as ImageIcon, PanelsTopLeft, ArrowRight, RotateCcw, Copy, Check, ShieldCheck, Zap, Lightbulb, ChevronRight, LoaderCircle, Download, CircleHelp } from 'lucide-react';
import './styles.css';

const examples = [
  { icon: '🪴', title: 'Keep a plant healthy', text: 'My indoor plant leaves are turning yellow. What should I check?' },
  { icon: '📚', title: 'Study smarter', text: 'Help me make a simple 20-minute revision plan for a difficult chapter.' },
  { icon: '♻️', title: 'Reuse something', text: 'Suggest a safe useful project I can make from cardboard boxes.' },
  { icon: '💻', title: 'Fix a tech issue', text: 'My laptop is running slowly. What safe checks should I try first?' }
];

function App() {
  const [problem, setProblem] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('solve');
  const [image, setImage] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => { fetch('/api/health').then(r => r.json()).then(d => setApiStatus(d.aiConfigured ? 'ready' : 'setup')).catch(() => setApiStatus('offline')); }, []);

  async function solve(e) {
    e?.preventDefault();
    if (!problem.trim() || busy) return;
    setBusy(true); setError(''); setImage(''); setAnswer(''); setMode('solve');
    try {
      const r = await fetch('/api/solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Something went wrong.');
      setAnswer(d.answer);
      setHistory(old => [{ title: problem.trim().slice(0, 64), kind: 'Solution', at: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }, ...old].slice(0, 5));
    } catch (e) { setError(e.message || 'Could not connect. Please try again.'); }
    finally { setBusy(false); }
  }

  async function makeImage(nextMode) {
    if (!problem.trim() || imageBusy) return;
    setMode(nextMode); setImageBusy(true); setError(''); setImage(''); setAnswer('');
    try {
      const r = await fetch('/api/visual-guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: problem, mode: nextMode }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not generate an image.');
      setImage(d.image);
      setHistory(old => [{ title: problem.trim().slice(0, 64), kind: nextMode === 'steps' ? 'Step guide' : 'Visual concept', at: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }, ...old].slice(0, 5));
    } catch (e) { setError(e.message || 'Could not connect. Please try again.'); }
    finally { setImageBusy(false); }
  }

  async function copyAnswer() {
    try { await navigator.clipboard.writeText(answer); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { setError('Copy is not available in this browser. Select the answer text to copy it.'); }
  }

  const busyNow = busy || imageBusy;
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Fix AI home"><span className="brand-mark"><Wrench size={20}/><Sparkles size={12} className="brand-spark"/></span><span>fix<span className="brand-ai">ai</span><small>MAKE A WAY</small></span></a>
      <div className="top-actions"><span className={'status-dot ' + (apiStatus === 'ready' ? 'online' : '')}></span><span className="status-text">{apiStatus === 'ready' ? 'AI ready' : apiStatus === 'setup' ? 'Setup needed' : apiStatus === 'offline' ? 'Connecting' : 'Checking'}</span><div className="avatar"><Sparkles size={17}/></div></div>
    </header>
    <main>
      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-dot"></span> YOUR EVERYDAY PROBLEM-SOLVING PARTNER</div>
        <h1>Big or small,<br/><span>let’s find a way.</span></h1>
        <p className="hero-copy">Describe what’s tricky. Get a clear plan, a visual idea, or a guide that helps you move forward.</p>
        <div className="hero-pills"><span><ShieldCheck size={15}/> Safety-first guidance</span><span><Zap size={15}/> Practical next steps</span></div>
      </section>

      <section className="workspace">
        <div className="composer-card">
          <div className="section-kicker"><span className="kicker-icon"><Lightbulb size={16}/></span> WHAT CAN WE HELP WITH?</div>
          <form onSubmit={solve}>
            <label htmlFor="problem" className="sr-only">Describe your problem or idea</label>
            <textarea id="problem" value={problem} onChange={e => setProblem(e.target.value)} placeholder="Tell us what’s happening, what you want to build, or what you’d like to understand…" rows="4" maxLength="5000"/>
            <div className="composer-bottom"><span className="char-count">{problem.length}/5000</span><button className="primary-button" type="submit" disabled={!problem.trim() || busyNow}>{busy && <LoaderCircle size={17} className="spin"/>}{busy ? 'Thinking…' : <>Solve my problem <ArrowRight size={17}/></>}</button></div>
          </form>
          <div className="divider-label"><span></span><small>OR CHOOSE A VISUAL MODE</small><span></span></div>
          <div className="mode-grid">
            <button className={'mode-card ' + (mode === 'concept' ? 'selected' : '')} onClick={() => makeImage('concept')} disabled={!problem.trim() || busyNow}>
              <span className="mode-icon purple"><ImageIcon size={20}/></span><span className="mode-text"><strong>Visual concept</strong><small>See the finished idea</small></span><ChevronRight size={17} className="mode-arrow"/>
            </button>
            <button className={'mode-card ' + (mode === 'steps' ? 'selected' : '')} onClick={() => makeImage('steps')} disabled={!problem.trim() || busyNow}>
              <span className="mode-icon orange"><PanelsTopLeft size={20}/></span><span className="mode-text"><strong>Step-by-step image</strong><small>One guide, 3–6 steps</small></span><ChevronRight size={17} className="mode-arrow"/>
            </button>
          </div>
          <p className="helper-note"><CircleHelp size={14}/> Add details for more useful results. Visuals are AI-generated concepts, not verified engineering plans.</p>
        </div>

        {(error || busyNow || answer || image) && <section className="result-card" aria-live="polite">
          <div className="result-head"><div><span className="result-label">{busyNow ? 'WORKING ON IT' : 'YOUR RESULT'}</span><h2>{busyNow ? (imageBusy ? 'Creating your visual…' : 'Thinking it through…') : image ? (mode === 'steps' ? 'Your visual guide' : 'Your concept') : 'Here’s a way forward'}</h2></div>{(answer || image) && <button className="icon-button" onClick={() => {setAnswer('');setImage('');setError('');}} aria-label="Clear result"><RotateCcw size={17}/></button>}</div>
          {busyNow && <div className="loading-state"><div className="loading-orb"><Sparkles size={24}/></div><div className="loading-lines"><i></i><i></i><i></i></div><p>Working on a helpful response. This can take a moment.</p></div>}
          {error && <div className="error-box"><strong>Not quite there yet</strong><p>{error}</p></div>}
          {answer && <><div className="answer-content">{answer}</div><div className="answer-actions"><button className="secondary-button" onClick={copyAnswer}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Copy answer'}</button><button className="secondary-button" onClick={solve}><RotateCcw size={16}/> Try again</button></div></>}
          {image && <div className="generated-image-wrap"><img src={image} alt={mode === 'steps' ? 'AI-generated step-by-step visual guide' : 'AI-generated visual concept'}/><a className="secondary-button download-link" href={image} download={mode === 'steps' ? 'fix-ai-step-guide.png' : 'fix-ai-visual-concept.png'}><Download size={16}/> Save image</a></div>}
        </section>}

        <section className="examples-section"><div className="examples-heading"><div><span className="result-label">NEED A STARTING POINT?</span><h2>Try one of these</h2></div><span className="tiny-sparkle"><Sparkles size={18}/></span></div>
          <div className="examples-grid">{examples.map(ex => <button className="example-card" key={ex.title} onClick={() => {setProblem(ex.text);setError('');document.getElementById('problem')?.focus();}}><span className="example-emoji">{ex.icon}</span><strong>{ex.title}</strong><p>{ex.text}</p><span className="example-link">Use this prompt <ArrowRight size={14}/></span></button>)}</div>
        </section>

        {history.length > 0 && <section className="history-section"><div className="examples-heading"><div><span className="result-label">THIS SESSION</span><h2>Recent activity</h2></div></div><div className="history-list">{history.map((h,i)=><div className="history-row" key={h.title+h.kind+i}><span className="history-icon"><Wrench size={16}/></span><div className="history-info"><strong>{h.title}</strong><small>{h.kind} · {h.at}</small></div><span className="history-arrow"><ChevronRight size={17}/></span></div>)}</div></section>}
      </section>
      <section className="safety-banner"><span className="safety-icon"><ShieldCheck size={20}/></span><div><strong>Good ideas start with safety.</strong><p>For electrical, chemical, medical, or structural risks, involve a qualified professional. AI answers can be wrong—use your judgement.</p></div></section>
    </main>
    <footer><a className="footer-brand" href="#">fix<span>ai</span></a><span>Small steps. Better solutions.</span><span className="footer-status"><span className="status-dot online"></span> Built to help, responsibly</span></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);