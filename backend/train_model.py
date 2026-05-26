"""
train_model.py - VERSIÓN MEGA
Dataset masivo + 29 características + Random Forest optimizado
"""
import pandas as pd
import numpy as np
import re, os, joblib, math
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from collections import Counter

CSV_PATH = "data/dataset.csv"
if not os.path.exists(CSV_PATH):
    print("Dataset no encontrado. Ejecuta primero: python dataset_builder.py")
    exit(1)

df = pd.read_csv(CSV_PATH)
print(f"Dataset: {len(df):,} filas — {df['label'].sum():,} phishing, {len(df)-df['label'].sum():,} legítimos")

COMMON_BIGRAMS = set(["go","oo","og","gl","le","bo","ok","fa","ac","ce","eb","am","ma","az","zo","on",
    "yo","ou","ut","tu","ub","tw","wi","it","tt","er","in","st","ar","re","et","te","ap",
    "pp","pl","li","nk","ed","di","is","sc","co","or","rd","de","sp","po","ot","ti",
    "ck","ya","ah","ho","pa","ay","al","sh","op","pi","if","fy","ne","tf","fl","ix",
    "ch","ha","at","tv","vi","im","me","gi","th","hu","bl","oc","ai","an","nd","dr",
    "ro","oi","id","wh","ts","si","ig","gn","na","no","ki","ip","pe","ra","ad","bi",
    "ng","ea","br","tr","pr","gr","fr","cr","sm","sp","sl","sn","sk","sw","qu","ph"])

def gibberish_score(domain):
    domain = re.sub(r'[^a-z]', '', domain.lower())
    if len(domain) < 3: return 0.0
    clusters = re.findall(r'[bcdfghjklmnpqrstvwxyz]{4,}', domain)
    cluster_score = min(len(clusters) * 0.3, 1.0)
    bigrams = [domain[i:i+2] for i in range(len(domain)-1)]
    if not bigrams: return 1.0
    common_count = sum(1 for b in bigrams if b in COMMON_BIGRAMS)
    bigram_score = 1.0 - (common_count / len(bigrams))
    freq = Counter(domain)
    total = len(domain)
    entropy = -sum((c/total)*math.log2(c/total) for c in freq.values())
    entropy_score = entropy / math.log2(26)
    length_score = min(max(0, (len(domain)-15)/20), 1.0)
    return round(cluster_score*0.3 + bigram_score*0.35 + entropy_score*0.25 + length_score*0.1, 4)

def extract_features(url):
    url = str(url).lower().strip()
    suspicious_words = ["login","verify","secure","account","update","confirm","banking",
        "suspend","alert","free","winner","claim","prize","urgent","password","credential",
        "support","help","limited","locked","billing","payment","invoice","refund",
        "signin","recover","validate","authenticate","authorize","reset","blocked",
        "unusual","activity","security","verify-now","confirm-now","update-now"]
    brand_words = ["paypal","amazon","apple","microsoft","google","facebook","netflix",
        "instagram","twitter","whatsapp","ebay","bank","chase","wells","citi","hsbc",
        "irs","fedex","ups","dhl","bancolombia","nequi","daviplata","spotify","tiktok",
        "snapchat","linkedin","discord","telegram","roblox","steam","binance","coinbase",
        "airbnb","uber","visa","mastercard","santander","bbva","davivienda"]
    suspect_tlds = [".xyz",".ru",".info",".tk",".ml",".ga",".cf",".gq",".top",".click",
        ".work",".loan",".win",".download",".accountant",".racing",".party",".trade",
        ".review",".science",".date",".faith",".stream",".bid",".men",".icu",".vip"]
    legit_tlds = [".com",".org",".net",".edu",".gov",".io",".co",".us",".uk",".edu.co"]

    domain_full = url.split("/")[0]
    parts = domain_full.split(".")
    domain_part = parts[0] if parts else url

    gib = gibberish_score(domain_part)
    sw_count = sum(1 for w in suspicious_words if w in url)
    bw_count  = sum(1 for w in brand_words if w in url)

    return {
        "length":                  len(url),
        "num_dots":                url.count("."),
        "num_hyphens":             url.count("-"),
        "num_digits":              sum(c.isdigit() for c in url),
        "num_subdomains":          max(0, url.count(".")-1),
        "has_https":               int(url.startswith("https")),
        "has_at":                  int("@" in url),
        "has_ip":                  int(bool(re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url))),
        "suspicious_words":        sw_count,
        "brand_words":             bw_count,
        "suspect_tld":             int(any(url.endswith(t) for t in suspect_tlds)),
        "legit_tld":               int(any(url.endswith(t) for t in legit_tlds)),
        "url_depth":               url.count("/"),
        "long_url":                int(len(url) > 54),
        "has_numbers_in_domain":   int(bool(re.search(r'\d', domain_part))),
        "brand_plus_suspicious":   int(bw_count > 0 and sw_count > 0),
        "many_hyphens":            int(url.count("-") >= 2),
        "domain_length":           len(domain_part),
        "has_double_extension":    int(url.count(".") >= 3),
        "gibberish_score":         gib,
        "is_gibberish":            int(gib > 0.65),
        "consonant_clusters":      len(re.findall(r'[bcdfghjklmnpqrstvwxyz]{4,}', domain_part)),
        "domain_entropy":          round(-sum((domain_part.count(c)/len(domain_part))*math.log2(domain_part.count(c)/len(domain_part)) for c in set(domain_part)), 4) if domain_part else 0,
        "very_long_domain":        int(len(domain_part) > 20),
        "no_vowels":               int(not bool(re.search(r'[aeiou]', domain_part))),
        "suspicious_word_ratio":   round(sw_count / max(len(url.split("-")), 1), 3),
        "has_known_brand":         int(bw_count > 0),
        "num_special_chars":       sum(1 for c in url if c in "@#%&=+?~"),
        "path_length":             len("/".join(url.split("/")[1:])) if "/" in url else 0,
    }

print("Extrayendo características (29 por URL)...")
X = pd.DataFrame([extract_features(u) for u in df["url"]])
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    "Random Forest": RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced", n_jobs=-1),
    "SVM":           SVC(kernel="rbf", probability=True, random_state=42, class_weight="balanced"),
    "Naive Bayes":   GaussianNB(),
}

best_model = None
best_acc   = 0
best_name  = ""

print("\n" + "="*55)
print("  COMPARACIÓN DE MODELOS — TESIS PHISHGUARD")
print("="*55)

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc   = accuracy_score(y_test, preds)
    cv    = cross_val_score(model, X, y, cv=5, n_jobs=-1).mean()
    print(f"\n  {name}")
    print(f"    Accuracy en test:       {acc*100:.2f}%")
    print(f"    Cross-validation (5k):  {cv*100:.2f}%")
    print("   ", classification_report(y_test, preds, target_names=["Legítimo","Phishing"]).replace("\n","\n    "))
    if acc > best_acc:
        best_acc = acc; best_model = model; best_name = name

os.makedirs("model", exist_ok=True)
joblib.dump(best_model,      "model/phishguard_model.pkl")
joblib.dump(list(X.columns), "model/feature_names.pkl")

print("="*55)
print(f"  MEJOR MODELO: {best_name} ({best_acc*100:.2f}%)")
print(f"  Características: {len(X.columns)}")
print(f"  Dataset: {len(df):,} URLs")
print(f"  Guardado en model/phishguard_model.pkl")
print("="*55)
print("\nReinicia la API: uvicorn api:app --reload --port 8000")
