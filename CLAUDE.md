# 발표 영상 자동 생성 파이프라인

이 프로젝트는 발표 대본 텍스트만 받아서 모션 그래픽 영상(MP4)을 자동 생성하는 Remotion 기반 프로젝트이다.

---

## 필수 파일 (이 파일들을 프로젝트 폴더에 넣으면 된다)

1. **CLAUDE.md** (이 파일) — Claude Code가 읽는 자동화 지침서
2. **tts_elevenlabs.py** — ElevenLabs API 기반 음성 생성 스크립트 (scenes.json → wav 파일)

---

## 글로벌 규칙

- 사용자는 비개발자이다. 기술 용어 설명 없이 작업만 수행하라.
- 에러 발생 시 스스로 해결을 시도하고, 해결 불가능한 경우에만 사용자에게 보고하라.
- 중간에 사용자에게 질문하지 말고, 합리적인 기본값으로 판단하여 끝까지 진행하라.
- **파일 탐색, 환경 확인 등 복잡한 작업은 `python -c "..."` 로 실행하라.** 셸 명령어(PowerShell, cmd, bash)는 OS에 따라 깨질 수 있지만, Python은 어디서든 동일하게 동작한다.

---

## 작업 트리거

사용자가 발표 대본을 제공하면, 아래 파이프라인을 Step 0부터 순서대로 **자동 실행**하라.
이미 설치/완료된 단계는 건너뛰고 다음으로 넘어가라.

---

## 파이프라인

### Step 0: 환경 진단 및 셋업

#### 0-1. Python 확인 (최우선 — 이후 모든 스크립트에 필수)
```bash
python --version || python3 --version
```
- 없으면 반드시 먼저 설치하라. Python 설치 전에는 이후 단계를 진행하지 마라.
  - Mac: `brew install python` / Ubuntu: `sudo apt install -y python3 python3-pip` / Windows: `winget install Python.Python.3.11`

#### 0-2. Node.js & npm
```bash
node -v && npm -v
```
- Node 18+ 권장. 없으면: Mac `brew install node` / Ubuntu `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs` / Windows `winget install OpenJS.NodeJS.LTS`

#### 0-3. ffmpeg
```bash
ffmpeg -version
```
- 없으면: Mac `brew install ffmpeg` / Ubuntu `sudo apt install -y ffmpeg` / Windows `winget install Gyan.FFmpeg`

#### 0-4. TTS 설정 (ElevenLabs API)
- ELEVENLABS_API_KEY 환경변수 확인 (.env 파일 또는 시스템 환경변수)
- 없으면 → .env 파일에 `ELEVENLABS_API_KEY=sk_xxx...` 형태로 API 키 설정 안내
- `pip install elevenlabs` (미설치 시 자동 설치)
- 테스트: 짧은 문장으로 API 연결 확인
- 실패하면 → TTS 없이 진행. 사용자에게 안내.

#### 0-5. 한국어 폰트 확인
```bash
python -c "
import os, subprocess
fonts = []
if os.name == 'nt':
    try:
        r = subprocess.run(['reg', 'query', r'HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts'],
                          capture_output=True, text=True, encoding='utf-8', errors='replace')
        for line in r.stdout.split('\n'):
            if any(k in line.lower() for k in ['malgun', 'gulim', 'noto sans kr', 'pretendard']):
                fonts.append(line.strip())
    except: pass
else:
    try:
        r = subprocess.run(['fc-list', ':lang=ko'], capture_output=True, text=True, timeout=10)
        fonts = [l.strip() for l in r.stdout.split('\n') if l.strip()][:5]
    except: pass
print('폰트:', fonts[:3] if fonts else 'sans-serif 사용')
"
```

#### 0-6. 환경 진단 결과 출력
```
✅ 환경 확인 완료
- Node.js / npm / ffmpeg / Python: 버전 표시
- ElevenLabs API: ✅ 연결 확인 (또는 "❌ API 키 없음 → 음성 없이 진행")
- 한국어 폰트: 발견된 폰트명
- OS: Windows / macOS / Linux
→ 영상 생성을 시작합니다.
```

### Step 1: Remotion 프로젝트 초기화

- `package.json`에 remotion이 있으면 → 넘어간다.
- 없으면:
  ```bash
  npx create-video@latest . --template blank
  npm install
  ```
- `.claude/skills/remotion/`이 없으면:
  ```bash
  npx skills add remotion-dev/skills
  ```
- **Zod 스키마 패키지 설치:**
  ```bash
  npx remotion add @remotion/zod-types zod
  ```
- **Skills 설치 확인 후, `.claude/skills/remotion/` 안의 스킬 문서들을 반드시 읽어라.**
  특히 typography, spring-physics, transitions, sequencing 관련 스킬을 숙지한 뒤 Step 4에 반영하라.

### Step 2: 대본 → 장면 구조화 + 나레이션 생성 + 인포그래픽 기획

사용자는 **전체 발표 대본을 하나의 텍스트로** 제공한다.
이것을 분석하여 장면 분리, 나레이션 작성, 인포그래픽 기획을 한 번에 수행하라.

**처리 순서:**
1. 전체 대본을 읽고 내용의 흐름과 구조를 파악한다.
2. 자연스러운 끊김 단위로 장면을 분리한다 (한 장면당 2~4문장, 15~30초 분량).
3. 각 장면에 대해 **narration(TTS가 읽을 텍스트)을 새로 작성**한다.
4. 각 장면에 적합한 인포그래픽(visual)을 판단한다.
5. 인트로/아웃트로를 자동 추가한다.

**narration 작성 규칙:**
- narration은 대본 원문을 그대로 복사하지 않는다. **TTS가 자연스럽게 읽을 수 있도록 다듬은 텍스트**이다.
- 구어체로 자연스럽게 다듬어라. 발표 톤을 유지하라.
- 너무 긴 문장은 쪼개라. 너무 짧은 문장은 합쳐라.
- 인트로: 발표 제목 소개 한 문장. 아웃트로: 마무리 멘트.

**⚠️ TTS 한글 변환 규칙 (권장 — 변환하면 TTS 발음 품질이 더 좋아진다):**
TTS 엔진에 관계없이 narration의 영문/숫자/기호를 한글로 변환하면 발음이 더 자연스럽다.
**narration에는 영문, 숫자, 기호를 가능한 한글로 변환하라.**

| 유형 | ❌ 원문 그대로 | ✅ 한글 변환 |
|------|-------------|------------|
| 연도 | 2024년 | 이천이십사년 |
| 숫자 | 30%, 150만 | 삼십 퍼센트, 백오십만 |
| 금액 | $500, 1.2억 | 오백 달러, 일점이억 |
| 영문 약어 | WSOP, AI, CEO | 더블유에스오피, 에이아이, 씨이오 |
| 영문 브랜드 | Tesla, OpenAI | 테슬라, 오픈에이아이 |
| 영문 단어 | blockchain, cloud | 블록체인, 클라우드 |
| 소수점 | 3.5배 | 삼점오 배 |
| 날짜 | 1월 15일 | 일월 십오일 |
| 순서 | 1단계, 3번째 | 첫 번째 단계, 세 번째 |
| 단위 | 10GB, 5km | 십 기가바이트, 오 킬로미터 |
| 수식/기호 | A→B, +20% | 에이에서 비로, 플러스 이십 퍼센트 |

**변환 원칙:**
- 한국어에서 이미 널리 쓰이는 외래어는 한글 표기로: AI → 에이아이, USB → 유에스비
- 고유명사는 한국어 발음으로: Google → 구글, Amazon → 아마존
- 숫자는 모두 한글로 풀어쓰기: 2024 → 이천이십사, 100 → 백
- 퍼센트, 달러 등 단위도 한글로: % → 퍼센트, $ → 달러, ° → 도

**시각화 자동 판단 기준:**
대본에 아래 패턴이 있으면 해당 인포그래픽을 자동 배정하라.
하나의 장면에 여러 패턴이 겹치면 가장 핵심적인 것 하나를 선택하라.

**📊 데이터/수치 관련:**
| 대본 내용 패턴 | visual 타입 | 설명 |
|---------------|------------|------|
| 여러 항목의 수치 비교 | `chart-bar` | 바가 차오르는 애니메이션 차트 |
| 비율, 구성, 점유율 | `chart-pie` | 파이 차트가 순차적으로 채워짐 |
| A vs B 직접 비교 | `chart-comparison` | 좌우 비교 바 + 중앙 VS |
| 핵심 수치 하나 강조 (매출, 성장률 등) | `big-number` | 큰 숫자가 0부터 카운트업 (120px+) |
| 시간에 따른 변화, 추이, 트렌드 | `chart-line` | 선이 왼쪽에서 오른쪽으로 그려지는 라인 차트 |
| 달성률, 진행률, 목표 대비 | `gauge` | 반원형 게이지가 채워지는 애니메이션 |
| 여러 KPI/지표 동시 표시 | `dashboard` | 2x2 또는 1x3 카드 그리드, 각각 숫자 카운트업 |
| 다차원 평가 (5개 이상 항목 점수) | `chart-radar` | 레이더/스파이더 차트가 펼쳐지는 애니메이션 |
| 단계별 감소/전환율 | `funnel` | 깔때기형 차트, 위에서 아래로 순차 등장 |

**🔄 프로세스/구조 관련:**
| 대본 내용 패턴 | visual 타입 | 설명 |
|---------------|------------|------|
| 단계, 절차, 과정 설명 | `process-flow` | 화살표로 연결된 단계별 플로우 |
| 시간순 나열, 연도, 역사 | `timeline` | 가로/세로 타임라인 |
| 순환, 반복, 사이클 | `cycle` | 원형 화살표 다이어그램, 순차 하이라이트 |
| 구조, 계층, 분류, 조직도 | `hierarchy` | 트리 다이어그램 또는 피라미드 |
| 인과관계, 원인→결과 | `cause-effect` | 화살표로 연결된 원인→결과 다이어그램 |
| 두 축으로 분류 (2x2 매트릭스) | `matrix` | 4사분면 매트릭스, 각 칸 순차 등장 |
| 겹치는 개념, 공통점/차이점 | `venn` | 벤 다이어그램, 원이 겹치며 등장 |
| 레이어, 계층적 쌓임 (스택) | `stack` | 아래에서 위로 레이어가 쌓이는 애니메이션 |

**📋 비교/나열 관련:**
| 대본 내용 패턴 | visual 타입 | 설명 |
|---------------|------------|------|
| 장단점, 찬반, 긍정/부정 | `pros-cons` | 좌우 분할 (초록 vs 빨강), 번갈아 등장 |
| 전/후 비교, 도입 전후 | `before-after` | 좌우 또는 상하 분할, 동시 슬라이드인 |
| 3개 이상 항목 나열 | `icon-grid` | 아이콘 + 텍스트 그리드 (2x2, 3x1 등) |
| 기능, 특징, 스펙 소개 | `feature-cards` | 카드가 하나씩 flip 또는 pop-in |
| 체크리스트, 조건, 요구사항 | `checklist` | 항목이 하나씩 나타나며 체크 애니메이션 ✓ |
| 순위, 랭킹, Top N | `ranking` | 1위부터 순차 등장, 바 길이로 차이 표현 |
| 가격, 요금제 비교 | `pricing-table` | 2~3개 컬럼 비교 테이블, 추천 항목 강조 |

**💬 텍스트/강조 관련:**
| 대본 내용 패턴 | visual 타입 | 설명 |
|---------------|------------|------|
| 인용, 명언, 고객 후기 | `quote` | 큰따옴표 + 강조 타이포그래피 + 출처 |
| 핵심 정의, 개념 설명 | `definition` | 용어 크게 + 밑에 설명 fadeIn, 사전 스타일 |
| 질문 제기, 문제 제시 | `question` | 큰 물음표 + 질문 텍스트 타이프라이터 효과 |
| 핵심 메시지, 슬로건, 한 줄 요약 | `highlight` | 화면 중앙 대형 텍스트 + 밑줄/배경 하이라이트 |
| 여러 키워드, 핵심 용어 나열 | `word-cloud` | 단어들이 랜덤 위치에서 pop-in, 중요도별 크기 차이 |
| 경고, 주의사항, 중요 포인트 | `alert` | ⚠️ 아이콘 + 강조 박스 shake 후 등장 |

**👥 사람/주체 관련:**
| 대본 내용 패턴 | visual 타입 | 설명 |
|---------------|------------|------|
| 팀 소개, 인물 소개 | `profile-cards` | 이름 + 역할 카드가 staggered 등장 |
| 고객/사용자 여정 | `journey-map` | 가로 단계별 여정 + 감정 곡선 |
| 설문 결과, 사용자 피드백 | `survey-result` | 가로 바 + 퍼센트, 응답 비율 표시 |

**🗺️ 공간/위치 관련:**
| 대본 내용 패턴 | visual 타입 | 설명 |
|---------------|------------|------|
| 지역, 국가, 위치 언급 | `map-highlight` | 심플 지도 + 해당 지역 핀/하이라이트 |
| 글로벌 확장, 진출 지역 | `map-expansion` | 점이 하나씩 추가되며 연결선 확장 |

**위 패턴 모두 해당 없음:**
| 대본 내용 패턴 | visual 타입 | 설명 |
|---------------|------------|------|
| 일반 설명, 서론, 맥락 설명 | `text-focus` | 텍스트 중심 레이아웃 + 핵심 키워드 하이라이트 |

**출력 형식 (scenes.json):**
```json
{
  "title": "발표 전체 제목",
  "author": "",
  "scenes": [
    {
      "id": 1,
      "type": "intro",
      "title": "발표 제목",
      "subtitle": "부제 또는 발표자 이름",
      "narration": "안녕하세요, 오늘은 OOO에 대해 말씀드리겠습니다.",
      "keywords": [],
      "visual": "none",
      "transition": "fadeIn",
      "backgroundColor": "#0f172a",
      "accentColor": "#3b82f6"
    },
    {
      "id": 2,
      "type": "content",
      "title": "장면 제목",
      "narration": "대본에서 추출하여 TTS에 맞게 다듬은 나레이션 텍스트",
      "keywords": ["키워드1", "키워드2", "키워드3"],
      "visual": "chart-bar",
      "visualData": {
        "items": [
          {"label": "항목A", "value": 75, "color": "#3b82f6"},
          {"label": "항목B", "value": 45, "color": "#60a5fa"},
          {"label": "항목C", "value": 90, "color": "#818cf8"}
        ],
        "unit": "%"
      },
      "transition": "slideUp",
      "backgroundColor": "#1e293b",
      "accentColor": "#60a5fa"
    },
    {
      "id": 3,
      "type": "content",
      "title": "도입 과정",
      "narration": "도입 과정은 크게 네 단계로 나뉩니다. 먼저 기획 단계에서...",
      "keywords": ["단계1", "단계2"],
      "visual": "process-flow",
      "visualData": {
        "steps": ["기획", "개발", "테스트", "배포"]
      },
      "transition": "slideUp",
      "backgroundColor": "#1a1a2e",
      "accentColor": "#a78bfa"
    },
    {
      "id": 4,
      "type": "content",
      "title": "핵심 성과",
      "narration": "가장 주목할 만한 성과는 삼백이십 퍼센트의 성장률입니다.",
      "keywords": [],
      "visual": "big-number",
      "visualData": {
        "number": 320,
        "unit": "%",
        "label": "성장률"
      },
      "transition": "scaleIn",
      "backgroundColor": "#0d1b2a",
      "accentColor": "#34d399"
    },
    {
      "id": 99,
      "type": "outro",
      "title": "감사합니다",
      "narration": "이상으로 발표를 마치겠습니다. 감사합니다.",
      "keywords": [],
      "visual": "none",
      "transition": "fadeIn",
      "backgroundColor": "#0f172a",
      "accentColor": "#3b82f6"
    }
  ]
}
```

**visualData는 대본에서 추출한 실제 데이터로 채워라.** 대본에 "매출이 30% 증가했다"라면 `{"number": 30, "unit": "%", "label": "매출 증가율"}`처럼 실제 수치를 넣어라. 대본에 정확한 수치가 없으면 합리적으로 추정하되, 추정값임을 주석으로 표시하라.

### Step 3: TTS 음성 생성

```bash
python tts_elevenlabs.py
```
- 이 스크립트가 scenes.json → ElevenLabs API → mp3 → wav 변환 → audioDuration 업데이트를 **전부 자동**으로 처리한다.
- ELEVENLABS_API_KEY가 없으면 → 음성 없이 진행. narration 글자 수 기반 예상 시간 사용 (한국어 초당 4~5글자).
- Remotion 오디오: `<Audio src={staticFile("audio/scene_1.wav")} />`. Studio에서 안 나오면 화면 클릭 후 재생.

---

### ⭐⭐⭐ Step 4: Remotion 영상 구성 (핵심 — 영상 퀄리티를 결정하는 단계)

**⚠️ 이 Step이 영상의 품질을 결정한다. 가장 많은 시간과 주의를 투자하라.**
**⚠️ 단색 배경 + 단순 fadeIn만으로 구성하면 안 된다. 반드시 아래 규칙을 전부 지켜라.**

#### 핵심 원칙: Remotion Agent Skills 먼저 활용

`.claude/skills/remotion/` 안의 스킬 문서를 반드시 먼저 읽고 작업을 시작하라.
- `spring()`: 모든 애니메이션에 spring physics 적용 (단순 linear interpolate 금지)
- `interpolate()` + `Easing`: 색상, 위치, 크기 전환
- `<TransitionSeries>`: 장면 전환 (fade, slide, wipe 등)
- `<Sequence>`: 요소별 등장 타이밍 제어 (staggered 등장)
- `<Audio>`, `staticFile()`: 음성 재생
- `<AbsoluteFill>`: 레이어 구성 (배경 → 파티클 → 텍스트 → UI)

**스킬 활용:** typography(타이프라이터, 글자별 등장) / spring-physics(바운스, 탄성) / transitions(slide, wipe 조합) / sequencing(staggered delay)

**직접 코딩은 최후의 수단이다.**

---

#### ⭐ 인포그래픽 애니메이션 규칙 (각 타입별 반드시 준수)

- **chart-bar**: 바가 아래에서 위로 spring으로 차오름, 0.2초 stagger, 위에 수치
- **chart-pie**: 0도에서 각 항목만큼 순차 채워짐 (SVG arc)
- **chart-line**: 좌→우 점 등장 + 선 연결, 마지막에 영역 fill fadeIn
- **chart-comparison**: 중앙에서 좌우 확장 + VS 텍스트
- **chart-radar**: 중심→꼭짓점 확장, spring으로 펼쳐짐
- **big-number**: 0→목표 카운트업 (interpolate), 120px+ 폰트
- **gauge**: 반원 게이지 spring 채움 + 중앙 숫자 카운트업
- **dashboard**: staggered pop-in 카드 + 숫자 동시 카운트업
- **funnel**: 위→아래 순차 등장, 너비 점점 감소
- **process-flow**: 단계 박스 순차 등장 + 화살표 연결
- **timeline**: 가로선 그려지고 + 이벤트 pop-in
- **cycle**: 원형 노드 순차 등장 + 원 따라 화살표
- **hierarchy**: 위→아래 트리 노드 순차 + 연결선
- **cause-effect**: 원인 → 화살표 → 결과 순차
- **matrix**: 격자 먼저 → 각 칸 pop-in
- **venn**: 원 순차 등장 → 교집합 하이라이트
- **stack**: 아래→위 레이어 쌓임
- **pros-cons**: 좌우 분할(초록/빨강), 번갈아 등장
- **before-after**: 좌(before) → 화살표 → 우(after)
- **icon-grid**: staggered scaleIn (SVG/이모지)
- **feature-cards**: flip 또는 3D rotate-in
- **checklist**: slideIn + SVG 체크마크 path 애니메이션 ✓
- **ranking**: 1위부터 순차 + 바 길이 차이 + bounce-in
- **pricing-table**: 좌→우 순차, 추천 항목 scale 1.05
- **quote**: 큰따옴표 scaleIn → typewriter → 출처 fadeIn
- **definition**: stamp-in → 밑줄 → 설명 fadeIn
- **question**: 물음표 bounce → typewriter → 잠시 멈춤
- **highlight**: 중앙 등장 → 형광펜 밑줄 좌→우
- **word-cloud**: 랜덤 위치 pop-in, 중요도별 크기
- **alert**: ⚠️ shake → 박스 scaleIn → 텍스트 fadeIn
- **profile-cards**: 아바타 scaleIn → 이름/역할 slideUp
- **journey-map**: 경로선 좌→우 → 마커 pop-in
- **survey-result**: 가로 바 좌→우 채움 + 퍼센트 카운트업
- **map-highlight**: 외곽선 draw-in → 색상 채움 + 핀 drop
- **map-expansion**: 첫 점 → 연결선 + 새 점 순차 확장
- **text-focus**: 텍스트 레이아웃 + 핵심 키워드 하이라이트

**공통:** 라벨/수치 항상 포함, accentColor 기반 통일, SVG 기반, 필요한 컴포넌트만 생성

**레이아웃:** 인포그래픽 장면은 인포그래픽 60~70% 차지. 나레이션 언급 시점에 애니메이션 시작.

---

#### ⭐ 디자인 퀄리티 규칙 (프로페셔널한 영상의 핵심)

**해상도:** 1920x1080 (16:9), 30fps

**배경 (단색 절대 금지!):**
- 모든 장면: **움직이는 그라디언트** (interpolate로 색상 천천히 변화)
- 배경 위 **파티클 효과**: 원형/사각형 10~20개, opacity 0.05~0.15, 각각 다른 속도로 떠다님
- 장면마다 색상 조합이 달라야 함

**폰트 & 타이포그래피:**
- 제목: 72px+, weight 800, letter-spacing -0.02em
- 본문: 40px+, weight 400, line-height 1.6
- 키워드: 20px, weight 600
- 중요 단어에 **악센트 컬러 하이라이트** (밑줄 또는 배경)

**텍스트 애니메이션 (단순 fadeIn 금지!):**
- 제목: 글자 하나씩 staggered (0.03초 간격) + spring 바운스
- 본문: 문장 단위 slideUp + fadeIn (0.2초 stagger)
- 현재 읽히는 문장만 밝게, 나머지 opacity 0.3 dim
- 키워드: scaleIn + 바운스 (spring mass 0.8, damping 10)

**장면 전환 (단순 fade 금지!):**
- TransitionSeries 사용
- slide (방향 번갈아), wipe + 블러, scale + fade 동시 중 랜덤 조합
- 전환 시간: 0.7~1초

**인트로:** 진한 그라디언트 + 파티클, 제목 scale 0→spring, 부제 0.5초 후 slideUp, 하단 가로선 중앙→양쪽 확장, 3~4초

**본문 레이아웃 (2종 번갈아 사용):**
- A: 좌측 40% 제목 + 우측 60% 본문/키워드
- B: 상단 20% 제목 바 + 중앙 본문 + 하단 키워드

**아웃트로:** "감사합니다" spring 바운스, 하단 날짜/발표자, 파티클 위로 올라감

**필수 UI:** 하단 프로그레스 바 (4px, 악센트 컬러), 우측 상단 장면 번호 pill

**타이밍:** `durationInFrames = (audioDuration + 1.5) * fps`. 음성 없으면 기본 4초.

**색상 팔레트:**
```
장면 1: bg #0f172a→#1e3a5f, accent #3b82f6
장면 2: bg #1a1a2e→#16213e, accent #60a5fa
장면 3: bg #0d1b2a→#1b2838, accent #818cf8
장면 4: bg #1e1e30→#2d2d50, accent #a78bfa
장면 5: bg #0f172a→#1e293b, accent #34d399
(이후 반복)
```

---

#### Zod 스키마 (Studio에서 코드 없이 시각 편집)

`src/schemas.ts`에 정의: 색상(zColor→컬러피커), 폰트 크기(슬라이더), 애니메이션 파라미터(spring mass/damping), 파티클(수/투명도/크기), UI 토글(프로그레스바/장면번호), 오디오 볼륨.
모든 필드에 `.describe("한국어 설명")`. `<Composition>`의 schema/defaultProps에 연결.

---

### Step 5: 미리보기 및 확인

`npx remotion studio`로 미리보기 실행 → "http://localhost:3000 에서 확인하세요. 우측 패널에서 색상, 크기, 애니메이션 등을 직접 조정할 수 있습니다." 안내.

### Step 6: 렌더링

```bash
npx remotion render src/index.ts MainComposition out/presentation.mp4 --codec h264
```
메모리 부족 시 `--concurrency 1`.

---

## 반복 작업 시

새 대본 → scenes.json 새로 생성 + `python tts_elevenlabs.py` 재실행. 컴포넌트 재사용.

## 수정 요청 대응

| 요청 | 수정 대상 |
|------|-----------|
| "색상 바꿔줘" | scenes.json 또는 colors.ts |
| "직접 조정하고 싶어" | Studio props 패널 안내 |
| "더 화려하게" | 파티클↑, 그라디언트 다채롭게, 바운스 강화 |
| "너무 정신없어" | 파티클↓, 애니메이션 단순화, 색상 통일 |
| "인포그래픽 빼줘" | visual → text-focus 변경 |

## 금지 사항

- 코드를 보여주지 마라. 실행하라.
- 선택지를 제시하지 마라. 최적의 하나를 실행하라.
- "~할까요?" 묻지 마라. 하라.
- 중간에 멈추지 마라. Step 0~5 연속 실행.
- **Skills 무시하고 처음부터 직접 코딩 금지.**
- **단색 배경 + 단순 fadeIn 금지. 그라디언트 + 파티클 + spring 필수.**
