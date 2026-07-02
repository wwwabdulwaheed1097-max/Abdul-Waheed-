import { useState, useEffect, useRef } from 'react';
import { 
  Code2, Cpu, Database, Network, Play, Terminal, Send, CheckCircle2, 
  Layers, Settings, GitBranch, RefreshCw, AlertTriangle, ArrowRight,
  ShieldCheck, HelpCircle, HardDrive, Check, Zap
} from 'lucide-react';

interface DeveloperHubProps {
  theme: 'light' | 'dark' | 'glass';
}

interface APITemplate {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'GRAPHQL';
  url: string;
  description: string;
  payload?: string;
  response: any;
}

const API_TEMPLATES: APITemplate[] = [
  {
    id: 'get-me',
    name: 'Get Current Logged Profile',
    method: 'GET',
    url: '/api/v1/users/me',
    description: 'Returns private fields of the authenticated active user session.',
    response: {
      status: 'success',
      data: {
        id: 'user_pulse_99',
        username: 'waves_master',
        displayName: 'Wave Master',
        email: 'waves@pulse.social',
        isVerified: true,
        twoFactorEnabled: true,
        deviceSessionsCount: 3,
        roles: ['creator', 'partner']
      }
    }
  },
  {
    id: 'get-posts',
    name: 'Query Global Wave Feed',
    method: 'GET',
    url: '/api/v1/posts?limit=10&category=ambient',
    description: 'Fetch modern posts with audio wave metadata.',
    response: {
      status: 'success',
      total: 24,
      limit: 10,
      results: [
        { id: 'p_wave_1', authorId: 'user_sound_4', content: 'Sublime waves synthesis!', likes: 142, hashtags: ['ambient', 'lfo'] },
        { id: 'p_wave_2', authorId: 'user_cyber_0', content: 'Dark modular synthesiser preset compilation.', likes: 98, hashtags: ['synth', 'eurorack'] }
      ]
    }
  },
  {
    id: 'post-verify-2fa',
    name: 'Verify 2FA Security Token',
    method: 'POST',
    url: '/api/v1/auth/2fa/verify',
    description: 'Validate TOTP security seed token during login sequence.',
    payload: JSON.stringify({ token: '482910', deviceId: 'iphone_15_client' }, null, 2),
    response: {
      status: 'authenticated',
      sessionToken: 'jwt_pulse_secure_session_token_3894109',
      expiresAt: '2026-07-02T23:00:00Z',
      verifiedFromIp: '192.168.1.104'
    }
  },
  {
    id: 'graphql-feed',
    name: 'GraphQL Query: User Analytics',
    method: 'GRAPHQL',
    url: '/graphql',
    description: 'Request granular user stats and monetization counts in a single payload.',
    payload: `query GetCreatorStats {
  user(id: "me") {
    displayName
    isVerified
    creatorStats {
      totalSubscribers
      totalEarnings
      activeCampaigns {
        name
        spent
      }
    }
  }
}`,
    response: {
      data: {
        user: {
          displayName: 'Wave Master',
          isVerified: true,
          creatorStats: {
            totalSubscribers: 148,
            totalEarnings: 4124.80,
            activeCampaigns: [
              { name: 'Midsummer Waves Launch', spent: 85.00 }
            ]
          }
        }
      }
    }
  }
];

export default function DeveloperHub({ theme }: DeveloperHubProps) {
  const [activeTab, setActiveTab] = useState<'api' | 'ws' | 'ops'>('api');

  // API Explorer states
  const [selectedTemplate, setSelectedTemplate] = useState<APITemplate>(API_TEMPLATES[0]);
  const [customPayload, setCustomPayload] = useState(selectedTemplate.payload || '');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isRunningQuery, setIsRunningQuery] = useState(false);

  // WebSocket simulator states
  const [wsLogs, setWsLogs] = useState<{ time: string; type: 'info' | 'ping' | 'recv' | 'err'; text: string }[]>([]);
  const [isWsConnected, setIsWsConnected] = useState(true);
  const logIntervalRef = useRef<any>(null);

  // DevOps pipeline states
  const [pipelineState, setPipelineState] = useState<'idle' | 'building' | 'testing' | 'packaging' | 'deploying' | 'completed' | 'error'>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [pipelineProgress, setPipelineProgress] = useState(0);

  // Sync payload when template updates
  useEffect(() => {
    setCustomPayload(selectedTemplate.payload || '');
    setApiResponse(null);
  }, [selectedTemplate]);

  // WebSocket random logs generator
  useEffect(() => {
    if (isWsConnected) {
      // Seed first logs
      setWsLogs([
        { time: new Date().toLocaleTimeString(), type: 'info', text: 'Initializing WebSocket secure client... URI: wss://pulse.social/live-gateway' },
        { time: new Date().toLocaleTimeString(), type: 'info', text: 'Connected to Pulse WebSocket node. Session established (ID: ws_client_f918)' }
      ]);

      logIntervalRef.current = setInterval(() => {
        const types: ('ping' | 'recv')[] = ['ping', 'recv'];
        const randType = types[Math.floor(Math.random() * types.length)];
        const timeStr = new Date().toLocaleTimeString();

        if (randType === 'ping') {
          setWsLogs(prev => [
            ...prev.slice(-30),
            { time: timeStr, type: 'ping', text: '⚡️ HEARTBEAT ping -> sending heartbeat token' },
            { time: timeStr, type: 'ping', text: '⚡️ HEARTBEAT pong <- received ack (latency 12ms)' }
          ]);
        } else {
          const events = [
            'SUBSCRIBE feed_activity: Completed successfully',
            'NOTIFY trigger: @Clara_Wave commented on your post "Lovely Synthesizer"',
            'MESSAGE_RECEIVE: New encrypted payload received from @sound_engineer_99',
            'SYNC_STATE: Local indexedDB synchronised (v1.0.4)',
            'METRICS: Video view milestone triggered'
          ];
          const randEv = events[Math.floor(Math.random() * events.length)];
          setWsLogs(prev => [
            ...prev.slice(-30),
            { time: timeStr, type: 'recv', text: `📩 EVENT: ${randEv}` }
          ]);
        }
      }, 3500);
    } else {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
      setWsLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), type: 'err', text: '🔴 WebSocket Gateway disconnected manually. Retrying paused.' }
      ]);
    }

    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, [isWsConnected]);

  // Run selected API query
  const handleRunQuery = () => {
    setIsRunningQuery(true);
    setApiResponse(null);
    
    setTimeout(() => {
      setIsRunningQuery(false);
      setApiResponse(JSON.stringify(selectedTemplate.response, null, 2));
    }, 1200);
  };

  // Run simulated Docker/CI/CD deployment pipeline
  const handleTriggerPipeline = () => {
    setPipelineState('building');
    setPipelineProgress(5);
    setBuildLogs([
      '🚀 Pipeline triggered via GitHub action webhook.',
      '🐳 Loading builder base environment: node:20-alpine',
      '📦 Running dependency audits (package.json compliance)...'
    ]);

    // Step 1: Build
    setTimeout(() => {
      setPipelineState('testing');
      setPipelineProgress(25);
      setBuildLogs(prev => [
        ...prev,
        '✔️ Dependencies audit completed. 0 vulnerabilities found.',
        '🤖 Building client: running `npm run build` using vite-typescript...',
        '⚙️ Typescript checks active... Clean compiled output (dist/ folder written).',
        '⚡️ Running automated unit tests via Jest suite...'
      ]);
    }, 1500);

    // Step 2: Test
    setTimeout(() => {
      setPipelineState('packaging');
      setPipelineProgress(55);
      setBuildLogs(prev => [
        ...prev,
        '✔️ All 24 automated unit tests completed successfully (100% pass rate).',
        '🔒 Standard security auditing scans: No secret keys or exposed variables in dist.',
        '🐳 Packaging container: running docker build -t pulse-social-node:v1.0.4 ...',
        '🐳 Layer cache hit: docker build compiled in 0.8s'
      ]);
    }, 3000);

    // Step 3: Package & Deploy
    setTimeout(() => {
      setPipelineState('deploying');
      setPipelineProgress(80);
      setBuildLogs(prev => [
        ...prev,
        '🐳 Docker container image successfully uploaded to Google Artifact Registry.',
        '🚀 Scaling ingress nodes... deploying container to Google Cloud Run server cluster (asia-east1)...',
        '🔒 Verifying health check route: GET /api/health returns 200 OK.'
      ]);
    }, 4500);

    // Step 4: Completed
    setTimeout(() => {
      setPipelineState('completed');
      setPipelineProgress(100);
      setBuildLogs(prev => [
        ...prev,
        '🎉 DEPLOYMENT SUCCESSFUL!',
        '⚡️ Container traffic rerouted successfully. Cluster health: 100%.',
        '🔗 Active Live Preview URL updated.'
      ]);
    }, 6000);
  };

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-md'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-sm animate-fade-in">
      
      {/* Title */}
      <div className="px-2">
        <h2 className="font-display font-black text-3xl bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 bg-clip-text text-transparent">
          Developer Command Center
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Explore REST/GraphQL schemas, watch WebSocket events pipeline, and trigger Docker CI/CD actions.
        </p>
      </div>

      {/* Dev Navigation tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-0.5 gap-1 scrollbar-none">
        {[
          { id: 'api', label: 'Interactive API Console', icon: Code2 },
          { id: 'ws', label: 'WebSocket Event Logs', icon: Network },
          { id: 'ops', label: 'DevOps & Docker Pipeline', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`dev-hub-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                active 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION CONTENT */}

      {/* 1. API EXPLORER */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* API Setup Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-5 rounded-3xl border ${containerStyle}`}>
              <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Select API Endpoint</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Choose a pre-declared endpoint parameter or GraphQL query to test pipeline request responses:
              </p>

              <div className="space-y-2">
                {API_TEMPLATES.map(tmpl => {
                  const isSel = selectedTemplate.id === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      id={`btn-api-tmpl-${tmpl.id}`}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-start gap-2.5 ${
                        isSel 
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold' 
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/20 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      <span className={`px-2 py-0.5 font-extrabold text-[8px] rounded uppercase ${
                        tmpl.method === 'GET' 
                          ? 'bg-sky-500 text-white' 
                          : tmpl.method === 'POST' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-indigo-500 text-white'
                      }`}>
                        {tmpl.method}
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate font-bold">{tmpl.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono block mt-0.5 truncate">{tmpl.url}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-5 rounded-3xl border ${containerStyle}`}>
              <h4 className="font-display font-bold text-xs text-zinc-900 dark:text-zinc-50 mb-2">Endpoint Description</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                {selectedTemplate.description}
              </p>
            </div>
          </div>

          {/* Code Editor Console Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl flex flex-col h-[520px] max-h-[520px]">
              
              {/* Toolbar */}
              <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center text-xs">
                <span className="font-mono text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Runner Console</span>
                </span>
                
                <button
                  id="btn-run-api-query"
                  onClick={handleRunQuery}
                  disabled={isRunningQuery}
                  className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunningQuery ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>

              {/* Payload editing / response viewer splits */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* 1. Request Payload editor (if POST or GRAPHQL) */}
                {selectedTemplate.payload && (
                  <div className="flex-1 border-b border-zinc-900 flex flex-col min-h-[160px]">
                    <span className="px-4 py-1.5 bg-zinc-900/40 text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Request Payload Body</span>
                    <textarea
                      value={customPayload}
                      onChange={e => setCustomPayload(e.target.value)}
                      className="flex-1 w-full bg-zinc-950 text-zinc-200 p-4 font-mono text-xs focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* 2. Response View (formatted JSON console) */}
                <div className="flex-[2] flex flex-col min-h-[220px]">
                  <span className="px-4 py-1.5 bg-zinc-900/40 text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Response Payload JSON (200 OK)</span>
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-emerald-400">
                    {isRunningQuery ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-2 text-zinc-500">
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                        <span className="font-mono text-[10px]">GET {selectedTemplate.url} is compiling...</span>
                      </div>
                    ) : apiResponse ? (
                      <pre className="whitespace-pre-wrap">{apiResponse}</pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                        <HelpCircle className="w-8 h-8 text-zinc-700 dark:text-zinc-800 mb-2" />
                        <span className="font-mono text-[10px]">Click "Send Request" to fetch simulated data payloads.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 2. WEBSOCKET REAL-TIME GATEWAY MONITOR */}
      {activeTab === 'ws' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Header configuration and state controls */}
          <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${containerStyle}`}>
            <div className="space-y-1">
              <span className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 block">WebSocket Connection Status</span>
              <p className="text-xs text-zinc-400">
                Monitor duplex real-time socket actions. Simulates instant comments, messages, and profile events pipelines.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                isWsConnected 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full block ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{isWsConnected ? 'Gateway Live' : 'Closed'}</span>
              </span>

              <button
                id="btn-ws-toggle"
                onClick={() => setIsWsConnected(!isWsConnected)}
                className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition-all"
              >
                {isWsConnected ? 'Disconnect Socket' : 'Establish Gateway'}
              </button>
            </div>
          </div>

          {/* Logs terminal box */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col h-[420px] max-h-[420px] shadow-xl">
            <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center text-xs">
              <span className="font-mono text-zinc-400">ws_client_f918@pulse.social: ~ event-pipeline-logs</span>
              <button 
                onClick={() => setWsLogs([])}
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300"
              >
                Clear Terminal
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 select-text">
              {wsLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 leading-relaxed ${
                    log.type === 'ping' 
                      ? 'text-zinc-500' 
                      : log.type === 'recv' 
                        ? 'text-teal-400 font-bold' 
                        : log.type === 'err' 
                          ? 'text-rose-500 font-bold' 
                          : 'text-zinc-300'
                  }`}
                >
                  <span className="text-[10px] text-zinc-600 shrink-0">{log.time}</span>
                  <span>{log.text}</span>
                </div>
              ))}

              {wsLogs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <span className="text-xs font-mono">Console logs successfully flushed. Logs pipeline is active.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3. DEVOPS CI/CD & DOCKER BUILDER */}
      {activeTab === 'ops' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Action Trigger Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-5 rounded-3xl border ${containerStyle}`}>
              <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Docker Deploy Console</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Trigger simulated Docker builds and container pushes. The container is packaged and deployed onto multi-zone Cloud Run servers:
              </p>

              <div className="space-y-4 border-t border-b border-zinc-100 dark:border-zinc-800/40 py-4">
                {/* Metric stats list */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 p-3 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 block uppercase font-bold">Image size</span>
                    <span className="text-xs text-zinc-800 dark:text-zinc-200 font-extrabold mt-0.5 block">142.5 MB</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 p-3 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 block uppercase font-bold">Deploy Target</span>
                    <span className="text-xs text-zinc-800 dark:text-zinc-200 font-extrabold mt-0.5 block">Cloud Run</span>
                  </div>
                </div>

                {/* Progress bar */}
                {pipelineState !== 'idle' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
                      <span className="capitalize">Stage: {pipelineState}</span>
                      <span>{pipelineProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        style={{ width: `${pipelineProgress}%` }}
                        className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                id="btn-trigger-cicd-pipeline"
                onClick={handleTriggerPipeline}
                disabled={pipelineState !== 'idle' && pipelineState !== 'completed'}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold rounded-2xl hover:opacity-95 active:scale-98 text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-emerald-300 fill-emerald-300" />
                <span>{pipelineState === 'idle' || pipelineState === 'completed' ? 'Build & Run Container' : 'Pipeline Running...'}</span>
              </button>
            </div>
          </div>

          {/* DevOps Log monitor (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col h-[350px] max-h-[350px] shadow-xl">
              <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
                <span className="font-mono">pipeline_runner_docker.sh logs</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-zinc-400 space-y-2">
                {buildLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {log}
                  </p>
                ))}

                {buildLogs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                    <GitBranch className="w-8 h-8 text-zinc-800 mb-2" />
                    <span className="text-[10px]">Docker Deployment Logs will output here. Click trigger to compile.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
