from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pickle
from sklearn.preprocessing import StandardScaler

with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
loaded_model = tf.keras.models.load_model('./tf_model.keras')
injury_types = ['KNEE', 'ANKLE', 'HAMSTRING', 'SHOULDER', 'FOOT', 'CONCUSSION', 'GROIN', 'BACK', 'CALF', 'HIP', 'NECK', 'TOE', 'QUADRICEP', 'ELBOW', 'HAND', 'RIB', 'WRIST', 'THUMB', 'ABDOMEN', 'HEAD', 'FINGER', 'ACHILLES', 'SHIN', 'PECTORAL', 'FOREARM', 'HEEL', 'BICEPS', 'FIBULA']

pos_types = ['WR', 'LB', 'C', 'RB', 'CB', 'DT', 'TE', 'S', 'T', 'G', 'DE', 'P', 'LS', 'QB']

numerical_types = ['height', 'weight', 'age', 'forty', 'bench', 'vertical']

app = Flask(__name__)

def run_inference(wizard_data):
    """
    Placeholder for ML inference logic. Replace with actual model prediction.
    
    Args:
        wizard_data (dict): Dictionary containing wizard data (age, height, etc.)

    Returns:
        dict: Predicted probabilities for each injury type.
    """
    X_injury_counts = np.zeros(shape=(1, len(injury_types)))
    X_position = np.zeros(shape=(1, 1))
    X_numerical = np.zeros(shape=(1, len(numerical_types)))

    # Example: Mock predictions based on height & weight (replace with actual model)
    height = wizard_data.get("height", 70)  # Default 70 inches if missing
    weight = wizard_data.get("weight", 200) # Default 200 lbs if missing

    past_injuries = wizard_data.get('injuries', [])
    position = wizard_data.get('pos', 0)

    for injury in past_injuries:
        X_injury_counts[0][injury_types.index(injury['type'].upper())] += 1

    X_position[0][0] = pos_types.index(position)

    for i, value in enumerate(numerical_types):
        X_numerical[0][i] = wizard_data.get(value, 0)

    X_numerical = scaler.transform(X_numerical) # Normalize numerical data

    prediction = loaded_model.predict([X_injury_counts, X_position, X_numerical])[0]

    output = {}
    for i, injury in enumerate(injury_types):
        output[injury] = float(prediction[i])
    
    return output

@app.route('/inference', methods=['POST'])
def inference_endpoint():
    """
    API route that receives WizardData JSON, runs inference, and returns predictions.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing request body"}), 400

    try:
        # Run inference using the received WizardData
        predictions = run_inference(data)

        return jsonify(predictions)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5328, debug=True)