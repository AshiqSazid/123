import librosa
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

class ViralSongAnalyzer:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_path = 'models/viral_audio_model/'
        self._load_or_create_model()
    
    def _load_or_create_model(self):
        """Load existing model or create a new one"""
        model_file = os.path.join(self.model_path, 'audio_rf_model.pkl')
        scaler_file = os.path.join(self.model_path, 'audio_scaler.pkl')
        
        if os.path.exists(model_file) and os.path.exists(scaler_file):
            self.model = joblib.load(model_file)
            self.scaler = joblib.load(scaler_file)
        else:
            # Create a simple model for demonstration
            self.model = RandomForestRegressor(n_estimators=200, random_state=42)
            self.scaler = StandardScaler()
            # You would train this with real data
    
    def extract_audio_features(self, audio_path):
        """Extract audio features from a file"""
        try:
            y, sr = librosa.load(audio_path, duration=30)
            
            # Extract tempo
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            
            # Extract MFCCs (13 coefficients)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfccs, axis=1).tolist()
            
            # Extract spectral contrast (7 bands)
            spectral = librosa.feature.spectral_contrast(y=y, sr=sr)
            spectral_mean = np.mean(spectral, axis=1).tolist()
            
            # Extract chroma features (12 pitch classes)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1).tolist()
            
            return {
                'tempo': float(tempo),
                'mfcc_features': mfcc_mean,
                'spectral_features': spectral_mean,
                'chroma_features': chroma_mean,
                'duration_ms': int(len(y) / sr * 1000)
            }
        except Exception as e:
            print(f"Error extracting features: {e}")
            return None
    
    def predict_virality(self, features, artist_popularity=50, year=2024):
        """Predict track popularity based on features"""
        if not features:
            return None
        
        # Prepare feature vector
        feature_vector = (
            [features['tempo']] +
            features['mfcc_features'] +
            features['spectral_features'] +
            features['chroma_features'] +
            [artist_popularity, year, features['duration_ms']]
        )
        
        # If model is trained, use it for prediction
        if hasattr(self.model, 'n_features_in_'):
            X = np.array(feature_vector).reshape(1, -1)
            X_scaled = self.scaler.transform(X)
            prediction = self.model.predict(X_scaled)[0]
        else:
            # Return a mock prediction for demonstration
            prediction = np.random.uniform(40, 85)
        
        return float(prediction)
    
    def analyze_emotion_impact(self, audio_features):
        """Analyze emotional impact based on audio features"""
        # This is a simplified version - in reality, you'd use a trained model
        emotions = {
            'uplifting': 0.0,
            'distracting': 0.0,
            'reappraisal': 0.0,
            'motivating': 0.0,
            'relaxing': 0.0,
            'suppressing': 0.0,
            'destressing': 0.0
        }
        
        if not audio_features:
            return emotions
        
        # Use tempo and features to estimate emotions
        tempo = audio_features['tempo']
        
        # High tempo tends to be more motivating/uplifting
        if tempo > 120:
            emotions['motivating'] = min(0.8 + np.random.uniform(-0.1, 0.1), 1.0)
            emotions['uplifting'] = min(0.7 + np.random.uniform(-0.1, 0.1), 1.0)
        elif tempo < 80:
            emotions['relaxing'] = min(0.8 + np.random.uniform(-0.1, 0.1), 1.0)
            emotions['destressing'] = min(0.7 + np.random.uniform(-0.1, 0.1), 1.0)
        else:
            emotions['reappraisal'] = min(0.6 + np.random.uniform(-0.1, 0.1), 1.0)
        
        # Add some variation to other emotions
        for emotion in emotions:
            if emotions[emotion] == 0.0:
                emotions[emotion] = max(0.1, np.random.uniform(0.2, 0.5))
        
        return emotions