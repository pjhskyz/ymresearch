# Leader Signal Radar 연구 운영 기준

기존 `schemaVersion: 2`와 모든 상위 필드는 보존한다. 연구 확장은 `research.version: 1`이다. 이 문서는 2026.09.06 사용자가 승인한 점수 근거·사건 이력·검증 결과 개편 기준이다. 홈페이지 변경과 일일 조사 완료는 별개의 작업이다.

## 변경 범위와 검증

일일 자동화는 `pjhskyz/ymresearch` main의 `leader-signal-radar/data/daily.json`만 교체한다. 디자인·HTML·JS·CSS·배포 설정·다른 경로는 변경하지 않는다. 시작할 때 최신 파일과 이 문서, `leader-signal-radar/lib/validate-research.mjs`, `leader-signal-radar/scripts/validate-data.mjs`를 읽는다. 검증 코드와 같은 디렉터리 구조로 파일을 준비하고 다음을 실행한다.

`node leader-signal-radar/scripts/validate-data.mjs candidate.json previous.json`

점수·날짜·원문·참조·고정 22명·불변 이력을 검사한다. 통과 전 공개하지 않는다. 교체 직전 blob SHA를 다시 읽고 조사 중 다른 수정이 있으면 최신본에 보강한다. 동일 내용이면 커밋하지 않는다. Actions 성공 및 캐시 우회한 공개 JSON·HTML의 HTTP 200을 확인한다. 공개 JSON의 기준일·상태·두 current 배열·research 버전과 실제 응답이 후보와 일치해야 한다. 실패를 성공으로 보고하지 않는다.

## 조사와 누락 방지

- 기본 조사 구간은 직전 lastSuccessfulRun 이후부터 현재 KST 종료 시각까지. 첫 실행은 최근 36시간.
- 별도의 수집 구간은 기본 구간 시작 72시간 전부터 종료까지. `research.collectionWindow`에 기록한다. 시간 겹침은 검색 누락 보충용이며 동일 사건을 다시 신규화하지 않는다.
- 사건일·게시일·최초 기록일·원문 확인일을 `timing.occurredAt/publishedAt/firstSeenAt/verifiedAt`에 구분한다. 일자만 알면 YYYY-MM-DD, 정확한 시각을 알면 +09:00 ISO를 사용한다. 모르는 값은 null로 둔다. 최초 기록일은 실제 기록 시점이며 기사 게시 시점으로 대체하지 않는다.
- 구간 이전 사건이라도 이번에 처음 원문 검증한 중요한 누락분은 `lateDiscovery: true`와 지연 확인 사유를 남기고 선별한다. 단순 재인용·반복 기사는 제외한다.
- 고정 22명 각각 `research.coverage`에 leader, checked/blocked, checkedAt, 실제 열린 urls, note를 기록한다. 시도만 한 리더는 checked가 아니다. 기존 legacy 내역은 새 조사에서 갱신한다. `runSummary.sourcesChecked`는 실제 열린 중복 제거 원문 수로 산출한다.
- 22명을 정상 확인하면 signals/observations/no_signal을 두 current 배열에 맞게 선택하고 lastSuccessfulRun을 researchWindow.end로 갱신한다. 한 명이라도 충분히 조사하지 못하면 partial, 직전 lastSuccessfulRun 유지. partial에서도 확인된 카드와 실패 이유를 공개한다. no_signal은 충분히 조사한 결과이며 수집 실패와 다르다.

## 사건과 가설

- 카드 id는 기존 동일 사건의 id를 유지한다. eventId는 실제 하나의 사건을 가리키는 안정적인 짧은 ASCII ID. hypothesisId는 사건들이 검증하는 투자 질문.
- 같은 회사·리더·테마라는 이유로 다른 사건을 하나의 카드에 덮어쓰지 않는다. `openai-pacing`은 이관 후 위키 공개정책 사건을 유지한다. 기존 다른 OpenAI 사건은 history 안의 별도 eventId로 복원돼 있다. 새 사건은 별도 카드 id/eventId를 만들고 같은 가설에 연결한다.
- `research.hypotheses`는 id/title/question/leaderNames. 같은 거래를 여러 참여자의 독립 사건으로 늘리지 않는다.
- 새 카드·실질 보강·재평가에는 `research.history`에 고유 revision을 앞에 추가한다. 동일 eventId의 직전 revision을 previousRevisionId로 참조한다. reportDate, recordedAt, tier, score, headline, source, status, stage, reason, evidenceIds, 당시 전체 snapshot을 넣는다.
- 과거 revision과 evidence는 추가만 허용한다. 기존 내용을 수정·삭제하지 않는다. 정정도 새 revision과 정정 사유로 기록한다. 같은 날짜 재실행에도 동일 내용의 revision을 반복 추가하지 않는다.
- signals/observations는 같은 사건이 정확히 한 배열에만 존재하도록 이동한다. 최근 90일 또는 최대 30개 활성 카드를 유지해도 관련 history는 지우지 않는다.

## 근거와 기준선

- 회사·기관의 공식 원문 A, 신뢰도 높은 매체의 직접 인용·인터뷰 B. 실제 본문과 발표일을 확인한다. 검색 스니펫·루머·익명 협상·출처 없는 요약만으로 승격하지 않는다.
- `research.evidence`에 id/url/label/grade/publishedAt/verifiedAt/claim/provenance를 추가한다. 공식 원문은 official, 직접 보도는 direct_report. claim은 검증된 사실의 간결한 요약이며 의견과 구분한다. 기존 URL에 새 내용이 추가되면 새 evidence ID로 기록한다.
- `assessment.baseline`에 과거 90일의 날짜 date, statement, evidenceIds를 넣는다. 현재 근거는 assessment.evidenceIds. 회사의 공식 입장과 리더 직접 발언을 혼동하지 않도록 attribution은 leader_direct/company_action/company_statement/third_party로 구분한다.
- 게시일이 새로워도 이전 기준선의 약속을 반복하면 변화량을 추가하지 않는다. 신제품 출시와 이미 발표한 안전장치 설명처럼 사건과 반복 근거를 분리한다.

## 점수와 단계

75 이상 결정적, 60–74 관찰, 60 미만 제외. 점수는 편집상 중요도이며 주가 상승 확률이 아니다. `assessment`에 status:reviewed, rubricVersion:1, assessedAt, stage, impactDirection, attribution, breakdown, baseline, evidenceIds, note를 빠짐없이 넣는다.

구성점수는 `breakdown.action/change/impact/verification/source` 각각 `{score,reason}`이며 합이 score와 정확히 같아야 한다.

| 축 | 상한 | 평가 앵커 |
|---|---:|---|
| 행동 증거 | 30 | 일반 발언 0–6, 구체적 공개 확약 7–14, 계약·조직·출시 확정 15–22, 실제 운영·자본 집행·성과 23–30. 문장 존재 여부로 판단하지 않는다. |
| 변화량 | 25 | 기존 반복 0–5, 시점·범위의 제한적 변화 6–12, 의미 있는 정책·전략 변화 13–19, 근본적 반전 20–25. 날짜 있는 과거 원문과 대조. |
| 파급력 | 20 | 단일 기능·국소 영향보다 산업 구조·공급망·자본 흐름 변화에 가산. 가능한 경로와 불확실성을 명시. |
| 검증 가능성 | 15 | 단순 추적 가능보다 수치·기한·공개 문서로 판별 가능한 조건에 가산. 기한·성과 기준 없으면 만점 금지. |
| 출처 품질 | 10 | 회사 원문이라고 결과의 진실성을 자동 확정하지 않는다. 직접성·내용·발표일 검증과 교차확인으로 평가. |

- stage: statement(발언), commitment(공식 확약), execution(실행), outcome(성과 확인).
- 기업의 statement/commitment는 합계가 높아도 결정적 승격 금지. 단계에 맞게 행동·변화량을 재검토하고 관찰 이하로 판정한다. 결정적 기업 카드는 실행/성과와 행동증거 최소 18점이 필요하다.
- 투자자·사상가는 구체적인 관점 변화와 반증 조건을 중시하며 실제 포트폴리오 변경은 필수 조건이 아니다. 낮은 행동점수를 억지로 채우지 않는다.
- impactDirection은 positive/negative/mixed. 높은 중요도와 긍정 방향은 별개이다.
- 과거 `legacy_unreviewed` 카드는 총점과 내용을 그대로 보존한다. 임의로 구성점수를 역산하거나 모두 일률 하향하지 않는다. 실제 재평가한 경우에만 reviewed로 바꾸고 이력에 이유를 추가한다. 당일 current 배열에는 reviewed만 허용한다.
- '행동으로 전환'은 같은 eventId의 검증된 전후 revision이 발언/공식 확약→실행/성과로 이동한 사건 수. 최초 실행 발견, 서로 다른 사건, 미검토 legacy는 전환 수에 넣지 않는다.

## 모든 카드 필드

기존 id, leader(한글명(영문명)), role, initials, score, kind(신규·강화·약화·반전·실행), date(사건일 YYYY.MM.DD), reportDate, theme, headline, takeaway, before, now, facts(2–4), action, impact, impactPath(2–4), counter, next, source(https), sourceLabel, sourceGrade를 보존한다. 추가로 eventId/hypothesisId/assessment/timing/industryLinks를 기록한다.

`industryLinks`는 sector/relationship/text/evidenceIds 배열. relationship: confirmed(계약·공급 관계 확인), indirect(산업 간접 연결), hypothesis(검증 가설). 확인된 계약이 없으면 수혜 기업을 단정하거나 ticker를 채우지 않는다. 공개 홈페이지에는 개인 포트폴리오를 넣지 않는다.

## 테마와 검증 결과

- themes의 기존 값은 보존하되 `research.supporting/opposing`에 eventId/text/evidenceIds/status(verified 또는 legacy)를 붙인다. 반대 근거가 없으면 없다고 기록하며 만들어내지 않는다.
- independentEventGroups는 id/eventIds/note. 공통 거래·자금 고리는 하나로 묶고 중복 포함 금지. 여러 독립 리더의 증거가 확인돼야 검증된 합의로 표현한다.
- comparison은 from/to/label/summary. 직전 7일 기준점과 현재를 확인한 경우에만 주간 변화라고 한다. 기준점이 없으면 준비 중으로 표시한다. 기존 direction의 하루 변화를 주간 변화로 바꾸지 않는다.
- 활성 checkpoints 최대 6개: 기존 date/title/test/theme와 id/hypothesisId/dueDate/nextReviewDate/status/reviewedAt/result/evidenceIds/history를 포함한다. dueDate는 외부 약속일, nextReviewDate는 편집 일정으로 구별한다.
- 상태 unverified/confirmed/refuted/delayed. 기한 경과만으로 delayed로 바꾸지 않는다. 확인·반증·실제 지연 모두 결과 원문과 검토 시각 필수. unresolved는 다음 재검토일과 부족한 증거를 갱신한다. 이전 판단은 checkpoint.history에 남긴다.
- 완료 항목은 삭제 대신 research.checkpointArchive로 이동한다. 주가가 올랐다는 이유로 가설을 확인 처리하지 않는다.

## 결과 보고

기준일·실제 조사 구간, 결정적/관찰 수와 제목·점수·실행 단계·원문, 주요 제외 이유, partial/no_signal 이유, 재평가·승격·반증·지연 변경, 배포 성공 여부와 공개 주소를 한국어로 짧게 보고한다. 확인하지 못한 수치·사실을 채우지 않는다.
