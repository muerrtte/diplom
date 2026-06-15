import json

fixes = {
    10: "1715711169869-148ad11c6e30",   # Puma Velocity Nitro — from "puma nitro running"
    22: "1700853010051-dce31802dafc",   # Adidas Gazelle Indoor — from "adidas gazelle shoe"
    33: "1593287073863-c992914cb3e3",   # Adidas Harden Vol.8 — from "adidas basketball shoe"
    35: "1635770997862-2b93a75f4856",   # Nike KD 17 — from "nike kd basketball shoe"
    41: "1605408499391-6368c628ef42",   # Nike Metcon 9 — from "nike metcon crossfit"
}

with open("db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

for p in db["products"]:
    pid = p["id"]
    if pid in fixes:
        p["image"] = f"https://images.unsplash.com/photo-{fixes[pid]}?w=600&q=80"
        print(f"[{pid}] {p['name']} -> {p['image']}")

with open("db.json", "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Done.")
