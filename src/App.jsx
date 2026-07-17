import { useMemo, useState } from 'react'
import './App.css'

const postKey = 'open-close-radar.ugc'
const saveKey = 'open-close-radar.saved'

const reports = [
  {
    id: 'nagoya-ramen-open',
    name: '名駅横丁 濃厚中華そば',
    area: '名古屋',
    station: '名古屋',
    category: '飲食',
    status: '開店',
    date: '2026-08-01',
    confidence: '確認済み',
    source: '店頭告知',
    tags: ['新店', 'ラーメン', '求人あり', 'クーポン予定'],
    note: '駅近の新店。開店前求人、初回クーポン、近隣ホテル・飲食回遊の広告導線が作りやすい。',
  },
  {
    id: 'sakae-game-close',
    name: '栄ミニゲームコーナー',
    area: '名古屋',
    station: '栄',
    category: 'ゲームセンター',
    status: '閉店',
    date: '2026-07-31',
    confidence: '要確認',
    source: 'ユーザー投稿',
    tags: ['閉店予定', '思い出投稿', '代替店舗', 'レトロゲーム'],
    note: '閉店前に行きたい需要、思い出レビュー、近隣ゲームセンターへの送客が見込める。',
  },
  {
    id: 'shizuoka-netcafe-renew',
    name: '静岡駅前ネットカフェ',
    area: '静岡',
    station: '静岡',
    category: '漫画喫茶',
    status: 'リニューアル',
    date: '2026-08-10',
    confidence: '確認済み',
    source: '公式SNS',
    tags: ['個室追加', 'シャワー', '夜行バス', 'ComicStay連携'],
    note: '漫画喫茶・夜行バス到着後の休憩需要へ送客できる。ComicStayとの内部リンク候補。',
  },
  {
    id: 'tokyo-smoke-move',
    name: '新宿スモークラウンジ',
    area: '東京',
    station: '新宿',
    category: '喫煙所',
    status: '移転',
    date: '2026-07-25',
    confidence: '確認待ち',
    source: '現地張り紙',
    tags: ['移転', '喫煙可', '駅近', '地図更新'],
    note: '喫煙場所検索の更新需要が強い。旧住所から新住所へリダイレクト的に案内できる。',
  },
  {
    id: 'osaka-karaoke-open',
    name: '梅田ひとりカラオケBOX',
    area: '大阪',
    station: '梅田',
    category: 'カラオケ',
    status: '開店',
    date: '2026-08-20',
    confidence: '要確認',
    source: '求人情報',
    tags: ['ひとり利用', '深夜営業', 'クーポン', '求人'],
    note: '求人情報から開店予測を作れる。開店日確定後にクーポン・予約へつなげる。',
  },
  {
    id: 'kanagawa-rc-close',
    name: '横浜RCコース',
    area: '神奈川',
    station: '横浜',
    category: 'RCサーキット',
    status: '閉店',
    date: '2026-06-30',
    confidence: '確認済み',
    source: '公式告知',
    tags: ['閉店', '代替コース', '思い出投稿', '用品導線'],
    note: '閉店アーカイブとして残し、近隣RCコースや用品購入へ送客できる。',
  },
]

const revenuePlans = [
  ['新店広告・PR', '開店前から求人、初回クーポン、オープン告知、予約導線を掲載。'],
  ['閉店前送客', '閉店日までの来店促進、思い出投稿、代替店舗案内で回遊を作る。'],
  ['確認済み掲載', '店舗や運営者が営業日、移転先、閉店日、クーポンを更新できる有料枠。'],
  ['求人・テナント導線', '開店準備中の求人、居抜き、テナント募集、不動産広告へ接続。'],
  ['地域スポンサー', '市区町村別ページにローカル広告、商店街スポンサー、周辺店舗広告を配置。'],
]

const buzzIdeas = [
  '今月閉店する店まとめ',
  '開店前から追える新店カレンダー',
  '閉店前に行きたい思い出レビュー募集',
  '求人情報から見つけた開店予測',
  '駅別の閉店跡地・次に入る店予想',
]

const faq = [
  ['AIに引用されやすい情報は？', '店名、地域、駅、ジャンル、開店日または閉店日、確認状況、出典、投稿状態を短く表示します。'],
  ['UGC投稿はどう扱いますか？', '未確認投稿は確認待ちとして表示し、公式SNS、店頭告知、現地写真などで確認済みにします。'],
  ['収益化の中心は？', '新店広告、クーポン、求人、テナント募集、確認済み掲載、閉店前送客、代替店舗送客です。'],
]

function readArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

function App() {
  const [query, setQuery] = useState('名古屋')
  const [status, setStatus] = useState('すべて')
  const [category, setCategory] = useState('すべて')
  const [posts, setPosts] = useState(() => readArray(postKey))
  const [saved, setSaved] = useState(() => readArray(saveKey))
  const [form, setForm] = useState({ name: '', area: '', type: '開店', memo: '' })

  const statuses = ['すべて', ...new Set(reports.map((report) => report.status))]
  const categories = ['すべて', ...new Set(reports.map((report) => report.category))]
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return reports
      .filter((report) => status === 'すべて' || report.status === status)
      .filter((report) => category === 'すべて' || report.category === category)
      .filter((report) => !text || `${report.name} ${report.area} ${report.station} ${report.category} ${report.status} ${report.tags.join(' ')} ${report.note}`.toLowerCase().includes(text))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [category, query, status])
  const display = filtered.length ? filtered : reports

  const submitPost = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.memo.trim()) return
    const next = [{ ...form, id: crypto.randomUUID(), status: '確認待ち', date: new Date().toLocaleDateString('ja-JP') }, ...posts].slice(0, 8)
    setPosts(next)
    localStorage.setItem(postKey, JSON.stringify(next))
    setForm({ name: '', area: '', type: '開店', memo: '' })
  }

  const toggleSaved = (id) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(saveKey, JSON.stringify(next))
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="brand">Open Close Radar</span>
          <h1>開店・閉店・移転を、地域の速報データにする。</h1>
          <p>
            店頭告知、公式SNS、求人情報、現地投稿をもとに、開店・閉店・移転・休業・リニューアルを整理。UGCで速報性を高め、広告、求人、代替店送客へつなげます。
          </p>
        </div>
        <aside className="answer-box">
          <span>AI向け即答</span>
          <strong>店名、地域、状態、日付、確認状況、出典を1カードで提示</strong>
          <p>検索結果やAI回答に引用されやすいよう、未確認情報と確認済み情報を分けて表示します。</p>
        </aside>
      </section>

      <section className="search-panel" aria-label="開店閉店検索">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="地域・駅・店名・ジャンルで検索" />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      <section className="summary-grid">
        <article><span>掲載情報</span><strong>{reports.length}</strong><p>開店・閉店・移転を横断</p></article>
        <article><span>検索結果</span><strong>{display.length}</strong><p>地域と状態で絞り込み</p></article>
        <article><span>保存済み</span><strong>{saved.length}</strong><p>追跡したい店を保存</p></article>
      </section>

      <section className="content-grid">
        {display.map((report) => (
          <article className={`card ${report.status === '閉店' ? 'closed' : ''}`} key={report.id}>
            <div className="card-topline">
              <span>{report.area} / {report.station}</span>
              <span>{report.status}</span>
            </div>
            <h2>{report.name}</h2>
            <p>{report.note}</p>
            <div className="tag-row">{report.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="metric-row">
              <span>{report.category}</span>
              <span>{report.date}</span>
              <strong>{report.confidence}</strong>
            </div>
            <small>出典: {report.source}</small>
            <button type="button" onClick={() => toggleSaved(report.id)}>{saved.includes(report.id) ? '保存済み' : '追跡する'}</button>
          </article>
        ))}
      </section>

      <section className="ugc-section">
        <div>
          <span className="brand">UGC</span>
          <h2>開店・閉店・移転・休業情報を投稿</h2>
          <p>投稿を確認待ちとして蓄積し、公式確認後に地域ページ、速報記事、代替店導線へ展開します。</p>
        </div>
        <form className="ugc-form" onSubmit={submitPost}>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="店名" />
          <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="地域・駅" />
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option>開店</option>
            <option>閉店</option>
            <option>移転</option>
            <option>休業</option>
            <option>リニューアル</option>
          </select>
          <input value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} placeholder="日付・出典・張り紙・公式SNSなど" />
          <button type="submit">投稿する</button>
        </form>
        <div className="post-grid">
          {posts.length === 0 && <p className="empty-text">まだ投稿はありません。最初の開店閉店情報を投稿できます。</p>}
          {posts.map((post) => (
            <article key={post.id}>
              <span>{post.type} / {post.status}</span>
              <h3>{post.name}</h3>
              <p>{post.memo}</p>
              <small>{post.area || 'エリア未入力'} / {post.date}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="growth-grid">
        <div className="revenue-panel">
          <h2>収益導線</h2>
          {revenuePlans.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}
        </div>
        <div className="buzz-panel">
          <h2>バズ施策</h2>
          <ul>{buzzIdeas.map((idea) => <li key={idea}>{idea}</li>)}</ul>
        </div>
      </section>

      <section className="seo-section">
        <div className="answer-box">
          <span className="brand">SEO / AIO / LLMO</span>
          <h2>開店閉店情報は、店名・地域・日付・確認状況・出典を同じ形式で出すほど検索とAI回答に強くなります。</h2>
          <p>未確認投稿は確認待ちとして扱い、公式SNSや店頭告知で確認済みにすることで、速報性と信頼性を両立します。</p>
        </div>
        <div className="faq-grid">
          {faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        </div>
      </section>
    </main>
  )
}

export default App
