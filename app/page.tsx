"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { characters, type Character } from "./data/characters";
import { worlds } from "./data/worlds";
import { updates } from "./data/updates";

type Page = "home" | "characters" | "worlds" | "gallery" | "updates" | "character" | "world" | "editor";
let liveCharacters: Character[] = characters;
type WorldItem = (typeof worlds)[number];
let liveWorlds: WorldItem[] = worlds;
type UpdateItem = (typeof updates)[number];
let liveUpdates: UpdateItem[] = updates;
type HomeSettings = {
  logoLetter: string; logoImage: string; siteTitle: string;
  kicker: string; titleTop: string; titleBottom: string; intro: string;
  buttonText: string; bannerUrl: string; noticeTitle: string; noticeBody: string;
  noticeRightTitle: string; noticeRightBody: string;
  noticeLeftImage: string; noticeRightImage: string;
  bgmTitle: string; bgmArtist: string; bgmUrl: string;
  sns1Label: string; sns1Url: string; sns2Label: string; sns2Url: string;
  footerTitle: string; footerText: string; footerBgColor: string; footerTextColor: string;
};
const defaultHome: HomeSettings = {
  logoLetter: "A",
  logoImage: "",
  siteTitle: "ATELIER NOCTURNE",
  kicker: "ORIGINAL CHARACTER ARCHIVE · EST. 2026",
  titleTop: "Stories begin", titleBottom: "where names remain.",
  intro: "흩어진 인물과 세계의 조각을 수집하는 개인 창작 아카이브.\n기억해야 할 모든 이름을 한곳에 기록합니다.",
  buttonText: "VIEW CHARACTERS",
  bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2000&q=90",
  noticeTitle: "Atelier Nocturne에 오신 것을 환영합니다.",
  noticeBody: "이곳은 창작 캐릭터와 세계관의 설정을 기록하는 개인 아카이브입니다. 상단 메뉴에서 인물, 세계관과 갤러리를 확인할 수 있습니다.",
  noticeRightTitle: "NOTICE",
  noticeRightBody: "캐릭터와 세계관 설정은 천천히 업데이트됩니다.\n모든 이미지와 설정의 무단 사용을 금합니다.",
  noticeLeftImage: "", noticeRightImage: "",
  bgmTitle: "BLUE HOUR", bgmArtist: "Archive theme", bgmUrl: "",
  sns1Label: "Twitter", sns1Url: "https://twitter.com/",
  sns2Label: "Instagram", sns2Url: "https://instagram.com/",
  footerTitle: "ATELIER NOCTURNE",
  footerText: "Original character & world archive · 2026",
  footerBgColor: "#071529", footerTextColor: "#ffffff",
};
let liveHome: HomeSettings = defaultHome;

// 이미지처럼 큰 데이터도 저장할 수 있는 브라우저 전용 저장소입니다.
function openArchiveDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("atelier-nocturne", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("archive");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveArchive(key: string, value: unknown) {
  const db = await openArchiveDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("archive", "readwrite");
    tx.objectStore("archive").put(value, key);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
  db.close();
}
async function loadArchive<T>(key: string): Promise<T | null> {
  try {
    const db = await openArchiveDb();
    const value = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction("archive", "readonly");
      const request = tx.objectStore("archive").get(key);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    db.close();
    if (value !== undefined) return value;
  } catch {}
  const legacy = localStorage.getItem(key);
  if (!legacy) return null;
  try { return JSON.parse(legacy) as T; } catch { return null; }
}
async function deleteArchive(key: string) {
  const db = await openArchiveDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("archive", "readwrite");
    tx.objectStore("archive").delete(key);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
  db.close();
}
const nav: { label: string; page: Page }[] = [
  { label: "HOME", page: "home" }, { label: "WORLD", page: "worlds" },
  { label: "CHARACTER", page: "characters" }, { label: "GALLERY", page: "gallery" },
];

export default function Archive() {
  const [page, setPage] = useState<Page>("home");
  const [selected, setSelected] = useState(liveCharacters[0].id);
  const [selectedWorld, setSelectedWorld] = useState(liveWorlds[0].id);
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [, setDataRevision] = useState(0);
  const [canEdit, setCanEdit] = useState(true);
  const go = (next: Page) => { setPage(next); setMenu(false); scrollTo({ top: 0, behavior: "smooth" }); };
  const openCharacter = (id: string) => { setSelected(id); go("character"); };
  const openWorld = (id: string) => { setSelectedWorld(id); go("world"); };

  useEffect(() => {
    setPage("home");
    const isLocalEditor = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    setCanEdit(isLocalEditor);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
    void (async () => {
      let published: { characters?: Character[]; worlds?: WorldItem[]; home?: HomeSettings } | null = null;
      try {
        const response = await fetch("/archive-data.json", { cache: "no-store" });
        if (response.ok) published = await response.json();
      } catch {}
      const [savedCharacters, savedHome, savedUpdates, savedWorlds] = await Promise.all([
        loadArchive<Character[]>("atelier-characters"), loadArchive<HomeSettings>("atelier-home"),
        loadArchive<UpdateItem[]>("atelier-updates"), loadArchive<WorldItem[]>("atelier-worlds"),
      ]);
      // 로컬 편집 화면에서는 사용자가 저장한 내용을 가장 먼저 불러옵니다.
      // 공개 사이트에서는 배포된 archive-data.json만 표시합니다.
      if (isLocalEditor && savedCharacters) liveCharacters = savedCharacters;
      else if (published?.characters) liveCharacters = published.characters;
      setSelected(liveCharacters[0]?.id || "");
      if (isLocalEditor && savedHome) liveHome = { ...defaultHome, ...savedHome };
      else if (published?.home) liveHome = { ...defaultHome, ...published.home };
      if (savedUpdates) liveUpdates = savedUpdates;
      if (isLocalEditor && savedWorlds) liveWorlds = savedWorlds;
      else if (published?.worlds) liveWorlds = published.worlds;
      if (!localStorage.getItem("restore-atelier-title-v2")) {
        liveHome = { ...liveHome, siteTitle: "ATELIER NOCTURNE", footerTitle: "ATELIER NOCTURNE" };
        await saveArchive("atelier-home", liveHome);
        localStorage.setItem("restore-atelier-title-v2", "done");
      }
      document.title = `${liveHome.siteTitle} — Character Archive`;
      setDataRevision(v => v + 1);
    })();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    const observer = new IntersectionObserver((entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")), { threshold: .1 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [page, dark]);

  return <div className="site-shell">
    <header>
      <button className="brand" onClick={() => go("home")} aria-label="대표 홈으로 이동">
        <span className={`brand-mark ${liveHome.logoImage ? "has-image" : ""}`}>{liveHome.logoImage ? <img src={liveHome.logoImage} alt="사이트 로고"/> : (liveHome.logoLetter || "A")}</span><span>{liveHome.siteTitle}</span>
      </button>
      <nav className={menu ? "open" : ""}>
        {nav.map(item => <button key={item.page} className={page === item.page ? "active" : ""} onClick={() => go(item.page)}>{item.label}</button>)}
      </nav>
      <div className="header-tools">
        {canEdit && <button className="edit-button" onClick={() => go("editor")} aria-label="아카이브 편집">EDIT</button>}
        <button className="theme-button" onClick={() => setDark(!dark)} aria-label="다크 모드 전환">{dark ? "☀" : "◐"}</button>
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="메뉴 열기"><span/><span/></button>
      </div>
    </header>
    <main className="page-fade">
      {page === "home" && <Home go={go} openCharacter={openCharacter} openWorld={openWorld} />}
      {page === "characters" && <Characters openCharacter={openCharacter} />}
      {page === "character" && <CharacterProfile character={liveCharacters.find(c => c.id === selected) || liveCharacters[0]} openCharacter={openCharacter} setLightbox={setLightbox} />}
      {page === "worlds" && <Worlds openWorld={openWorld} />}
      {page === "world" && <WorldDetail worldId={selectedWorld} openCharacter={openCharacter} />}
      {page === "gallery" && <Gallery setLightbox={setLightbox} />}
      {page === "updates" && <Updates />}
      {page === "editor" && <Editor onSaved={(destination = "home") => { setDataRevision(v => v + 1); go(destination); }} />}
    </main>
    <footer style={{ background: liveHome.footerBgColor, color: liveHome.footerTextColor }}><span>{liveHome.footerTitle}</span><p style={{ color: liveHome.footerTextColor }}>{liveHome.footerText}</p></footer>
    {lightbox && <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-label="이미지 크게 보기"><button>×</button><img src={lightbox} alt="확대 이미지"/></div>}
  </div>;
}

function SectionTitle({ eyebrow, title, link, onClick }: { eyebrow: string; title: string; link?: string; onClick?: () => void }) {
  return <div className="section-title reveal"><div><small>{eyebrow}</small><h2>{title}</h2></div>{link && <button onClick={onClick}>{link} <span>↗</span></button>}</div>;
}

function Home({ go, openCharacter, openWorld }: { go: (p: Page) => void; openCharacter: (id: string) => void; openWorld: (id: string) => void }) {
  return <>
    <section className="hero">
      <div className="hero-image" style={{ backgroundImage: `url("${liveHome.bannerUrl}")` }} />
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="kicker">{liveHome.kicker}</p>
        <h1>{liveHome.titleTop}<br/><em>{liveHome.titleBottom}</em></h1>
        <p className="hero-copy">{liveHome.intro.split("\n").map((line, i) => <span key={i}>{line}{i < liveHome.intro.split("\n").length - 1 && <br/>}</span>)}</p>
        <button className="primary" onClick={() => go("characters")}>{liveHome.buttonText} <span>→</span></button>
      </div>
      <div className="hero-index">001 — 006</div>
    </section>
    <section className="home-notices">
      <div className="notice-highlight reveal">
        <h2>{liveHome.noticeTitle}</h2>
        <div className="notice-columns">
          <article>{liveHome.noticeLeftImage && <img src={liveHome.noticeLeftImage} alt="왼쪽 공지 이미지"/>}<p>{liveHome.noticeBody}</p></article>
          <article>{liveHome.noticeRightImage && <img src={liveHome.noticeRightImage} alt="오른쪽 공지 이미지"/>}<p>{liveHome.noticeRightBody}</p></article>
        </div>
      </div>
      <div className="social-links">
        {liveHome.sns1Label && <a href={liveHome.sns1Url || "#"} target="_blank" rel="noreferrer"><span>↗</span><b>{liveHome.sns1Label}</b><i>→</i></a>}
        {liveHome.sns2Label && <a href={liveHome.sns2Url || "#"} target="_blank" rel="noreferrer"><span>↗</span><b>{liveHome.sns2Label}</b><i>→</i></a>}
      </div>
      <BgmCard home={liveHome}/>
    </section>
  </>;
}

function Characters({ openCharacter }: { openCharacter: (id: string) => void }) {
  const [query, setQuery] = useState(""); const [world, setWorld] = useState("ALL"); const [type, setType] = useState("ALL");
  const filtered = liveCharacters.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) && (world === "ALL" || c.world === world) && (type === "ALL" || c.type === type));
  return <section className="listing-page">
    <PageIntro no="01" eyebrow="CHARACTER DIRECTORY" title="All characters" copy="기록된 인물들을 이름, 세계관, 유형으로 찾아보세요." />
    <div className="filters reveal">
      <label className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="이름으로 검색"/></label>
      <select value={world} onChange={e => setWorld(e.target.value)}><option>ALL</option>{liveWorlds.map(w => <option key={w.id}>{w.name}</option>)}</select>
      <select value={type} onChange={e => setType(e.target.value)}><option>ALL</option><option>인간</option><option>이능력자</option><option>인공생명</option></select>
      <button onClick={() => { setQuery(""); setWorld("ALL"); setType("ALL"); }}>전체 보기</button>
    </div>
    <div className="character-grid">{filtered.map(c => <article className="character-card reveal" key={c.id}>
      <button onClick={() => openCharacter(c.id)}><div className="character-image"><img src={c.thumbnail} alt={c.name}/><span>{c.codename}</span></div>
      <div className="character-info"><small>{c.world}</small><h2>{c.name}</h2><p>{c.englishName} · {c.tagline}</p><b>VIEW PROFILE →</b></div></button>
    </article>)}</div>
    {!filtered.length && <p className="empty">조건에 맞는 캐릭터가 없습니다.</p>}
  </section>;
}

function PageIntro({ no, eyebrow, title, copy }: { no: string; eyebrow: string; title: string; copy: string }) {
  return <div className="page-intro reveal"><div><small>{eyebrow}</small><h1>{title}</h1><p>{copy}</p></div><span>{no}</span></div>;
}

const tabs = ["PROFILE", "APPEARANCE", "PERSONALITY", "ABILITY", "STORY", "RELATIONSHIP", "GALLERY", "LOG"];
function CharacterProfile({ character: c, openCharacter, setLightbox }: { character: Character; openCharacter: (id: string) => void; setLightbox: (s: string) => void }) {
  const [tab, setTab] = useState("PROFILE");
  useEffect(() => setTab("PROFILE"), [c.id]);
  return <div className="profile-page" style={{ "--accent": c.accentColor } as React.CSSProperties}>
    <section className="profile-hero">
      <div className="profile-visual"><img src={c.profileImage} alt={c.name}/><span className="vertical-name">{c.englishName}</span></div>
      <div className="profile-heading reveal"><small>CHARACTER FILE · {c.codename}</small><h1>{c.name}</h1><h2>{c.englishName}</h2><p>{c.tagline}</p>
        <div className="profile-chips"><span>{c.world}</span>{c.keywords.map(k => <span key={k}>#{k}</span>)}</div>
        <blockquote>“{c.quote}”</blockquote>
      </div>
    </section>
    <div className="profile-tabs">{tabs.map(t => <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>{t}</button>)}</div>
    <section className="tab-content reveal">
      {tab === "PROFILE" && <InfoGrid data={c.basicProfile}/>}
      {tab === "APPEARANCE" && <TextSections data={c.appearance}/>}
      {tab === "PERSONALITY" && <TextSections data={c.personality}/>}
      {tab === "ABILITY" && <TextSections data={c.ability}/>}
      {tab === "STORY" && <><TextSections data={c.story}/><div className="timeline">{c.timeline.map(t => <div key={t.year}><time>{t.year}</time><span/><p>{t.text}</p></div>)}</div></>}
      {tab === "RELATIONSHIP" && <div className="relationship-grid">{c.relationships.map(r => {
        const target = liveCharacters.find(x => x.id === r.characterId); return target && <button key={r.characterId} onClick={() => openCharacter(r.characterId)}><img src={target.thumbnail} alt={target.name}/><div><small>{r.label}</small><h3>{target.name}</h3><p>{r.description}</p><b>VIEW PROFILE →</b></div></button>;
      })}</div>}
      {tab === "GALLERY" && <div className="profile-gallery">{c.gallery.map((g, i) => <button key={i} onClick={() => setLightbox(g.url)}><img src={g.url} alt={`${c.name} ${g.type}`}/><span>{g.type}</span></button>)}</div>}
      {tab === "LOG" && <div className="character-log">{(c.logs || []).length ? (c.logs || []).map((log, i) => <article key={i}><time>{log.date}</time><div><h2>{log.title}</h2><p>{log.content}</p></div></article>) : <p className="empty-log">아직 작성된 로그가 없습니다.</p>}</div>}
    </section>
  </div>;
}

function InfoGrid({ data }: { data: Record<string, string> }) { return <div className="info-grid">{Object.entries(data).map(([k, v]) => <div key={k}><small>{k}</small><p>{v}</p></div>)}</div>; }
function TextSections({ data }: { data: Record<string, string> }) { return <div className="text-sections">{Object.entries(data).map(([k, v]) => <article key={k}><small>{k}</small><p>{v}</p></article>)}</div>; }

function Worlds({ openWorld }: { openWorld: (id: string) => void }) { return <section className="listing-page"><PageIntro no="02" eyebrow="WORLD ARCHIVE" title="Worlds & universes" copy="서로 다른 규칙과 기억으로 이루어진 세계를 탐색하세요."/><div className="world-grid">{liveWorlds.map((w, i) => <button className="world-card reveal" key={w.id} onClick={() => openWorld(w.id)}><img src={w.image} alt={w.name}/><div><small>WORLD · 0{i + 1}</small><h2>{w.name}</h2><p>{w.summary}</p><span>EXPLORE →</span></div></button>)}</div></section>; }
function WorldDetail({ worldId, openCharacter }: { worldId: string; openCharacter: (id: string) => void }) {
  const w = liveWorlds.find(x => x.id === worldId) || liveWorlds[0]; return <section className="world-detail"><div className="world-detail-hero"><img src={w.image} alt={w.name}/><div><small>WORLD ARCHIVE</small><h1>{w.name}</h1><p>{w.summary}</p></div></div>
  <div className="world-copy reveal"><p className="lead">{w.description}</p><InfoGrid data={w.details}/><h2>Affiliated characters</h2><div className="mini-characters">{liveCharacters.filter(c => c.world === w.name).map(c => <button onClick={() => openCharacter(c.id)} key={c.id}><img src={c.thumbnail} alt={c.name}/><span>{c.name}<small>{c.codename}</small></span></button>)}</div></div></section>;
}

function Gallery({ setLightbox }: { setLightbox: (s: string) => void }) {
  const [char, setChar] = useState("ALL"); const [kind, setKind] = useState("ALL");
  const items = useMemo(() => liveCharacters.flatMap(c => c.gallery.map(g => ({ ...g, character: c }))).filter(x => (char === "ALL" || x.character.id === char) && (kind === "ALL" || x.type === kind)), [char, kind]);
  return <section className="listing-page"><PageIntro no="03" eyebrow="VISUAL RECORDS" title="Integrated gallery" copy="모든 캐릭터의 이미지와 순간을 한곳에서 감상하세요."/><div className="filters gallery-filters"><select value={char} onChange={e => setChar(e.target.value)}><option value="ALL">모든 캐릭터</option>{liveCharacters.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select><select value={kind} onChange={e => setKind(e.target.value)}><option>ALL</option><option>전신</option><option>반신</option><option>표정</option><option>의상</option><option>커미션</option><option>로그</option></select><select><option>최신 업로드순</option><option>오래된순</option></select></div>
  <div className="masonry">{items.map((g, i) => <button className="reveal" key={g.character.id + i} onClick={() => setLightbox(g.url)}><img src={g.url} alt={g.type}/><span><b>{g.character.name}</b><small>{g.type} · {g.date}</small></span></button>)}</div></section>;
}
function Updates() { return <section className="listing-page updates-page"><PageIntro no="04" eyebrow="ARCHIVE NOTES" title="Update log" copy="설정과 이미지가 추가되고 수정된 기록입니다."/><div className="update-list">{liveUpdates.map((u, i) => <article className="reveal" key={u.date + u.title}><span>{String(i + 1).padStart(2, "0")}</span><time>{u.date}</time><em>{u.category}</em><div><h2>{u.title}</h2><p>{u.detail}</p></div></article>)}</div></section>; }

function Editor({ onSaved }: { onSaved: (destination?: Page) => void }) {
  const [mode, setMode] = useState<"character" | "world" | "home" | "notice">("home");
  const [items, setItems] = useState<Character[]>(() => JSON.parse(JSON.stringify(liveCharacters)));
  const [home, setHome] = useState<HomeSettings>(() => ({ ...liveHome }));
  const [notices, setNotices] = useState<UpdateItem[]>(() => JSON.parse(JSON.stringify(liveUpdates)));
  const [worldItems, setWorldItems] = useState<WorldItem[]>(() => JSON.parse(JSON.stringify(liveWorlds)));
  const [index, setIndex] = useState(0);
  const current = items[index];
  const change = <K extends keyof Character,>(key: K, value: Character[K]) => setItems(old => old.map((c, i) => i === index ? { ...c, [key]: value } : c));
  const changeRecord = (section: "basicProfile" | "appearance" | "personality" | "ability" | "story", key: string, value: string) =>
    change(section, { ...current[section], [key]: value });
  const changeTimeline = (i: number, key: "year" | "text", value: string) =>
    change("timeline", current.timeline.map((item, n) => n === i ? { ...item, [key]: value } : item));
  const changeRelationship = (i: number, key: "characterId" | "label" | "description", value: string) =>
    change("relationships", current.relationships.map((item, n) => n === i ? { ...item, [key]: value } : item));
  const addGalleryImages = (files?: FileList | null) => {
    if (!files?.length) return;
    [...files].forEach(file => {
      const reader = new FileReader();
      reader.onload = () => change("gallery", [...current.gallery, { url: String(reader.result), type: "이미지", date: new Date().toISOString().slice(0, 10).replaceAll("-", ".") }]);
      reader.readAsDataURL(file);
    });
  };
  const changeLog = (i: number, key: "date" | "title" | "content", value: string) =>
    change("logs", (current.logs || []).map((log, n) => n === i ? { ...log, [key]: value } : log));
  const uploadCharacterImage = (key: "thumbnail" | "profileImage", file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => change(key, String(reader.result));
    reader.readAsDataURL(file);
  };
  const save = async () => {
    liveCharacters = items;
    await saveArchive("atelier-characters", items);
    onSaved("characters");
  };
  const add = () => {
    const copy: Character = JSON.parse(JSON.stringify(current));
    copy.id = `new-character-${Date.now()}`;
    copy.name = "새 캐릭터";
    copy.englishName = "NEW CHARACTER";
    copy.codename = "UNTITLED";
    const next = [...items, copy]; setItems(next); setIndex(next.length - 1);
  };
  const remove = () => {
    if (items.length <= 1 || !confirm(`${current.name} 캐릭터를 삭제할까요?`)) return;
    const next = items.filter((_, i) => i !== index); setItems(next); setIndex(Math.max(0, index - 1));
  };
  const exportForPublish = () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), home, worlds: worldItems, characters: items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "archive-data.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const reset = async () => {
    if (!confirm("모든 수정 내용을 지우고 처음 예시 데이터로 돌아갈까요?")) return;
    localStorage.removeItem("atelier-characters"); await deleteArchive("atelier-characters"); liveCharacters = characters;
    setItems(JSON.parse(JSON.stringify(characters))); setIndex(0);
  };
  if (!current) return null;
  return <section className="editor-page">
    <PageIntro no="✎" eyebrow="EASY EDITOR" title="Archive editor" copy="코드를 열지 않고 캐릭터의 기본 정보와 이미지를 수정할 수 있습니다."/>
    <div className="editor-mode-tabs">
      <button className={mode === "home" ? "active" : ""} onClick={() => setMode("home")}>홈 화면 편집</button>
      <button className={mode === "notice" ? "active" : ""} onClick={() => setMode("notice")}>고정 공지 편집</button>
      <button className={mode === "world" ? "active" : ""} onClick={() => setMode("world")}>세계관 편집</button>
      <button className={mode === "character" ? "active" : ""} onClick={() => setMode("character")}>캐릭터 편집</button>
      <button className="export-button" onClick={exportForPublish}>배포용 데이터 내보내기 ↓</button>
    </div>
    {mode === "home" && <HomeEditor value={home} setValue={setHome} onSave={async () => {
      liveHome = home; await saveArchive("atelier-home", home); document.title = `${home.siteTitle} — Character Archive`; onSaved("home");
    }}/>}
    {mode === "world" && <WorldEditor items={worldItems} setItems={setWorldItems} onSave={async () => {
      liveWorlds = worldItems; await saveArchive("atelier-worlds", worldItems); onSaved("worlds");
    }}/>}
    {mode === "notice" && <NoticeEditor home={home} setHome={setHome} onSave={async () => {
      liveHome = home;
      try { await saveArchive("atelier-home", home); }
      catch { alert("저장하지 못했습니다. 파일 크기를 확인해주세요."); return; }
      onSaved("home");
    }}/>}
    {mode === "character" && <>
    <div className="editor-layout">
      <aside className="editor-list">
        <div className="editor-help"><b>사용 방법</b><p>왼쪽에서 캐릭터를 고르고 내용을 바꾼 뒤 아래의 ‘저장하고 확인’ 버튼을 누르세요.</p></div>
        {items.map((c, i) => <button className={i === index ? "active" : ""} onClick={() => setIndex(i)} key={c.id}><img src={c.thumbnail} alt=""/><span>{c.name}<small>{c.codename}</small></span></button>)}
        <button className="add-character" onClick={add}>＋ 새 캐릭터 추가</button>
      </aside>
      <div className="editor-form">
        <div className="editor-preview"><img src={current.thumbnail} alt={current.name}/><div><small>현재 카드 미리보기</small><h2>{current.name || "이름 없음"}</h2><p>{current.tagline}</p></div></div>
        <div className="form-grid">
          <EditField label="이름" value={current.name} onChange={v => change("name", v)}/>
          <EditField label="영문 이름" value={current.englishName} onChange={v => change("englishName", v)}/>
          <EditField label="코드네임" value={current.codename} onChange={v => change("codename", v)}/>
          <EditField label="캐릭터 유형" value={current.type} onChange={v => change("type", v)}/>
          <label><span>소속 세계관</span><select value={current.world} onChange={e => change("world", e.target.value)}>{liveWorlds.map(w => <option key={w.id}>{w.name}</option>)}</select></label>
          <label><span>포인트 색상</span><div className="color-field"><input type="color" value={current.accentColor} onChange={e => change("accentColor", e.target.value)}/><input value={current.accentColor} onChange={e => change("accentColor", e.target.value)}/></div></label>
          <EditField wide label="한 줄 소개" value={current.tagline} onChange={v => change("tagline", v)}/>
          <EditField wide label="대표 대사" value={current.quote} onChange={v => change("quote", v)}/>
          <label><span>목록 썸네일 직접 선택</span><input className="file-input" type="file" accept="image/*" onChange={e => uploadCharacterImage("thumbnail", e.target.files?.[0])}/></label>
          <label><span>프로필 대표 이미지 직접 선택</span><input className="file-input" type="file" accept="image/*" onChange={e => uploadCharacterImage("profileImage", e.target.files?.[0])}/></label>
          <EditField wide label="목록 이미지 주소" value={current.thumbnail} onChange={v => change("thumbnail", v)}/>
          <EditField wide label="프로필 이미지 주소" value={current.profileImage} onChange={v => change("profileImage", v)}/>
        </div>
        <div className="detail-editor">
          <h2>상세 프로필 편집</h2>
          <label className="keyword-editor"><span>프로필 키워드 — 쉼표로 구분</span><textarea className="short-area" value={current.keywords.join(", ")} onChange={e => change("keywords", e.target.value.split(",").map(v => v.trim()).filter(Boolean))}/></label>
          <RecordEditor title="PROFILE" data={current.basicProfile} onChange={(k, v) => changeRecord("basicProfile", k, v)}/>
          <RecordEditor title="APPEARANCE" data={current.appearance} onChange={(k, v) => changeRecord("appearance", k, v)}/>
          <RecordEditor title="PERSONALITY" data={current.personality} onChange={(k, v) => changeRecord("personality", k, v)}/>
          <RecordEditor title="ABILITY" data={current.ability} onChange={(k, v) => changeRecord("ability", k, v)}/>
          <RecordEditor title="STORY" data={current.story} onChange={(k, v) => changeRecord("story", k, v)}/>
          <section className="detail-block"><div className="detail-heading"><h3>STORY TIMELINE</h3><button onClick={() => change("timeline", [...current.timeline, { year: "연도", text: "새 사건" }])}>＋ 연표 추가</button></div>
            {current.timeline.map((item, i) => <div className="inline-edit-row" key={i}><input value={item.year} onChange={e => changeTimeline(i, "year", e.target.value)}/><textarea value={item.text} onChange={e => changeTimeline(i, "text", e.target.value)}/><button onClick={() => change("timeline", current.timeline.filter((_, n) => n !== i))}>삭제</button></div>)}
          </section>
          <section className="detail-block"><div className="detail-heading"><h3>RELATIONSHIP</h3><button onClick={() => change("relationships", [...current.relationships, { characterId: liveCharacters.find(c => c.id !== current.id)?.id || current.id, label: "관계명", description: "관계 설명" }])}>＋ 관계 추가</button></div>
            {current.relationships.map((item, i) => <div className="relationship-edit-row" key={i}><select value={item.characterId} onChange={e => changeRelationship(i, "characterId", e.target.value)}>{items.filter(c => c.id !== current.id).map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select><input value={item.label} onChange={e => changeRelationship(i, "label", e.target.value)}/><textarea value={item.description} onChange={e => changeRelationship(i, "description", e.target.value)}/><button onClick={() => change("relationships", current.relationships.filter((_, n) => n !== i))}>삭제</button></div>)}
          </section>
          <section className="detail-block"><div className="detail-heading"><h3>GALLERY</h3><label className="gallery-upload">＋ 이미지 추가<input type="file" accept="image/*" multiple onChange={e => addGalleryImages(e.target.files)}/></label></div>
            <div className="gallery-edit-grid">{current.gallery.map((g, i) => <div key={i}><img src={g.url} alt=""/><input value={g.type} onChange={e => change("gallery", current.gallery.map((x, n) => n === i ? { ...x, type: e.target.value } : x))}/><input value={g.date} onChange={e => change("gallery", current.gallery.map((x, n) => n === i ? { ...x, date: e.target.value } : x))}/><button onClick={() => change("gallery", current.gallery.filter((_, n) => n !== i))}>삭제</button></div>)}</div>
          </section>
          <section className="detail-block"><div className="detail-heading"><h3>LOG</h3><button onClick={() => change("logs", [...(current.logs || []), { date: new Date().toISOString().slice(0, 10).replaceAll("-", "."), title: "새 로그", content: "로그 내용을 입력하세요." }])}>＋ 로그 작성</button></div>
            <div className="log-editor-list">{(current.logs || []).map((log, i) => <article key={i}><input value={log.date} onChange={e => changeLog(i, "date", e.target.value)}/><input value={log.title} onChange={e => changeLog(i, "title", e.target.value)}/><textarea value={log.content} onChange={e => changeLog(i, "content", e.target.value)}/><button onClick={() => change("logs", (current.logs || []).filter((_, n) => n !== i))}>삭제</button></article>)}</div>
          </section>
        </div>
        <p className="editor-note">이미지는 인터넷 이미지 주소를 붙여넣거나, 프로젝트의 public/images 폴더에 넣은 뒤 /images/파일명.jpg처럼 입력하세요.</p>
        <div className="editor-actions"><button className="danger" onClick={remove}>이 캐릭터 삭제</button><button onClick={reset}>전체 초기화</button><button className="save" onClick={save}>저장하고 확인 →</button></div>
      </div>
    </div>
    </>}
  </section>;
}

function EditField({ label, value, onChange, wide }: { label: string; value: string; onChange: (v: string) => void; wide?: boolean }) {
  return <label className={wide ? "wide" : ""}><span>{label}</span><input value={value} onChange={e => onChange(e.target.value)}/></label>;
}

function RecordEditor({ title, data, onChange }: { title: string; data: Record<string, string>; onChange: (key: string, value: string) => void }) {
  return <section className="detail-block"><div className="detail-heading"><h3>{title}</h3></div><div className="record-edit-grid">{Object.entries(data).map(([key, value]) => <label key={key}><span>{key}</span><textarea value={value} onChange={e => onChange(key, e.target.value)}/></label>)}</div></section>;
}

function HomeEditor({ value, setValue, onSave }: { value: HomeSettings; setValue: React.Dispatch<React.SetStateAction<HomeSettings>>; onSave: () => void }) {
  const change = (key: keyof HomeSettings, text: string) => setValue(v => ({ ...v, [key]: text }));
  const uploadBanner = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => change("bannerUrl", String(reader.result));
    reader.readAsDataURL(file);
  };
  const uploadLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => change("logoImage", String(reader.result));
    reader.readAsDataURL(file);
  };
  return <div className="simple-editor">
    <div className="editor-preview home-editor-preview" style={{ backgroundImage: `linear-gradient(90deg,rgba(2,10,24,.88),rgba(2,10,24,.2)),url("${value.bannerUrl}")` }}>
      <div><small>{value.kicker}</small><h2>{value.titleTop}<br/><i>{value.titleBottom}</i></h2><p>{value.intro}</p></div>
    </div>
    <div className="form-grid">
      <label><span>로고 글자 (현재 A)</span><textarea className="short-area" value={value.logoLetter} onChange={e => change("logoLetter", e.target.value.slice(0, 2))}/></label>
      <label><span>홈페이지 이름 (현재 ATELIER NOCTURNE)</span><textarea className="short-area" value={value.siteTitle} onChange={e => change("siteTitle", e.target.value)}/></label>
      <label><span>PC에서 로고 이미지 선택</span><input className="file-input" type="file" accept="image/*" onChange={e => uploadLogo(e.target.files?.[0])}/></label>
      <label><span>또는 로고 이미지 주소</span><textarea className="url-area" value={value.logoImage} onChange={e => change("logoImage", e.target.value)}/></label>
      {value.logoImage && <div className="wide logo-edit-preview"><img src={value.logoImage} alt="로고 미리보기"/><button onClick={() => change("logoImage", "")}>이미지 제거하고 글자 사용</button></div>}
      <label className="wide"><span>상단 작은 문구</span><textarea className="short-area" value={value.kicker} onChange={e => change("kicker", e.target.value)}/></label>
      <label><span>메인 제목 첫 줄</span><textarea className="short-area" value={value.titleTop} onChange={e => change("titleTop", e.target.value)}/></label>
      <label><span>메인 제목 둘째 줄</span><textarea className="short-area" value={value.titleBottom} onChange={e => change("titleBottom", e.target.value)}/></label>
      <label className="wide"><span>홈 소개 문구</span><textarea value={value.intro} onChange={e => change("intro", e.target.value)}/></label>
      <EditField label="버튼 문구" value={value.buttonText} onChange={v => change("buttonText", v)}/>
      <label><span>PC에서 배너 이미지 선택</span><input className="file-input" type="file" accept="image/*" onChange={e => uploadBanner(e.target.files?.[0])}/></label>
      <label className="wide"><span>또는 배너 이미지 주소</span><textarea className="url-area" value={value.bannerUrl} onChange={e => change("bannerUrl", e.target.value)}/></label>
      <div className="wide editor-subtitle"><small>FOOTER</small><h3>맨 아래 영역</h3></div>
      <label><span>왼쪽 영문 제목</span><textarea className="short-area" value={value.footerTitle} onChange={e => change("footerTitle", e.target.value)}/></label>
      <label><span>오른쪽 영문 설명</span><textarea className="short-area" value={value.footerText} onChange={e => change("footerText", e.target.value)}/></label>
      <label><span>푸터 배경색</span><div className="color-field"><input type="color" value={value.footerBgColor} onChange={e => change("footerBgColor", e.target.value)}/><input value={value.footerBgColor} onChange={e => change("footerBgColor", e.target.value)}/></div></label>
      <label><span>푸터 글자색</span><div className="color-field"><input type="color" value={value.footerTextColor} onChange={e => change("footerTextColor", e.target.value)}/><input value={value.footerTextColor} onChange={e => change("footerTextColor", e.target.value)}/></div></label>
    </div>
    <div className="editor-actions"><button onClick={() => setValue({ ...defaultHome })}>기본값 불러오기</button><button className="save" onClick={onSave}>홈 저장하고 확인 →</button></div>
  </div>;
}

function NoticeEditor({ home, setHome, onSave }: { home: HomeSettings; setHome: React.Dispatch<React.SetStateAction<HomeSettings>>; onSave: () => void }) {
  const noticeImageUpload = (side: "noticeLeftImage" | "noticeRightImage", file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setHome(v => ({ ...v, [side]: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const audioUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 3_000_000) { alert("직접 선택하는 음원은 3MB 이하를 권장합니다. 큰 파일은 URL 방식을 사용해주세요."); return; }
    const reader = new FileReader(); reader.onload = () => setHome(v => ({ ...v, bgmUrl: String(reader.result) })); reader.readAsDataURL(file);
  };
  return <div className="simple-editor">
    <section className="pinned-notice-editor">
      <div><small>PINNED NOTICE</small><h2>홈 고정 공지</h2><p>홈 화면의 두 면 분할 영역에 크게 표시됩니다.</p></div>
      <div className="form-grid">
        <label className="wide"><span>공지 제목</span><textarea className="short-area" value={home.noticeTitle} onChange={e => setHome(v => ({ ...v, noticeTitle: e.target.value }))}/></label>
        <label><span>왼쪽 공지 내용</span><textarea value={home.noticeBody} onChange={e => setHome(v => ({ ...v, noticeBody: e.target.value }))}/></label>
        <label><span>오른쪽 공지 내용</span><textarea value={home.noticeRightBody} onChange={e => setHome(v => ({ ...v, noticeRightBody: e.target.value }))}/></label>
        <label><span>왼쪽 공지 이미지 선택</span><input className="file-input" type="file" accept="image/*" onChange={e => noticeImageUpload("noticeLeftImage", e.target.files?.[0])}/></label>
        <label><span>오른쪽 공지 이미지 선택</span><input className="file-input" type="file" accept="image/*" onChange={e => noticeImageUpload("noticeRightImage", e.target.files?.[0])}/></label>
        <label><span>왼쪽 이미지 URL</span><textarea className="url-area" value={home.noticeLeftImage} onChange={e => setHome(v => ({ ...v, noticeLeftImage: e.target.value }))}/></label>
        <label><span>오른쪽 이미지 URL</span><textarea className="url-area" value={home.noticeRightImage} onChange={e => setHome(v => ({ ...v, noticeRightImage: e.target.value }))}/></label>
        {(home.noticeLeftImage || home.noticeRightImage) && <div className="wide notice-image-previews">
          {home.noticeLeftImage && <div><img src={home.noticeLeftImage} alt="왼쪽 미리보기"/><button onClick={() => setHome(v => ({ ...v, noticeLeftImage: "" }))}>왼쪽 이미지 제거</button></div>}
          {home.noticeRightImage && <div><img src={home.noticeRightImage} alt="오른쪽 미리보기"/><button onClick={() => setHome(v => ({ ...v, noticeRightImage: "" }))}>오른쪽 이미지 제거</button></div>}
        </div>}
      </div>
    </section>
    <section className="pinned-notice-editor">
      <div><small>BGM PLAYER</small><h2>배경음악</h2><p>재생 버튼을 눌렀을 때 들을 음원과 표시 정보를 설정합니다.</p></div>
      <div className="form-grid">
        <EditField label="곡 제목" value={home.bgmTitle} onChange={v => setHome(h => ({ ...h, bgmTitle: v }))}/>
        <EditField label="아티스트" value={home.bgmArtist} onChange={v => setHome(h => ({ ...h, bgmArtist: v }))}/>
        <label><span>PC에서 음원 선택 (3MB 이하)</span><input className="file-input" type="file" accept="audio/*" onChange={e => audioUpload(e.target.files?.[0])}/></label>
        <label><span>또는 음원 URL / 경로</span><textarea className="url-area" value={home.bgmUrl} onChange={e => setHome(h => ({ ...h, bgmUrl: e.target.value }))}/></label>
      </div>
    </section>
    <section className="pinned-notice-editor">
      <div><small>SOCIAL LINKS</small><h2>SNS 링크</h2><p>비워둔 SNS 이름은 홈에 표시되지 않습니다.</p></div>
      <div className="form-grid">
        <EditField label="SNS 1 이름" value={home.sns1Label} onChange={v => setHome(h => ({ ...h, sns1Label: v }))}/>
        <EditField label="SNS 1 링크" value={home.sns1Url} onChange={v => setHome(h => ({ ...h, sns1Url: v }))}/>
        <EditField label="SNS 2 이름" value={home.sns2Label} onChange={v => setHome(h => ({ ...h, sns2Label: v }))}/>
        <EditField label="SNS 2 링크" value={home.sns2Url} onChange={v => setHome(h => ({ ...h, sns2Url: v }))}/>
      </div>
    </section>
    <div className="editor-actions"><button className="save" onClick={onSave}>고정 공지 저장하고 홈에서 확인 →</button></div>
  </div>;
}

function BgmCard({ home }: { home: HomeSettings }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = async () => {
    if (!audio.current || !home.bgmUrl) return;
    if (audio.current.paused) { await audio.current.play(); setPlaying(true); }
    else { audio.current.pause(); setPlaying(false); }
  };
  return <div className="bgm-card">
    <div className="music-icon">♫</div>
    <div className="track-info"><b>{home.bgmTitle || "No BGM selected"}</b><small>{home.bgmArtist || "—"}</small><span><i className={playing ? "playing" : ""}/></span></div>
    <button onClick={toggle} disabled={!home.bgmUrl} aria-label="배경음악 재생">{playing ? "Ⅱ" : "▶"}</button>
    <audio ref={audio} src={home.bgmUrl} loop onEnded={() => setPlaying(false)}/>
  </div>;
}

function WorldEditor({ items, setItems, onSave }: { items: WorldItem[]; setItems: React.Dispatch<React.SetStateAction<WorldItem[]>>; onSave: () => void }) {
  const [index, setIndex] = useState(0);
  const current = items[index];
  const change = (key: keyof WorldItem, value: string | Record<string, string>) => setItems(old => old.map((w, i) => i === index ? { ...w, [key]: value } : w));
  const detail = (key: string, value: string) => change("details", { ...current.details, [key]: value });
  const upload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader(); reader.onload = () => change("image", String(reader.result)); reader.readAsDataURL(file);
  };
  const add = () => {
    const copy: WorldItem = JSON.parse(JSON.stringify(current));
    copy.id = `new-world-${Date.now()}`; copy.name = "NEW WORLD"; copy.summary = "새 세계관의 한 줄 소개";
    const next = [...items, copy]; setItems(next); setIndex(next.length - 1);
  };
  const remove = () => {
    if (items.length <= 1 || !confirm(`${current.name} 세계관을 삭제할까요?`)) return;
    const next = items.filter((_, i) => i !== index); setItems(next); setIndex(Math.max(0, index - 1));
  };
  if (!current) return null;
  return <div className="editor-layout world-editor">
    <aside className="editor-list">
      <div className="editor-help"><b>세계관 목록</b><p>세계관을 선택하고 오른쪽 내용을 수정하세요.</p></div>
      {items.map((w, i) => <button className={i === index ? "active" : ""} onClick={() => setIndex(i)} key={w.id}><img src={w.image} alt=""/><span>{w.name}</span></button>)}
      <button className="add-character" onClick={add}>＋ 새 세계관 추가</button>
    </aside>
    <div className="simple-editor">
      <div className="world-editor-preview" style={{ backgroundImage: `url("${current.image}")` }}><h2>{current.name}</h2></div>
      <div className="form-grid">
        <EditField wide label="세계관 이름" value={current.name} onChange={v => change("name", v)}/>
        <label className="wide"><span>한 줄 소개</span><textarea className="short-area" value={current.summary} onChange={e => change("summary", e.target.value)}/></label>
        <label className="wide"><span>상세 소개</span><textarea value={current.description} onChange={e => change("description", e.target.value)}/></label>
        <label><span>PC에서 대표 이미지 선택</span><input className="file-input" type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])}/></label>
        <label><span>또는 이미지 주소</span><textarea className="url-area" value={current.image} onChange={e => change("image", e.target.value)}/></label>
        {Object.entries(current.details).map(([key, value]) => <label key={key}><span>{key}</span><textarea className="short-area" value={value} onChange={e => detail(key, e.target.value)}/></label>)}
      </div>
      <div className="editor-actions"><button className="danger" onClick={remove}>이 세계관 삭제</button><button className="save" onClick={onSave}>세계관 저장하고 확인 →</button></div>
    </div>
  </div>;
}
