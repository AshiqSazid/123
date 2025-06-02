# 🛠️ INSTALL EVERYTHING
!pip install librosa scikit-learn joblib matplotlib faiss-cpu sentence-transformers --quiet

# 📚 IMPORTS
import librosa, pandas as pd, numpy as np, os, joblib, matplotlib.pyplot as plt, faiss, json
from sentence_transformers import SentenceTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from google.colab import files

# 📁 UPLOAD CSV
uploaded = files.upload()
csv_path = list(uploaded.keys())[0]
df = pd.read_csv(csv_path, encoding="ISO-8859-1")

# 🎵 UPLOAD AUDIO FILES
audio_files = files.upload()
audio_file_list = list(audio_files.keys())

# 🎼 EXTRACT FEATURES
def extract_audio_features(audio_path):
    y, sr = librosa.load(audio_path, duration=30)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    spectral = librosa.feature.spectral_contrast(y=y, sr=sr)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    return [tempo] + np.mean(mfccs, axis=1).tolist() + np.mean(spectral, axis=1).tolist() + np.mean(chroma, axis=1).tolist()

# 🔁 MATCH AND EXTRACT ALL TRACKS
all_rows = []
for row in df.itertuples():
    matched_file = None
    for f in audio_file_list:
        if row.track_name.lower() in f.lower() and row.artist_name.lower() in f.lower():
            matched_file = f
            break
    if matched_file is None:
        continue
    try:
        features = extract_audio_features(matched_file)
        row_data = features + [row.artist_popularity, row.year, row.duration_ms, row.track_popularity]
        all_rows.append(row_data)
    except Exception as e:
        print(f"Error on {matched_file}: {e}")

# 🧾 CREATE MODEL DATAFRAME
columns = (
    ["tempo"] +
    [f"mfcc_{i}" for i in range(13)] +
    [f"spectral_{i}" for i in range(7)] +
    [f"chroma_{i}" for i in range(12)] +
    ["artist_popularity", "year", "duration_ms", "track_popularity"]
)
df_model = pd.DataFrame(all_rows, columns=columns)

# 🔍 SCALE AND TRAIN MODEL
X = df_model.drop("track_popularity", axis=1)
y = df_model["track_popularity"]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 📊 EVALUATE
y_pred = model.predict(X_test)
metrics = {
    "MAE": round(mean_absolute_error(y_test, y_pred), 2),
    "RMSE": round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
    "R2": round(r2_score(y_test, y_pred), 4)
}
print("📈 Evaluation Metrics:", metrics)

# 💾 SAVE EVERYTHING
os.makedirs("virality_audio_model", exist_ok=True)
df_model.to_csv("virality_audio_model/combined_features.csv", index=False)
joblib.dump(model, "virality_audio_model/audio_rf_model.pkl")
joblib.dump(scaler, "virality_audio_model/audio_scaler.pkl")

# 📥 SAVE TOP 100 PREDICTIONS
pred_df = pd.DataFrame(X_test, columns=X.columns)
pred_df["actual"] = y_test.values
pred_df["predicted"] = y_pred
result = {
    "metrics": metrics,
    "predictions_sample": pred_df.head(100).to_dict(orient="records")
}
with open("virality_audio_model/prediction_result.json", "w") as f:
    json.dump(result, f, indent=2)
files.download("virality_audio_model/combined_features.csv")
files.download("virality_audio_model/prediction_result.json")

# 🔎 BUILD RAG RETRIEVER
df = pd.read_csv("virality_audio_model/combined_features.csv")
def row_to_text(row):
    return (
        f"Tempo: {row['tempo']}, MFCC: {row['mfcc_0']:.2f}, {row['mfcc_1']:.2f}..., "
        f"Spectral: {row['spectral_0']:.2f}, {row['spectral_1']:.2f}..., "
        f"Chroma: {row['chroma_0']:.2f}, {row['chroma_1']:.2f}..., "
        f"Artist Popularity: {row['artist_popularity']}, "
        f"Year: {row['year']}, Duration: {row['duration_ms']}ms"
    )

model = SentenceTransformer("all-MiniLM-L6-v2")
corpus = df.apply(row_to_text, axis=1).tolist()
embeddings = model.encode(corpus, normalize_embeddings=True)

dimension = embeddings[0].shape[0]
index = faiss.IndexFlatIP(dimension)
index.add(np.array(embeddings).astype("float32"))

def rag_query(question, top_k=5):
    query_vec = model.encode(question, normalize_embeddings=True).astype("float32").reshape(1, -1)
    scores, indices = index.search(query_vec, top_k)
    results = []
    for idx in indices[0]:
        row = df.iloc[idx]
        verdict = (
            "🟢 Viral asf" if row["track_popularity"] >= 80 else
            "🟡 Okayish viral" if row["track_popularity"] >= 70 else
            "🔴 Not that viral" if row["track_popularity"] >= 50 else
            "⚪ Flop"
        )
        results.append({
            "Track Summary": row_to_text(row),
            "Popularity Score": round(row["track_popularity"], 1),
            "Verdict": verdict
        })
    return pd.DataFrame(results)

# 🚀 TEST RAG SEARCH
rag_query("Which songs have strong tempo and artist popularity?")
