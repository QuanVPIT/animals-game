import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ANIMALS, COLORS, STAGES, ROUNDS, GIN_PHOTO, sticker, makeRounds, cap, friend, pick } from './data.js';
import { speak, cheer, oops, bigCheer, pop, setSoundEnabled, partyTune, munch, balloonPop } from './sound.js';

// ---------- Lưu tiến độ trên máy ----------
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

function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}

const byId = (id) => ANIMALS.find((a) => a.id === id);

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [stage, setStage] = useState(null);
  const [playId, setPlayId] = useState(0);
  const [storySeen, setStorySeen] = useState(false);
  const [count, setCount] = useState(() => store.get('count', 3));
  const [soundOn, setSoundOn] = useState(() => store.get('sound', true));
  const [found, setFound] = useState(() => store.get('found', []));
  const [done, setDone] = useState(() => store.get('done', {}));

  useEffect(() => {
    setSoundEnabled(soundOn);
    store.set('sound', soundOn);
  }, [soundOn]);
  useEffect(() => store.set('count', count), [count]);
  useEffect(() => store.set('found', found), [found]);
  useEffect(() => store.set('done', done), [done]);

  const partyOpen = ['find', 'feed', 'color'].every((s) => done[s] > 0);

  const addFound = (id) => setFound((f) => (f.includes(id) ? f : [...f, id]));

  const go = (s) => {
    setScreen(s);
  };

  const openStage = (s) => {
    pop();
    if (s.id === 'party') {
      if (!partyOpen) {
        speak('Gin xong ba chặng tìm bạn, cho bạn ăn và bóng bay thì bữa tiệc sẽ mở nhé!');
        return;
      }
      go('party');
      return;
    }
    setStage(s);
    setPlayId((n) => n + 1);
    go('play');
  };

  const finishStage = (id) => {
    const wasOpen = partyOpen;
    const next = { ...done, [id]: (done[id] || 0) + 1 };
    setDone(next);
    const nowOpen = ['find', 'feed', 'color'].every((s) => next[s] > 0);
    return !wasOpen && nowOpen;
  };

  return (
    <div className="app">
      <button className="sound-btn" onClick={() => setSoundOn(!soundOn)} aria-label="Bật tắt âm thanh">
        {soundOn ? '🔊' : '🔇'}
      </button>

      {screen === 'welcome' && (
        <Welcome
          onStart={() => {
            pop();
            if (storySeen) go('map');
            else go('story');
          }}
        />
      )}
      {screen === 'story' && (
        <Story
          onDone={() => {
            setStorySeen(true);
            go('map');
          }}
        />
      )}
      {screen === 'map' && (
        <MapScreen
          done={done}
          found={found}
          partyOpen={partyOpen}
          count={count}
          setCount={setCount}
          onStage={openStage}
          onAlbum={() => {
            pop();
            go('album');
          }}
          onHome={() => go('welcome')}
        />
      )}
      {screen === 'play' && stage && (
        <Play
          key={playId}
          stage={stage}
          count={count}
          onFound={addFound}
          onFinish={finishStage}
          onBack={() => go('map')}
        />
      )}
      {screen === 'party' && <Party found={found} onBack={() => go('map')} />}
      {screen === 'album' && <Album found={found} onBack={() => go('map')} />}
    </div>
  );
}

// ---------- Ảnh Gin ----------
function Gin({ size = 160, hat }) {
  return (
    <span className="gin" style={{ width: size, height: size, fontSize: size }}>
      <img src={GIN_PHOTO} alt="Gin" draggable={false} />
      {hat && <span className="gin-hat">🥳</span>}
    </span>
  );
}

function Sticker({ id, className = '', style, onClick }) {
  return <img className={'sticker ' + className} src={sticker(id)} alt="" draggable={false} style={style} onClick={onClick} />;
}

// ---------- Màn chào ----------
const WELCOME_FRIENDS = ['bear', 'rabbit', 'lion', 'elephant', 'monkey', 'panda'];

function Welcome({ onStart }) {
  const greet = () => speak('Xin chào Gin Đẹp Trai, Địch Thúi!');
  useEffect(() => {
    greet();
  }, []);

  return (
    <div className="screen welcome" onClick={greet}>
      <div className="welcome-friends">
        {WELCOME_FRIENDS.map((id, i) => (
          <Sticker key={id} id={id} className="float" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>
      <div className="gin-wrap">
        <Gin size={170} />
      </div>
      <h1 className="hello">
        Xin chào
        <br />
        <span>Gin Đẹp Trai,</span>
        <br />
        <span className="alt">Địch Thúi!</span>
      </h1>
      <button
        className="big-btn"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        🌳 Vào rừng thôi!
      </button>
    </div>
  );
}

// ---------- Cốt truyện mở đầu ----------
const STORY = [
  { who: 'owl', text: 'Chào Gin Đẹp Trai! Bác là Cú Mèo, sống ở Rừng Xanh.' },
  { who: 'bear', text: 'Hôm nay là sinh nhật bạn Gấu. Nhưng các bạn thú đi chơi bị lạc hết rồi!' },
  {
    who: 'owl',
    text: 'Gin giúp bác tìm các bạn, cho các bạn ăn no, rồi chọn bóng bay trang trí bữa tiệc nhé!',
  },
];

function Story({ onDone }) {
  const [i, setI] = useState(0);
  const page = STORY[i];
  useEffect(() => {
    speak(page.text);
  }, [i]);

  const next = () => {
    pop();
    if (i + 1 < STORY.length) setI(i + 1);
    else onDone();
  };

  return (
    <div className="screen story" onClick={next}>
      <div className="story-scene" key={i}>
        <Sticker id={page.who} className="story-char" />
        <div className="bubble">{page.text}</div>
      </div>
      <div className="dots">
        {STORY.map((_, k) => (
          <span key={k} className={k === i ? 'on' : ''} />
        ))}
      </div>
      <button className="big-btn">{i + 1 < STORY.length ? 'Tiếp ▶' : 'Đi thôi! 🚀'}</button>
      <button
        className="skip"
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
      >
        Bỏ qua
      </button>
    </div>
  );
}

// ---------- Bản đồ Rừng Xanh ----------
function MapScreen({ done, found, partyOpen, count, setCount, onStage, onAlbum, onHome }) {
  const nextStage = STAGES.find((s) => s.id !== 'party' && !done[s.id]) || (partyOpen ? STAGES[3] : STAGES[0]);

  useEffect(() => {
    const lines = {
      find: 'Gin ơi, mình đi tìm các bạn thú nhé!',
      feed: 'Các bạn thú đói bụng rồi. Gin cho các bạn ăn nhé!',
      color: 'Mình đi chọn bóng bay cho bữa tiệc nào!',
      party: 'Bữa tiệc mở rồi! Gin vào dự tiệc thôi!',
    };
    speak(lines[nextStage.id]);
  }, []);

  return (
    <div className="screen map">
      <div className="topbar">
        <button className="back gin-btn" onClick={onHome} aria-label="Về màn chào">
          <Gin size={48} />
        </button>
        <h2 className="title">Rừng Xanh 🌳</h2>
        <button className="album-btn" onClick={onAlbum}>
          📒 {found.length}/{ANIMALS.length}
        </button>
      </div>

      <div className="trail">
        {STAGES.map((s, i) => {
          const locked = s.id === 'party' && !partyOpen;
          const isNext = s.id === nextStage.id;
          return (
            <div key={s.id} className={'trail-row ' + (i % 2 ? 'right' : 'left')}>
              <button
                className={'stage-card' + (locked ? ' locked' : '') + (isNext ? ' next' : '')}
                style={{ '--c': s.color }}
                onClick={() => onStage(s)}
              >
                <span className="stage-icon">{locked ? '🔒' : s.icon}</span>
                <span className="stage-title">{s.title}</span>
                <span className="stage-hint">{locked ? 'Xong 3 chặng để mở' : s.hint}</span>
                {done[s.id] > 0 && <span className="stage-done">✅ × {done[s.id]}</span>}
              </button>
              {isNext && (
                <span className="gin-marker">
                  <Gin size={56} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="level">
        <span>Số lựa chọn:</span>
        {[2, 3, 4].map((n) => (
          <button key={n} className={count === n ? 'on' : ''} onClick={() => setCount(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Một chặng chơi: 5 câu ----------
function Play({ stage, count, onFound, onFinish, onBack }) {
  const rounds = useMemo(() => makeRounds(stage.id, count), []);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [right, setRight] = useState(null);
  const [msg, setMsg] = useState('');
  const [confetti, setConfetti] = useState(0);
  const [newSticker, setNewSticker] = useState(null);
  const [result, setResult] = useState(null);
  const firstTry = useRef(0);
  const busy = useRef(false);
  const alive = useAlive();
  const r = rounds[i];
  const a = r.answer;

  const question = () => {
    if (stage.id === 'find') return `${cap(a.name)} đâu nhỉ? Gin tìm ${a.name} nào!`;
    if (stage.id === 'feed') return `${cap(friend(a))} đói bụng rồi! ${cap(friend(a))} thích ăn gì nhỉ?`;
    return `Gin tìm quả bóng ${a.name} nào!`;
  };

  useEffect(() => {
    busy.current = false;
    speak(question());
  }, [i]);

  const choose = async (c) => {
    if (busy.current || right || wrong.includes(c.id)) return;
    busy.current = true;
    const correct = c.id === a.id;

    if (correct) {
      setRight(c.id);
      if (!wrong.length) firstTry.current += 1;
      setConfetti((n) => n + 1);
      let line;
      if (stage.id === 'color') {
        balloonPop();
        line = `Đúng rồi! ${cap(a.name)}, ${a.like.text}!`;
      } else {
        onFound(a.id);
        setNewSticker(a.id);
        if (stage.id === 'feed') {
          munch();
          line = `Măm măm! ${cap(friend(a))} thích ăn ${a.food.name}! Cảm ơn Gin!`;
        } else {
          line = `Đúng rồi! Đây là ${a.name}!${a.sound ? ` ${cap(a.sound)}!` : ''} ${cap(friend(a))} thích ăn ${a.food.name}.`;
        }
      }
      const praise = cheer();
      setMsg(praise);
      await speak(`${line} ${praise}`);
      if (!alive.current) return;
      await wait(500);
      if (!alive.current) return;
      setNewSticker(null);
      if (i + 1 < ROUNDS) {
        setWrong([]);
        setRight(null);
        setMsg('');
        setI(i + 1);
      } else {
        const opened = onFinish(stage.id);
        const stars = firstTry.current >= ROUNDS - 1 ? 3 : firstTry.current >= 3 ? 2 : 1;
        setResult({ stars, opened });
        const big = bigCheer();
        await speak(big);
        if (opened && alive.current) await speak('Bữa tiệc sinh nhật đã mở rồi! Gin vào dự tiệc thôi!');
      }
    } else {
      setWrong([...wrong, c.id]);
      const t = oops();
      setMsg(t);
      let line = t;
      if (stage.id === 'feed') line = `${cap(friend(a))} không thích ăn ${c.food.name} đâu. ${t}`;
      if (stage.id === 'color') line = `Đây là ${c.name}. Gin tìm ${a.name} cơ! ${t}`;
      if (stage.id === 'find') line = `Đây là ${c.name} mà. Gin tìm ${a.name} nhé!`;
      await speak(line);
      busy.current = false;
    }
  };

  if (result) {
    return (
      <div className="screen result">
        <Gin size={140} hat />
        <div className="result-stars">
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= result.stars ? 'lit' : ''} style={{ animationDelay: `${n * 0.25}s` }}>
              ⭐
            </span>
          ))}
        </div>
        <h2 className="title">Xong chặng {stage.title}!</h2>
        {result.opened && <p className="sub">🎂 Bữa tiệc đã mở rồi!</p>}
        <button className="big-btn" onClick={onBack}>
          🗺️ Về bản đồ
        </button>
        <Confetti big />
      </div>
    );
  }

  const hint = wrong.length >= 2 && !right;

  return (
    <div className="screen play" style={{ '--accent': stage.color }}>
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <div className="paws">
          {Array.from({ length: ROUNDS }, (_, k) => (
            <span key={k} className={k < i || (k === i && right) ? 'lit' : ''}>
              🐾
            </span>
          ))}
        </div>
      </div>

      {/* Phần câu hỏi */}
      {stage.id === 'find' ? (
        <button className="color-ask" onClick={() => speak(question())}>
          🔊 {cap(a.name)} đâu?
        </button>
      ) : stage.id === 'feed' ? (
        <button className="stage-pic" onClick={() => speak(question())}>
          <Sticker id={a.id} className={right ? 'happy' : 'idle'} />
          {stage.id === 'feed' && (
            <span className="ask-bubble">{right ? a.food.emoji : '😋'}</span>
          )}
        </button>
      ) : (
        <button className="color-ask" onClick={() => speak(question())}>
          🎈 Bóng <b>{a.name.replace('màu ', '')}</b> đâu?
        </button>
      )}

      {/* Các lựa chọn */}
      <div className={`choices n${r.choices.length} ${stage.id}`}>
        {r.choices.map((c) => {
          const cls =
            'choice' +
            (right === c.id ? ' right' : '') +
            (wrong.includes(c.id) ? ' wrong' : '') +
            (right && right !== c.id ? ' faded' : '') +
            (hint && c.id === a.id ? ' hint' : '');
          if (stage.id === 'find')
            return (
              <button key={c.id} className={cls + ' sticker-choice'} onClick={() => choose(c)}>
                <Sticker id={c.id} className={right === c.id ? 'happy' : ''} />
                {(right === c.id || wrong.includes(c.id)) && <span className="choice-name">{c.name}</span>}
              </button>
            );
          if (stage.id === 'feed')
            return (
              <button key={c.id} className={cls + ' food-choice'} onClick={() => choose(c)}>
                <span className="food">{c.food.emoji}</span>
                {(right === c.id || wrong.includes(c.id)) && <span className="choice-name">{c.food.name}</span>}
              </button>
            );
          return (
            <button
              key={c.id}
              className={cls + ' balloon-choice' + (right === c.id ? ' popped' : '')}
              onClick={() => choose(c)}
            >
              <Balloon hex={c.hex} />
              {wrong.includes(c.id) && <span className="choice-name">{c.name}</span>}
            </button>
          );
        })}
      </div>

      <div className="message">
        {stage.id === 'color' && right && a.like && (
          <span className="like">
            {a.like.animal ? <Sticker id={a.like.animal} className="mini" /> : <span className="mini-emoji">{a.like.emoji}</span>}
          </span>
        )}
        {msg}
      </div>

      {newSticker && (
        <div className="new-sticker">
          <Sticker id={newSticker} />
          <span>📒 Thêm vào album!</span>
        </div>
      )}
      {confetti > 0 && <Confetti key={confetti} />}
    </div>
  );
}

function Balloon({ hex }) {
  return (
    <svg className="balloon" viewBox="0 0 100 150" aria-hidden>
      <path d="M50 108 Q46 125 54 135 Q60 143 50 150" stroke="#888" strokeWidth="2" fill="none" />
      <ellipse cx="50" cy="55" rx="40" ry="50" fill={hex} />
      <path d="M44 103 L56 103 L50 112 Z" fill={hex} />
      <ellipse cx="35" cy="35" rx="9" ry="15" fill="#fff" opacity="0.45" transform="rotate(-25 35 35)" />
    </svg>
  );
}

// ---------- Bữa tiệc sinh nhật ----------
const GUESTS_FALLBACK = ['bear', 'rabbit', 'monkey', 'elephant', 'lion', 'panda', 'cat', 'dog'];

function Party({ found, onBack }) {
  const guests = useMemo(() => {
    const list = ['bear', ...found.filter((id) => id !== 'bear')];
    return (list.length >= 6 ? list : [...new Set([...list, ...GUESTS_FALLBACK])]).slice(0, 12);
  }, [found]);
  const [jump, setJump] = useState(null);

  const celebrate = () => {
    partyTune();
    speak('Hoan hô! Chúc mừng sinh nhật bạn Gấu! Cảm ơn Gin Đẹp Trai đã giúp các bạn thú!');
  };

  useEffect(() => {
    celebrate();
  }, []);

  const tapGuest = (id) => {
    const a = byId(id);
    setJump(id + Date.now());
    pop();
    speak(`${cap(a.name)}${a.sound ? `. ${cap(a.sound)}!` : ''}`);
  };

  return (
    <div className="screen party">
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <h2 className="title">🎉 Tiệc sinh nhật bạn Gấu</h2>
      </div>
      <div className="garland">🎈🎊🎈🎊🎈🎊🎈</div>
      <div className="party-center">
        <Gin size={130} hat />
        <span className="cake">🎂</span>
      </div>
      <div className="guests">
        {guests.map((id, k) => (
          <button
            key={id}
            className={'guest' + (jump?.startsWith(id) ? ' jump' : '')}
            style={{ animationDelay: `${(k % 4) * 0.2}s` }}
            onClick={() => tapGuest(id)}
            onAnimationEnd={(e) => e.animationName === 'jump' && setJump(null)}
          >
            <Sticker id={id} />
          </button>
        ))}
      </div>
      <button className="big-btn small" onClick={celebrate}>
        🎶 Hát mừng nào!
      </button>
      <FloatingBalloons />
    </div>
  );
}

function FloatingBalloons() {
  const items = useMemo(
    () =>
      Array.from({ length: 10 }, (_, k) => ({
        hex: COLORS[k % COLORS.length].hex,
        left: Math.random() * 90,
        delay: Math.random() * 6,
        dur: 7 + Math.random() * 5,
      })),
    []
  );
  return (
    <div className="float-balloons" aria-hidden>
      {items.map((b, k) => (
        <span key={k} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
          <Balloon hex={b.hex} />
        </span>
      ))}
    </div>
  );
}

// ---------- Album sticker ----------
function Album({ found, onBack }) {
  const [jump, setJump] = useState(null);

  useEffect(() => {
    speak(
      found.length
        ? `Gin đã tìm được ${found.length} bạn thú rồi! Chạm vào bạn nào để nghe nhé!`
        : 'Album còn trống. Gin đi tìm các bạn thú nhé!'
    );
  }, []);

  const tap = (a) => {
    if (!found.includes(a.id)) {
      speak('Bạn này còn đang trốn. Gin đi tìm nhé!');
      return;
    }
    setJump(a.id + Date.now());
    pop();
    speak(`${cap(a.name)}.${a.sound ? ` ${cap(a.sound)}!` : ''} ${cap(friend(a))} thích ăn ${a.food.name}.`);
  };

  return (
    <div className="screen album">
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <h2 className="title">
          📒 Album của Gin · {found.length}/{ANIMALS.length}
        </h2>
      </div>
      <div className="album-grid">
        {ANIMALS.map((a) => {
          const has = found.includes(a.id);
          return (
            <button
              key={a.id}
              className={'album-card' + (has ? '' : ' hidden') + (jump?.startsWith(a.id) ? ' jump' : '')}
              onClick={() => tap(a)}
              onAnimationEnd={() => setJump(null)}
            >
              <Sticker id={a.id} />
              <span className="album-name">{has ? a.name : '?'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Pháo hoa ----------
const PIECES = ['⭐', '🎉', '💖', '✨', '🌈', '🎈', '🍭'];

function Confetti({ big }) {
  const n = big ? 40 : 18;
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: n }, (_, k) => (
        <span
          key={k}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${20 + Math.random() * 24}px`,
          }}
        >
          {PIECES[k % PIECES.length]}
        </span>
      ))}
    </div>
  );
}
