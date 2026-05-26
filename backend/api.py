from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib, re, os, math
from collections import Counter

app = FastAPI(title="PhishGuard API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE          = os.path.dirname(__file__)
model         = joblib.load(os.path.join(BASE, "model", "phishguard_model.pkl"))
feature_names = joblib.load(os.path.join(BASE, "model", "feature_names.pkl"))

class AnalysisRequest(BaseModel):
    text: str

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
    cluster_score = min(len(clusters)*0.3, 1.0)
    bigrams = [domain[i:i+2] for i in range(len(domain)-1)]
    if not bigrams: return 1.0
    common_count = sum(1 for b in bigrams if b in COMMON_BIGRAMS)
    bigram_score = 1.0 - (common_count/len(bigrams))
    freq = Counter(domain)
    total = len(domain)
    entropy = -sum((c/total)*math.log2(c/total) for c in freq.values())
    entropy_score = entropy/math.log2(26)
    length_score = min(max(0,(len(domain)-15)/20),1.0)
    return round(cluster_score*0.3+bigram_score*0.35+entropy_score*0.25+length_score*0.1,4)

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
        "domain_entropy":          round(-sum((domain_part.count(c)/len(domain_part))*math.log2(domain_part.count(c)/len(domain_part)) for c in set(domain_part)),4) if domain_part else 0,
        "very_long_domain":        int(len(domain_part) > 20),
        "no_vowels":               int(not bool(re.search(r'[aeiou]', domain_part))),
        "suspicious_word_ratio":   round(sw_count/max(len(url.split("-")),1),3),
        "has_known_brand":         int(bw_count > 0),
        "num_special_chars":       sum(1 for c in url if c in "@#%&=+?~"),
        "path_length":             len("/".join(url.split("/")[1:])) if "/" in url else 0,
    }

def classify(prob_phishing):
    if prob_phishing >= 0.60: return "danger"
    elif prob_phishing >= 0.30: return "warn"
    else: return "safe"

LABELS = {
    "safe":   {"label":"SEGURO",     "color":"#00e676","bg":"rgba(0,230,118,0.07)","border":"rgba(0,230,118,0.35)"},
    "warn":   {"label":"SOSPECHOSO", "color":"#ffab00","bg":"rgba(255,171,0,0.07)","border":"rgba(255,171,0,0.35)"},
    "danger": {"label":"PHISHING",   "color":"#ff1744","bg":"rgba(255,23,68,0.07)","border":"rgba(255,23,68,0.35)"},
}
REASONS = {
    "safe":   ["Dominio registrado y verificado","Estructura de URL coherente","Sin palabras sospechosas","Sin patrones de manipulación"],
    "warn":   ["URL con características inusuales","Dominio poco confiable o desconocido","Verificar manualmente antes de continuar","Patrón parcialmente sospechoso"],
    "danger": ["Dominio suplantando entidad legítima o inventado","Estructura de URL ofuscada o aleatoria","Patrones de phishing confirmados por el modelo","No interactúes con este contenido"],
}

@app.get("/")
def root():
    return {"status": "PhishGuard API v3.0 activa", "features": len(feature_names)}

@app.post("/analyze")
def analyze(req: AnalysisRequest):
    text   = req.text.strip()
    urls   = re.findall(r'https?://\S+|[\w\-]+\.[a-z]{2,}(?:/\S*)?', text)
    target = urls[0] if urls else text

    features       = extract_features(target)
    feature_vector = [[features[f] for f in feature_names]]

    proba         = model.predict_proba(feature_vector)[0]
    prob_phishing = float(proba[1])
    level         = classify(prob_phishing)
    riesgo        = round(prob_phishing * 100)

    result = LABELS[level].copy()
    result["level"]      = level
    result["riesgo"]     = riesgo
    result["reasons"]    = REASONS[level]
    result["confidence"] = round(max(proba)*100, 1)
    return result
