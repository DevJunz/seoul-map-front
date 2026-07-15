# First AI Team - Frontend (Vue 3 + Vite)

간단한 SPA 뼈대를 제공합니다. `frontend.design` 명세를 기반으로 mock 데이터로 먼저 동작합니다. 향후 `sqlite_api_spec.md`에 따라 API 연동이 가능합니다.

빠른 시작

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

구성

- `src/pages` : Community, Map, Calendar 페이지
- `src/components` : Chatbot, PostForm, PostList
- `src/mock` : mock 데이터 (posts, places, events)

노트

- 좋아요 중복 방지는 브라우저 로컬 `client_id`로 처리합니다.
- 익명 게시글의 수정/삭제는 평문 비밀번호로 검증합니다 (명세에 따름).
- 챗봇은 현재 mock으로 동작하며, API 연동 시 `src/components/Chatbot.vue`를 수정하면 됩니다.
