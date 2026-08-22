export type ScanUrlResponse = {
  safe: boolean;
  score: number;
  message: string;
};

export async function scanUrl(url: string): Promise<ScanUrlResponse> {
  // Hackathon demo mode
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    safe: true,
    score: 92,
    message: `URL "${url}" appears safe.`,
  };
}
