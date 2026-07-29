"use client";

import { useEffect, useMemo, useState } from "react";
import { characters, type Character } from "./data/characters";
import { worlds } from "./data/worlds";
import { updates } from "./data/updates";

type Page = "home" | "characters" | "worlds" | "gallery" | "updates" | "character" | "world";
const nav: { label: string; page: Page }[] = [
  { label: "HOME", page: "home" }, { label: "CHARACTER", page: "characters" },
  { label: "WORLD", page: "worlds" }, { label: "GALLERY", page: "gallery" },
  { label: "UPDATE", page: "updates" },
];

export default function Archive() {
  const [page, setPage] = useState<Page>("home");
  const [selected, setSelected] = useState(characters[0].id);
  const [selectedWorld, setSelectedWorld] = useState(worlds[0].id);
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const go = (next: Page) => { setPage(next); setMenu(false); scrollTo({ top: 0, behavior: "smooth" }); };
  const openCharacter = (id: string) => { setSelected(id); go("character"); };
  const openWorld = (id: string) => { setSelectedWorld(id); go("world"); };

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    const observer = new IntersectionObserver((entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")), { threshold: .1 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [page, dark]);

  return <div className="site-shell">
    <header>
      <button className="brand" onClick={() => go("home")} aria-label="대표 홈으로 이동">
        <span className="brand-mark">A</span><span>ATELIER <i>NOCTURNE</i></span>
      </button>
      <nav className={menu ? "open" : ""}>
        {nav.map(item => <button key={item.page} className={page === item.page ? "active" : ""} onClick={() => go(item.page)}>{item.label}</button>)}
      </nav>
      <div className="header-tools">
        <button className="theme-button" onClick={() => setDark(!dark)} aria-label="다크 모드 전환">{dark ? "☀" : "◐"}</button>
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="메뉴 열기"><span/><span/></button>
      </div>
    </header>
    <main className="page-fade">
      {page === "home" && <Home go={go} openCharacter={openCharacter} openWorld={openWorld} />}
      {page === "characters" && <Characters openCharacter={openCharacter} />}
      {page === "character" && <CharacterProfile character={characters.find(c => c.id === selected)!} openCharacter={openCharacter} setLightbox={setLightbox} />}
      {page === "worlds" && <Worlds openWorld={openWorld} />}
      {page === "world" && <WorldDetail worldId={selectedWorld} openCharacter={openCharacter} />}
      {page === "gallery" && <Gallery setLightbox={setLightbox} />}
      {page === "updates" && <Updates />}
    </main>
    <footer><span>ATELIER NOCTURNE</span><p>Original character & world archive · 2026</p></footer>
    {lightbox && <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-label="이미지 크게 보기"><button>×</button><img src={lightbox} alt="확대 이미지"/></div>}
  </div>;
}

function SectionTitle({ eyebrow, title, link, onClick }: { eyebrow: string; title: string; link?: string; onClick?: () => void }) {
  return <div className="section-title reveal"><div><small>{eyebrow}</small><h2>{title}</h2></div>{link && <button onClick={onClick}>{link} <span>↗</span></button>}</div>;
}

function Home({ go, openCharacter, openWorld }: { go: (p: Page) => void; openCharacter: (id: string) => void; openWorld: (id: string) => void }) {
  return <>
    <section className="hero">
      <div className="hero-image" />
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="kicker">ORIGINAL CHARACTER ARCHIVE · EST. 2026</p>
        <h1>Stories begin<br/>where names <em>remain.</em></h1>
        <p className="hero-copy">흩어진 인물과 세계의 조각을 수집하는 개인 창작 아카이브.<br/>기억해야 할 모든 이름을 한곳에 기록합니다.</p>
        <button className="primary" onClick={() => go("characters")}>VIEW CHARACTERS <span>→</span></button>
      </div>
      <div className="hero-index">001 — 006</div>
    </section>
    <section className="content-section">
      <SectionTitle eyebrow="SELECTED PERSONA" title="Featured characters" link="View all characters" onClick={() => go("characters")} />
      <div className="featured-grid">
        {characters.map((c, i) => <article className="featured-card reveal" key={c.id} onClick={() => openCharacter(c.id)}>
          <div className="portrait-wrap"><img src={c.thumbnail} alt={c.name}/><span>0{i + 1}</span></div>
          <div className="card-meta"><small>{c.world} · {c.type}</small><h3>{c.name}</h3><p>{c.englishName}</p></div>
        </article>)}
      </div>
    </section>
    <section className="split-section">
      <div className="world-feature reveal">
        <div className="world-image"/>
        <div className="glass-card">
          <small>WORLD FILE · 001</small><h2>THE BLUE HOUR</h2>
          <p>낮과 밤의 경계가 사라진 도시, 루멘. 잊힌 이름들이 이곳에서 능력이 된다.</p>
          <button onClick={() => openWorld("blue-hour")}>EXPLORE THE WORLD →</button>
        </div>
      </div>
      <div className="updates-preview reveal">
        <SectionTitle eyebrow="RECENT NOTES" title="Latest updates" />
        {updates.slice(0, 4).map((u, i) => <div className="update-row" key={u.date + u.title}><time>{u.date}</time><span>{u.category}</span><p>{u.title}</p><b>0{i + 1}</b></div>)}
        <button className="text-link" onClick={() => go("updates")}>ALL UPDATES →</button>
      </div>
    </section>
    <section className="content-section gallery-preview">
      <SectionTitle eyebrow="VISUAL RECORDS" title="From the gallery" link="Open gallery" onClick={() => go("gallery")} />
      <div className="preview-strip">{characters.flatMap(c => c.gallery.slice(0, 2)).map((g, i) => <img className="reveal" key={i} src={g.url} alt={g.type}/>)}</div>
    </section>
  </>;
}

function Characters({ openCharacter }: { openCharacter: (id: string) => void }) {
  const [query, setQuery] = useState(""); const [world, setWorld] = useState("ALL"); const [type, setType] = useState("ALL");
  const filtered = characters.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) && (world === "ALL" || c.world === world) && (type === "ALL" || c.type === type));
  return <section className="listing-page">
    <PageIntro no="01" eyebrow="CHARACTER DIRECTORY" title="All characters" copy="기록된 인물들을 이름, 세계관, 유형으로 찾아보세요." />
    <div className="filters reveal">
      <label className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="이름으로 검색"/></label>
      <select value={world} onChange={e => setWorld(e.target.value)}><option>ALL</option>{worlds.map(w => <option key={w.id}>{w.name}</option>)}</select>
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

const tabs = ["PROFILE", "APPEARANCE", "PERSONALITY", "ABILITY", "STORY", "RELATIONSHIP", "GALLERY"];
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
        const target = characters.find(x => x.id === r.characterId)!; return <button key={r.characterId} onClick={() => openCharacter(r.characterId)}><img src={target.thumbnail} alt={target.name}/><div><small>{r.label}</small><h3>{target.name}</h3><p>{r.description}</p><b>VIEW PROFILE →</b></div></button>;
      })}</div>}
      {tab === "GALLERY" && <div className="profile-gallery">{c.gallery.map((g, i) => <button key={i} onClick={() => setLightbox(g.url)}><img src={g.url} alt={`${c.name} ${g.type}`}/><span>{g.type}</span></button>)}</div>}
    </section>
  </div>;
}

function InfoGrid({ data }: { data: Record<string, string> }) { return <div className="info-grid">{Object.entries(data).map(([k, v]) => <div key={k}><small>{k}</small><p>{v}</p></div>)}</div>; }
function TextSections({ data }: { data: Record<string, string> }) { return <div className="text-sections">{Object.entries(data).map(([k, v]) => <article key={k}><small>{k}</small><p>{v}</p></article>)}</div>; }

function Worlds({ openWorld }: { openWorld: (id: string) => void }) { return <section className="listing-page"><PageIntro no="02" eyebrow="WORLD ARCHIVE" title="Worlds & universes" copy="서로 다른 규칙과 기억으로 이루어진 세계를 탐색하세요."/><div className="world-grid">{worlds.map((w, i) => <button className="world-card reveal" key={w.id} onClick={() => openWorld(w.id)}><img src={w.image} alt={w.name}/><div><small>WORLD · 0{i + 1}</small><h2>{w.name}</h2><p>{w.summary}</p><span>EXPLORE →</span></div></button>)}</div></section>; }
function WorldDetail({ worldId, openCharacter }: { worldId: string; openCharacter: (id: string) => void }) {
  const w = worlds.find(x => x.id === worldId)!; return <section className="world-detail"><div className="world-detail-hero"><img src={w.image} alt={w.name}/><div><small>WORLD ARCHIVE</small><h1>{w.name}</h1><p>{w.summary}</p></div></div>
  <div className="world-copy reveal"><p className="lead">{w.description}</p><InfoGrid data={w.details}/><h2>Affiliated characters</h2><div className="mini-characters">{characters.filter(c => c.world === w.name).map(c => <button onClick={() => openCharacter(c.id)} key={c.id}><img src={c.thumbnail} alt={c.name}/><span>{c.name}<small>{c.codename}</small></span></button>)}</div></div></section>;
}

function Gallery({ setLightbox }: { setLightbox: (s: string) => void }) {
  const [char, setChar] = useState("ALL"); const [kind, setKind] = useState("ALL");
  const items = useMemo(() => characters.flatMap(c => c.gallery.map(g => ({ ...g, character: c }))).filter(x => (char === "ALL" || x.character.id === char) && (kind === "ALL" || x.type === kind)), [char, kind]);
  return <section className="listing-page"><PageIntro no="03" eyebrow="VISUAL RECORDS" title="Integrated gallery" copy="모든 캐릭터의 이미지와 순간을 한곳에서 감상하세요."/><div className="filters gallery-filters"><select value={char} onChange={e => setChar(e.target.value)}><option value="ALL">모든 캐릭터</option>{characters.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select><select value={kind} onChange={e => setKind(e.target.value)}><option>ALL</option><option>전신</option><option>반신</option><option>표정</option><option>의상</option><option>커미션</option><option>로그</option></select><select><option>최신 업로드순</option><option>오래된순</option></select></div>
  <div className="masonry">{items.map((g, i) => <button className="reveal" key={g.character.id + i} onClick={() => setLightbox(g.url)}><img src={g.url} alt={g.type}/><span><b>{g.character.name}</b><small>{g.type} · {g.date}</small></span></button>)}</div></section>;
}
function Updates() { return <section className="listing-page updates-page"><PageIntro no="04" eyebrow="ARCHIVE NOTES" title="Update log" copy="설정과 이미지가 추가되고 수정된 기록입니다."/><div className="update-list">{updates.map((u, i) => <article className="reveal" key={u.date + u.title}><span>{String(i + 1).padStart(2, "0")}</span><time>{u.date}</time><em>{u.category}</em><div><h2>{u.title}</h2><p>{u.detail}</p></div></article>)}</div></section>; }
