from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pickle
import pandas as pd
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import io
import base64
import asyncio
import joblib

with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

loaded_model = tf.keras.models.load_model('./tf_model.keras')

injury_types = ['KNEE', 'ANKLE', 'HAMSTRING', 'SHOULDER', 'FOOT', 'CONCUSSION', 'GROIN', 'BACK', 'CALF', 'HIP', 'NECK', 'TOE', 'QUADRICEP', 'ELBOW', 'HAND', 'RIB', 'WRIST', 'THUMB', 'ABDOMEN', 'HEAD', 'FINGER', 'ACHILLES', 'SHIN', 'PECTORAL', 'FOREARM', 'HEEL', 'BICEPS', 'FIBULA']
pos_types = ['WR', 'LB', 'C', 'RB', 'CB', 'DT', 'TE', 'S', 'T', 'G', 'DE', 'P', 'LS', 'QB']
numerical_types = ['height', 'weight', 'age', 'forty', 'bench', 'vertical']

df = pd.read_csv('data.csv')

app = Flask(__name__)

# def run_inference(wizard_data):
#     """
#     Placeholder for ML inference logic. Replace with actual model prediction.
    
#     Args:
#         wizard_data (dict): Dictionary containing wizard data (age, height, etc.)

#     Returns:
#         dict: Predicted probabilities for each injury type.
#     """
#     X_injury_counts = np.zeros(shape=(1, len(injury_types)))
#     X_position = np.zeros(shape=(1, 1))
#     X_numerical = np.zeros(shape=(1, len(numerical_types)))

#     # Example: Mock predictions based on height & weight (replace with actual model)
#     height = wizard_data.get("height", 70)  # Default 70 inches if missing
#     weight = wizard_data.get("weight", 200) # Default 200 lbs if missing

#     past_injuries = wizard_data.get('injuries', [])
#     position = wizard_data.get('pos', 0)

#     model = joblib.load('model.joblib')

#     for injury in past_injuries:
#         X_injury_counts[0][injury_types.index(injury['type'].upper())] += 1

#     X_position[0][0] = pos_types.index(position)

#     for i, value in enumerate(numerical_types):
#         X_numerical[0][i] = wizard_data.get(value, 0)

#     X_numerical = scaler.transform(X_numerical) # Normalize numerical data

#     prediction = loaded_model.predict([X_injury_counts, X_position, X_numerical])[0]

#     output = {}
#     for i, injury in enumerate(injury_types):
#         output[injury] = float(prediction[i])
    
#     return output

def run_inference(wizard_data):
    """
    Performs inference using a persisted joblib model.

    Args:
        wizard_data (dict): Dictionary containing wizard data (e.g., injuries, pos, numerical inputs)

    Returns:
        dict: Predicted probabilities for each injury type.
    """
    # Initialize feature arrays
    X_injury_counts = np.zeros((1, len(injury_types)))
    X_position = np.zeros((1, 1))
    X_numerical = np.zeros((1, len(numerical_types)))
    
    # Process past injuries into a one-hot count vector
    past_injuries = wizard_data.get('injuries', [])
    for injury in past_injuries:
        injury_name = injury['type'].upper()
        if injury_name in injury_types:
            X_injury_counts[0][injury_types.index(injury_name)] += 1

    # Process position: default to first element if missing
    position = wizard_data.get('pos', pos_types[0])
    if position in pos_types:
        X_position[0][0] = pos_types.index(position)
    else:
        X_position[0][0] = 0

    # Process numerical features
    for i, feature in enumerate(numerical_types):
        X_numerical[0][i] = wizard_data.get(feature, 0)
    
    # Normalize numerical data using the pre-loaded scaler
    X_numerical = scaler.transform(X_numerical)
    
    # Concatenate all features into a single input array
    # Ensure the order of features matches the order used during training
    input_features = np.concatenate([X_numerical, X_injury_counts, X_position], axis=1)
    
    # Load the persisted model from joblib (this assumes the file exists at the given path)
    joblib_model = joblib.load('model.joblib')
    
    # Use the model to predict the output based on the input features
    predicted_output = joblib_model.predict(input_features)
    
    # Format the prediction output as a dictionary mapping each injury type to its prediction
    output = {}
    for i, injury in enumerate(injury_types):
        # Here we assume that the model outputs a vector of predictions for each injury type
        output[injury] = float(predicted_output[0][i])
    
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

def get_injury_df_json(selected_injury_types):
    """
    Filter the DataFrame based on the given list of injury types and return the result as JSON.
    
    Args:
        selected_injury_types (list): List of injury type strings (e.g., ['KNEE', 'ANKLE']).

    Returns:
        str: JSON string representation of the filtered DataFrame.
    """
    filtered_df = df[df['injury'].str.upper().isin([inj.upper() for inj in selected_injury_types])][["injury", "height", "weight"]]
    return filtered_df.to_json(orient='records')

def get_boxplot_image(selected_injury_types):
    """
    Filter the DataFrame for the selected injury types, create a box and whisker plot for weight distribution,
    and return the plot as a base64-encoded PNG image.
    
    Args:
        selected_injury_types (list): List of injury type strings.
        
    Returns:
        str: Base64 encoded PNG image of the box plot.
    """
    # Filter DataFrame by selected injury types (case-insensitive)
    filtered_df = df[df['injury'].str.upper().isin([inj.upper() for inj in selected_injury_types])][["injury", "weight"]]
    
    # Create the box plot using Pandas' boxplot (which uses Matplotlib)
    plt.figure(figsize=(10, 6))
    ax = filtered_df.boxplot(column='weight', by='injury', grid=False)
    plt.title('Box & Whisker Plot: Weight Distribution by Injury Type')
    plt.suptitle('')  # Remove default subtitle
    plt.xlabel('Injury Type')
    plt.ylabel('Weight (lbs)')
    
    # Save the figure to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    
    # Encode the image in base64
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return img_base64

@app.route('/injuries', methods=['POST'])
def injuries_endpoint():
    """
    API route that accepts a JSON payload with a list of injury types and returns the filtered data.
    Example input: { "injury_types": ["KNEE", "ANKLE"] }
    """
    data = request.get_json()
    if not data or 'injury_types' not in data:
        return jsonify({"error": "Missing injury_types in request body"}), 400

    injury_list = data['injury_types']
    
    try:
        filtered_json = get_injury_df_json(injury_list)
        return filtered_json, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/injuries-boxplot', methods=['GET'])
def injuries_boxplot_endpoint():
    """
    API route that accepts a GET request with an 'injury_types' query parameter (comma-separated list),
    generates a box plot for weight distribution using Pandas/Matplotlib, and returns the image as a 
    base64-encoded string.
    
    Example URL: /injuries-boxplot?injury_types=KNEE,ANKLE
    """
    injury_types_param = request.args.get('injury_types')
    if not injury_types_param:
        return jsonify({"error": "Missing injury_types query parameter"}), 400

    # Convert the comma-separated string into a list
    injury_list = [inj.strip() for inj in injury_types_param.split(',')]
    
    try:
        img_base64 = get_boxplot_image(injury_list)
        return jsonify({"image": img_base64})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5328, debug=True)