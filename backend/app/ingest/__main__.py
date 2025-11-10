from app.db.session import session_scope
from app.services.ingest import fetch_museum_coins, fetch_online_coins, upsert_museum_coins, upsert_online_coins


def main() -> None:
    museum_data = fetch_museum_coins()
    online_data = fetch_online_coins()
    with session_scope() as session:
        museum_count = upsert_museum_coins(session, museum_data)
        online_count = upsert_online_coins(session, online_data)
        print(f"Synced {museum_count} museum coin(s) and {online_count} online coin(s).")


if __name__ == "__main__":
    main()

