#!/usr/bin/env python3
import json, sys, math, re, random, string

COMMON_PASSWORDS = {
    "password", "123456", "password1", "12345678", "qwerty", "abc123",
    "monkey", "letmein", "trustno1", "dragon", "iloveyou", "master",
    "passw0rd", "shadow", "123123", "superman", "football", "password123",
    "admin", "welcome", "login", "starwars", "hello", "12345", ...
}

SPECIAL_CHARS = "!@#$%^&*()-_=+[]{}|;:',.<>?/`~\""

def calculate_entropy(password):
    charset_size = 0
    if re.search(r"[a-z]", password): charset_size += 26
    if re.search(r"[A-Z]", password): charset_size += 26
    if re.search(r"\d", password):    charset_size += 10
    if re.search(r"[!@#$%^&*...]", password): charset_size += 32
    return len(password) * math.log2(charset_size) if charset_size else 0.0

def estimate_crack_time(entropy):
    seconds = (2 ** entropy) / 1e10   # 10 billion guesses/sec
    if seconds < 1:         return "Instantly"
    elif seconds < 60:      return f"{int(seconds)} seconds"
    elif seconds < 3600:    return f"{int(seconds/60)} minutes"
    elif seconds < 86400:   return f"{int(seconds/3600)} hours"
    elif seconds < 31536000: return f"{int(seconds/86400)} days"
    else:                   return "Millions of years"

def analyze_password(password):
    checks = {
        "hasLength":    len(password) >= 8,
        "hasUppercase": bool(re.search(r"[A-Z]", password)),
        "hasLowercase": bool(re.search(r"[a-z]", password)),
        "hasNumbers":   bool(re.search(r"\d", password)),
        "hasSpecial":   bool(re.search(r"[!@#$%...]", password)),
        "notCommon":    password.lower() not in COMMON_PASSWORDS,
        "hasGoodLength": len(password) >= 12,
    }
    # scoring, labels, suggestions...
    return { "score": score, "label": label, "entropy": ..., "color": ...,
             "checks": checks, "suggestions": [...], "crackTime": ... }

def generate_password(length, include_uppercase, include_lowercase,
                      include_numbers, include_special):
    pool, required = "", []
    if include_lowercase: pool += string.ascii_lowercase; required.append(random.choice(string.ascii_lowercase))
    if include_uppercase: pool += string.ascii_uppercase; required.append(random.choice(string.ascii_uppercase))
    if include_numbers:   pool += string.digits;          required.append(random.choice(string.digits))
    if include_special:   pool += SPECIAL_CHARS;          required.append(random.choice(SPECIAL_CHARS))
    rest = [random.choice(pool) for _ in range(length - len(required))]
    all_chars = required + rest
    random.shuffle(all_chars)
    password = "".join(all_chars)
    return { "password": password, "analysis": analyze_password(password) }

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    if data.get("action") == "generate":
        result = generate_password(data["length"], ...)
    else:
        result = analyze_password(data.get("password", ""))
    print(json.dumps(result))
