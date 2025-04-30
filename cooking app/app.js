// ─── DISH & VIDEO LOGIC ─────────────────────────────────────────
const dishes = `Achari Chicken, Achari Gosht, Aloo Baingan, Aloo Biryani, Aloo Cutlets,
Aloo Ghost, Aloo Gosht, Aloo Kabab, Aloo Ki Bhujiya, Aloo Matar Ka Salan, Aloo Methi,
Aloo Palak, Aloo Paratha, Aloo Qeema, Anda Aloo Curry, Anda Bhurji, Anda Chana,
Anda Curry, Anda Ka Salan, Anda Qeema, Anday Ka Salan, Anday Tori, Arhar Ki Daal,
Arvi Gosht, Arvi Ki Bhujiya, Baingan Ka Bharta, Baisan Ke Parathy, Beef Korma,
Beef Nihari, Beef Stew, Besan Ki Roti, Bhindi Gosht, Bhooni Hoe Moong Ki Daal,
Bhuna Gosht, Biryani, Chana Daal, Chana Masala, Chane Ki Daal Ki Qubooli,
Chapli Kabab, Chicken Achari Handi, Chicken Biryani, Chicken Curry, Chicken Haleem,
Chicken Handi, Chicken Jalfrezi, Chicken Karahi, Chicken Kofta, Chicken Pulao,
Chicken Qeema, Chicken Qorma, Chicken Shorba, Chicken Stew, Chicken Tehri,
Chicken White Handi, Cholay Biryani, Cholay Ka Salan, Custard, Daal Chawal,
Daal Fry, Daal Mash, Daal Moong, Dum Ka Qeema, Dahi Baray Roti, Fish Curry,
Gajar Matar, Garlic Bread With Fried Chicken, Haleem, Hinduiani Aloo, Kaddu Gosht,
Kaleji Masala, Karhi Chawal, Katakat, Khichri, Kheer, Kofta Curry, Koftay Aloo,
Kulfa Karhi, Loki Channe Ki Daal, Loki Gosht, Loki Ki Bhojiya, Makhni Handi,
Malaka Masoor Daal, Mangoria, Mangooriyo Ka Salan, Masoor Daal, Mash Daal,
Matar Paneer, Matar Pulao, Matar Qeema, Mix Sabzi, Moong Daal, Murg Cholay,
Mutton Biryani, Mutton Curry, Mutton Do Pyaza, Mutton Haleem, Mutton Karahi,
Mutton Pulao, MUTTON Salan, Nihari, Nargisi Kofta, Paltay, Paneer Qorma, Paya,
Qeema Karelay, Rajma, Roghni Naan, Saag, Saag Paneer, Sada Biryani, Shahi Qeema,
Shaljam Gosht, Shami Kabab, Shami Kabab Curry, Sheermal, Sashilik, Stoo, Taheri,
Taftaan, Timator Wali Masoor Ki Daal, Tikka Biryani, Tinday Gosht, Turnip Curry,
Tandoori Roti, Tawa Chicken, Tawa Keema, White Chicken Karahi, White Qorma,
Yakhni Pulao, Zarda`.split(/,\s*/);

const channels = [
  'UC4oKG2wXw65aXk8qQqFb6NQ',
  'UCwX5G6Uf9xYwJzqKq7wQ9Vg',
  'UC6c_6QvOZRzY7Yq8J2X6Q1w',
  'UCbV30Yw0eMWY-LqyHcN7QJg',
  'UC5j8yEE9GZq3z5Y5yJ5QZ9g',
  'UCX9ZvS-4Q5Zk5Q5ZQ5ZQ5ZQ',
  'UCq6yvGQ3W7R6ZnU6Yw2Z8ZQ',
  'UCX9ZvS-4Q5Zk5Q5ZQ5ZQ5ZQ'
];

const API_KEY = 'AIzaSyCa740ajzKVz-vmQTNKB3o_rnCN40Gz9dw';

async function fetchTopVideo(dish) {
  for (let channelId of channels) {
    const q = encodeURIComponent(dish + ' recipe');
    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&order=viewCount` +
      `&channelId=${channelId}&q=${q}&maxResults=1&key=${API_KEY}`;
    try {
      let resp = await fetch(url),
          json = await resp.json();
      if (json.items?.length) {
        let vid = json.items[0];
        return {
          dish,
          title: vid.snippet.title,
          channel: vid.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${vid.id.videoId}`
        };
      }
    } catch {}
  }
  return {
    dish,
    title: 'Search on YouTube',
    channel: '',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(dish + ' recipe Pakistani')}`
  };
}

document.getElementById('startBtn').onclick = async () => {
  const spinner = document.getElementById('spinner'),
        result  = document.getElementById('result');
  spinner.style.display = 'block';
  result.innerHTML = '';
  await new Promise(r => setTimeout(r, 1500));
  spinner.style.display = 'none';
  const pick = dishes.sort(() => 0.5 - Math.random()).slice(0, 3),
        vids = await Promise.all(pick.map(fetchTopVideo));
  result.innerHTML = `<ul>${vids.map(v => `
    <li>
      <strong>${v.dish}</strong><br>
      <a class="link" href="${v.url}" target="_blank">▶ ${v.title}</a><br>
      <span class="meta">${v.channel}</span>
    </li>
  `).join('')}</ul>`;
};

document.getElementById('date').textContent =
  new Date().toLocaleDateString('en-GB',{
    weekday:'long', day:'2-digit', month:'short', year:'numeric'
  });

// ─── PWA & INSTALL PROMPT ─────────────────────────────────────
const isInstalled = localStorage.getItem('appInstalled') === 'true';
let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('✅ SW Registered:', reg.scope))
      .catch(err => console.log('❌ SW Failed:', err));
  });
}

if (!isInstalled) {
  const btnInstall = document.getElementById('btnInstall');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstall.style.display = 'block';
  });

  btnInstall.addEventListener('click', async () => {
    btnInstall.style.display = 'none';
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') localStorage.setItem('appInstalled','true');
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('appInstalled','true');
  });
}
