import { useMemo, useState } from 'react'
import './App.css'

const postKey = 'open-close-radar.ugc'
const saveKey = 'open-close-radar.saved'
const alertKey = 'open-close-radar.alerts'

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
    note: '喫煙場所検索の更新需要が強い。旧住所から新住所へ迷わず案内できる。',
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
  ['LINE通知スポンサー', '地域別アラートの下部に新店クーポン、求人、予約リンクを差し込む。'],
  ['X速報プロモーション', '閉店前に行きたい投稿、開店カウントダウン、スポンサー投稿をXへ展開。'],
  ['新店広告・PR', '開店前から求人、初回クーポン、オープン告知、予約導線を掲載。'],
  ['閉店前送客', '閉店日までの来店促進、思い出投稿、代替店舗案内で回遊を作る。'],
  ['確認済み掲載', '店舗や運営者が営業日、移転先、閉店日、クーポンを更新できる有料枠。'],
  ['求人・テナント導線', '開店準備中の求人、居抜き、テナント募集、不動産広告へ接続。'],
]

const alertProducts = [
  { name: 'LINE地域アラート', text: '市区町村、駅、ジャンル、開店/閉店を指定して、確認済み速報をLINEで受信。' },
  { name: 'X速報ポスト', text: '確認済み情報をハッシュタグ付きで即時投稿。拡散後は詳細ページとスポンサー枠へ誘導。' },
  { name: '店舗向け通知枠', text: '新店クーポン、採用告知、閉店セール、移転先案内を通知内の広告枠として販売。' },
]

const buzzIdeas = [
  '今月閉店する店まとめ',
  '開店前から追える新店カレンダー',
  'LINEで受け取る駅別閉店アラート',
  'Xで拡散する閉店前に行きたい店リスト',
  '求人情報から見つけた開店予測',
]

const faq = [
  ['AIに引用されやすい情報は？', '店名、地域、駅、ジャンル、開店日または閉店日、確認状況、出典、投稿状態を短く表示します。'],
  ['LINEとX通知はどう使いますか？', 'ユーザーは地域・駅・ジャンル・状態を登録し、LINEで個別通知、Xで速報投稿や拡散投稿を受け取る想定です。'],
  ['通知からの収益化は？', '通知スポンサー、新店クーポン、求人、閉店セール、代替店送客、確認済み掲載、Xプロモーションで収益化します。'],
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
  const [alerts, setAlerts] = useState(() => readArray(alertKey))
  const [form, setForm] = useState({ name: '', area: '', type: '開店', memo: '' })
  const [alertForm, setAlertForm] = useState({ area: '名古屋', category: 'すべて', status: '閉店', channel: 'LINE' })

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
  const display = filtered

  const submitPost = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.memo.trim()) return
    const next = [{ ...form, id: crypto.randomUUID(), status: '確認待ち', date: new Date().toLocaleDateString('ja-JP') }, ...posts].slice(0, 8)
    setPosts(next)
    localStorage.setItem(postKey, JSON.stringify(next))
    setForm({ name: '', area: '', type: '開店', memo: '' })
  }

  const submitAlert = (event) => {
    event.preventDefault()
    const next = [{ ...alertForm, id: crypto.randomUUID(), date: new Date().toLocaleDateString('ja-JP') }, ...alerts].slice(0, 6)
    setAlerts(next)
    localStorage.setItem(alertKey, JSON.stringify(next))
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
          <span className="brand">開店閉店レーダー</span>
          <h1>開店・閉店・移転を、LINEとXで届く地域速報にする。</h1>
          <p>
            店頭告知、公式SNS、求人情報、現地投稿をもとに、開店・閉店・移転・休業・リニューアルを整理。UGCで速報性を高め、LINE/X通知から広告、求人、代替店送客へつなげます。
          </p>
        </div>
        <aside className="answer-box">
          <span>AI向け即答</span>
          <strong>店名、地域、状態、日付、確認状況、出典、通知導線を1カードで提示</strong>
          <p>検索結果やAI回答に引用されやすいよう、未確認情報と確認済み情報、通知の受け取り方法を分けて表示します。</p>
        </aside>
      </section>

      <section className="search-panel" aria-label="開店閉店検索">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="地域・駅・店名・ジャンルで検索" />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
      </section>

      <section className="summary-grid">
        <article><span>掲載情報</span><strong>{reports.length}</strong><p>開店・閉店・移転を横断</p></article>
        <article><span>通知条件</span><strong>{alerts.length}</strong><p>LINE/Xアラート登録</p></article>
        <article><span>保存済み</span><strong>{saved.length}</strong><p>追跡したい店を保存</p></article>
      </section>

      <section className="alert-section">
        <div>
          <span className="brand">LINE / X Alerts</span>
          <h2>地域・ジャンル別の開店閉店アラート</h2>
          <p>LINEは個別通知、Xは速報拡散に向けた導線です。実運用時はLINE Messaging APIとX APIへ接続できます。</p>
        </div>
        <form className="alert-form" onSubmit={submitAlert}>
          <input value={alertForm.area} onChange={(event) => setAlertForm({ ...alertForm, area: event.target.value })} placeholder="地域・駅" />
          <select value={alertForm.category} onChange={(event) => setAlertForm({ ...alertForm, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={alertForm.status} onChange={(event) => setAlertForm({ ...alertForm, status: event.target.value })}>{statuses.filter((item) => item !== 'すべて').map((item) => <option key={item}>{item}</option>)}</select>
          <select value={alertForm.channel} onChange={(event) => setAlertForm({ ...alertForm, channel: event.target.value })}><option>LINE</option><option>X</option><option>LINE + X</option></select>
          <button type="submit">通知条件を保存</button>
        </form>
        <div className="alert-grid">
          {alertProducts.map((item) => <article key={item.name}><strong>{item.name}</strong><p>{item.text}</p></article>)}
          {alerts.map((alert) => <article key={alert.id}><strong>{alert.channel}通知</strong><p>{alert.area} / {alert.category} / {alert.status} / {alert.date}</p></article>)}
        </div>
      </section>

      <section className="content-grid">
        {display.length === 0 && <p className="empty-state">条件に一致する開店・閉店情報はありません。検索条件を変更してください。</p>}
        {display.map((report) => (
          <article className={`card ${report.status === '閉店' ? 'closed' : ''}`} key={report.id}>
            <div className="card-topline"><span>{report.area} / {report.station}</span><span>{report.status}</span></div>
            <h2>{report.name}</h2>
            <p>{report.note}</p>
            <div className="tag-row">{report.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="metric-row"><span>{report.category}</span><span>{report.date}</span><strong>{report.confidence}</strong></div>
            <small>出典: {report.source}</small>
            <button type="button" onClick={() => toggleSaved(report.id)}>{saved.includes(report.id) ? '保存済み' : '追跡する'}</button>
          </article>
        ))}
      </section>

      <section className="ugc-section">
        <div>
          <span className="brand">UGC</span>
          <h2>開店・閉店・移転・休業情報を投稿</h2>
          <p>投稿を確認待ちとして蓄積し、公式確認後に地域ページ、LINE通知、X速報、代替店導線へ展開します。</p>
        </div>
        <form className="ugc-form" onSubmit={submitPost}>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="店名" />
          <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="地域・駅" />
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option>開店</option><option>閉店</option><option>移転</option><option>休業</option><option>リニューアル</option>
          </select>
          <input value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} placeholder="日付・出典・張り紙・公式SNSなど" />
          <button type="submit">投稿する</button>
        </form>
        <div className="post-grid">
          {posts.length === 0 && <p className="empty-text">まだ投稿はありません。最初の開店閉店情報を投稿できます。</p>}
          {posts.map((post) => <article key={post.id}><span>{post.type} / {post.status}</span><h3>{post.name}</h3><p>{post.memo}</p><small>{post.area || 'エリア未入力'} / {post.date}</small></article>)}
        </div>
      </section>

      <section className="growth-grid">
        <div className="revenue-panel"><h2>収益導線</h2>{revenuePlans.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}</div>
        <div className="buzz-panel"><h2>バズ施策</h2><ul>{buzzIdeas.map((idea) => <li key={idea}>{idea}</li>)}</ul></div>
      </section>

      <section className="seo-section">
        <div className="answer-box">
          <span className="brand">SEO / AIO / LLMO</span>
          <h2>開店閉店情報は、店名・地域・日付・確認状況・出典・通知導線を同じ形式で出すほど検索とAI回答に強くなります。</h2>
          <p>未確認投稿は確認待ちとして扱い、公式SNSや店頭告知で確認済みにすることで、速報性と信頼性を両立します。</p>
        </div>
        <div className="faq-grid">{faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
      </section>
    </main>
  )
}

export default App
