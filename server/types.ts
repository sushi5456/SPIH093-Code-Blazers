export interface UrlScanStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
}

export type UrlScanVerdict = "DANGEROUS" | "SUSPICIOUS" | "NO_THREATS_DETECTED" | "UNKNOWN";

export interface ScanUrlResponse {
  url: string;
  score: number;
  verdict: UrlScanVerdict;
  safe_to_proceed: boolean;
  stats: UrlScanStats;
  message: string;
}

export interface ScanUrlError {
  error: string;
}
