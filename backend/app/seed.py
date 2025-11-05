import json

from app.db.base import Base
from app.db.session import engine, session_scope
from app.models import CandidateListing, MatchRecord, MuseumCoin, User
from app.services.auth import hash_password


def seed_users():
    with session_scope() as session:
        if session.query(User).count() == 0:
            user = User(
                name="Dr. Laure Marest",
                email="laure_marest@harvard.edu",
                password_hash=hash_password("coinmatch123")
            )
            session.add(user)


def seed_coins():
    coins = [
        {
            "coin_id": "coin-4224",
            "mint": "Tarentum",
            "authority": "Pyrrhus of Epirus",
            "date_range": "circa 281–272 BC",
            "denomination": "Didrachm",
            "metal": "AR (Silver)",
            "weight": 7.62,
            "diameter": 21.3,
            "die_axis": "6h",
            "obverse_description": "Youth on horseback right, crowning horse; Nike flying left above with wreath.",
            "reverse_description": "Taras astride dolphin left, holding trident and kantharos; legend ΤΑΡΑΣ.",
            "reverse_inscription": "ΤΑΡΑΣ",
            "monograms": "Θ",
            "reference_list": "Vlasto 807; Fischer-Bossert 969; HGC 1, 839",
            "catalog_number": "HAM Dewing 4224",
            "source_database": "Dewing Catalogue",
            "provenance_text": "Harvard Art Museums, ex Dewing Collection; possibly ex CNG Triton XXVII, Lot 112 (2024).",
            "previous_owners": "Henry P. Kendall; Walter E. Dewing",
            "auction_history": json.dumps([
                {"house": "CNG", "sale": "Triton XXVII", "date": "2024-01-15", "lot": "112", "price_realized": "$1,440"}
            ]),
            "estimate_value": "$1,200–$1,500",
            "obverse_image_key": "https://placehold.co/400x400?text=Obverse+4224",
            "reverse_image_key": "https://placehold.co/400x400?text=Reverse+4224",
            "lot_description_raw": "Calabria, Tarentum. Silver didrachm with youth on horseback obv. Taras on dolphin rev.",
            "lot_description_en": "Calabria, Tarentum. Didrachm, youth on horseback / Taras riding dolphin.",
            "source_type": "museum"
        },
        {
            "coin_id": "coin-1783",
            "mint": "Antioch on the Orontes",
            "authority": "Antiochus IV Epiphanes",
            "date_range": "175–164 BC",
            "denomination": "Tetrassarion",
            "metal": "AE (Bronze)",
            "weight": 13.45,
            "diameter": 27.1,
            "die_axis": "12h",
            "obverse_description": "Helmeted head of Athena right, wearing crested Corinthian helmet.",
            "reverse_description": "Apollo seated left on omphalos, holding arrow and resting hand on bow; legend ΒΑΣΙΛΕΩΣ ΑΝΤΙΟΧΟΥ.",
            "reverse_inscription": "ΒΑΣΙΛΕΩΣ ΑΝΤΙΟΧΟΥ ΘΕΟΥ ΕΠΙΦΑΝΟΥΣ",
            "monograms": "Μ",
            "reference_list": "SC 1385; HGC 9, 694",
            "catalog_number": "HAM Dewing 1783",
            "source_database": "Dewing Catalogue",
            "provenance_text": "Recorded missing since 1973 inventory; likely sold in NAC 128, Lot 54 (2023).",
            "previous_owners": "Charles T. Seltman",
            "auction_history": json.dumps([
                {"house": "NAC", "sale": "128", "date": "2023-11-02", "lot": "54", "price_realized": "CHF 520"}
            ]),
            "estimate_value": "CHF 450–600",
            "obverse_image_key": "https://placehold.co/400x400?text=Obverse+1783",
            "reverse_image_key": "https://placehold.co/400x400?text=Reverse+1783",
            "lot_description_raw": "Seleucid Kingdom, Antiochus IV. AE tetrassarion; Athena / Apollo on omphalos.",
            "lot_description_en": "Seleucid Kingdom. Antiochus IV Epiphanes bronze tetrassarion from Antioch.",
            "source_type": "museum"
        },
        {
            "coin_id": "coin-0512",
            "mint": "Alexandria",
            "authority": "Ptolemy I Soter",
            "date_range": "305–283 BC",
            "denomination": "Stater",
            "metal": "AV (Gold)",
            "weight": 8.56,
            "diameter": 18.2,
            "die_axis": "11h",
            "obverse_description": "Diademed head of Ptolemy I right, wearing aegis.",
            "reverse_description": "Athena Alkidemos standing left, brandishing spear and holding shield; eagle on thunderbolt in field.",
            "reverse_inscription": "ΑΛΕΞΑΝΔΡΟΥ",
            "monograms": "ΔΙ",
            "reference_list": "Svoronos 187; CPE 79",
            "catalog_number": "HAM Dewing 512",
            "source_database": "Dewing Catalogue",
            "provenance_text": "Believed missing during 1952 renovation; potential match in Roma Numismatics E-Sale 103, Lot 256.",
            "previous_owners": "Harvard Art Museums",
            "auction_history": json.dumps([
                {"house": "Roma Numismatics", "sale": "E-Sale 103", "date": "2024-02-20", "lot": "256", "price_realized": "£5,800"}
            ]),
            "estimate_value": "£5,500–£6,500",
            "obverse_image_key": "https://placehold.co/400x400?text=Obverse+512",
            "reverse_image_key": "https://placehold.co/400x400?text=Reverse+512",
            "lot_description_raw": "Ptolemaic Kingdom. AV stater of Ptolemy I with diademed head / Athena Alkidemos.",
            "lot_description_en": "Ptolemaic gold stater, Alexandria mint, Athena Alkidemos reverse.",
            "source_type": "museum"
        }
    ]

    with session_scope() as session:
        for coin_data in coins:
            if session.query(MuseumCoin).filter(MuseumCoin.coin_id == coin_data["coin_id"]).first():
                continue
            session.add(MuseumCoin(**coin_data))


def seed_candidates():
    candidates = [
        {
            "id": "cand-901",
            "museum_coin_id": "coin-4224",
            "similarity_score": 0.87,
            "listing_reference": "CNG Triton XXVII, Lot 112",
            "sale_date": "2024-01-15",
            "estimate_value": "$1,200–$1,500",
            "sale_price": "$1,440",
            "listing_url": "https://www.cngcoins.com/Coin.aspx?ID=tritonxxvii-lot112",
            "metadata_json": json.dumps({
                "coin_id": "cand-901",
                "mint": "Tarentum",
                "authority": "Pyrrhus of Epirus",
                "denomination": "Didrachm",
                "metal": "AR (Silver)",
                "weight": 7.58,
                "diameter": 21.1,
                "die_axis": "6h",
                "obverse_description": "Youth on horseback right, Nike above with wreath.",
                "reverse_description": "Taras riding dolphin left, holds trident and kantharos.",
                "obverse_image_url": "https://placehold.co/400x400?text=CNG+Obverse+112",
                "reverse_image_url": "https://placehold.co/400x400?text=CNG+Reverse+112"
            })
        },
        {
            "id": "cand-655",
            "museum_coin_id": "coin-1783",
            "similarity_score": 0.81,
            "listing_reference": "NAC 128, Lot 54",
            "sale_date": "2023-11-02",
            "estimate_value": "CHF 450–600",
            "sale_price": "CHF 520",
            "listing_url": "https://www.arsclassicacoins.com/auction/nac-128-lot-54",
            "metadata_json": json.dumps({
                "coin_id": "cand-655",
                "mint": "Antioch on the Orontes",
                "authority": "Antiochus IV Epiphanes",
                "denomination": "Tetrassarion",
                "metal": "AE (Bronze)",
                "weight": 13.31,
                "diameter": 27.4,
                "die_axis": "12h",
                "obverse_description": "Helmeted head of Athena right.",
                "reverse_description": "Apollo seated left on omphalos, holding arrow and resting on bow.",
                "obverse_image_url": "https://placehold.co/400x400?text=NAC+Obverse+54",
                "reverse_image_url": "https://placehold.co/400x400?text=NAC+Reverse+54"
            })
        },
        {
            "id": "cand-712",
            "museum_coin_id": "coin-0512",
            "similarity_score": 0.79,
            "listing_reference": "Roma Numismatics E-Sale 103, Lot 256",
            "sale_date": "2024-02-20",
            "estimate_value": "£5,500–£6,500",
            "sale_price": "£5,800",
            "listing_url": "https://romanumismatics.com/roma-e-sale-103-lot-256",
            "metadata_json": json.dumps({
                "coin_id": "cand-712",
                "mint": "Alexandria",
                "authority": "Ptolemy I Soter",
                "denomination": "Stater",
                "metal": "AV (Gold)",
                "weight": 8.51,
                "diameter": 18.1,
                "die_axis": "11h",
                "obverse_description": "Diademed head of Ptolemy I right wearing aegis.",
                "reverse_description": "Athena Alkidemos advancing left with spear and shield; eagle on thunderbolt in field.",
                "obverse_image_url": "https://placehold.co/400x400?text=Roma+Obverse+256",
                "reverse_image_url": "https://placehold.co/400x400?text=Roma+Reverse+256"
            })
        }
    ]

    with session_scope() as session:
        for candidate_data in candidates:
            if session.query(CandidateListing).filter(CandidateListing.id == candidate_data["id"]).first():
                continue
            session.add(CandidateListing(**candidate_data))


def seed_matches():
    with session_scope() as session:
        if session.query(MatchRecord).count() > 0:
            return
        session.add_all([
            MatchRecord(
                museum_coin_id="coin-4224",
                candidate_id="cand-901",
                similarity_score=0.87,
                status="Confirmed",
                notes="Reverse die matches Dewing plate.",
                source="CNG Triton XXVII"
            ),
            MatchRecord(
                museum_coin_id="coin-1783",
                candidate_id="cand-655",
                similarity_score=0.81,
                status="Pending",
                notes="Need to confirm monogram detail.",
                source="NAC 128"
            ),
            MatchRecord(
                museum_coin_id="coin-0512",
                candidate_id="cand-712",
                similarity_score=0.79,
                status="Rejected",
                notes="Reverse legend differs from record.",
                source="Roma Numismatics E-Sale 103"
            )
        ])


def main():
    Base.metadata.create_all(bind=engine)
    seed_users()
    seed_coins()
    seed_candidates()
    seed_matches()
    print("Seed data loaded.")


if __name__ == "__main__":
    main()

