"""
dataset_builder.py - VERSIÓN MASIVA
Genera un dataset de +10,000 URLs con patrones reales de phishing y dominios legítimos.
También intenta descargar datos reales de Phishing.Database en tiempo de ejecución.
"""
import pandas as pd
import requests
import random
import os
import re

random.seed(42)

# ── 1. DOMINIOS DE PHISHING REALES (descarga en tiempo de ejecución) ──────────
PHISHING_URLS = [
    "https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt",
    "https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-INACTIVE.txt",
]

print("Intentando descargar dominios de phishing reales...")
online_phishing = []
for url in PHISHING_URLS:
    try:
        r = requests.get(url, timeout=20)
        if r.status_code == 200:
            lines = [l.strip() for l in r.text.splitlines() if l.strip()]
            online_phishing.extend(lines)
            print(f"  ✓ {len(lines)} dominios de {url.split('/')[-1]}")
    except Exception as e:
        print(f"  ✗ No disponible: {e}")

print(f"  Total online: {len(online_phishing)} dominios de phishing reales")

# ── 2. GENERADOR DE PHISHING SINTÉTICO REALISTA ───────────────────────────────
# Basado en patrones reales documentados en investigaciones de ciberseguridad

BRANDS = [
    "paypal","amazon","apple","microsoft","google","facebook","netflix",
    "instagram","twitter","whatsapp","ebay","linkedin","spotify","tiktok",
    "snapchat","discord","telegram","roblox","steam","binance","coinbase",
    "chase","wellsfargo","bankofamerica","citibank","hsbc","santander",
    "bbva","bancolombia","nequi","daviplata","davivienda",
    "fedex","ups","dhl","usps","correos",
    "irs","gov","medicare","socialsecurity",
    "netflix","hulu","disneyplus","hbomax","primevideo",
    "airbnb","uber","lyft","doordash","rappi",
    "adobe","office365","outlook","onedrive","dropbox",
]

SUSPICIOUS = [
    "login","verify","secure","account","update","confirm","banking",
    "suspend","alert","free","winner","claim","prize","urgent","password",
    "reset","blocked","unusual","activity","security","signin","recover",
    "validate","authenticate","billing","payment","invoice","refund",
    "support","help","limited","locked","verify-now","confirm-now",
    "update-now","secure-login","account-verify","identity-confirm",
]

SUSPECT_TLDS = [
    ".xyz",".ru",".info",".tk",".ml",".ga",".cf",".gq",".top",
    ".click",".work",".loan",".win",".download",".accountant",
    ".racing",".party",".trade",".review",".science",".date",
    ".faith",".stream",".gdn",".bid",".men",".icu",".vip",
]

LEGIT_TLDS = [".com",".net",".org"]

def random_string(min_len=4, max_len=12):
    chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    return "".join(random.choices(chars, k=random.randint(min_len, max_len)))

def random_gibberish(min_len=6, max_len=16):
    """Genera strings que parecen inventados"""
    consonants = "bcdfghjklmnpqrstvwxyz"
    all_chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    # Alta proporción de consonantes para que parezca inventado
    length = random.randint(min_len, max_len)
    return "".join(random.choices(consonants if random.random() > 0.3 else all_chars, k=length))

def gen_phishing():
    """Genera una URL de phishing realista"""
    pattern = random.randint(1, 8)

    if pattern == 1:
        # marca + palabra sospechosa + TLD sospechoso
        brand = random.choice(BRANDS)
        sus   = random.choice(SUSPICIOUS)
        tld   = random.choice(SUSPECT_TLDS)
        return f"{brand}-{sus}{tld}"

    elif pattern == 2:
        # marca + número + TLD sospechoso (typosquatting)
        brand = random.choice(BRANDS)
        num   = random.randint(1, 9)
        tld   = random.choice(SUSPECT_TLDS)
        return f"{brand}{num}{tld}"

    elif pattern == 3:
        # subdominio de marca en dominio falso
        brand  = random.choice(BRANDS)
        fake   = random_string(5, 12)
        tld    = random.choice(SUSPECT_TLDS)
        return f"{brand}.{fake}{tld}"

    elif pattern == 4:
        # múltiples palabras sospechosas
        sus1 = random.choice(SUSPICIOUS)
        sus2 = random.choice(SUSPICIOUS)
        tld  = random.choice(SUSPECT_TLDS)
        return f"{sus1}-{sus2}{tld}"

    elif pattern == 5:
        # gibberish puro
        gib = random_gibberish(8, 18)
        tld = random.choice(SUSPECT_TLDS)
        return f"{gib}{tld}"

    elif pattern == 6:
        # marca con guiones y palabras
        brand = random.choice(BRANDS)
        sus   = random.choice(SUSPICIOUS)
        act   = random.choice(["now","today","here","immediately","fast"])
        tld   = random.choice(SUSPECT_TLDS)
        return f"{brand}-{sus}-{act}{tld}"

    elif pattern == 7:
        # IP address style phishing
        ip = ".".join([str(random.randint(1,254)) for _ in range(4)])
        path = random.choice(["/login","/verify","/account","/secure","/update"])
        return f"{ip}{path}"

    else:
        # URL muy larga sospechosa
        brand = random.choice(BRANDS)
        sus   = random.choice(SUSPICIOUS)
        fake  = random_string(6, 10)
        tld   = random.choice(SUSPECT_TLDS)
        path  = "/" + "-".join([random_string(3,6) for _ in range(3)])
        return f"{brand}-{sus}-{fake}{tld}{path}"

# Generar phishing sintético
print("\nGenerando phishing sintético...")
synthetic_phishing = [gen_phishing() for _ in range(8000)]
all_phishing = list(set(online_phishing + synthetic_phishing))
random.shuffle(all_phishing)
print(f"  Total phishing: {len(all_phishing)} URLs")

# ── 3. DOMINIOS LEGÍTIMOS MASIVOS ─────────────────────────────────────────────
LEGIT_BASE = [
    # Buscadores
    "google.com","bing.com","yahoo.com","duckduckgo.com","baidu.com",
    "yandex.com","ask.com","ecosia.org","startpage.com","brave.com",
    # Redes sociales
    "facebook.com","instagram.com","twitter.com","linkedin.com","tiktok.com",
    "pinterest.com","snapchat.com","reddit.com","tumblr.com","quora.com",
    "discord.com","telegram.org","whatsapp.com","signal.org","mastodon.social",
    "threads.net","vk.com","weibo.com","line.me","viber.com",
    # Google servicios
    "youtube.com","gmail.com","drive.google.com","maps.google.com",
    "play.google.com","docs.google.com","sheets.google.com","meet.google.com",
    "calendar.google.com","photos.google.com","translate.google.com",
    "news.google.com","analytics.google.com","cloud.google.com",
    "firebase.google.com","developers.google.com","support.google.com",
    # Microsoft
    "microsoft.com","outlook.com","office.com","onedrive.com",
    "teams.microsoft.com","azure.microsoft.com","xbox.com","skype.com",
    "office365.com","sharepoint.com","onenote.com","powerbi.com",
    "visualstudio.com","docs.microsoft.com","support.microsoft.com",
    # Apple
    "apple.com","icloud.com","developer.apple.com","support.apple.com",
    "music.apple.com","tv.apple.com","store.apple.com",
    # Amazon
    "amazon.com","aws.amazon.com","prime.amazon.com","music.amazon.com",
    "twitch.tv","audible.com","goodreads.com","amazon.co.uk",
    "amazon.de","amazon.es","amazon.com.br","amazon.com.mx",
    # Streaming
    "netflix.com","spotify.com","hulu.com","disneyplus.com","hbomax.com",
    "max.com","paramount.com","peacocktv.com","crunchyroll.com",
    "vimeo.com","dailymotion.com","soundcloud.com","deezer.com",
    "tidal.com","pandora.com","imdb.com","rottentomatoes.com",
    # Gaming
    "steampowered.com","epicgames.com","roblox.com","ea.com","ubisoft.com",
    "nintendo.com","playstation.com","blizzard.com","minecraft.net",
    "activision.com","rockstargames.com","leagueoflegends.com",
    # Noticias
    "cnn.com","bbc.com","nytimes.com","theguardian.com","reuters.com",
    "apnews.com","washingtonpost.com","npr.org","bloomberg.com",
    "forbes.com","techcrunch.com","theverge.com","wired.com",
    "arstechnica.com","engadget.com","gizmodo.com","vice.com",
    "economist.com","ft.com","wsj.com","usatoday.com","time.com",
    "eltiempo.com","semana.com","elespectador.com","caracol.com.co",
    "elpais.com","elmundo.es","clarin.com","infobae.com",
    "latercera.com","elcomercio.pe","milenio.com","univision.com",
    # Educación
    "wikipedia.org","coursera.org","udemy.com","edx.org","khanacademy.org",
    "mit.edu","harvard.edu","stanford.edu","w3schools.com","codecademy.com",
    "freecodecamp.org","developer.mozilla.org","docs.python.org",
    "udacity.com","pluralsight.com","skillshare.com","duolingo.com",
    "brilliant.org","chegg.com","quizlet.com","britannica.com",
    "nationalgeographic.com","ted.com","jstor.org","springer.com",
    "unal.edu.co","uceva.edu.co","uniandes.edu.co","javeriana.edu.co",
    "uis.edu.co","udea.edu.co","univalle.edu.co","utp.edu.co",
    "uninorte.edu.co","eafit.edu.co","icesi.edu.co","usb.edu.co",
    # Tech / Dev
    "stackoverflow.com","github.com","gitlab.com","bitbucket.org",
    "npmjs.com","pypi.org","docker.com","kubernetes.io","vercel.com",
    "netlify.com","heroku.com","digitalocean.com","cloudflare.com",
    "replit.com","codepen.io","codesandbox.io","railway.app",
    "linux.org","ubuntu.com","debian.org","python.org","nodejs.org",
    "reactjs.org","vuejs.org","angular.io","svelte.dev","rust-lang.org",
    "golang.org","php.net","ruby-lang.org","swift.org",
    "postgresql.org","mysql.com","mongodb.com","redis.io",
    # Compras
    "ebay.com","shopify.com","etsy.com","aliexpress.com","walmart.com",
    "target.com","bestbuy.com","costco.com","ikea.com","zara.com",
    "hm.com","asos.com","nike.com","adidas.com","mercadolibre.com",
    "falabella.com","ripley.com","exito.com","rappi.com","linio.com",
    # Finanzas
    "paypal.com","stripe.com","square.com","venmo.com","cashapp.com",
    "wise.com","revolut.com","coinbase.com","binance.com","visa.com",
    "mastercard.com","americanexpress.com","bankofamerica.com",
    "wellsfargo.com","chase.com","citibank.com","hsbc.com",
    "santander.com","bbva.com","bancolombia.com","davivienda.com",
    "nequi.com.co","bold.co","wompi.com","daviplata.com",
    # Salud
    "webmd.com","mayoclinic.org","healthline.com","nih.gov",
    "cdc.gov","who.int","paho.org","medscape.com",
    # Gobierno
    "usa.gov","gov.uk","canada.ca","europa.eu","un.org","irs.gov",
    "gov.co","presidencia.gov.co","dian.gov.co","mintic.gov.co",
    "supersalud.gov.co","registraduria.gov.co","cancilleria.gov.co",
    # Viajes
    "airbnb.com","booking.com","expedia.com","tripadvisor.com",
    "kayak.com","skyscanner.com","hotels.com","trivago.com",
    "uber.com","lyft.com","cabify.com","delta.com","united.com",
    "latam.com","avianca.com","volaris.com",
    # Herramientas
    "notion.so","slack.com","zoom.us","dropbox.com","trello.com",
    "asana.com","monday.com","figma.com","canva.com","adobe.com",
    "atlassian.com","miro.com","airtable.com","clickup.com",
    "mailchimp.com","hubspot.com","salesforce.com","zendesk.com",
    "godaddy.com","namecheap.com","cloudflare.com","protonmail.com",
    "nordvpn.com","expressvpn.com","norton.com","kaspersky.com",
    # Delivery
    "doordash.com","ubereats.com","grubhub.com","instacart.com",
    "deliveroo.com","glovo.com","ifood.com.br","pedidosya.com",
    # Otros
    "yelp.com","indeed.com","glassdoor.com","upwork.com","fiverr.com",
    "medium.com","substack.com","wordpress.com","wix.com","squarespace.com",
    "loom.com","calendly.com","typeform.com","surveymonkey.com",
]

def gen_legit_variant(domain):
    """Genera variantes realistas de dominios legítimos"""
    variants = [domain]
    base = domain.split(".")[0]
    tld  = "." + ".".join(domain.split(".")[1:])

    # Subdominio simple
    for sub in ["www","m","app","api","mail","news","blog","shop","store","help","support"]:
        variants.append(f"{sub}.{domain}")

    # Con path
    for path in ["/home","/about","/contact","/login","/signup","/pricing","/features"]:
        variants.append(f"{domain}{path}")

    return random.choice(variants)

print("Generando dominios legítimos...")
legit_variants = []
for domain in LEGIT_BASE:
    # Cada dominio genera 3-5 variantes
    for _ in range(random.randint(3, 5)):
        legit_variants.append(gen_legit_variant(domain))

legit_variants = list(set(legit_variants))
print(f"  Total legítimos: {len(legit_variants)} URLs")

# ── 4. CONSTRUIR CSV ──────────────────────────────────────────────────────────
phishing_sample = all_phishing[:min(len(all_phishing), len(legit_variants))]
legit_sample    = legit_variants[:len(phishing_sample)]

rows = []
for u in phishing_sample: rows.append({"url": u, "label": 1})
for u in legit_sample:    rows.append({"url": u, "label": 0})

df = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)

os.makedirs("data", exist_ok=True)
df.to_csv("data/dataset.csv", index=False)

print(f"\n{'='*55}")
print(f"  Dataset guardado en data/dataset.csv")
print(f"  Total:     {len(df):,} filas")
print(f"  Phishing:  {df['label'].sum():,}")
print(f"  Legítimos: {len(df) - df['label'].sum():,}")
print(f"{'='*55}")
print("\nAhora ejecuta: python train_model.py")
