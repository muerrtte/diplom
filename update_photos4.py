import json

# Photo assignments based on specific model searches on Unsplash.
# ★ = confirmed from dedicated model search (e.g., "nike air force 1" → AF1 photo)
# B = brand-appropriate photo from brand-specific search
photo_map = {
    # === RUNNING (1-15) ===
    1:  "1542291026-7eec264c27ff",    # Nike Pegasus 40 — Nike running shoe (orange, from Nike shoe search) ★
    2:  "1580902394724-b08ff9ba7e8a",  # Adidas Ultraboost 23 — from Ultraboost search ★
    3:  "1621315271772-28b1f3a5df87",  # NB Fresh Foam 1080 — from NB product search (B)
    4:  "1575456456278-936c89ccdb7b",  # Asics Gel-Kayano 30 — from Asics search ★
    5:  "1584539696499-bff0b4768e4e",  # Saucony Triumph 21 — performance running (Asics search, B)
    6:  "1676767720609-c76265fb3074",  # Hoka Clifton 9 — from Hoka search ★
    7:  "1602560915003-3688d3497962",  # Brooks Ghost 15 — from Brooks search ★
    8:  "1600185365483-26d7a4cc7519",  # Nike React Infinity Run 4 — Nike shoe (B)
    9:  "1596182883210-b7d32c0344a0",  # Asics Gel-Nimbus 25 — from Asics search ★
    10: "1589178698655-a3153b64e8fa",  # Puma Velocity Nitro 3 — from Puma running search ★
    11: "1676767728793-a16c722eb2ca",  # Saucony Kinvara 14 — colorful running, Hoka search (B)
    12: "1635770997779-8ec3396088a5",  # UA HOVR Phantom 3 — from UA training search (B)
    13: "1691067951700-138ca8f4841f",  # Adidas Solar Glide 6 — Adidas running, Ultraboost search (B)
    14: "1600185365926-3a2ce3cdb9eb",  # Nike Zoom Structure 25 — Nike shoe (B)
    15: "1559745206-ca4056293ddc",     # NB 860v14 — from NB product search (B)

    # === CASUAL (16-30) ===
    16: "1595950653106-6c9ebd614d3a",  # Nike Air Force 1 — from AF1 search ★★
    17: "1544441892-794166f1e3be",     # Adidas Stan Smith — from Stan Smith search ★★
    18: "1551107696-a4b0c5a0d9a2",    # NB 574 Legacy — from NB product search (B)
    19: "1572601809155-8a9f3191b2d9",  # Converse Chuck Taylor — from Chuck Taylor search ★★
    20: "1589312866743-e043e4a6e2b9",  # Vans Old Skool — from Old Skool search ★★
    21: "1615290642882-6b9501729a27",  # Nike Dunk Low — from Dunk Low search ★★
    22: "1557818249-72a26ef9814d",     # Adidas Gazelle — Adidas classic shoe, Stan Smith search (B)
    23: "1665517464780-ab4f42d8af95",  # NB 550 — from NB 550 search ★
    24: "1626298038175-e9f383124e1f",  # Puma Suede Classic — from Puma Suede search ★★
    25: "1580977252013-f5d20c3303ae",  # Reebok Club C 85 — from Reebok search (B)
    26: "1620794341491-76be6eeb6946",  # Adidas Forum Low — from Forum Low search ★★
    27: "1603994457622-63687030478a",  # Vans Sk8-Hi — from Vans search (B)
    28: "1610630879511-3f6a23c19a02",  # NB 9060 — from NB product search (B)
    29: "1680254418556-3980c19d4304",  # Puma RS-X — from Puma search (B)
    30: "1577184474979-ec0f715605a7",  # Nike Cortez — from Cortez search ★★

    # === BASKETBALL (31-40) ===
    31: "1695748966450-3abe5c25b481",  # Air Jordan 1 Retro — from AJ1 search ★★
    32: "1656944227421-416b1d2186c9",  # Nike LeBron 21 — Nike basketball, from AJ1 search (B)
    33: "1580902394857-0b40c534dc71",  # Adidas Harden Vol. 8 — Adidas from Ultraboost search (B)
    34: "1597045566677-8cf032ed6634",  # Air Jordan 4 — Nike/Jordan shoe from AF1 search (B)
    35: "1706879349357-f17b91de99a5",  # Nike KD 17 — from Nike product search (B)
    36: "1610945102998-749b4a3d798c",  # Adidas Dame 9 — Adidas from Ultraboost search (B)
    37: "1680254418818-0d9f606e035e",  # Puma MB.03 — from Puma Suede search (B)
    38: "1661324257527-ce9379163e1b",  # Air Jordan 11 — from AJ1 search (close match) ★
    39: "1604726923839-606d2f0e0870",  # UA Curry 11 — from UA Curry basketball search ★★
    40: "1530511250146-026c208e059e",  # Nike Kyrie Infinity 2 — Nike basketball (B)

    # === TRAINING (41-50) ===
    41: "1485395037613-e83d5c1f5290",  # Nike Metcon 9 — from Nike basketball search (B)
    42: "1580977251946-c5f692a4db0d",  # Reebok Nano X4 — from Reebok search (B)
    43: "1546200843-d3a4e1e0103d",     # Adidas Dropset 3 — Adidas from Ultraboost search (B)
    44: "1680254418652-7ffe87e6955a",  # Puma Fuse 3.0 — from Puma Suede search (B)
    45: "1707679950570-633e3fab0ac3",  # UA TriBase Reign 6 — from UA training search (B)
    46: "1656164603279-b989e21168ba",  # Nike Free Metcon 6 — from Nike basketball search (B)
    47: "1623018996682-717d5c453907",  # Adidas Powerlift 5 — Adidas from Ultraboost search (B)
    48: "1602487790202-27a673875ef7",  # NB Minimus 40 — from NB product search (B)
    49: "1582740510910-388f37f9d4b6",  # Reebok Lifter PR 2.0 — from Reebok training search (B)
    50: "1605348532760-6753d2c43329",  # Nike React Metcon Turbo 2 — Nike from Nike search (B)
}

with open("db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

updated = 0
for product in db["products"]:
    pid = product["id"]
    if pid in photo_map:
        product["image"] = f"https://images.unsplash.com/photo-{photo_map[pid]}?w=600&q=80"
        updated += 1

with open("db.json", "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"Updated {updated} products.")
for p in db["products"]:
    pid = p["id"]
    if pid in photo_map:
        mark = "★★" if photo_map[pid] in [
            "1542291026-7eec264c27ff","1580902394724-b08ff9ba7e8a",
            "1575456456278-936c89ccdb7b","1676767720609-c76265fb3074",
            "1602560915003-3688d3497962","1596182883210-b7d32c0344a0",
            "1589178698655-a3153b64e8fa","1595950653106-6c9ebd614d3a",
            "1544441892-794166f1e3be","1572601809155-8a9f3191b2d9",
            "1589312866743-e043e4a6e2b9","1615290642882-6b9501729a27",
            "1626298038175-e9f383124e1f","1620794341491-76be6eeb6946",
            "1577184474979-ec0f715605a7","1695748966450-3abe5c25b481",
            "1604726923839-606d2f0e0870","1580977252013-f5d20c3303ae",
        ] else "  "
        print(f"  {mark} [{pid:2}] {p['name']:30} {p['brand']:15} {p['image']}")
