export interface Article {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string;
  readTime?: string;
  keywords: string[];
}

export interface W1HAnswers {
  who: string;
  when: string;
  where: string;
  what: string;
  how: string;
  why: string;
}

export interface W1HQuotes {
  who: string[];
  when: string[];
  where: string[];
  what: string[];
  how: string[];
  why: string[];
}

export interface AnalysisResult {
  answers: W1HAnswers;
  quotes: W1HQuotes;
}

export interface SavedDocument {
  id: number;
  date: string;
  articleTitle: string;
  answers: W1HAnswers;
}

export enum W1HField {
  WHO = 'who',
  WHEN = 'when',
  WHERE = 'where',
  WHAT = 'what',
  HOW = 'how',
  WHY = 'why'
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const RECOMMENDED_ARTICLES: Article[] = [
  {
    id: 'rec_1',
    category: '과학',
    title: '제임스 웹 우주 망원경, 우주의 비밀을 밝히다',
    content: `우주에는 아주 거대한 눈이 떠 있습니다. 바로 '제임스 웹 우주 망원경'입니다. 이 망원경은 2021년 크리스마스에 우주로 발사되어 지구에서 약 150만 킬로미터 떨어진 곳에 도착했습니다. 이곳은 아주 춥고 어두워서 별들의 희미한 빛을 포착하기에 아주 좋은 장소입니다.\n\n최근 제임스 웹 망원경은 '창조의 기둥'이라는 성운을 촬영했습니다. 사진 속에는 가스와 먼지 구름 속에서 아기 별들이 태어나는 모습이 아주 선명하게 담겨 있었습니다. 이전의 망원경으로는 뿌옇게 보이던 먼지 구름 안쪽까지 꿰뚫어 본 것입니다.\n\n과학자들은 이 사진을 통해 별이 어떻게 태어나고 자라나는지 연구하고 있습니다. 또한, 아주 먼 우주를 관찰하여 우주가 처음 생겨날 때의 모습도 알아내려고 합니다. 제임스 웹 망원경은 우리가 알지 못했던 우주의 신비로운 비밀들을 하나씩 풀어줄 것입니다.`,
    source: '추천 과학 상식',
    readTime: '3분',
    keywords: ['우주', '망원경', '과학', '별', '나사']
  },
  {
    id: 'rec_2',
    category: '역사',
    title: '세종대왕의 위대한 선물, 훈민정음 탄생 이야기',
    content: `조선 시대 초기만 해도 우리나라는 고유한 글자가 없어서 중국의 한자를 빌려 쓰고 있었습니다. 하지만 한자는 배우기가 너무 어렵고 우리말과 문법이 달랐습니다. 그래서 일반 백성들은 억울한 일이 있어도 관청에 글로 호소할 수 없었고, 농사짓는 법을 책으로 배울 수도 없었습니다.\n\n이를 안타깝게 여긴 세종대왕은 집현전 학자들과 함께 연구를 거듭하여 1443년, 드디어 우리 글자인 '훈민정음'을 만들었습니다. '백성을 가르치는 바른 소리'라는 뜻입니다. 세종대왕은 사람의 발음 기관(입, 혀, 목구멍) 모양을 본떠 자음을 만들고, 하늘, 땅, 사람의 모양을 본떠 모음을 만들었습니다.\n\n처음에는 양반들이 "오랑캐의 글자"라며 반대하기도 했습니다. 하지만 한글은 배우기 쉽고 쓰기 편해서 금방 널리 퍼지게 되었습니다. 오늘날 한글은 세계에서 가장 과학적이고 독창적인 문자로 인정받고 있으며, 유네스코 세계기록유산으로도 등재되어 있습니다.`,
    source: '한국사 다시 읽기',
    readTime: '4분',
    keywords: ['세종대왕', '한글', '역사', '조선', '문화유산']
  }
];

export const SUGGESTED_KEYWORDS = ['공룡', '인공지능', '기후 변화', '이순신', 'BTS', '독도'];