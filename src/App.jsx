import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ANIMALS, MODES, makeQuestion, cap } from './data.js';
import { speak, cheer, oops, bigCheer, pop, setSoundEnabled } from './sound.js';

// Lưu cài đặt nhỏ trên máy; lỗi (chế độ ẩn danh...) thì bỏ qua
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('animals.' + key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('animals.' + key, JSON.stringify(value));
    } catch {}
  },
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [mode, setMode] = useState(null);
  const [count, setCount] = useState(() => store.get('count', 3));
  const [soundOn, setSoundOn] = useState(() => store.get('sound', true));
  const [totalStars, setTotalStars] = useState(() => store.get('stars', 0));

  useEffect(() => {
    setSoundEnabled(soundOn);
    store.set('sound', soundOn);
  }, [soundOn]);
  useEffect(() => store.set('count', count), [count]);
  useEffect(() => store.set('stars', totalStars), [totalStars]);

  const goMenu = () => {
    setScreen('menu');
    speak('Gin Thúi muốn chơi gì nào?');
  };

  return (
    <div className="app">
      <button className="sound-btn" onClick={() => setSoundOn(!soundOn)} aria-label="Bật tắt âm thanh">
        {soundOn ? '🔊' : '🔇'}
      </button>

      {screen === 'welcome' && <Welcome onStart={goMenu} />}

      {screen === 'menu' && (
        <Menu
          stars={totalStars}
          count={count}
          setCount={setCount}
          onPick={(m) => {
            pop();
            if (m === 'free') setScreen('free');
            else {
              setMode(m);
              setScreen('game');
            }
          }}
        />
      )}

      {screen === 'game' && mode && (
        <Game key={mode.id} mode={mode} count={count} onBack={goMenu} onStar={() => setTotalStars((s) => s + 1)} />
      )}

      {screen === 'free' && <FreePlay onBack={goMenu} />}
    </div>
  );
}

function Welcome({ onStart }) {
  const greet = () => speak('Chào bé Gin Cứt Gà! Mình cùng chơi với các bạn thú nhé!');

  useEffect(() => {
    // Một số trình duyệt chặn tự đọc khi chưa chạm; bé chạm vào là đọc
    greet();
  }, []);

  return (
    <div className="screen welcome" onClick={greet}>
      <div className="parade">
        {['🐶', '🐱', '🐮', '🐷', '🐔', '🐵', '🐰'].map((e, i) => (
          <span key={e} style={{ animationDelay: `${i * 0.15}s` }}>
            {e}
          </span>
        ))}
      </div>
      <h1 className="hello">
        Chào bé
        <br />
        <span>Gin Cứt Gà</span>
      </h1>
      <p className="sub">👋 Cùng chơi với các bạn thú nào!</p>
      <button
        className="big-btn"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        ▶ Chơi thôi!
      </button>
    </div>
  );
}

function Menu({ stars, count, setCount, onPick }) {
  return (
    <div className="screen menu">
      <h2 className="title">Gin Thúi chơi gì nào? 🐾</h2>
      <div className="star-total">⭐ {stars}</div>
      <div className="mode-grid">
        {MODES.map((m) => (
          <button key={m.id} className="mode-card" style={{ background: m.color }} onClick={() => onPick(m)}>
            <span className="mode-icon">{m.icon}</span>
            <span>{m.title}</span>
          </button>
        ))}
        <button className="mode-card" style={{ background: '#90f1a8' }} onClick={() => onPick('free')}>
          <span className="mode-icon">🎈</span>
          <span>Chơi tự do</span>
        </button>
      </div>
      <div className="level">
        <span>Số hình:</span>
        {[2, 3, 4].map((n) => (
          <button key={n} className={count === n ? 'on' : ''} onClick={() => setCount(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function Game({ mode, count, onBack, onStar }) {
  const [q, setQ] = useState(null);
  const [stars, setStars] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [picked, setPicked] = useState(null);
  const [confetti, setConfetti] = useState(0);
  const [party, setParty] = useState(false);
  const [message, setMessage] = useState('');
  const locked = useRef(false);
  const alive = useRef(true);
  const lastId = useRef(null);

  const next = useCallback(() => {
    const nq = makeQuestion(mode, count, lastId.current);
    lastId.current = nq.answer.id;
    setQ(nq);
    setWrong([]);
    setPicked(null);
    setMessage('');
    locked.current = false;
    speak(nq.say);
  }, [mode, count]);

  useEffect(() => {
    alive.current = true;
    next();
    return () => {
      alive.current = false;
    };
  }, [next]);

  const choose = async (a) => {
    if (locked.current || !q) return;
    if (a.id === q.answer.id) {
      locked.current = true;
      setPicked(a.id);
      setConfetti((c) => c + 1);
      const praise = cheer();
      setMessage(praise);
      const extra = mode.id === 'sound' || mode.id === 'name' ? (a.sound ? ` ${cap(a.sound)}!` : '') : '';
      await speak(`${cap(a.name)}!${extra} ${praise}`);
      if (!alive.current) return;
      const total = stars + 1;
      setStars(total);
      onStar();
      if (total % 5 === 0) {
        setParty(true);
        await speak(bigCheer());
        await wait(600);
        if (!alive.current) return;
        setParty(false);
      } else {
        await wait(400);
      }
      if (alive.current) next();
    } else {
      if (wrong.includes(a.id)) return;
      const nw = [...wrong, a.id];
      setWrong(nw);
      const text = oops();
      setMessage(text);
      locked.current = true;
      await speak(`Đây là ${a.name}. ${text}`);
      locked.current = false;
      if (alive.current) speak(q.say);
    }
  };

  if (!q) return null;
  const hint = wrong.length >= 2;

  return (
    <div className="screen game" style={{ '--accent': mode.color }}>
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <div className="stars">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < stars % 5 || (stars > 0 && stars % 5 === 0 && party) ? 'lit' : ''}>
              ⭐
            </span>
          ))}
        </div>
      </div>

      <button className="prompt" onClick={() => speak(q.say)} aria-label="Nghe lại">
        <span className={'prompt-pic' + (q.shadow && !picked ? ' shadow' : '')}>{q.show}</span>
        <span className="prompt-label">{q.label}</span>
        <span className="replay">🔁</span>
      </button>

      <div className={`choices n${q.choices.length}`}>
        {q.choices.map((a) => {
          const isRight = picked === a.id;
          const isWrong = wrong.includes(a.id);
          return (
            <button
              key={a.id}
              className={
                'choice' +
                (isRight ? ' right' : '') +
                (isWrong ? ' wrong' : '') +
                (hint && a.id === q.answer.id && !picked ? ' hint' : '') +
                (picked && !isRight ? ' faded' : '')
              }
              onClick={() => choose(a)}
            >
              <span className="choice-pic">{a.emoji}</span>
              {(isRight || isWrong) && <span className="choice-name">{a.name}</span>}
            </button>
          );
        })}
      </div>

      <div className="message">{message}</div>

      {confetti > 0 && <Confetti key={confetti} />}
      {party && (
        <div className="party">
          <div className="party-box">
            <div className="party-star">🌟</div>
            <div>Gin Thúi giỏi quá!</div>
            <div className="party-count">⭐ × {stars}</div>
          </div>
          <Confetti big />
        </div>
      )}
    </div>
  );
}

function FreePlay({ onBack }) {
  const [active, setActive] = useState(null);

  const tap = (a) => {
    setActive(a.id + Date.now());
    pop();
    speak(`${cap(a.name)}${a.sound ? `. ${cap(a.sound)}!` : '!'}`);
  };

  return (
    <div className="screen free">
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <h2 className="title small">Chạm vào bạn thú nào! 🎈</h2>
      </div>
      <div className="free-grid">
        {ANIMALS.map((a) => (
          <button
            key={a.id}
            className={'free-card' + (active?.startsWith(a.id) ? ' bounce' : '')}
            onClick={() => tap(a)}
            onAnimationEnd={() => setActive(null)}
          >
            {a.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

const PIECES = ['⭐', '🎉', '💖', '✨', '🌈', '🎈', '🍭'];

function Confetti({ big }) {
  const n = big ? 40 : 18;
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${20 + Math.random() * 24}px`,
          }}
        >
          {PIECES[i % PIECES.length]}
        </span>
      ))}
    </div>
  );
}
