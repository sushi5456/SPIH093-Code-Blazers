# SPIH093-Code-Blazers

https://spih-093.netlify.app/



SIGHTSENSE — Smart URL Security Scanner

SIGHTSENSE is a real-time URL security analysis platform that helps users determine whether a website is safe to visit before opening it.

Users can submit a URL and receive a security assessment based on threat intelligence from VirusTotal, including malicious and suspicious detections, an overall security score, and a clear recommendation.

🚨 Problem

The internet is filled with phishing pages, malicious websites, scams, and suspicious links.

A user may receive a URL through:

Email
Social media
Messaging apps
QR codes
Online advertisements
Unknown sources

Opening an unsafe URL can expose users to phishing attacks, malware, credential theft, and other security threats.

SIGHTSENSE provides a simple layer of protection before the user visits the website.

💡 Solution

SIGHTSENSE allows users to enter a URL and scan it using threat intelligence.

The system:

Accepts a URL from the user.
Sends the URL securely to the backend.
Submits the URL to VirusTotal.
Retrieves security analysis results.
Calculates a security score out of 100.
Displays malicious, suspicious, harmless, and undetected results.
Provides a simple Safe / Suspicious / Malicious verdict.
✨ Features
🔍 Real-time URL scanning
🛡️ Threat intelligence powered by VirusTotal
📊 Security score out of 100
🚨 Malicious and suspicious detection counts
✅ Safe-to-proceed recommendation
📈 Detailed scan statistics
⚡ Fast and simple interface
🔐 API key protected on the server
🌐 Responsive web interface
🧠 Security Score

SIGHTSENSE converts the VirusTotal analysis into an easy-to-understand score.

The score is based on the number of malicious and suspicious detections compared with the total number of analyzed security engines.

Example
Malicious:   0
Suspicious:  0
Harmless:   65
Undetected:  5

Security Score: 100/100
Verdict: SAFE
