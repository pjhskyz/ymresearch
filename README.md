# YM Research — 투자 리서치 홈페이지

독립 투자 리서치 회사 홈페이지(랜딩 페이지)입니다.
별도 빌드 없이 브라우저에서 바로 열리는 **단일 HTML 파일**(`index.html`)로 구성되어 있습니다.

> 스타일: Tailwind CSS (CDN) · 네이비 + 골드 금융 톤
> 데모는 가상 회사 "Meridian Research" 기준으로 작성된 샘플입니다.

---

## 빠른 시작

```bash
# 1) 그냥 파일 열기
open index.html          # macOS
xdg-open index.html      # Linux

# 2) 로컬 서버로 보기 (권장)
python3 -m http.server 8000
# → http://localhost:8000
```

## 구성 섹션

| 섹션 | 내용 |
|------|------|
| Hero | 슬로건 + 핵심 지표(트랙레코드·적중률·구독사) |
| 리서치 커버리지 | 거시 / 2차전지 / 반도체 / 금융 / 퀀트 / ESG |
| 투자 프로세스 | 4단계 검증 + 샘플 리포트 카드 |
| 최신 인사이트 | 리포트 블로그 카드 |
| 리서치 팀 | 애널리스트 프로필 |
| 구독 CTA | 뉴스레터 가입 폼 |
| 푸터 | 회사 정보 / 법적 고지 |

## 배포 (GitHub Pages)

저장소 **Settings → Pages → Branch: `main` / `/root`** 선택 후 저장하면
`https://pjhskyz.github.io/ymresearch/` 에서 공개됩니다.

## 커스터마이징

- 회사명/슬로건: `index.html` 상단 `<header>` 와 Hero 섹션 텍스트 수정
- 색상: `<script>tailwind.config</script>` 의 `colors`(navy·gold 등) 변경
- 섹션 추가/삭제: 각 `<section>` 블록 단위로 편집

---

본 페이지는 디자인 샘플이며 실제 투자 자문이 아닙니다.
