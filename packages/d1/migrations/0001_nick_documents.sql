CREATE TABLE nick_documents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  key TEXT,
  schema_version INTEGER NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (type, key)
);

CREATE INDEX nick_documents_type_created_at_id ON nick_documents (type, created_at, id);
