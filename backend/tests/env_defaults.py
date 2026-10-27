"""Default env vars for tests. Imported first by conftest.py so that
`app.main`'s module-level `Settings()` can load under pytest. Dummy values:
nothing connects to Postgres or a provider in P0.
"""

import os

# Tests always run against the dedicated LOCAL test cluster
# (outmate_test @ 127.0.0.1:5433 — initdb'd under backend/.testdb), never the
# dev/prod DATABASE_URL from backend/.env. CI may point TEST_DATABASE_URL at
# its own Postgres.
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres@127.0.0.1:5433/outmate_test",
)
os.environ.setdefault("EXA_API_KEY", "test-exa-key")
os.environ.setdefault("MOLTSETS_API_KEY", "test-moltsets-key")
