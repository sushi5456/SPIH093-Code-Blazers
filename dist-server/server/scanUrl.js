const VIRUSTOTAL_BASE = "https://www.virustotal.com/api/v3";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;
function isValidHttpUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    catch {
        return false;
    }
}
async function vtFetch(path, apiKey, init) {
    return fetch(`${VIRUSTOTAL_BASE}${path}`, {
        ...init,
        headers: {
            "x-apikey": apiKey,
            accept: "application/json",
            ...(init?.headers ?? {}),
        },
    });
}
async function pollAnalysis(analysisId, apiKey) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
        const response = await vtFetch(`/analyses/${analysisId}`, apiKey, { method: "GET" });
        if (response.status === 429)
            throw new Error("VirusTotal rate limit reached. Try again shortly.");
        if (!response.ok)
            throw new Error(`VirusTotal analysis lookup failed (${response.status}).`);
        const body = (await response.json());
        const attributes = body.data?.attributes;
        if (attributes?.status === "completed")
            return attributes;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    return null;
}
export async function scanUrlHandler(req, res) {
    try {
        const { url } = req.body;
        if (typeof url !== "string" || url.trim() === "") {
            res.status(400).json({ error: "A URL is required." });
            return;
        }
        const normalized = url.trim();
        if (!isValidHttpUrl(normalized)) {
            res.status(400).json({ error: "Please provide a valid http or https URL." });
            return;
        }
        const apiKey = process.env.VIRUSTOTAL_API_KEY;
        if (!apiKey || apiKey === "your_actual_key_here") {
            res.status(500).json({ error: "VirusTotal API key is not configured on the server." });
            return;
        }
        const form = new URLSearchParams();
        form.append("url", normalized);
        const submitResponse = await vtFetch("/urls", apiKey, {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: form,
        });
        if (submitResponse.status === 429) {
            res.status(429).json({ error: "VirusTotal rate limit reached. Please try again shortly." });
            return;
        }
        if (!submitResponse.ok) {
            res.status(502).json({ error: `VirusTotal rejected the submission (${submitResponse.status}).` });
            return;
        }
        const submitBody = (await submitResponse.json());
        const analysisId = submitBody.data?.id;
        if (!analysisId) {
            res.status(502).json({ error: "VirusTotal did not return an analysis ID." });
            return;
        }
        const attributes = await pollAnalysis(analysisId, apiKey);
        if (!attributes) {
            const timeoutResponse = {
                url: normalized,
                score: 0,
                verdict: "UNKNOWN",
                safe_to_proceed: false,
                stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
                message: "Analysis timed out before VirusTotal finished processing. Try again.",
            };
            res.status(200).json(timeoutResponse);
            return;
        }
        const stats = attributes.stats ?? {};
        const malicious = stats.malicious ?? 0;
        const suspicious = stats.suspicious ?? 0;
        const harmless = stats.harmless ?? 0;
        const undetected = stats.undetected ?? 0;
        const totalEngines = malicious + suspicious + harmless + undetected;
        let verdict;
        let safeToProceed;
        let message;
        if (malicious > 0) {
            verdict = "DANGEROUS";
            safeToProceed = false;
            message = `${malicious} security engine(s) flagged this URL as malicious.`;
        }
        else if (suspicious > 0) {
            verdict = "SUSPICIOUS";
            safeToProceed = false;
            message = `${suspicious} security engine(s) flagged this URL as suspicious.`;
        }
        else if (totalEngines > 0) {
            verdict = "NO_THREATS_DETECTED";
            safeToProceed = true;
            message = `${totalEngines} engine(s) analyzed this URL and found no threats.`;
        }
        else {
            verdict = "UNKNOWN";
            safeToProceed = false;
            message = "No completed analysis results were available for this URL.";
        }
        const score = totalEngines > 0 ? Math.max(0, Math.round(100 - (malicious * 100) / totalEngines)) : 0;
        const response = {
            url: normalized,
            score,
            verdict,
            safe_to_proceed: safeToProceed,
            stats: { malicious, suspicious, harmless, undetected },
            message,
        };
        res.status(200).json(response);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred during analysis.";
        res.status(500).json({ error: message });
    }
}
export function healthHandler(_req, res) {
    const apiKeyConfigured = Boolean(process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY !== "your_actual_key_here");
    res.status(200).json({ status: "ok", virustotal_configured: apiKeyConfigured });
}
