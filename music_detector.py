import os
import numpy as np
import librosa
import soundfile as sf
from spleeter.separator import Separator
import openl3

class MusicDetector:
    def __init__(self):
        self.separator = Separator('spleeter:4stems')
        self.output_dir = "temp_separated_audio"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def separate_stems(self, audio_path):
        """Separate audio into stems"""
        try:
            # Get base name without extension
            base_name = os.path.splitext(os.path.basename(audio_path))[0]
            
            # Separate audio
            self.separator.separate_to_file(audio_path, self.output_dir)
            
            # Return paths to stems
            stem_dir = os.path.join(self.output_dir, base_name)
            stems = {
                "vocals": os.path.join(stem_dir, "vocals.wav"),
                "drums": os.path.join(stem_dir, "drums.wav"),
                "bass": os.path.join(stem_dir, "bass.wav"),
                "other": os.path.join(stem_dir, "other.wav")
            }
            
            return stems
        except Exception as e:
            print(f"Error separating stems: {e}")
            return None
    
    def compute_energy_db(self, wav_path):
        """Compute energy and dB level"""
        try:
            y, sr = librosa.load(wav_path, sr=None)
            rms = np.sqrt(np.mean(y**2))
            db = librosa.amplitude_to_db(np.array([rms]), ref=np.max)[0]
            energy = float(np.sum(y**2))
            duration = len(y) / sr
            
            return {
                'energy': energy,
                'db': float(db),
                'duration': duration
            }
        except Exception as e:
            print(f"Error computing energy: {e}")
            return {'energy': 0.0, 'db': -120.0, 'duration': 0.0}
    
    def get_openl3_embedding(self, wav_path):
        """Get OpenL3 embedding for audio"""
        try:
            y, sr = librosa.load(wav_path, sr=None)
            emb, _ = openl3.get_audio_embedding(
                y, sr, 
                input_repr="mel256", 
                content_type="music", 
                embedding_size=512
            )
            mean_emb = emb.mean(axis=0)
            norm_emb = mean_emb / np.linalg.norm(mean_emb) if np.linalg.norm(mean_emb) > 0 else mean_emb
            return norm_emb.tolist()
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return [0.0] * 512
    
    def analyze_stems(self, audio_path):
        """Analyze audio stems and return energy distribution"""
        stems = self.separate_stems(audio_path)
        if not stems:
            return None
        
        results = {
            'energy_info': {},
            'proportions': {},
            'embeddings': {},
            'total_energy': 0.0
        }
        
        # Analyze each stem
        for stem_name, stem_path in stems.items():
            if os.path.exists(stem_path):
                # Get energy info
                energy_info = self.compute_energy_db(stem_path)
                results['energy_info'][stem_name] = energy_info
                results['total_energy'] += energy_info['energy']
                
                # Get embedding
                embedding = self.get_openl3_embedding(stem_path)
                results['embeddings'][stem_name] = embedding
        
        # Calculate proportions
        if results['total_energy'] > 0:
            for stem_name, info in results['energy_info'].items():
                results['proportions'][stem_name] = round(
                    info['energy'] / results['total_energy'] * 100, 2
                )
        
        # Clean up temporary files
        self._cleanup_temp_files()
        
        return results
    
    def _cleanup_temp_files(self):
        """Clean up temporary separated files"""
        try:
            import shutil
            if os.path.exists(self.output_dir):
                shutil.rmtree(self.output_dir)
                os.makedirs(self.output_dir, exist_ok=True)
        except Exception as e:
            print(f"Error cleaning up: {e}")