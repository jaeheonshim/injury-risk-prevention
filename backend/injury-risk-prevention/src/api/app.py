from flask import Flask, request, jsonify

app = Flask(__name__)

def run_inference(wizard_data):
    """
    Placeholder for ML inference logic. Replace with actual model prediction.
    
    Args:
        wizard_data (dict): Dictionary containing wizard data (age, height, etc.)

    Returns:
        dict: Predicted probabilities for each injury type.
    """
    # Example: Mock predictions based on height & weight (replace with actual model)
    height = wizard_data.get("height", 70)  # Default 70 inches if missing
    weight = wizard_data.get("weight", 200) # Default 200 lbs if missing

    # Mock logic: Higher weight increases knee injury probability
    knee_injury_risk = min(1.0, weight / 300)  
    ankle_injury_risk = min(1.0, height / 80)

    predictions = {
        "SHOULDER": 1
    }
    return predictions

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