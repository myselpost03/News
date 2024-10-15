import express from "express";
import Parser from "rss-parser";
import cors from "cors";
import axios from "axios";
import NodeCache from "node-cache";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import webpush from "web-push";
import cron from "node-cron";

const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;

const parser = new Parser();

const cache = new NodeCache();

//! Connect database
const mongoURI =
  "mongodb+srv://himarabkoti:CWoZHUiM2kpze9vd@myselpostcluster.xetzmg2.mongodb.net/";
mongoose
  .connect(mongoURI, {
    dbName: "myselpostDB",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to myselpostDB database");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

//! Database schemas
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  rating: Number,
});

const contactUsSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const subscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: mongoose.Schema.Types.Mixed,
});

//! Database models
const Feedback = mongoose.model("Feedbacks", feedbackSchema);
const ContactUs = mongoose.model("contact Us", contactUsSchema);
const Subscription = mongoose.model("Subscription", subscriptionSchema);

//! Web push API keys
const publicKey =
  "BFYpZ9Lk5HdtTY5gx2InF-FXWMFb0sbaQgQa489op10YK9mBu4hgM-JQGh6K6Pwq8NwGn3tHMbNukgx3IWD51PY";
const privateKey = "XxvrcNKDtcNNfVrs0dfkEwnOr2kEj6Q9ZP7v-EP3Jqg";
webpush.setVapidDetails(
  "mailto:anujrajpoot087@gmail.com",
  publicKey,
  privateKey
);

app.use(bodyParser.json());

//! News sources
const newsSources = [
  //! Indian rss feed
  "https://www.india.com/news/india/feed/",
  "https://feeds.feedburner.com/ndtvnews-india-news",
  "https://zeenews.india.com/rss/india-national-news.xml",

  //! American rss feed
  "https://theintercept.com/feed/?lang=en",
  "https://chaski.huffpost.com/us/auto/vertical/us-news",
  "http://rss.cnn.com/rss/cnn_us.rss",
  "https://www.latimes.com/nation/rss2.0.xml",

  //! Technology rss feed
  "https://techcrunch.com/feed/",
  "https://lifehacker.com/rss",
  "https://www.wired.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://www.zdnet.com/news/rss.xml",
  "https://feeds.feedburner.com/gadgets360-latest",

  //! Indian states wise rss feed
  "https://www.thehindu.com/news/cities/Delhi/feeder/default.rss",
  "https://www.thehindu.com/news/cities/bangalore/feeder/default.rss",
  "https://www.thehindu.com/news/cities/mumbai/feeder/default.rss",
  "https://www.thehindu.com/news/cities/chennai/feeder/default.rss",
  "https://www.thehindu.com/news/cities/hyderabad/feeder/default.rss",
  "https://www.thehindu.com/news/cities/kochi/feeder/default.rss",
  "https://www.thehindu.com/news/cities/kolkata/feeder/default.rss",
  "https://www.thehindu.com/news/cities/madurai/feeder/default.rss",
  "https://www.thehindu.com/news/cities/kozhikode/feeder/default.rss",
  "https://www.thehindu.com/news/cities/mangaluru/feeder/default.rss",
  "https://www.thehindu.com/news/cities/puducherry/feeder/default.rss",
  "https://www.thehindu.com/news/cities/thiruvananthapuram/feeder/default.rss",
  "https://www.thehindu.com/news/cities/tiruchirapalli/feeder/default.rss",
  "https://www.india.com/topic-rss/andhra-pradesh/feed/",
  "https://www.india.com/topic-rss/himachal-pradesh/feed/",
  "https://www.india.com/topic-rss/haryana/feed/",
  "https://www.india.com/topic-rss/jammu-kashmir/feed/",
  "https://www.india.com/topic-rss/punjab/feed/",
  "https://www.india.com/topic-rss/rajasthan/feed/",
  "https://www.india.com/topic-rss/gujarat/feed/",
  "https://www.india.com/topic-rss/uttar-pradesh/feed/",
  "https://timesofindia.indiatimes.com/rssfeeds/-2128821153.cms",
  "https://www.india.com/topic-rss/assam/feed/",
  "https://www.india.com/topic-rss/goa/feed/",
  "https://www.india.com/topic-rss/bihar/feed/",
  "https://www.india.com/topic-rss/jharkhand/feed/",
  "https://timesofindia.indiatimes.com/rssfeeds/3947067.cms",
  "https://www.india.com/topic-rss/karnataka/feed/",
  "https://www.india.com/topic-rss/madhya-pradesh/feed/",

  //! American states wise rss feed
  "https://feeds.texastribune.org/feeds/main/",
  "https://nypost.com/us-news/feed/",
  "https://mississippitoday.org/feed/",
  "https://www.orlandosentinel.com/feed/",
  "https://www.spokesman.com/feeds/stories/",
  "https://billingsgazette.com/search/?f=rss&t=article&l=50&s=start_time&sd=desc&k%5B%5D=%23topstory",
  "https://www.reviewjournal.com/feed/",
  "https://www.latimes.com/california/rss2.0.xml",
  "https://starherald.com/search/?f=rss&t=article&l=50&s=start_time&sd=desc&k%5B%5D=%23topstory",
  "https://www.jamestownsun.com/index.rss",
  "https://www.denverpost.com/news/feed/",
  "https://feeds.mcclatchy.com/thestate/stories",
  "https://www.nwitimes.com/search/?f=rss&t=article&l=50&s=start_time&sd=desc&k%5B%5D=%23topstory",

  //! Indonesia states wise rss feed
  "https://rss.tempo.co/",
  "https://jabar.tribunnews.com/rss",
  "https://surabayapagi.com/feed",
  "https://www.balidiscovery.com/feed/",
  "https://www.metrosumatera.com/feed/",

  //! Cuba states wise rss feed
  "https://havanatimes.org/feed/",
  "https://santiagotimes.com/feed/",
  "https://www.radiorebelde.cu/feed/",
  "https://www.cubanet.org/feed/",

  //! UK states wise rss feed
  "https://www.standard.co.uk/news/rss",
  "https://www.manchestereveningnews.co.uk/news/?service=rss",
  "https://www.birminghammail.co.uk/news/?service=rss",
  "https://www.glasgowlive.co.uk/news/?service=rss",
  "https://feeds.bbci.co.uk/news/wales/rss.xml",
  "https://www.scotsman.com/rss",
  "https://feeds.bbci.co.uk/news/northern_ireland/rss.xml",

  //! World location news
  "https://www.nzherald.co.nz/arc/outboundfeeds/rss/section/nz/?outputType=xml&_website=nzh",
  "https://feeds.bbci.co.uk/news/rss.xml",
  "http://rss.cnn.com/rss/cnn_us.rss",
  "https://www.smh.com.au/rss/feed.xml",
  "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
  "http://www.xinhuanet.com/english/rss/chinarss.xml",
  "https://www.rt.com/rss/",
  "https://batimes.com.ar/feed",
  "https://rss.jpost.com/rss/rssfeedsfrontpage.aspx",
  "https://www.arabnews.com/rss.xml",
  "https://feeds.capi24.com/v1/Search/articles/news24/topstories/rss",
  "https://www.dailysabah.com/rssFeed/10",
  "https://www.adaderana.lk/rss.php",
  "https://www.cbc.ca/webfeed/rss/rss-world",
  "https://feeds.thelocal.com/rss/dk",
  "https://www.france24.com/en/rss",
  "https://www.japantimes.co.jp/feed/",
  "https://www.spiegel.de/international/index.rss",
  "https://www.thedailystar.net/rss.xml",
  "https://tribune.com.pk/feed/pakistan",
  "https://english.onlinekhabar.com/feed",
  "https://www.irrawaddy.com/feed",
  "https://rss.tempo.co/",
  "https://www.riotimesonline.com/feed/",
  "https://rss.punchng.com/v1/category/latest_news",
  "https://www.arctictoday.com/feed/",
  "https://mexiconewsdaily.com/feed/",

  //! UK news
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://www.thesun.co.uk/feed/",
  "https://www.independent.co.uk/rss",
  "https://www.telegraph.co.uk/rss.xml",
  "https://en.granma.cu/feed",

  //! World news
  "https://www.thehindu.com/news/international/?service=rss",
  "https://www.scmp.com/rss/2/feed",
  "https://www.euronews.com/rss?level=theme&name=news",

  //! Business news
  "https://marketbusinessnews.com/feed/",
  "https://www.ibtimes.com/rss",
  "https://www.vox.com/rss/business-and-finance/index.xml",
  "https://fortune.com/feed/fortune-feeds/?id=3230629",
  "https://www.businessinsider.com/rss",

  //! Sports news
  "https://www.espn.com/espn/rss/news",
  "https://www.fourfourtwo.com/feeds.xml",
  "https://www.eurosport.com/rss.xml",
  "https://www.cbssports.com/rss/headlines/",

  //! Health news
  "https://www.statnews.com/feed/",
  "https://kffhealthnews.org/feed/",
  "https://www.medpagetoday.com/rss/headlines.xml",
  "https://theconversation.com/us/health/articles.atom",

  //! Science news
  "https://www.space.com/rss.xml",
  "https://www.livescience.com/feeds/all",
  "https://phys.org/rss-feed/",
  "https://feeds.newscientist.com/home",

  //! Entertainment news
  "https://www.etonline.com/movies/rss",
  "https://www.billboard.com/feed/",
  "https://www.hollywoodreporter.com/feed/",
  "https://deadline.com/feed/",
  "https://variety.com/feed/",

  //! Fashion news
  "https://www.fashiongonerogue.com/feed/",
  "https://www.businessoffashion.com/arc/outboundfeeds/rss/?outputType=xml",
  "https://www.glamour.com/feed/rss",
  "https://graziamagazine.com/feed/",
  "https://coveteur.com/feeds/feed.rss",

  //! Rus-ukr war news
  "https://euromaidanpress.com/feed/",
  "https://apnews.com/hub/russia-ukraine.rss",
  "https://feeds.bbci.co.uk/news/topics/c1vw6q14rzqt/rss.xml",
  "https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/news-event/ukraine-russia/rss.xml",

  //! Israel war news
  "https://apnews.com/hub/israel-hamas-war.rss",
  "https://www.theguardian.com/world/israel-hamas-war/rss",
  "https://rss.jpost.com/rss/israel-hamas-war/",
  "https://feeds.bbci.co.uk/news/topics/c2vdnvdg6xxt/rss.xml",

  //! Education news
  "https://www.insidehighered.com/rss.xml",
  "https://theconversation.com/us/education/articles.atom",
  "https://www.educationnext.org/feed/",
  "https://hechingerreport.org/feed/",

  //! Brazil news
  "https://jornaldebrasilia.com.br/feed/",
  "https://www.brasilwire.com/feed/",
  "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/geral/?body=%7B%22layout%22:%22google-news%22%7D",
  "https://braziljournal.com/feed/",

  //! Olympics trending
  "https://nypost.com/olympics/feed/",

  "https://www.news.com.au/content-feeds/latest-news-world/",

  "https://en.antaranews.com/rss/news.xml",
  "https://www.sindonews.com/feed",
  "https://www.jpnn.com/index.php?mib=rss",

  "https://www.toronto.com/search/?f=rss&t=article&c=news&l=50&s=start_time&sd=desc",
  "https://www.cbc.ca/webfeed/rss/rss-canada",
  "https://feeds.feedburner.com/ndtvnews-india-news",

  "https://www.wheninmanila.com/feed/",
  "https://www.inquirer.net/fullfeed/",
  "https://www.rappler.com/feed/",

  "https://oglobo.globo.com/rss/oglobo",
  "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/geral/?body=%7B%22layout%22:%22google-news%22%7D",
];

/*async function fetchRSS(url, startIndex = 0, limit = 5) {
  const startTime = Date.now();

  try {
    const feedResponse = await axios.get(url);

    if (feedResponse.status !== 200) {
      throw new Error(
        `Failed to fetch RSS feed, status code: ${feedResponse.status}`
      );
    }

    const feedContent = removeBOM(feedResponse.data);
    const feed = await parser.parseString(feedContent);
    
    const items = feed.items
      .slice(startIndex, startIndex + limit)
      .map((item) => ({
        title: item.title,
        link: item.link,
        description: item.contentSnippet,
        date: item.isoDate,
        image: null,
      }));

    const imageStartTime = Date.now();
    const imageRequests = items.map(async (item) => {
      try {
        const htmlResponse = await axios.get(item.link, { timeout: 5000 });
        const metaImage = extractImage(htmlResponse.data);
        item.image = metaImage || null;
      } catch (error) {
        //console.error(`Error fetching image for ${item.link}:`, error);
      }
    });

    await Promise.all(imageRequests);
    console.log(
      `Image processing time: ${(Date.now() - imageStartTime) / 1000} seconds`
    );

    cache.set(`${url}-${startIndex}`, items);
    console.log(
      `Total fetchRSS time: ${(Date.now() - startTime) / 1000} seconds`
    );
    return items;
  } catch (error) {
    //console.error(`Error in fetchRSS function:`, error);
    await restartServer();
    console.log(
      `Total fetchRSS time: ${(Date.now() - startTime) / 1000} seconds`
    );
    return [];
  }
}*/

const index = {
  indianews: 0,
  ndtvnews: 1,
  zeenews: 2,

  cbsnews: 3,
  huffpost: 4,
  cnnnews: 5,
  lanews: 6,

  techcrunch: 7,
  lifehacker: 8,
  wired: 9,
  verge: 10,
  zdnet: 11,
  gadget360: 12,

  delhi: 13,
  bangalore: 14,
  mumbai: 15,
  chennai: 16,
  hyderabad: 17,
  kochi: 18,
  kolkata: 19,
  madurai: 20,
  kozhikode: 21,
  mangaluru: 22,
  puducherry: 23,
  thiruvananthapuram: 24,
  tiruchirapalli: 25,
  andhrapradesh: 26,
  himachalpradesh: 27,
  haryana: 28,
  jammukashmir: 29,
  punjab: 30,
  rajasthan: 31,
  gujarat: 32,
  uttarpradesh: 33,
  ahmedabad: 34,
  assam: 35,
  goa: 36,
  bihar: 37,
  jharkhand: 38,
  kanpur: 39,
  karnataka: 40,
  madhyapradesh: 41,

  texas: 42,
  newyork: 43,
  mississippi: 44,
  florida: 45,
  washington: 46,
  montana: 47,
  lasvegas: 48,
  california: 49,
  nebraska: 50,
  northdakota: 51,
  denver: 52,
  southcarolina: 53,
  indiana: 54,

  jakarta: 55,
  bandung: 56,
  surabaya: 57,
  bali: 58,
  sumatra: 59,

  havana: 60,
  santiago: 61,
  pinardelrio: 62,
  matanzas: 63,

  london: 64,
  manchester: 65,
  birmingham: 66,
  glasgow: 67,
  wales: 68,
  scotland: 69,
  northernireland: 70,

  newzealand: 71,
  uk: 72,
  us: 73,
  australia: 74,
  india: 75,
  china: 76,
  russia: 77,
  argentina: 78,
  israel: 79,
  saudiarabia: 80,
  southafrica: 81,
  turkey: 82,
  srilanka: 83,
  canada: 84,
  denmark: 85,
  france: 86,
  japan: 87,
  germany: 88,
  bangladesh: 89,
  pakistan: 90,
  nepal: 91,
  myanmar: 92,
  indonesia: 93,
  brazil: 94,
  nigeria: 95,
  greenland: 96,
  mexico: 97,

  bbc: 98,
  guardian: 99,
  independent: 100,
  telegraph: 101,

  granma: 102,

  thehindu: 103,
  scpost: 104,
  euronews: 105,

  marketbusiness: 106,
  ibtimes: 107,
  vox: 108,
  fortune: 109,
  businessinsider: 110,

  espn: 111,
  fourfourtwo: 112,
  eurosport: 113,
  cbssport: 114,

  statnews: 115,
  kffhealth: 116,
  medpagetoday: 117,
  theconversation: 118,

  spacenews: 119,
  livescience: 120,
  physics: 121,
  newsscientist: 122,

  etonline: 123,
  billboard: 124,
  hollywoodreporter: 125,
  deadline: 126,
  variety: 127,

  fashionrogue: 128,
  businessoffashion: 129,
  glamour: 130,
  glaziamagazine: 131,
  coveteur: 132,

  euromaid: 133,
  apnews: 134,
  bbcukraine: 135,
  nytukraine: 136,

  apisrael: 137,
  guardianisrael: 138,
  jpost: 139,
  bbcisrael: 140,

  insidehigh: 141,
  theconversationeducation: 142,
  educationnext: 143,
  hechingerreport: 144,

  brazilnews: 145,
  brasilwire: 146,
  estadao: 147,
  braziljournal: 148,

  olympics: 149,

  global4: 150,

  indonesia1: 151,
  indonesia2: 152,
  indonesia3: 153,

  canada1: 154,
  canada2: 155,
  canada3: 156,

  phillipines1: 157,
  phillipines2: 158,
  phillipines3: 159,

  manila: 157,

  rionews: 160,
  saopaulo: 161,
};

function removeBOM(data) {
  if (data.charCodeAt(0) === 0xfeff) {
    return data.slice(1);
  }
  return data;
}

async function fetchRSS(url, startIndex = 0, limit = 3) {
  //const startTime = Date.now();

  try {
    const feedResponse = await axios.get(url);

    if (feedResponse.status !== 200) {
      throw new Error(
        `Failed to fetch RSS feed, status code: ${feedResponse.status}`
      );
    }

    const feedContent = removeBOM(feedResponse.data);
    const feed = await parser.parseString(feedContent);
    const items = feed.items
      .slice(startIndex, startIndex + limit)
      .map((item) => ({
        title: item.title,
        link: item.link,
        description: item.contentSnippet,
        date: item.isoDate,
        image: null,
      }));

    //const imageStartTime = Date.now();
    const imageRequests = items.map(async (item) => {
      try {
        const htmlResponse = await axios.get(item.link, { timeout: 5000 });
        const metaImage = extractImage(htmlResponse.data);
        item.image = metaImage || null;
      } catch (error) {
        //console.error(`Error fetching image for ${item.link}:`, error);
      }
    });

    await Promise.all(imageRequests);
    /* console.log(
      `Image processing time: ${(Date.now() - imageStartTime) / 1000} seconds`
    );*/

    cache.set(`${url}-${startIndex}`, items);
    /*console.log(
      `Total fetchRSS time: ${(Date.now() - startTime) / 1000} seconds`
    );*/
    return items;
  } catch (error) {
    //console.error(`Error in fetchRSS function:`, error);
    await restartServer();
    /*console.log(
      `Total fetchRSS time: ${(Date.now() - startTime) / 1000} seconds`
    );*/
    return [];
  }
}

async function fetchRSSTimer(url) {
  try {
    const cachedData = cache.get(url);
    if (cachedData) {
      return cachedData;
    }
    const feed = await parser.parseURL(url);

    const items = feed.items.slice(0, 144).map((item) => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet,
      date: item.isoDate,
      image: null,
    }));
    const imageRequests = items.map(async (item) => {
      try {
        const htmlResponse = await axios.get(item.link, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          timeout: 5000,
        });
        const metaImage = extractImage(htmlResponse.data);
        item.image = metaImage || null;
      } catch (error) {
        //console.error("Error fetching or parsing article:", error);
      }
    });

    await Promise.all(imageRequests);

    cache.set(url, items);

    return items;
  } catch (error) {
    console.error("Error parsing RSS feed:", error);
    restartServer();

    return [];
  }
}

async function fetchRSSMaps(url) {
  try {
    const cachedData = cache.get(url);
    if (cachedData) {
      console.log("Cached data found for:", url);
      return cachedData;
    }

    const feed = await parser.parseURL(url);
    const items = feed.items.slice(0, 5).map((item) => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet,
      date: item.isoDate,
      image: null,
    }));

    const imageRequests = items.map(async (item) => {
      try {
        const htmlResponse = await axios.get(item.link);
        const metaImage = extractImage(htmlResponse.data);
        item.image = metaImage || null;
      } catch (error) {
        //console.error("Error fetching or parsing article:", error);
      }
    });

    await Promise.all(imageRequests);
    cache.set(url, items);
    return items;
  } catch (error) {
    console.error("Error parsing RSS feed:", error);
    restartServer();
    return [];
  }
}

//! Extract image from news source
function extractImage(html) {
  try {
    const match = html.match(
      /<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"\s*\/?>/i
    );
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting image:", error);
    return null;
  }
}

//! Restart server
async function restartServer() {
  console.log("Restarting server...");

  try {
    const newPort = PORT + 1;

    server = app.listen(newPort, () => {
      console.log(`Server listening on port ${newPort}`);
    });

    await mongoose.connect(mongoURI, {
      dbName: "myselpostDB",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Reconnected to the database");
  } catch (error) {
    console.error("Error restarting server:", error);
  }
}

// Separate schedule for 12 PM
cron.schedule("19 12 * * *", async () => {
  const title = "MySelpost";
  const body = "🕛 Midday Update: Here what happening right now!";
  await sendNotifications(title, body);
});



// Function to send notifications
const sendNotifications = async (title, body) => {
  const payload = JSON.stringify({ title, body });

  const subscriptions = await Subscription.find();

  const notificationPromises = subscriptions.map((subscription) => {
    return webpush
      .sendNotification(subscription, payload)
      .catch(async (err) => {
        if (err.statusCode === 410) {
          // Subscription is no longer valid, remove it from the database
          await Subscription.deleteOne({ endpoint: subscription.endpoint });
        }
      });
  });

  await Promise.all(notificationPromises);
};

//! Fetch news source
app.get("/api/news/:source", async (req, res) => {
  const source = req.params.source.toLowerCase();
  const page = parseInt(req.query.page) || 0;

  try {
    const url = newsSources[index[source]];
    const startIndex = page * 3;
    const cachedData = cache.get(`${url}-${startIndex}`);

    if (cachedData) {
      res.json(cachedData);
    } else {
      const newsData = await fetchRSS(url, startIndex);
      //console.log(newsData.length)
      res.json(newsData);
    }
  } catch (error) {
    if (error.errorcode === "EKEYTYPE") {
      // Do nothing, as you don't want to log this error
      return []; // or any default value or empty response you prefer
    }
    //console.error(`Error fetching ${source} News:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//! Fetch news for News Timer feature
app.get("/api/timer/:source", async (req, res) => {
  const source = req.params.source.toLowerCase();

  try {
    const url = newsSources[index[source]];
    const cachedData = cache.get(url);
    if (cachedData) {
      //console.log("Cached data found for:", url);
      res.json(cachedData);
    } else {
      const newsData = await fetchRSSTimer(url);
      //console.log(newsData.length)
      res.json(newsData);
    }
  } catch (error) {
    console.error(`Error fetching ${source} News:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/maps-news/:source", async (req, res) => {
  const source = req.params.source.toLowerCase();

  try {
    const url = newsSources[index[source]];
    const cachedData = cache.get(url);
    if (cachedData) {
      //console.log("Cached data found for:", url);
      res.json(cachedData);
    } else {
      const newsData = await fetchRSSMaps(url);
      //console.log(newsData.length)
      res.json(newsData);
    }
  } catch (error) {
    if (error.errorcode === "EKEYTYPE") {
      // Do nothing, as you don't want to log this error
      return []; // or any default value or empty response you prefer
    }
    //console.error(`Error fetching ${source} News:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//! Store user feedback
app.post("/api/feedbacks", async (req, res) => {
  try {
    //console.log('Received feedback:', req.body);
    const { name, email, message, rating } = req.body;
    const feedback = new Feedback({ name, email, message, rating });
    await feedback.save();
    console.log("Feedback saved successfully");
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

//! Store contact details
app.post("/api/contact-us", async (req, res) => {
  try {
    //console.log('Received feedback:', req.body);
    const { name, email, message } = req.body;
    const contact = new ContactUs({ name, email, message });
    await contact.save();
    console.log("Contact form saved successfully");
    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    console.error("Error saving contact form:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

//! Store subscription
app.post("/api/subscribe", async (req, res) => {
  try {
    const existingSubscription = await Subscription.findOneAndUpdate(
      { endpoint: req.body.endpoint },
      req.body,
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Subscription stored successfully",
      subscription: existingSubscription,
    });
  } catch (error) {
    console.error("Error storing subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//! Send notification
app.post("/api/send-notification", async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });

  const subscriptions = await Subscription.find();

  const notificationPromises = subscriptions.map((subscription) => {
    return webpush
      .sendNotification(subscription, payload)
      .catch(async (err) => {
        /* console.error("Error sending notification:", err);
        if (err.statusCode === 410) {
          // Subscription is no longer valid, remove it from the database
          await Subscription.deleteOne({ endpoint: subscription.endpoint });
        }*/
      });
  });

  await Promise.all(notificationPromises);

  res.status(200).json({ message: "Notifications sent" });
});

//! Update subscription
app.put("/api/update-subscription", async (req, res) => {
  const newSubscription = req.body;
  try {
    const existingSubscription = await Subscription.findOneAndUpdate(
      { endpoint: newSubscription.endpoint },
      newSubscription,
      { new: true, upsert: true }
    );

    if (existingSubscription) {
      res.status(200).json({
        message: "Subscription updated successfully",
        subscription: existingSubscription,
      });
    } else {
      res.status(404).json({ error: "Subscription not found" });
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

//! Start server
let server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
