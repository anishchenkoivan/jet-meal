from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


class TelegramNotifierError(Exception):
    """Telegram API returned an error or the HTTP call failed."""


def extract_telegram_chat_id(channels: dict[str, Any] | None) -> str | None:
    """
    Expects ``channels`` like::

        {"telegram": {"chat_id": "123456789"}}

    ``chat_id`` may be int or str (Telegram accepts both as string in API).
    """
    if not channels:
        return None
    raw = channels.get("telegram")
    if not isinstance(raw, dict):
        return None
    cid = raw.get("chat_id")
    if isinstance(cid, bool):
        return None
    if isinstance(cid, int):
        return str(cid)
    if isinstance(cid, float) and cid == int(cid):
        return str(int(cid))
    if isinstance(cid, str):
        s = cid.strip()
        return s or None
    return None


def send_message(*, bot_token: str, chat_id: str, text: str, timeout_sec: float = 15.0) -> None:
    """
    POST ``sendMessage`` to ``api.telegram.org``.

    Raises:
        TelegramNotifierError: on network errors or non-ok Telegram responses.
    """
    if not bot_token.strip():
        raise TelegramNotifierError("bot token is empty")
    if not chat_id.strip():
        raise TelegramNotifierError("chat_id is empty")

    if len(text) > 4096:
        text = text[:4090] + "..."

    url = f"https://api.telegram.org/bot{bot_token.strip()}/sendMessage"
    body = urllib.parse.urlencode(
        {
            "chat_id": chat_id.strip(),
            "text": text,
            "disable_web_page_preview": "true",
        }
    ).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": "application/x-www-form-urlencoded"})

    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8")
            data = json.loads(err_body)
            desc = data.get("description", err_body)
        except Exception:
            desc = str(e)
        raise TelegramNotifierError(f"HTTP {e.code}: {desc}") from e
    except urllib.error.URLError as e:
        raise TelegramNotifierError(str(e.reason if hasattr(e, "reason") else e)) from e

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise TelegramNotifierError(f"invalid JSON from Telegram: {raw[:200]}") from e

    if not data.get("ok"):
        raise TelegramNotifierError(data.get("description", str(data)))
