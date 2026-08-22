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

export async function scanUrl(url: string): Promise<ScanUrlResponse> {
  const response = await fetch("/api/scan-url", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    let message = `Analysis failed (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return (await response.json()) as ScanUrlResponse;
}
