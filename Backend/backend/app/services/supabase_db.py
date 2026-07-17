import contextvars
from typing import Any
from app.core.config import settings

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY
service_role_key: str = settings.SUPABASE_SERVICE_ROLE_KEY

try:
    from supabase import create_client, Client
    default_supabase: Client = create_client(url, key)
    supabase_admin: Client = create_client(url, service_role_key)
except Exception:
    # Keep app importable for local docs/testing even if Supabase deps are unavailable.
    default_supabase: Any = None
    supabase_admin: Any = None

# Request-scoped client variable
request_supabase = contextvars.ContextVar("request_supabase", default=None)

class SupabaseClientProxy:
    def _get_client(self) -> Any:
        client = request_supabase.get()
        if client is None:
            client = default_supabase
        if client is None:
            raise RuntimeError("Supabase client is not initialized")
        return client

    def __getattr__(self, name: str) -> Any:
        return getattr(self._get_client(), name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name == "_get_client":
            super().__setattr__(name, value)
        else:
            setattr(self._get_client(), name, value)

supabase = SupabaseClientProxy()

