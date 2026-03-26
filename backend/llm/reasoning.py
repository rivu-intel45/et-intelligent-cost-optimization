import json
import os

from groq import Groq


client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _fallback_reason(issue):
    if isinstance(issue, dict):
        server_id = issue.get("server_id", "resource")
        cpu_usage = issue.get("cpu_usage", 0)
        cost = issue.get("cost", 0)
        priority = "high" if cost >= 2000 or cpu_usage <= 20 else "medium"

        return {
            "problem": f"{server_id} is underutilized with only {cpu_usage}% CPU usage.",
            "impact": f"It is costing Rs. {cost} per month while delivering low utilization.",
            "recommended_action": f"Shut down or downsize {server_id} after workload verification.",
            "priority": priority,
        }

    return {
        "problem": str(issue),
        "impact": "This may be increasing operating costs unnecessarily.",
        "recommended_action": "Review the resource and optimize or remove it.",
        "priority": "medium",
    }


def generate_reason(issue):
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": f"""
Analyze this cost issue and return ONLY valid JSON:

{issue}

Expected schema:
{{
  "problem": "...",
  "impact": "...",
  "recommended_action": "...",
  "priority": "low/medium/high"
}}
""",
                }
            ],
        )

        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)

        return {
            "problem": parsed.get("problem", ""),
            "impact": parsed.get("impact", ""),
            "recommended_action": parsed.get("recommended_action", ""),
            "priority": parsed.get("priority", "medium"),
        }
    except Exception:
        return _fallback_reason(issue)
