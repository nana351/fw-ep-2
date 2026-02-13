"""
ElevenLabs TTS 음성 생성 스크립트
- scenes.json의 모든 narration을 ElevenLabs Jake 보이스로 생성
- 생성 후 각 wav 파일의 재생 시간을 측정하여 scenes.json에 audioDuration 추가
"""

import json
import os
import subprocess
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from elevenlabs import ElevenLabs

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
if not API_KEY:
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as _f:
            for _line in _f:
                if _line.startswith("ELEVENLABS_API_KEY="):
                    API_KEY = _line.split("=", 1)[1].strip()
VOICE_ID = "4iy2V51J5AfLP6EQCIae"  # Jake
SCENES_JSON = "src/data/scenes.json"
OUTPUT_DIR = "public/audio"


def get_duration(filepath):
    """ffprobe로 wav/mp3 재생 시간(초) 측정"""
    try:
        r = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", filepath],
            capture_output=True, text=True, timeout=10,
        )
        return round(float(r.stdout.strip()), 2)
    except Exception:
        try:
            size = os.path.getsize(filepath)
            return round(size / (24000 * 2), 2)
        except Exception:
            return 4.0


def main():
    if not os.path.exists(SCENES_JSON):
        print(f"❌ {SCENES_JSON} 없음.")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    client = ElevenLabs(api_key=API_KEY)
    print("✅ ElevenLabs 연결 완료 (Jake 보이스)\n")

    with open(SCENES_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    success_count = 0
    fail_count = 0
    total = len([s for s in data["scenes"] if s.get("narration", "").strip()])

    for scene in data["scenes"]:
        narration = scene.get("narration", "").strip()
        if not narration:
            continue

        scene_id = scene["id"]
        output_path = os.path.join(OUTPUT_DIR, f"scene_{scene_id}.mp3")
        wav_path = os.path.join(OUTPUT_DIR, f"scene_{scene_id}.wav")

        print(f"[{success_count + fail_count + 1}/{total}] scene_{scene_id} - {narration[:50]}...")

        try:
            audio = client.text_to_speech.convert(
                voice_id=VOICE_ID,
                text=narration,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128",
            )

            # Save mp3
            with open(output_path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)

            # Convert mp3 to wav for Remotion
            subprocess.run(
                ["ffmpeg", "-y", "-i", output_path, "-ar", "44100", "-ac", "1", wav_path],
                capture_output=True, timeout=30,
            )

            # Remove mp3, keep wav
            if os.path.exists(wav_path) and os.path.getsize(wav_path) > 0:
                os.remove(output_path)
                duration = get_duration(wav_path)
                scene["audioDuration"] = max(duration, 4.0)
                print(f"  ✅ {os.path.getsize(wav_path):,} bytes, {duration}초")
                success_count += 1
            else:
                print(f"  ❌ 변환 실패")
                fail_count += 1

        except Exception as e:
            print(f"  ❌ 에러: {e}")
            fail_count += 1

    # scenes.json 업데이트
    with open(SCENES_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 50}")
    print(f"TTS 생성 완료: ✅ {success_count}개 성공, ❌ {fail_count}개 실패")
    print(f"scenes.json에 audioDuration 업데이트 완료")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
