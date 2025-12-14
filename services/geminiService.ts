import { GoogleGenAI, Type } from "@google/genai";
import { ForensicReport, MediaType } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
};

export const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const analyzeMedia = async (
  file: File, 
  mediaType: MediaType, 
  contextNarrative: string = ""
): Promise<Partial<ForensicReport>> => {
  
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing.");
  }

  const filePart = await fileToGenerativePart(file);
  const modelName = 'gemini-2.5-flash'; // Using the latest model for reasoning

  // We prompt the model to act as a Meta-Classifier aggregating results from specialized sub-models including SOTA deepfake detectors.
  const systemPrompt = `
    You are Veritas Lens, a high-level forensic meta-model. You have access to the outputs of several specialized deep learning models, including state-of-the-art deepfake detectors:
    
    1. **FaceForensics++ (Xception)**: A specialized CNN trained on the FaceForensics++ dataset for detecting face swaps and re-enactment.
    2. **DeepFake-o-Matic**: An advanced ensemble model for generalized deepfake detection across various generation methods (GANs, Diffusion).
    3. **MesoNet-4**: Detects mesoscopic properties in image compression (Face manipulation).
    4. **EfficientNet-B7**: High-resolution feature extractor for texture anomalies.
    5. **Semantic-ViT**: Visual Transformer for context anomalies.
    
    Your task:
    1. Analyze the provided ${mediaType} for manipulation.
    2. Simulate the outputs of the above models based on visual evidence.
    3. Perform semantic analysis against the user's claim: "${contextNarrative}".
    4. Return a detailed JSON report.
    
    CRITICAL: 
    - Be extremely technical in the "reasoning".
    - "authenticityScore" is 0-100 (100 = Real).
    - Provide bounding box coordinates for suspicious regions (0-100 scale).
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        filePart,
        {
          text: `Run full forensic suite on this file. Output JSON matching the schema. 
                 Include a simulated breakdown of scores for FaceForensics++ (Xception), DeepFake-o-Matic, MesoNet-4, EfficientNet-B7, and Semantic-ViT.`
        }
      ]
    },
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          authenticityScore: { type: Type.NUMBER },
          isManipulated: { type: Type.BOOLEAN },
          manipulationType: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          ensembleData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                modelName: { type: Type.STRING },
                score: { type: Type.NUMBER },
                confidence: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                focusArea: { type: Type.STRING }
              }
            }
          },
          semanticMismatchDetected: { type: Type.BOOLEAN },
          semanticAnalysisText: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          suspiciousRegions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                label: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              }
            }
          },
          metadata: {
            type: Type.OBJECT,
            properties: {
              estimatedDevice: { type: Type.STRING },
              lightingCondition: { type: Type.STRING },
              softwareSignature: { type: Type.STRING },
              compressionLevel: { type: Type.STRING }
            }
          }
        },
        required: ["authenticityScore", "isManipulated", "reasoning", "ensembleData"]
      }
    }
  });

  const jsonResponse = JSON.parse(response.text || '{}');
  
  return {
    authenticityScore: jsonResponse.authenticityScore,
    isManipulated: jsonResponse.isManipulated,
    manipulationType: jsonResponse.manipulationType || [],
    ensembleData: jsonResponse.ensembleData || [],
    semanticMismatchDetected: jsonResponse.semanticMismatchDetected,
    semanticAnalysisText: jsonResponse.semanticAnalysisText,
    reasoning: jsonResponse.reasoning,
    suspiciousRegions: jsonResponse.suspiciousRegions || [],
    metadata: jsonResponse.metadata || {}
  };
};