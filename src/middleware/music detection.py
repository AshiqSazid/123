#Install Dependencies (if not already installed)
!pip uninstall -y tensorflow tensorflow-estimator tensorflow-intel -q
!pip install tensorflow==2.12.0 tensorflow-estimator==2.12.0 --quiet
!pip install spleeter librosa soundfile matplotlib pandas tqdm --quiet
!git clone https://github.com/marl/openl3.git
%cd openl3
!pip install .
%cd ..

#Imports
import os, json, time
import numpy as np
import pandas as pd
import librosa
import soundfile as sf
import matplotlib.pyplot as plt
import openl3
from tqdm import tqdm
from spleeter.separator import Separator
from google.colab import files
from datetime import timedelta

#Upload audio file
uploaded = files.upload()
file_path = list(uploaded.keys())[0]

#Separate stems
def separate_stems(audio_path, output_dir="separated_audio"):
    print("🔄 Separating stems...")
    separator = Separator('spleeter:4stems')
    separator.separate_to_file(audio_path, output_dir)
    return os.path.join(output_dir, os.path.splitext(os.path.basename(audio_path))[0])

#Compute energy + dB
def compute_energy_db(wav_path):
    y, sr = librosa.load(wav_path, sr=None)
    rms = np.sqrt(np.mean(y**2))
    db = librosa.amplitude_to_db(np.array([rms]), ref=np.max)[0]
    energy = float(np.sum(y**2))
    return energy, db, len(y)/sr

#  OpenL3 Embedding (512D, normalized)
def get_openl3_embedding_normalized(wav_path):
    y, sr = librosa.load(wav_path, sr=None)
    emb, _ = openl3.get_audio_embedding(y, sr, input_repr="mel256", content_type="music", embedding_size=512)
    mean_emb = emb.mean(axis=0)
    norm_emb = mean_emb / np.linalg.norm(mean_emb) if np.linalg.norm(mean_emb) > 0 else mean_emb
    return norm_emb

#  JSON-safe type converter
def make_json_safe(obj):
    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, (np.integer, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj

#Run Task 1
def run_task1(audio_path):
    start = time.time()
    stem_dir = separate_stems(audio_path)
    stems = {
        "Vocals": os.path.join(stem_dir, "vocals.wav"),
        "Drums": os.path.join(stem_dir, "drums.wav"),
        "Bass": os.path.join(stem_dir, "bass.wav"),
        "Other": os.path.join(stem_dir, "other.wav")
    }

    print("\n Calculating energy...")
    energy_info, total_energy = {}, 0
    for name, path in tqdm(stems.items(), desc="Energy"):
        try:
            energy, db, dur = compute_energy_db(path)
            energy_info[name] = {"raw_energy": energy, "db": db, "duration": dur}
            total_energy += energy
        except Exception as e:
            print(f" {name} error: {e}")
            energy_info[name] = {"raw_energy": 0, "db": -120, "duration": 0}

    proportions = {
        name: round(info["raw_energy"] / total_energy * 100, 2) if total_energy > 0 else 0.0
        for name, info in energy_info.items()
    }

    print("\n🎧 Extracting OpenL3 embeddings...")
    embeddings = {}
    for name, path in tqdm(stems.items(), desc="Embedding"):
        try:
            embeddings[name] = get_openl3_embedding_normalized(path)
        except Exception as e:
            print(f" {name} embedding failed: {e}")
            embeddings[name] = np.zeros(512)

    #Pie chart
    plt.figure(figsize=(6,6))
    plt.pie(proportions.values(), labels=proportions.keys(), autopct='%1.1f%%')
    plt.title("🎼 Instrument Proportions")
    plt.axis('equal')
    plt.show()

    #Save JSON + CSV
    os.makedirs("openl3_exports", exist_ok=True)
    json_path = "openl3_exports/results.json"
    csv_path = "openl3_exports/results.csv"

    # 🔒 Safe JSON export
    json_data = {
        "proportions": make_json_safe(proportions),
        "energy_info": make_json_safe(energy_info),
        "embeddings": {k: make_json_safe(v) for k, v in embeddings.items()}
    }
    with open(json_path, "w") as f:
        json.dump(json_data, f, indent=2)

    # CSV export
    rows = []
    for name in embeddings:
        row = [
            name,
            round(float(energy_info[name]["raw_energy"]), 2),
            round(float(energy_info[name]["db"]), 2),
            round(float(energy_info[name]["duration"]), 2),
            float(proportions[name])
        ] + embeddings[name].tolist()
        rows.append(row)

    cols = ["Instrument", "Energy", "dB", "DurationSec", "EnergyPercent"] + [f"Dim_{i+1}" for i in range(512)]
    pd.DataFrame(rows, columns=cols).to_csv(csv_path, index=False)

    print(f"\n Done! Exported to:")
    print(f" JSON: {json_path}")
    print(f" CSV : {csv_path}")
    files.download(json_path)
    files.download(csv_path)
    print(f"⏱ Time Elapsed: {str(timedelta(seconds=int(time.time() - start)))}")

#Go!
run_task1(file_path)
