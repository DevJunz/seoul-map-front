# SQLite 데이터 정의 및 API 응답 명세

## 1. SQLite 테이블

### 1.1 posts

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0
);
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | TEXT | 게시글 UUID |
| created_at | TEXT | 생성 시간 |
| updated_at | TEXT | 수정 시간 |
| title | TEXT | 게시글 제목 |
| content | TEXT | 게시글 내용 |
| password_hash | TEXT | 해시 처리된 비밀번호 |
| view_count | INTEGER | 조회 수 |

---

### 1.2 post_likes

```sql
CREATE TABLE post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE,

  UNIQUE (post_id, client_id)
);
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | TEXT | 좋아요 UUID |
| post_id | TEXT | 게시글 ID |
| client_id | TEXT | 익명 사용자 식별값 |
| created_at | TEXT | 좋아요 생성 시간 |

---

### 1.3 places

```sql
CREATE TABLE places (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL UNIQUE,
  content_type_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  address TEXT,
  first_image_url TEXT,
  map_x REAL,
  map_y REAL
);
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | TEXT | 내부 UUID |
| content_id | TEXT | TourAPI 콘텐츠 ID |
| content_type_id | INTEGER | 콘텐츠 유형 |
| title | TEXT | 장소 이름 |
| address | TEXT | 주소 |
| first_image_url | TEXT | 대표 이미지 URL |
| map_x | REAL | 경도 |
| map_y | REAL | 위도 |

---

### 1.4 contests

```sql
CREATE TABLE contests (
  id TEXT PRIMARY KEY,
  place_id TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  age_limit INTEGER,

  FOREIGN KEY (place_id)
    REFERENCES places(id)
    ON DELETE SET NULL
);
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | TEXT | 행사 UUID |
| place_id | TEXT | 장소 ID |
| start_date | TEXT | 시작일 |
| end_date | TEXT | 종료일 |
| title | TEXT | 행사 제목 |
| image_url | TEXT | 행사 이미지 |
| description | TEXT | 행사 설명 |
| age_limit | INTEGER | 나이 제한 |

---

## 2. 전체 SQLite 스키마

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE,

  UNIQUE (post_id, client_id)
);

CREATE TABLE places (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL UNIQUE,
  content_type_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  address TEXT,
  first_image_url TEXT,
  map_x REAL,
  map_y REAL
);

CREATE TABLE contests (
  id TEXT PRIMARY KEY,
  place_id TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  age_limit INTEGER,

  FOREIGN KEY (place_id)
    REFERENCES places(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_posts_created_at
ON posts(created_at DESC);

CREATE INDEX idx_post_likes_post_id
ON post_likes(post_id);

CREATE INDEX idx_places_content_type_id
ON places(content_type_id);

CREATE INDEX idx_contests_date
ON contests(start_date, end_date);
```

---

# 3. 공통 응답 형식

## 성공 응답

```json
{
  "success": true,
  "message": "요청에 성공했습니다.",
  "data": {}
}
```

## 실패 응답

```json
{
  "success": false,
  "statusCode": 400,
  "message": "잘못된 요청입니다.",
  "error": "Bad Request"
}
```

---

# 4. API 명세

## 1. 게시글 목록 조회

```http
GET /posts?page=1&take=20
```

### 응답

```json
{
  "success": true,
  "message": "게시글 목록 조회에 성공했습니다.",
  "data": {
    "items": [
      {
        "id": "8da8c240-c373-4aea-968f-c610ed1e9578",
        "time": "2026-07-14T17:30:00+09:00",
        "title": "게시글 제목",
        "content": "게시글 내용",
        "viewCount": 12,
        "likeCount": 3
      }
    ],
    "meta": {
      "page": 1,
      "take": 20,
      "total": 48,
      "totalPages": 3
    }
  }
}
```

---

## 2. 게시글 상세 조회

```http
GET /posts/{id}
```

### 응답

```json
{
  "success": true,
  "message": "게시글 조회에 성공했습니다.",
  "data": {
    "id": "8da8c240-c373-4aea-968f-c610ed1e9578",
    "time": "2026-07-14T17:30:00+09:00",
    "title": "게시글 제목",
    "content": "게시글 전체 내용",
    "viewCount": 13,
    "likeCount": 3,
    "liked": false
  }
}
```

---

## 3. 게시글 작성

```http
POST /posts
```

### 요청

```json
{
  "title": "게시글 제목",
  "content": "게시글 내용",
  "pwd": "1234"
}
```

### 응답

```json
{
  "success": true,
  "message": "게시글 작성에 성공했습니다.",
  "data": {
    "id": "8da8c240-c373-4aea-968f-c610ed1e9578",
    "time": "2026-07-14T17:30:00+09:00",
    "title": "게시글 제목",
    "content": "게시글 내용",
    "viewCount": 0,
    "likeCount": 0
  }
}
```

---

## 4. 게시글 수정

```http
PATCH /posts/{id}
```

### 요청

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "pwd": "1234"
}
```

### 응답

```json
{
  "success": true,
  "message": "게시글 수정에 성공했습니다.",
  "data": {
    "id": "8da8c240-c373-4aea-968f-c610ed1e9578",
    "time": "2026-07-14T17:30:00+09:00",
    "title": "수정된 제목",
    "content": "수정된 내용",
    "viewCount": 13,
    "likeCount": 3
  }
}
```

---

## 5. 게시글 좋아요 등록

```http
POST /posts/{id}/likes
```

요청 본문은 없으며 서버가 쿠키의 `clientId`를 사용한다.

### 응답

```json
{
  "success": true,
  "message": "좋아요가 등록되었습니다.",
  "data": {
    "postId": "8da8c240-c373-4aea-968f-c610ed1e9578",
    "liked": true,
    "likeCount": 4
  }
}
```

---

## 6. 게시글 좋아요 취소

```http
DELETE /posts/{id}/likes
```

### 응답

```json
{
  "success": true,
  "message": "좋아요가 취소되었습니다.",
  "data": {
    "postId": "8da8c240-c373-4aea-968f-c610ed1e9578",
    "liked": false,
    "likeCount": 3
  }
}
```

---

## 7. 장소 목록 조회

```http
GET /places
```

### 응답

```json
{
  "success": true,
  "message": "장소 목록 조회에 성공했습니다.",
  "data": {
    "items": [
      {
        "id": "e347a53d-8334-4095-a9ba-c0ab084513fc",
        "contentId": "2556687",
        "contentTypeId": 15,
        "title": "문학주간 2026",
        "address": "서울특별시 종로구 대학로 104 (동숭동)",
        "firstImageUrl": "https://tong.visitkorea.or.kr/cms/resource/47/4077947_image2_1.jpg",
        "mapX": 127.0023742293,
        "mapY": 37.580512461
      }
    ]
  }
}
```

---

## 8. 월별 캘린더 조회

```http
GET /calendars?year=2026&month=07
```

### 응답

```json
{
  "success": true,
  "message": "캘린더 조회에 성공했습니다.",
  "data": {
    "year": 2026,
    "month": 7,
    "items": [
      {
        "id": "c9986290-87be-4d82-aa7a-866bc0996525",
        "title": "문학주간 2026",
        "startDate": "2026-07-10",
        "endDate": "2026-07-17",
        "imageUrl": "https://example.com/image.jpg",
        "description": "문학 관련 행사입니다.",
        "ageLimit": null,
        "place": {
          "id": "e347a53d-8334-4095-a9ba-c0ab084513fc",
          "title": "대학로",
          "address": "서울특별시 종로구 대학로 104",
          "mapX": 127.0023742293,
          "mapY": 37.580512461
        }
      }
    ]
  }
}
```

---

# 5. API 목록

| 번호 | Method | Endpoint | 설명 |
|---:|---|---|---|
| 1 | GET | `/posts?page=1&take=20` | 게시글 목록 조회 |
| 2 | GET | `/posts/{id}` | 게시글 상세 조회 |
| 3 | POST | `/posts` | 게시글 작성 |
| 4 | PATCH | `/posts/{id}` | 게시글 수정 |
| 5 | POST | `/posts/{id}/likes` | 좋아요 등록 |
| 6 | DELETE | `/posts/{id}/likes` | 좋아요 취소 |
| 7 | GET | `/places` | 장소 목록 조회 |
| 8 | GET | `/calendars?year=2026&month=07` | 월별 행사 조회 |

## 네이밍 규칙

- DB 컬럼: `snake_case`
- API 요청 및 응답: `camelCase`
- 날짜 및 시간: ISO 8601 형식
- 비밀번호는 해시로 저장하고 응답에 포함하지 않음
