# Atelier Nocturne — Character Archive

개인 캐릭터 설정, 세계관, 이미지와 업데이트를 정적 데이터로 관리하는 반응형 아카이브입니다.

## 폴더 구조

```text
HomePage/
├─ app/
│  ├─ data/
│  │  ├─ characters.ts   # 캐릭터 프로필과 갤러리
│  │  ├─ worlds.ts       # 세계관 정보
│  │  └─ updates.ts      # 업데이트 기록
│  ├─ globals.css        # 전체 디자인, 색상, 반응형 스타일
│  ├─ layout.tsx         # 사이트 제목과 공통 문서 구조
│  └─ page.tsx           # 화면, 메뉴, 필터, 탭, 라이트박스
├─ public/               # 직접 보관할 이미지
└─ package.json          # 실행 명령과 패키지
```

## 실행 방법

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

터미널에 표시되는 `http://localhost:...` 주소를 브라우저에서 엽니다. 배포용 결과 확인은 `npm run build`로 할 수 있습니다.

## 캐릭터 추가

`app/data/characters.ts`에서 기존 캐릭터 객체 하나를 복사해 배열 마지막에 붙이고 `id`, 이름, 프로필 내용을 바꿉니다. `id`는 중복되지 않는 영문 소문자 형태를 권장합니다. 목록과 개별 프로필은 자동으로 만들어집니다. 관계는 상대 캐릭터의 `id`를 `relationships.characterId`에 입력합니다.

## 이미지 교체

이미지를 `public/images` 폴더에 넣고 데이터의 URL을 `/images/파일명.jpg` 형태로 바꿉니다.

- `thumbnail`: 목록 카드 이미지
- `profileImage`: 프로필 상단 대표 이미지
- `gallery[].url`: 갤러리 이미지
- 세계관의 `image`: 세계관 대표 이미지

## 메뉴 수정

`app/page.tsx` 상단의 `nav` 배열에서 메뉴 이름과 순서를 바꿉니다. 기존 화면 외에 새 화면을 추가하려면 `Page` 타입과 본문 렌더링 조건도 함께 추가합니다.

## 색상 변경

`app/globals.css`의 맨 위 `:root` 변수에서 전체 색을 수정합니다. 캐릭터별 포인트 색은 `characters.ts`의 `accentColor`만 바꾸면 됩니다.

## 배포 방법

GitHub에 올린 뒤 Vercel, Netlify, Cloudflare Pages 등에서 저장소를 연결합니다. 빌드 명령은 `npm run build`를 사용합니다. 이 프로젝트는 별도 데이터베이스 없이 정적 데이터만으로 실행됩니다.
