"""Transcribe Vietnamese audio (with noise) to text using faster-whisper."""
import os
os.environ["HF_HUB_DISABLE_XET"] = "1"
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"

import sys
from pathlib import Path
from faster_whisper import WhisperModel

MODEL_SIZE = os.environ.get("WHISPER_MODEL", "small")
AUDIO = r"C:\Users\AL\Downloads\Recording_3.m4a"
OUT_DIR = Path(__file__).parent
TXT_PATH = OUT_DIR / "Recording_3.txt"
SRT_PATH = OUT_DIR / "Recording_3.srt"

def srt_time(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"

def main() -> int:
    print(f"[load] {MODEL_SIZE} model (CPU int8)...", flush=True)
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

    print(f"[transcribe] {AUDIO}", flush=True)
    segments, info = model.transcribe(
        AUDIO,
        language="vi",
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
        condition_on_previous_text=False,
    )

    print(f"[info] detected language={info.language} prob={info.language_probability:.2f} duration={info.duration:.1f}s", flush=True)

    lines_txt = []
    lines_srt = []
    for i, seg in enumerate(segments, 1):
        text = seg.text.strip()
        lines_txt.append(text)
        lines_srt.append(f"{i}\n{srt_time(seg.start)} --> {srt_time(seg.end)}\n{text}\n")
        print(f"[{srt_time(seg.start)} -> {srt_time(seg.end)}] {text}", flush=True)

    TXT_PATH.write_text("\n".join(lines_txt) + "\n", encoding="utf-8")
    SRT_PATH.write_text("\n".join(lines_srt), encoding="utf-8")

    print(f"\n[done] wrote {TXT_PATH}", flush=True)
    print(f"[done] wrote {SRT_PATH}", flush=True)
    return 0

if __name__ == "__main__":
    sys.exit(main())
