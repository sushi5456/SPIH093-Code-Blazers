export type RiskLevel = "LOW RISK" | "MODERATE RISK" | "HIGH RISK" | "CRITICAL";
export type AnalysisKind = "url" | "file";

export interface AnalysisResult {
  kind: AnalysisKind;
  score: number;
  level: RiskLevel;
  confidence: number;
  title: string;
  findings: string[];
  recommendation: string;
}

const suspiciousUrlTerms = ["login", "verify", "secure", "account", "password", "bank", "paypal", "crypto", "urgent"];
const riskyFileExtensions = [".exe", ".scr", ".bat", ".cmd", ".ps1"];
const safeFileExtensions = [".pdf", ".docx", ".txt", ".jpg", ".png"];

function riskLevel(score: number): RiskLevel {
  if (score >= 90) return "CRITICAL";
  if (score >= 60) return "HIGH RISK";
  if (score >= 30) return "MODERATE RISK";
  return "LOW RISK";
}

export function analyzeURL(value: string): AnalysisResult {
  const url = value.trim().toLowerCase();
  const matchedTerms = suspiciousUrlTerms.filter((term) => url.includes(term));
  const hasIpAddress = /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/.test(url);
  const hasLongSubdomain = url.split(".").length > 3;
  const hasUnusualTld = /\.(zip|top|click|xyz|buzz)(\/|$)/.test(url);
  let score = 8 + matchedTerms.length * 10;
  if (hasIpAddress) score += 20;
  if (hasLongSubdomain) score += 10;
  if (hasUnusualTld) score += 15;
  score = Math.min(98, score);

  const findings = score < 30
    ? ["No major suspicious URL patterns detected", "Domain structure appears normal", "No high-risk keywords identified"]
    : [
      ...(matchedTerms.length > 0 ? [`${matchedTerms[0][0].toUpperCase() + matchedTerms[0].slice(1)} or account-related keyword found`] : []),
      ...(hasIpAddress || hasLongSubdomain ? ["Suspicious domain structure detected"] : ["Potential phishing pattern identified"]),
      ...(hasUnusualTld ? ["Unusual top-level domain detected"] : ["Domain appears unusual or untrusted"]),
    ];

  return {
    kind: "url",
    score,
    level: riskLevel(score),
    confidence: Math.min(98, 86 + matchedTerms.length * 2 + (hasIpAddress ? 4 : 0)),
    title: "URL ANALYSIS COMPLETE",
    findings,
    recommendation: score >= 60 ? "Block access until this destination can be verified." : "No major risk indicators detected. Continue with care.",
  };
}

export function analyzeFile(file: File): AnalysisResult {
  const name = file.name.toLowerCase();
  const hasRiskyExtension = riskyFileExtensions.some((extension) => name.endsWith(extension));
  const hasDoubleExtension = /\.(pdf|docx|jpg|png|txt|xlsx)\.(exe|scr|bat|cmd|ps1)$/i.test(name);
  const isKnownSafe = safeFileExtensions.some((extension) => name.endsWith(extension));
  let score = hasDoubleExtension ? 96 : hasRiskyExtension ? 78 : isKnownSafe ? 12 : 38;
  if (file.size > 25 * 1024 * 1024) score += 8;
  score = Math.min(99, score);

  const findings = hasDoubleExtension
    ? ["Double file extension detected", "Executable file disguised as a document", "High-risk file type identified"]
    : hasRiskyExtension
      ? ["Executable or script file type identified", "File can run active code on your device", "Origin should be verified before opening"]
      : isKnownSafe
        ? ["No suspicious filename patterns detected", "File type is commonly used for documents or images", "No major risk indicators detected"]
        : ["File type is not recognized by the demo", "Filename does not show obvious deception", "Origin should be verified before opening"];

  return {
    kind: "file",
    score,
    level: riskLevel(score),
    confidence: hasDoubleExtension ? 99 : hasRiskyExtension ? 95 : 88,
    title: "FILE ANALYSIS COMPLETE",
    findings,
    recommendation: score >= 60 ? "Quarantine this file until its source can be verified." : "No major risk indicators detected. Verify the source before opening.",
  };
}

export const scanSteps = [
  "Initializing analysis...",
  "Inspecting structure...",
  "Checking suspicious patterns...",
  "Evaluating threat signals...",
  "Calculating risk score...",
];
