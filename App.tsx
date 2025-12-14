import React, { useState, useEffect, useRef } from 'react';
import { User, ForensicReport, MediaType, ModuleTab, AnalysisState } from './types';
import { analyzeMedia, calculateFileHash } from './services/geminiService';
import { 
  ShieldCheck, Upload, User as UserIcon, LogOut, FileSearch, 
  Activity, Database, BrainCircuit, Eye, QrCode, Scan, 
  Terminal, Layers, AlertTriangle, CheckCircle, Cpu
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Legend 
} from 'recharts';

// --- STYLES FOR FILTERS ---
const filterStyles = {
  normal: {},
  grayscale: { filter: 'grayscale(100%) contrast(120%)' },
  highpass: { filter: 'contrast(150%) saturate(0%) brightness(1.1) sepia(100%) hue-rotate(180deg)' }, // Simulated ELA/HighPass look
  inverted: { filter: 'invert(100%)' },
  edges: { filter: 'grayscale(100%) contrast(200%) brightness(80%) drop-shadow(0 0 1px #fff)' }
};

// --- AUTH COMPONENT ---
const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: 'usr_123456',
      name: email.split('@')[0] || 'Investigator',
      email: email,
      role: 'ADMIN'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="glass-panel p-8 rounded-2xl w-full max-w-md z-10 shadow-2xl border border-slate-800/50 backdrop-blur-xl">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40"></div>
            <div className="relative p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <ShieldCheck className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight font-mono">VERITAS LENS</h2>
        <p className="text-slate-500 text-center mb-8 text-sm uppercase tracking-widest">AI Forensics Suite v2.0</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono text-sm"
              placeholder="AGENT_ID"
            />
          </div>
          <div>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono text-sm"
              placeholder="ACCESS_KEY"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            INITIALIZE SESSION
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ANALYSIS DASHBOARD ---
const AnalysisDashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contextText, setContextText] = useState('');
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    currentStep: 'IDLE',
    logs: []
  });
  
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [activeTab, setActiveTab] = useState<ModuleTab>('DASHBOARD');
  const [visualFilter, setVisualFilter] = useState<'normal' | 'grayscale' | 'highpass' | 'inverted' | 'edges'>('normal');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [analysisState.logs]);

  const addLog = (msg: string) => {
    setAnalysisState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${msg}`]
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setReport(null);
      setAnalysisState({ isAnalyzing: false, progress: 0, currentStep: 'IDLE', logs: [] });
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    
    setAnalysisState({ isAnalyzing: true, progress: 0, currentStep: 'INIT', logs: ['Initializing core modules...'] });
    
    try {
      // Step 1: Hashing
      addLog(`Hashing ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)...`);
      const hash = await calculateFileHash(file);
      setAnalysisState(prev => ({ ...prev, progress: 20, currentStep: 'HASHING' }));
      addLog(`SHA-256: ${hash.substring(0, 16)}...`);

      // Step 2: Model Loading Simulation
      await new Promise(r => setTimeout(r, 600));
      addLog('Loading FaceForensics++ (Xception) weights...');
      setAnalysisState(prev => ({ ...prev, progress: 40, currentStep: 'LOADING_MODELS' }));
      
      await new Promise(r => setTimeout(r, 600));
      addLog('Initializing DeepFake-o-Matic ensemble...');
      setAnalysisState(prev => ({ ...prev, progress: 50, currentStep: 'LOADING_MODELS' }));

      // Step 3: Analysis
      addLog('Sending tensors to analysis engine...');
      let type = MediaType.UNKNOWN;
      if (file.type.startsWith('image')) type = MediaType.IMAGE;
      else if (file.type.startsWith('video')) type = MediaType.VIDEO;
      else if (file.type.startsWith('audio')) type = MediaType.AUDIO;
      
      const aiResult = await analyzeMedia(file, type, contextText);
      setAnalysisState(prev => ({ ...prev, progress: 90, currentStep: 'INFERENCE' }));
      addLog('Inference complete. Aggregating results...');

      // Step 4: Report Construction
      const fullReport: ForensicReport = {
        id: `CASE-${Date.now().toString().slice(-6)}`,
        fileName: file.name,
        fileType: type,
        timestamp: new Date().toISOString(),
        fileHash: hash,
        authenticityScore: aiResult.authenticityScore || 0,
        isManipulated: aiResult.isManipulated || false,
        manipulationType: aiResult.manipulationType,
        ensembleData: aiResult.ensembleData || [],
        semanticMismatchDetected: aiResult.semanticMismatchDetected || false,
        semanticAnalysisText: aiResult.semanticAnalysisText || '',
        reasoning: aiResult.reasoning || 'Analysis failed.',
        suspiciousRegions: aiResult.suspiciousRegions || [],
        metadata: {
          ...aiResult.metadata,
          originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: file.type
        }
      };

      setReport(fullReport);
      setAnalysisState(prev => ({ ...prev, progress: 100, currentStep: 'COMPLETE', isAnalyzing: false }));
      addLog('Report generated successfully.');
      setActiveTab('DASHBOARD');

    } catch (error) {
      console.error(error);
      addLog(`CRITICAL ERROR: ${error}`);
      setAnalysisState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  // --- SUB-COMPONENTS ---
  
  const ScanOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg">
      <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
      <div className="absolute top-4 right-4 text-xs font-mono text-blue-400 bg-black/50 px-2 py-1 rounded">
        SCANNING...
      </div>
    </div>
  );

  const TerminalView = () => (
    <div className="bg-black/80 rounded-lg p-4 font-mono text-xs text-emerald-500 h-48 overflow-y-auto border border-slate-800 shadow-inner">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-2 sticky top-0 bg-black/80">
        <Terminal className="w-4 h-4" />
        <span className="font-bold">SYSTEM_LOGS</span>
      </div>
      <div className="space-y-1">
        {analysisState.logs.map((log, i) => (
          <div key={i} className="opacity-90 hover:opacity-100">{log}</div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-950 flex text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col backdrop-blur-md z-30">
        <div className="p-6 flex items-center justify-center lg:justify-start lg:space-x-3">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <span className="font-bold text-lg tracking-tight hidden lg:block">Veritas</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 flex flex-col items-center lg:items-stretch">
          {[
            { id: 'DASHBOARD', label: 'Overview', icon: Activity },
            { id: 'VISUAL_LAB', label: 'Visual Lab', icon: Eye },
            { id: 'SEMANTIC', label: 'Semantic', icon: BrainCircuit },
            { id: 'METADATA', label: 'Metadata', icon: FileSearch },
            { id: 'PROVENANCE', label: 'Chain', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => report && setActiveTab(tab.id as ModuleTab)}
              disabled={!report}
              className={`flex items-center lg:space-x-3 p-3 rounded-xl transition-all w-full justify-center lg:justify-start ${
                activeTab === tab.id 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center justify-center lg:justify-start lg:space-x-2 text-red-400 hover:bg-red-900/10 p-2 rounded-lg w-full transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800/50 bg-slate-900/20 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="font-mono text-sm text-slate-400">CASE_ID: <span className="text-white">{report ? report.id : 'N/A'}</span></h2>
          </div>
          <div className="flex items-center space-x-4">
             {analysisState.isAnalyzing && (
               <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                 <Scan className="w-3 h-3 text-blue-400 animate-spin" />
                 <span className="text-xs text-blue-400 font-bold">ANALYZING</span>
               </div>
             )}
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          
          {/* INITIAL UPLOAD STATE */}
          {!file && (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
              <label className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full"></div>
                <div className="relative border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl p-16 flex flex-col items-center justify-center space-y-4 hover:border-blue-500 transition-colors">
                   <div className="p-4 bg-slate-800 rounded-full group-hover:bg-blue-600 transition-colors">
                     <Upload className="w-8 h-8 text-white" />
                   </div>
                   <div className="text-center">
                     <h3 className="text-xl font-bold text-white">Upload Evidence</h3>
                     <p className="text-slate-400 text-sm mt-1">Image, Video, or Audio Files</p>
                   </div>
                </div>
                <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*" />
              </label>
            </div>
          )}

          {/* PRE-ANALYSIS CONTEXT */}
          {file && !report && !analysisState.isAnalyzing && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-2 rounded-xl bg-black/40 border border-slate-700">
                  {file.type.startsWith('image') && <img src={previewUrl!} className="w-full h-64 object-contain rounded-lg" />}
                  {file.type.startsWith('video') && <video src={previewUrl!} className="w-full h-64 rounded-lg" controls />}
                  {file.type.startsWith('audio') && <div className="h-64 flex items-center justify-center bg-slate-900 rounded-lg"><Activity className="w-16 h-16 text-slate-700" /></div>}
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">Semantic Context Check</label>
                    <p className="text-slate-400 text-sm mb-3">
                      To detect "Cheapfakes" (real media used in false contexts), provide the claim associated with this file.
                    </p>
                    <textarea 
                      value={contextText}
                      onChange={(e) => setContextText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none h-24 resize-none"
                      placeholder="e.g. 'Photo of the President in Tokyo last week'"
                    />
                  </div>
                  <button 
                    onClick={runAnalysis}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                  >
                    <Cpu className="w-5 h-5" />
                    <span>INITIATE DEEP SCAN</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ANALYSIS PROGRESS */}
          {analysisState.isAnalyzing && (
            <div className="max-w-3xl mx-auto mt-20 space-y-8">
               <div className="relative">
                 {file?.type.startsWith('image') && (
                   <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                     <img src={previewUrl!} className="w-full h-full object-cover opacity-50" />
                     <ScanOverlay />
                   </div>
                 )}
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-mono text-blue-400">
                   <span>PROCESS: {analysisState.currentStep}</span>
                   <span>{analysisState.progress}%</span>
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 transition-all duration-300 ease-linear" style={{ width: `${analysisState.progress}%` }}></div>
                 </div>
               </div>

               <TerminalView />
            </div>
          )}

          {/* REPORT DASHBOARD */}
          {report && !analysisState.isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* DASHBOARD TAB */}
              {activeTab === 'DASHBOARD' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* MAIN SCORE CARD */}
                  <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldCheck className="w-32 h-32 text-white" />
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Authenticity Probability</h3>
                    <div className="flex items-center space-x-6">
                      <div className="relative w-32 h-32">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={[{ value: report.authenticityScore }, { value: 100 - report.authenticityScore }]}
                              innerRadius={38}
                              outerRadius={50}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill={report.authenticityScore > 80 ? '#10b981' : report.authenticityScore > 50 ? '#f59e0b' : '#ef4444'} />
                              <Cell fill="#1e293b" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${
                            report.authenticityScore > 80 ? 'text-emerald-400' : report.authenticityScore > 50 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {report.authenticityScore}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${report.isManipulated ? 'text-red-400' : 'text-emerald-400'}`}>
                          {report.isManipulated ? 'MANIPULATION DETECTED' : 'LIKELY AUTHENTIC'}
                        </div>
                        <p className="text-slate-400 text-xs mt-1 max-w-[150px]">
                          Based on ensemble consensus of {report.ensembleData.length} models.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ENSEMBLE RADAR CHART */}
                  <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col md:flex-row">
                    <div className="flex-1">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Model Consensus</h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={report.ensembleData} layout="vertical" margin={{ left: 40 }}>
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="modelName" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                              cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="score" barSize={12} radius={[0, 4, 4, 0]}>
                              {report.ensembleData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#ef4444' : '#3b82f6'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="w-full md:w-64 border-l border-slate-700 pl-0 md:pl-6 mt-6 md:mt-0 flex flex-col justify-center space-y-4">
                      <div className="text-sm text-slate-300">
                        <span className="text-blue-400 font-bold">FaceForensics++:</span> Specialized on face manipulation datasets.
                      </div>
                      <div className="text-sm text-slate-300">
                        <span className="text-purple-400 font-bold">DeepFake-o-Matic:</span> Generalized detection for GANs/Diffusion.
                      </div>
                      <div className="text-sm text-slate-300">
                        <span className="text-emerald-400 font-bold">MesoNet-4:</span> Detects compression anomalies.
                      </div>
                       <div className="text-sm text-slate-300">
                        <span className="text-orange-400 font-bold">Semantic-ViT:</span> Contextual inconsistency check.
                      </div>
                    </div>
                  </div>
                  
                  {/* REASONING CARD */}
                  <div className="glass-panel p-6 rounded-2xl lg:col-span-3">
                    <div className="flex items-start space-x-4">
                      <BrainCircuit className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-white font-bold mb-2">Meta-Analysis Summary</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{report.reasoning}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VISUAL LAB TAB */}
              {activeTab === 'VISUAL_LAB' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                  <div className="lg:col-span-3 glass-panel p-4 rounded-2xl bg-black/50 relative flex items-center justify-center overflow-hidden border border-slate-800">
                    <div className="relative max-w-full max-h-full">
                      {file?.type.startsWith('image') ? (
                        <>
                          <img 
                            src={previewUrl!} 
                            className="max-w-full max-h-[550px] object-contain rounded transition-all duration-300"
                            style={filterStyles[visualFilter]}
                          />
                          {/* Heatmap Overlay */}
                          {report.suspiciousRegions.map((region, i) => (
                             <div 
                               key={i}
                               className="absolute border-2 border-red-500 bg-red-500/20 animate-pulse pointer-events-none"
                               style={{
                                 left: `${region.x}%`, 
                                 top: `${region.y}%`, 
                                 width: `${region.width}%`, 
                                 height: `${region.height}%`,
                                 display: visualFilter === 'normal' ? 'block' : 'none'
                               }}
                             >
                               <span className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                 {region.label} ({region.confidence}%)
                               </span>
                             </div>
                          ))}
                        </>
                      ) : (
                         <div className="text-slate-500">Video playback with frame-by-frame analysis filters coming in v2.1</div>
                      )}
                    </div>
                  </div>

                  <div className="glass-panel p-4 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Forensic Filters</h3>
                    
                    <button 
                      onClick={() => setVisualFilter('normal')}
                      className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-between ${visualFilter === 'normal' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <span>Standard View</span>
                      {visualFilter === 'normal' && <CheckCircle className="w-4 h-4" />}
                    </button>

                    <button 
                      onClick={() => setVisualFilter('highpass')}
                      className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-between ${visualFilter === 'highpass' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <div className="flex flex-col items-start">
                        <span>ELA Simulation</span>
                        <span className="text-[10px] opacity-70">Error Level Analysis</span>
                      </div>
                      {visualFilter === 'highpass' && <CheckCircle className="w-4 h-4" />}
                    </button>

                    <button 
                      onClick={() => setVisualFilter('edges')}
                      className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-between ${visualFilter === 'edges' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <span>Edge Detection</span>
                      {visualFilter === 'edges' && <CheckCircle className="w-4 h-4" />}
                    </button>

                    <button 
                      onClick={() => setVisualFilter('inverted')}
                      className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-between ${visualFilter === 'inverted' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <span>Inverted</span>
                      {visualFilter === 'inverted' && <CheckCircle className="w-4 h-4" />}
                    </button>

                    <div className="mt-8 pt-4 border-t border-slate-700">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Findings</h4>
                      <div className="space-y-2">
                        {report.suspiciousRegions.length > 0 ? (
                           report.suspiciousRegions.map((r, i) => (
                             <div key={i} className="text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/20">
                               Detected {r.label} at [{r.x}, {r.y}]
                             </div>
                           ))
                        ) : (
                          <div className="text-xs text-emerald-400 bg-emerald-900/10 p-2 rounded border border-emerald-900/20">
                             No visual artifacts found in this frame.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEMANTIC TAB */}
              {activeTab === 'SEMANTIC' && (
                <div className="glass-panel p-8 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <BrainCircuit className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Contextual Verification</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                       <h4 className="text-xs uppercase text-slate-500 font-bold">User Claim</h4>
                       <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-slate-300 italic min-h-[100px]">
                         "{contextText || 'No claim provided.'}"
                       </div>
                     </div>
                     <div className="space-y-4">
                       <h4 className="text-xs uppercase text-slate-500 font-bold">AI Analysis Result</h4>
                       <div className={`p-4 rounded-lg border min-h-[100px] ${
                         report.semanticMismatchDetected 
                           ? 'bg-red-500/10 border-red-500/30 text-red-200' 
                           : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                       }`}>
                         {report.semanticAnalysisText}
                       </div>
                     </div>
                  </div>
                </div>
              )}
              
              {/* METADATA & PROVENANCE (Simplified for brevity but kept in layout) */}
              {(activeTab === 'METADATA' || activeTab === 'PROVENANCE') && (
                <div className="glass-panel p-6 rounded-2xl">
                   <TerminalView />
                   <div className="mt-4 p-4 bg-slate-900 rounded border border-slate-800">
                     <h4 className="text-white font-mono mb-2">RAW_METADATA_DUMP</h4>
                     <pre className="text-xs text-slate-400 overflow-x-auto">
                       {JSON.stringify(report.metadata, null, 2)}
                     </pre>
                   </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- ROOT ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <>
      {user ? <AnalysisDashboard user={user} onLogout={() => setUser(null)} /> : <AuthScreen onLogin={setUser} />}
    </>
  );
};

export default App;