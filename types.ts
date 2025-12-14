export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  UNKNOWN = 'UNKNOWN'
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'USER';
  email: string;
}

export interface ModelConsensus {
  modelName: string;
  score: number; // 0-100
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  focusArea: string; // e.g., "Facial Landmarks", "Noise Analysis"
}

export interface ForensicReport {
  id: string;
  fileName: string;
  fileType: MediaType;
  timestamp: string;
  fileHash: string;
  
  // Phase 1: Core Detection
  authenticityScore: number;
  isManipulated: boolean;
  manipulationType?: string[];
  
  // Advanced Ensemble Data
  ensembleData: ModelConsensus[];
  
  // Phase 2: Modern Modules
  semanticMismatchDetected: boolean;
  semanticAnalysisText: string;
  
  // Explanations
  reasoning: string;
  suspiciousRegions: { x: number; y: number; width: number; height: number; label: string; confidence: number }[];
  
  metadata: Record<string, string>;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  logs: string[];
}

export type ModuleTab = 'DASHBOARD' | 'VISUAL_LAB' | 'SEMANTIC' | 'METADATA' | 'PROVENANCE';
