from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from collections import Counter

# Setup Flask
app = Flask(__name__)
CORS(app)

model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'model'))

tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(model_path, local_files_only=True)

# Device setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)
model.eval()

# Label mapping
label_map = {
    0: "Negative",
    1: "Netral",
    2: "Positive"
}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    texts = data.get('texts')  # Input: list of texts

    if not texts or not isinstance(texts, list):
        return jsonify({"error": "No texts provided or wrong format (should be list)."}), 400

    results = []
    summary = {"Negative": 0, "Netral": 0, "Positive": 0}
    all_words = []
    for text in texts:
        try:
            inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(device)

            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                prediction = torch.argmax(probs, dim=1).item()
                probas = probs.squeeze().tolist()

            predicted_label = label_map.get(prediction, "Unknown")

            # Tambahkan ke summary
            if predicted_label in summary:
                summary[predicted_label] += 1

            results.append({
                "text": text,
                "predicted_sentiment": predicted_label,
                "negative": round(probas[0]*100, 2),
                "netral": round(probas[1]*100, 2),
                "positive": round(probas[2]*100, 2)
            })

            # Kumpulkan kata untuk word frequency
            all_words.extend(text.lower().split())
        except Exception as e:
            results.append({
                "text": text,
                "error": str(e)
            })

    # Hitung word frequency (top 20)
    word_freq = Counter(all_words).most_common(20)
    word_freq_dict = dict(word_freq)

    return jsonify({"results": results, "summary": summary, "word_freq": word_freq_dict})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
