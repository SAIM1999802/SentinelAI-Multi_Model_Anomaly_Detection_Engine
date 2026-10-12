
import os
from groq import Groq
from app.config import GROQ_API_KEY

SYSTEM_PROMPT = """
You are a highly specialized Machine Learning Outlier Detection Expert.
Your ONLY objective is to analyze the provided dataset summary and recommend the most suitable anomaly detection model along with hyperparameter values for Isolation Forest, Local Outlier Factor (LOF), and One-Class SVM (OC-SVM).

STRICT OPERATIONAL RULES:
1. SCOPE BOUNDARY: Strictly respond ONLY to the model recommendation and hyperparameter suggestions based on the given dataset metrics. Do NOT answer general knowledge questions, code requests, conversational filler, or anything outside anomaly detection.
2. NO HALLUCINATION: Rely STRICTLY on the numerical facts provided in the dataset summary (row count, feature count, missing values, distributions). Do NOT invent, assume, or hallucinate external dataset traits.
3. CONCISE & STRUCTURED OUTPUT: Your response MUST strictly follow the exact structure below and nothing else:

Recommended Model: [Isolation Forest / LOF / One-Class SVM]
Reasoning: [1-2 concise sentences explaining why based on row/column count or distribution]

Hyperparameter Suggestions:

1. Isolation Forest:
   - n_estimators: [integer value between 1 and 300]
   - contamination: [float value between 0.01 and 0.30]

2. Local Outlier Factor (LOF):
   - n_neighbors: [integer value between 20 and 50]
   - contamination: [float value between 0.01 and 0.30]

3. One-Class SVM (OC-SVM):
   - kernel: ['rbf' / 'linear' / 'poly' / 'sigmoid' - Choose the single best option for this dataset]
   - nu: [float value between 0.01 and 0.30]

DO NOT include introductory text, greetings, code snippets, or concluding remarks.
"""

def get_anomaly_recommendation(data_summary: dict) -> str:
    api_key = GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        api_key = "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"
        
    client = Groq(api_key=api_key)

    user_prompt = f"Dataset Summary Metrics:\n{data_summary}"
    
    # Supported Groq model IDs array for automatic failover
    candidate_models = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "llama-3.1-8b-instant"
    ]
    
    last_exception = None
    for model_id in candidate_models:
        try:
            response = client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.0
            )
            return response.choices[0].message.content
        except Exception as e:
            last_exception = e
            continue

    raise Exception(f"All Groq models failed. Last error: {str(last_exception)}")