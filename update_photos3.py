import json

# All photos from flat lay / product photography / white background searches
# These are product-only shots without people
photo_map = {
    # Running (1-15) — from "sneakers flat lay" search
    1:  "photo-1512566793746-0f89bfe3cd06",
    2:  "photo-1494496195158-c3becb4f2475",
    3:  "photo-1595909315417-2edd382a56dc",
    4:  "photo-1731936757642-09bccaf8b495",
    5:  "photo-1770331168812-06a793129c16",
    6:  "photo-1544441892-83af2e53ea48",
    7:  "photo-1574859154521-4f7aa07d91b9",
    8:  "photo-1511556820780-d912e42b4980",
    9:  "photo-1645784127380-77aeb81be500",
    10: "photo-1640391846040-6e9e41388ad4",
    11: "photo-1608384177866-0bca0d225435",
    12: "photo-1685209088330-21627ef4371f",
    13: "photo-1597159497746-e725a4c445c4",
    14: "photo-1670966142541-706b0942c9b9",
    15: "photo-1564518125914-014ebd5f0346",

    # Casual (16-30) — from "shoe product photography" search
    16: "photo-1560769629-975ec94e6a86",
    17: "photo-1603808033192-082d6919d3e1",
    18: "photo-1543163521-1bf539c55dd2",
    19: "photo-1560343090-f0409e92791a",
    20: "photo-1603808033176-9d134e6f2c74",
    21: "photo-1604671801908-6f0c6a092c05",
    22: "photo-1626947346165-4c2288dadc2a",
    23: "photo-1603191659812-ee978eeeef76",
    24: "photo-1533867617858-e7b97e060509",
    25: "photo-1603808033587-935942847de4",
    26: "photo-1631087606988-a6be38fccaf6",
    27: "photo-1616696038562-574c18066055",
    28: "photo-1571859856639-d54ab2c18ba0",
    29: "photo-1626947346194-1c926eff4066",
    30: "photo-1603808033596-5d1fa1629eae",

    # Basketball (31-40) — from "adidas shoes white background" search
    31: "photo-1610664676282-55c8de64f746",
    32: "photo-1610664676996-84b489284b95",
    33: "photo-1666426303293-5a7157beab2d",
    34: "photo-1642769512179-0a0a1edce4af",
    35: "photo-1601929131351-21b36fcd49be",
    36: "photo-1565058534324-d0dd9f0fc3ad",
    37: "photo-1777339862772-d6d3ed390efa",
    38: "photo-1665837443141-2008dfd2ab7b",
    39: "photo-1588416681455-3f2ba669371d",
    40: "photo-1542291026-7eec264c27ff",

    # Training (41-50) — from "nike shoes product" search (product shots)
    41: "photo-1606107557195-0e29a4b5b4aa",
    42: "photo-1600185365483-26d7a4cc7519",
    43: "photo-1600185365926-3a2ce3cdb9eb",
    44: "photo-1600185365778-7875a359b924",
    45: "photo-1608541737042-87a12275d313",
    46: "photo-1605348532760-6753d2c43329",
    47: "photo-1552346154-21d32810aba3",
    48: "photo-1491553895911-0055eca6402d",
    49: "photo-1600269452121-4f2416e55c28",
    50: "photo-1615290642882-6b9501729a27",
}

with open("db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

updated = 0
for product in db["products"]:
    pid = product["id"]
    if pid in photo_map:
        product["image"] = f"https://images.unsplash.com/{photo_map[pid]}?w=600&q=80"
        updated += 1

with open("db.json", "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"Updated {updated} products.")
