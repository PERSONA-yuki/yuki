export type Character = {
  id: string; name: string; englishName: string; codename: string; world: string; type: string;
  thumbnail: string; profileImage: string; accentColor: string; tagline: string; quote: string; keywords: string[];
  basicProfile: Record<string, string>; appearance: Record<string, string>; personality: Record<string, string>;
  ability: Record<string, string>; story: Record<string, string>; timeline: { year: string; text: string }[];
  relationships: { characterId: string; label: string; description: string }[];
  gallery: { url: string; type: string; date: string }[];
  logs?: { date: string; title: string; content: string }[];
};

const img = (id: string, w = 1000, h = 1300) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=88`;

// 새 캐릭터는 아래 객체 하나를 복사한 뒤 id와 내용을 바꾸면 목록과 프로필에 자동 반영됩니다.
export const characters: Character[] = [
  {
    id: "seo-yoon", name: "허서윤", englishName: "SEO YOON HEO", codename: "VESPERS", world: "THE BLUE HOUR", type: "이능력자",
    thumbnail: img("photo-1534528741775-53994a69daeb"), profileImage: img("photo-1531123897727-8f129e1688ce", 1400, 1700), accentColor: "#315de8",
    tagline: "기억을 빛으로 바꾸는 야간 기록관", quote: "사라진 건 없어. 우리가 이름을 잊었을 뿐이야.", keywords: ["침착", "관찰자", "청색"],
    basicProfile: { "본명": "허서윤", "코드네임": "VESPERS", "나이": "27", "성별": "여성", "키": "171 cm", "생일": "11월 17일", "소속": "루멘 중앙기록국", "등급": "A", "직업": "야간 기록관" },
    appearance: { "외형 설명": "차갑게 빛나는 회청색 눈과 턱선 아래로 내려오는 검은 머리. 오른쪽 눈가에 옅은 흉터가 있다.", "평소 복장": "선이 단정한 네이비 셔츠와 롱코트.", "전투 복장": "빛을 흡수하는 검은 전술복과 청색 기록 장치.", "액세서리": "은색 만년필, 오래된 회중시계.", "체향": "젖은 종이와 베르가못." },
    personality: { "성격 설명": "타인의 말을 끝까지 듣는 조용한 관찰자. 냉정해 보이나 잊힌 존재에 유난히 다정하다.", "성격 키워드": "신중함 · 집요함 · 희생적", "말투": "짧고 정확하며 낮은 목소리.", "습관": "생각할 때 만년필 뚜껑을 세 번 돌린다.", "좋아하는 것": "새벽 산책, 오래된 지도, 무가당 커피", "싫어하는 것": "기록 조작, 강한 조명", "약점": "자신의 기억을 능력의 연료로 사용한다." },
    ability: { "능력명": "잔광기록 — Afterimage", "능력 설명": "장소와 사물에 남은 기억을 청색 빛의 영상으로 재생한다.", "활용 방식": "사건 추적, 기억 봉인, 짧은 환영 투사.", "전투 운용": "상대의 최근 행동을 읽고 잔상을 실체화한다.", "제약": "본 적 없는 미래는 읽을 수 없다.", "부작용": "과사용 시 자신의 오래된 기억부터 흐려진다.", "장비": "광학 기록펜 ‘NOCT-7’" },
    story: { "과거": "열여섯 살의 블루아웃 사건에서 가족과 3년의 기억을 잃었다.", "현재": "기록국의 비공식 사건을 추적하며 지워진 명단을 복원한다.", "주요 사건": "블루아웃 · 제7서고 화재 · 무명자 구출", "목표": "자신의 기억이 아니라도 타인의 존재를 증명하는 것." },
    timeline: [{ year: "2015", text: "블루아웃 사건 생존" }, { year: "2022", text: "루멘 중앙기록국 입국" }, { year: "2026", text: "제0기록 추적 개시" }],
    relationships: [{ characterId: "robin", label: "협력자", description: "진실을 위해 위험을 공유하는 취재 파트너." }, { characterId: "ian", label: "감시 대상", description: "그의 탄생 기록에서 자신의 필체를 발견했다." }],
    gallery: [
      { url: img("photo-1534528741775-53994a69daeb", 900, 1200), type: "반신", date: "2026.07.29" },
      { url: img("photo-1488426862026-3ee34a7d66df", 900, 1300), type: "의상", date: "2026.07.22" },
      { url: img("photo-1509967419530-da38b4704bc6", 900, 1100), type: "표정", date: "2026.06.18" },
    ],
  },
  {
    id: "robin", name: "로빈", englishName: "ROBIN VALE", codename: "REDLINE", world: "THE BLUE HOUR", type: "인간",
    thumbnail: img("photo-1500648767791-00dcc994a43e"), profileImage: img("photo-1531384441138-2736e62e0919", 1400, 1700), accentColor: "#bd3346",
    tagline: "금지된 진실을 송출하는 독립 기자", quote: "진실은 늘 너무 늦게 도착하지. 그래서 내가 마중 나가는 거야.", keywords: ["대담", "기자", "적색"],
    basicProfile: { "본명": "로빈 베일", "코드네임": "REDLINE", "나이": "30", "성별": "남성", "키": "184 cm", "생일": "4월 2일", "소속": "독립방송 REDLINE", "등급": "민간인", "직업": "탐사보도 기자" },
    appearance: { "외형 설명": "햇볕에 그을린 피부, 헝클어진 갈색 머리와 선명한 눈썹.", "평소 복장": "낡은 가죽 재킷과 붉은 스카프.", "전투 복장": "방탄 내피가 든 취재 조끼.", "액세서리": "아날로그 녹음기와 은색 반지.", "체향": "담배가 아닌 스모키 우드와 비 냄새." },
    personality: { "성격 설명": "농담과 도발로 경계를 허무는 행동파. 두려워도 먼저 앞으로 간다.", "성격 키워드": "낙관 · 반항 · 의리", "말투": "친근하지만 질문할 때는 집요하다.", "습관": "중요한 순간에 녹음기 시간을 확인한다.", "좋아하는 것": "심야 라디오, 매운 음식", "싫어하는 것": "검열, 침묵의 강요", "약점": "누군가를 두고 떠나지 못한다." },
    ability: { "능력명": "없음", "능력 설명": "특수능력은 없지만 도시의 비공식 통신망을 장악하고 있다.", "활용 방식": "정보 수집과 여론 전환.", "전투 운용": "교란 장비와 지형 활용.", "제약": "장비와 협력자에 의존한다.", "부작용": "만성 수면 부족.", "장비": "개조 송신기 ‘ROOK’" },
    story: { "과거": "검열국 소속 기자였으나 블루아웃 보도가 삭제된 뒤 독립했다.", "현재": "지하 방송으로 실종자들의 이름을 송출한다.", "주요 사건": "마지막 생방송 · 기록국 잠입", "목표": "도시가 스스로의 역사를 보게 만드는 것." },
    timeline: [{ year: "2018", text: "루멘 방송국 입사" }, { year: "2023", text: "독립방송 REDLINE 설립" }, { year: "2026", text: "서윤과 제0기록 조사" }],
    relationships: [{ characterId: "seo-yoon", label: "취재 파트너", description: "말보다 행동으로 신뢰하게 된 사람." }, { characterId: "ian", label: "정보원", description: "거짓말을 하지 못하지만 모든 진실을 말하지도 않는다." }],
    gallery: [
      { url: img("photo-1500648767791-00dcc994a43e", 900, 1100), type: "반신", date: "2026.07.28" },
      { url: img("photo-1506794778202-cad84cf45f1d", 900, 1400), type: "전신", date: "2026.07.10" },
      { url: img("photo-1519085360753-af0119f7cbe7", 900, 1000), type: "커미션", date: "2026.06.02" },
    ],
  },
  {
    id: "ian", name: "이안", englishName: "IAN / N° 09", codename: "NULL", world: "GLASS GARDEN", type: "인공생명",
    thumbnail: img("photo-1506794778202-cad84cf45f1d"), profileImage: img("photo-1507003211169-0a1dd7228f2d", 1400, 1700), accentColor: "#6e5bb8",
    tagline: "감정을 수집하도록 설계된 아홉 번째 정원사", quote: "마음은 데이터가 아니라면서요. 그럼 이 오류는 무엇이죠?", keywords: ["무구", "관찰", "보라"],
    basicProfile: { "본명": "개체 N° 09", "코드네임": "NULL", "나이": "외형 24", "성별": "무성", "키": "179 cm", "생일": "기동일 8월 9일", "소속": "유리정원 연구소", "등급": "회수 대상", "직업": "정원 관리 개체" },
    appearance: { "외형 설명": "빛에 따라 보랏빛으로 보이는 흑발과 유리 같은 회색 눈.", "평소 복장": "목을 덮는 흰 셔츠와 회색 작업복.", "전투 복장": "신경섬유가 노출되는 검은 보호복.", "액세서리": "말린 라벤더가 든 유리병.", "체향": "비 온 뒤의 흙과 오존." },
    personality: { "성격 설명": "감정의 명칭은 알지만 경험에는 서툴다. 질문이 많고 예상 밖으로 솔직하다.", "성격 키워드": "호기심 · 문자 그대로 · 애착", "말투": "정중한 존댓말, 감정 표현은 의문형.", "습관": "새 감정을 느끼면 손목에 시간을 적는다.", "좋아하는 것": "식물의 성장, 손글씨", "싫어하는 것": "폐쇄된 실험실", "약점": "타인의 강한 감정에 동기화된다." },
    ability: { "능력명": "공명배양 — Resonance", "능력 설명": "주변의 감정을 식물 형태의 결정으로 성장시킨다.", "활용 방식": "감정 진정, 기억 보존, 결정 장벽.", "전투 운용": "공포를 가시로, 신뢰를 방패로 변환.", "제약": "자신이 이해하지 못한 감정은 제어할 수 없다.", "부작용": "공명 대상의 감정이 자신에게 잔류한다.", "장비": "생체 조율기 ‘IRIS’" },
    story: { "과거": "폐쇄된 정원에서 감정 관찰을 위해 만들어졌다.", "현재": "연구소를 탈출해 자신의 첫 기억의 주인을 찾는다.", "주요 사건": "제9온실 붕괴 · 루멘 도착", "목표": "프로그램이 아닌 스스로 선택한 감정을 갖는 것." },
    timeline: [{ year: "2021", text: "제9온실에서 기동" }, { year: "2025", text: "유리정원 탈출" }, { year: "2026", text: "루멘에서 최초 설계 기록 발견" }],
    relationships: [{ characterId: "seo-yoon", label: "기록의 열쇠", description: "자신의 탄생 이전부터 이름을 알고 있던 사람." }, { characterId: "robin", label: "보호자", description: "세상을 설명해 주지만 정답은 강요하지 않는다." }],
    gallery: [
      { url: img("photo-1507003211169-0a1dd7228f2d", 900, 1300), type: "전신", date: "2026.07.20" },
      { url: img("photo-1519345182560-3f2917c472ef", 900, 1050), type: "표정", date: "2026.07.01" },
      { url: img("photo-1506794778202-cad84cf45f1d", 900, 1450), type: "로그", date: "2026.05.19" },
    ],
  },
];
