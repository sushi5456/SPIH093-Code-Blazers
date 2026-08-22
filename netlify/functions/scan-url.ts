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

    // Send URL to VirusTotal
    const form = new URLSearchParams();
    form.append("url", url);

    const vtResponse = await fetch(
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

    if (!vtResponse.ok) {
      const errorText = await vtResponse.text();

      return {
        statusCode: vtResponse.status,
        body: JSON.stringify({
          error: "VirusTotal request failed",
          details: errorText,
        }),
      };
    }

    const result = await vtResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
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
