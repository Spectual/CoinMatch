# 🪙 Coin Metadata Schema

This document defines the **metadata structure for each coin record** in the CoinMatch system.  
Each field describes the identifying, visual, textual, and provenance information of a coin,  
and can be used in both backend databases and frontend displays.

---

## 1️⃣ Field Definitions

| Field | Type | Description | Example |
|--------|------|-------------|----------|
| **coin_id** | `string` | Unique identifier (UUID or primary key) | `1b5f4d3a-91c8-4e20-93aa-7f39d2e7dca1` |
| **mint** | `string` | Minting city or region | `Tarentum` |
| **authority** | `string` | Issuing authority or ruler | `Pyrrhus of Epirus` |
| **date_range** | `string` | Approximate date range of issue | `circa 281–272 BC` |
| **denomination** | `string` | Monetary denomination | `Drachm` |
| **metal** | `string` | Metal composition (AR = silver, AE = bronze, AV = gold, etc.) | `AR (Silver)` |
| **weight** | `float` | Weight in grams | `3.23` |
| **diameter** | `float` | Diameter in millimeters | `18.0` |
| **die_axis** | `string` | Die alignment (e.g., “6h”, “12h”) | `6h` |
| **obverse_description** | `string` | Description of the obverse design | `Head of Athena right, wearing Attic helmet decorated with Scylla.` |
| **reverse_description** | `string` | Description of the reverse design | `Owl standing right on olive branch, head facing; legend ΤΑΡ, ΖΟΡ in field.` |
| **obverse_inscription** | `string` | Transcribed inscription on obverse | *(none)* |
| **reverse_inscription** | `string` | Transcribed inscription on reverse | `ΤΑΡ, ΖΟΡ` |
| **monograms** | `string` | Monograms or engraver’s marks | `ΖΟΡ` |
| **reference_list** | `string` | Bibliographic or catalog references | `Vlasto 1049; HN Italy 975; HGC 1, 822` |
| **catalog_number** | `string` | Museum or collection inventory number | `HAM 1972.45.21` |
| **source_database** | `string` | Originating database or publication | `CoinArchive` |
| **provenance_text** | `string` | Full provenance chain | `Ex Stack's 19 June 1969, 15; Auctiones AG 23, 1993, 256; Gorny & Mosch 265, 2019, 44.` |
| **previous_owners** | `string` | Names of previous collectors (semicolon separated) | `Hyla H. Troxell; Fred V. Fowler` |
| **auction_history** | `string / JSON` | Structured auction history | `[{"house":"Stack's","year":1969,"lot":15},{"house":"Gorny & Mosch","year":2019,"lot":44}]` |
| **estimate_value** | `string` | Auction estimate with currency | `300 CHF` |
| **sale_price** | `string` | Realized sale price (if known) | `320 CHF` |
| **obverse_image_url** | `string` | URL of obverse image | `https://media.coinarchives.com/85e4f5e9872c4b0a568c866ac2175cad/img/nac/autumn2025/image02017.jpg` |
| **reverse_image_url** | `string` | URL of reverse image | `https://media.coinarchives.com/85e4f5e9872c4b0a568c866ac2175cad/img/nac/autumn2025/image02017.jpg` |
| **lot_description_raw** | `string` | Original auction lot text | `Calabria, Tarentum. Drachm circa 281–272 BC...` |
| **lot_description_EN** | `string` | Original auction lot text in English | `Calabria, Tarentum. Drachm circa 281–272 BC...` |
| **created_at** | `datetime` | Record creation timestamp | `2025-10-27T10:20:00Z` |
| **updated_at** | `datetime` | Last modification timestamp | `2025-10-27T10:30:00Z` |
| **source_type** | `string` | Data source type (e.g., `auction`, `museum`, `literature`) | `auction` |

---

## 2️⃣ Example Entry

```json
{
  "coin_id": "1b5f4d3a-91c8-4e20-93aa-7f39d2e7dca1",
  "mint": "Tarentum",
  "authority": "Pyrrhus of Epirus",
  "date_range": "circa 281–272 BC",
  "denomination": "Drachm",
  "metal": "AR (Silver)",
  "weight": 3.23,
  "diameter": 18.0,
  "die_axis": "6h",
  "obverse_description": "Head of Athena right, wearing Attic helmet decorated with Scylla.",
  "reverse_description": "Owl standing right on olive branch, head facing; legend ΤΑΡ, ΖΟΡ in field.",
  "obverse_inscription": "",
  "reverse_inscription": "ΤΑΡ, ΖΟΡ",
  "monograms": "ΖΟΡ",
  "reference_list": "Vlasto 1049; HN Italy 975; HGC 1, 822",
  "catalog_number": "HAM 1972.45.21",
  "source_database": "Nomisma",
  "provenance_text": "Ex Stack's 19 June 1969, 15; Auctiones AG 23, 1993, 256; Gorny & Mosch 265, 2019, 44.",
  "previous_owners": "Hyla H. Troxell; Fred V. Fowler",
  "auction_history": [
    {"house": "Stack's", "year": 1969, "lot": 15},
    {"house": "Auctiones AG", "year": 1993, "lot": 256},
    {"house": "Gorny & Mosch", "year": 2019, "lot": 44}
  ],
  "estimate_value": "300 CHF",
  "sale_price": "",
  "obverse_image_url": "https://coinmatch.org/images/obv_1b5f4d3a.jpg",
  "reverse_image_url": "https://coinmatch.org/images/rev_1b5f4d3a.jpg",
  "lot_description_raw": "Calabria, Tarentum. Drachm circa 281–272 BC, AR, 18 mm, 3.23 g. Head of Athena r., wearing Attic helmet decorated with Scylla. Rev. ΤΑΡ Owl standing r. on olive branch, head facing; in r. field, ΖΟΡ. Vlasto 1049 (this reverse die). Historia Numorum Italy 975. HGC 1, 822. Struck on a very broad flan and with an attractive old cabinet tone. Good very fine. Ex Stack's 19 June 1969, 15; Auctiones AG 23, 1993, 256 and Gorny & Mosch 265, 2019, 44 sales. From the Hyla H. Troxell and Fred V. Fowler collections. Estimate: 300 CHF.",
  "lot_description_EN": "Calabria, Tarentum. Drachm circa 281–272 BC, AR, 18 mm, 3.23 g. Head of Athena r., wearing Attic helmet decorated with Scylla. Rev. ΤΑΡ Owl standing r. on olive branch, head facing; in r. field, ΖΟΡ. Vlasto 1049 (this reverse die). Historia Numorum Italy 975. HGC 1, 822. Struck on a very broad flan and with an attractive old cabinet tone. Good very fine. Ex Stack's 19 June 1969, 15; Auctiones AG 23, 1993, 256 and Gorny & Mosch 265, 2019, 44 sales. From the Hyla H. Troxell and Fred V. Fowler collections. Estimate: 300 CHF.",
  "created_at": "2025-10-27T10:20:00Z",
  "updated_at": "2025-10-27T10:30:00Z",
  "source_type": "auction"
}
```

---

## 3️⃣ Notes

- Empty or missing fields should be set to `""` or `null`.
- Use ISO-8601 format for dates (`YYYY-MM-DDThh:mm:ssZ`).
- For multilingual lots, store raw text in `lot_description_raw` and normalized English in `lot_description_EN`.
- `auction_history` can be a JSON array or a serialized string depending on storage format.
- Fields are designed to support:  
  - 🔍 text & image search  
  - 🧭 provenance tracking  
  - 🧠 machine-learning feature extraction  
  - 💬 multilingual lot parsing

---

**Document version:** 1.0  
**Last updated:** 2025-10-27  
**Maintainer:** Yifei Bao
