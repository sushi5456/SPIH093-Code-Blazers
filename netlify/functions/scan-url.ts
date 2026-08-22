import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { url } = JSON.parse(event.body || "{}");

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "URL is required" }),
      };
    }

    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "VIRUSTOTAL_API_KEY is missing",
        }),
      };
    }

    // 1. Submit URL to VirusTotal
    const form = new URLSearchParams();
    form.append("url", url);

    const submitResponse = await fetch(
      "https://www.virustotal.com/api/v3/urls",
      {
        method: "POST",
        headers: {
          "x-apikey": apiKey,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      }
    );

    const submitData = await submitResponse.json();

    if (!submitResponse.ok) {
      return {
        statusCode: submitResponse.status,
        body: JSON.stringify({
          error: "VirusTotal submission failed",
          details: submitData,
        }),
      };
    }

    // 2. Get analysis ID
    const analysisId = submitData?.data?.id;

    if (!analysisId) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "VirusTotal did not return an analysis ID",
        }),
      };
    }

    // 3. Wait for VirusTotal to process the URL
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 4. Get analysis results
    const analysisResponse = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          "x-apikey": apiKey,
        },
      }
    );

    const analysisData = await analysisResponse.json();

    if (!analysisResponse.ok) {
      return {
        statusCode: analysisResponse.status,
        body: JSON.stringify({
          error: "Could not retrieve VirusTotal analysis",
          details: analysisData,
        }),
      };
    }

    const stats = analysisData?.data?.attributes?.stats || {};

    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;

    const total =
      malicious +
      suspicious +
      harmless +
      undetected;

    const safeToProceed =
      malicious === 0 && suspicious === 0;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        verdict:
          malicious > 0
            ? "malicious"
            : suspicious > 0
            ? "suspicious"
            : "safe",

        stats: {
          malicious,
          suspicious,
          harmless,
          undetected,
          total,
        },

        safe_to_proceed: safeToProceed,
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
