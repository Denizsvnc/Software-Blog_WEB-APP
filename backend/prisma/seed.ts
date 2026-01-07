import { prisma } from '../src/lib/prisma.js';
import bcryptjs from 'bcryptjs';

const categoryData = [
  {
    name: 'Yazilim Trendleri',
    slug: 'yazilim-trendleri',
    description: 'Yeni teknolojiler, araclar ve hibrit yaklasimlar uzerine Turkce analizler'
  },
  {
    name: 'Web Gelistirme',
    slug: 'web-gelistirme',
    description: 'Frontend ve backend teknikleri, modern web is akislari'
  },
  {
    name: 'Mobil Uygulamalar',
    slug: 'mobil-uygulamalar',
    description: 'iOS, Android ve hibrit mobil gelistirme deneyimleri'
  },
  {
    name: 'Veri Bilimi',
    slug: 'veri-bilimi',
    description: 'Analitik, makine ogrenmesi ve veri muhendisligi rehberleri'
  },
  {
    name: 'Bulut Teknolojileri',
    slug: 'bulut-teknolojileri',
    description: 'Kubernetes, sunucusuz mimariler ve DevOps uygulamalari'
  },
  {
    name: 'Girisimcilik',
    slug: 'girisimcilik',
    description: 'Urun gelistirme, ekip yonetimi ve pazar stratejileri'
  }
];

const userData = [
  {
    email: 'deniz.admin@yazilim.blog',
    username: 'denizadmin',
    name: 'Deniz Sevinc',
    role: 'ADMIN' as const,
    bio: 'Toplulugu buyuten ve teknik vizyonu belirleyen admin',
    avatarUrl: 'https://ui-avatars.com/api/?name=Deniz+Sevinc'
  },
  {
    email: 'melis.editor@yazilim.blog',
    username: 'meliseditor',
    name: 'Melis Karaman',
    role: 'EDITOR' as const,
    bio: 'Turkce teknik rehberleri duzenleyen editor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Melis+Karaman'
  },
  {
    email: 'kaan.editor@yazilim.blog',
    username: 'kaaneditor',
    name: 'Kaan Ozdemir',
    role: 'EDITOR' as const,
    bio: 'Web ve mobil platformlarda 10+ yil deneyimli yazar',
    avatarUrl: 'https://ui-avatars.com/api/?name=Kaan+Ozdemir'
  },
  {
    email: 'aylin.dev@yazilim.blog',
    username: 'aylindev',
    name: 'Aylin Yildiz',
    role: 'USER' as const,
    bio: 'React ve Vue ekosisteminde calisan full-stack gelistirici',
    avatarUrl: 'https://ui-avatars.com/api/?name=Aylin+Yildiz'
  },
  {
    email: 'mert.data@yazilim.blog',
    username: 'mertdata',
    name: 'Mert Alkan',
    role: 'USER' as const,
    bio: 'Veri bilimcisi, kagit uzerinden prod ortamina model tasiyor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mert+Alkan'
  },
  {
    email: 'selin.cloud@yazilim.blog',
    username: 'selincloud',
    name: 'Selin Acar',
    role: 'USER' as const,
    bio: 'Bulut altyapilarinda platform ekiplerini yoneten uzman',
    avatarUrl: 'https://ui-avatars.com/api/?name=Selin+Acar'
  }
];

type PostSeed = {
  title: string;
  slug: string;
  content: string;
  views: number;
  author: string;
  categories: string[];
};

const postData: PostSeed[] = [
  {
    title: '2026 Yazilim Trendleri: Yapay Zeka Destekli Kodlama',
    slug: '2026-yazilim-trendleri-yapay-zeka-destekli-kodlama',
    content: `Yapay zeka artan sekilde gelistirme surecine entegre oluyor.

## Populer yaklasimlar
- Kod tamamlama icin ogrenici araclar
- Test senaryolarini AI ile uretme
- Veri analitigi destekli backlog planlama

Takimlar, AI'yi destekleyici bir uyeden ibaret gormeli ve kontrol mekanizmasini kaybetmemeli.`,
    views: 482,
    author: 'meliseditor',
    categories: ['yazilim-trendleri', 'web-gelistirme']
  },
  {
    title: 'Next.js 15 ile Hibrit Render Stratejileri',
    slug: 'nextjs-15-ile-hibrit-render-stratejileri',
    content: `Next.js 15 ile birlikte hibrit render secenekleri daha da oturdu.

### ODAK NOKTALARI
- Route bazli streaming
- Server Actions ile veri mutasyonunun sadelemesi
- Edge runtime icerisinde onceleme

Yeni surum, SSR ile statik uretimi dengelerken performansi da artiriyor.`,
    views: 361,
    author: 'aylindev',
    categories: ['web-gelistirme']
  },
  {
    title: 'Flutter ile Super App Mimarisine Giris',
    slug: 'flutter-ile-super-app-mimarisine-giris',
    content: `Super app yaklasimi tek uygulama icinde onlarca modul barindirir.

Flutter, modul yapisi ve widget sistemi sayesinde bu mimaride hizli ilerlemeyi saglar. Paket duzeni, moduller arasi bagimlilik ve dark mode uyumu onemli.

Performans icin isolates ve lazy load stratejileri uygulanmali.`,
    views: 275,
    author: 'kaaneditor',
    categories: ['mobil-uygulamalar']
  },
  {
    title: 'Kubernetes Ortamlarinda Maliyet Optimizasyonu',
    slug: 'kubernetes-ortamlarinda-maliyet-optimizasyonu',
    content: `Bulut faturalarini dusurmek icin kaynak kullanimini dogru olcmek sart.

- Node boyutlarini ihtiyaca gore secin
- Otomatik scale mekanizmalarini sinirlayin
- Gereksiz log ve metric toplama maliyetlerini azaltin

FinOps ekipleri ile gelistirme ekiplerinin birlikte calismasi buyuk fark yaratiyor.`,
    views: 198,
    author: 'selincloud',
    categories: ['bulut-teknolojileri']
  },
  {
    title: 'PostgreSQL 17 ile Gelen Yenilikler',
    slug: 'postgresql-17-ile-gelen-yenilikler',
    content: `PostgreSQL 17 surumu, sorgu planlayicisini iyilestiren bircok detay getiriyor.

## Onemli ozellikler
- Incremental sort performansi
- JSON verisi icin yeni operatorler
- Logical replication icin ince ayar yetenekleri

Butun bu adimlar veri odakli uygulamalari daha hizli hale getiriyor.`,
    views: 244,
    author: 'mertdata',
    categories: ['veri-bilimi']
  },
  {
    title: 'Serverless Mimaride Observability Yaklasimi',
    slug: 'serverless-mimaride-observability-yaklasimi',
    content: `Serverless uygulamalarinda izlenebilirlik saglamak klasik log yaklasimindan farkli.

Her fonksiyon icin dagitik trace, merkezi log depolama ve metrik toplama stratejileri kurmak gerekiyor. Iyilestirilmis alarm kurallari operasyonel sorunlari erken yakalar.`,
    views: 312,
    author: 'selincloud',
    categories: ['bulut-teknolojileri', 'web-gelistirme']
  },
  {
    title: 'React Server Components ile Veri Yonetime Yeni Bakis',
    slug: 'react-server-components-ile-veri-yonetine-yeni-bakis',
    content: `Server Components, veri erisimi ve component render mantigini yeniden sekillendiriyor.

- Client bundleni kucultur
- Veri cagrisini sunucuya tasir
- Streaming ile hizli ilk byte sunar

Ancak cache stratejisi ve hata yonetimi icin ekstra planlama gerekir.`,
    views: 401,
    author: 'aylindev',
    categories: ['web-gelistirme']
  },
  {
    title: 'Rust ile Mikro Servis Gelistirmeye Giris',
    slug: 'rust-ile-mikro-servis-gelistirmeye-giris',
    content: `Rust, memory safety garantisi ile mikro servislerde populerlesiyor.

Actix Web gibi kutuphaneler ile performansli REST servisleri kurabilirsiniz. Cargo yapisi, test kulturune ve CI/CD kanalina hizli entegre olur.`,
    views: 223,
    author: 'meliseditor',
    categories: ['yazilim-trendleri']
  },
  {
    title: 'Startup Ekipleri icin OKR Hazirlama Rehberi',
    slug: 'startup-ekipleri-icin-okr-hazirlama-rehberi',
    content: `OKR metodolojisi buyuk vizyonu parcalara boler.

Basarili OKR icin:
- Olculmesi kolay anahtar sonuclar belirleyin
- Tum ekiplerle seffaf paylasin
- Aylik check-in toplantilarini atlamayin

Disiplinli uygulama, erken asama girisimler icin hizlandiricidir.`,
    views: 187,
    author: 'denizadmin',
    categories: ['girisimcilik']
  },
  {
    title: 'Supabase ile Gercek Zamanli Uygulama Gelistirme',
    slug: 'supabase-ile-gercek-zamanli-uygulama-gelistirme',
    content: `Supabase, Postgres tabanli arka uc ile gercek zamanli ozellikler sunuyor.

Realtime kanallari sayesinde chat, bildirim ve panel uygulamalarini hizlica hayata gecirmek mumkun. Auth modulu ve cihaza ozel policy tanimlari buyuk kolaylik saglar.`,
    views: 265,
    author: 'aylindev',
    categories: ['web-gelistirme', 'bulut-teknolojileri']
  },
  {
    title: 'OpenTelemetry ile Uygulama Gozlemlenebilirligini Standartlastirma',
    slug: 'opentelemetry-ile-uygulama-gozlemlenebilirligini-standartlastirma',
    content: `Farkli izleme araclarini tek cati altinda toplamak icin OpenTelemetry iyi bir secenektir.

Trace, metrik ve log verilerini tek bir spesifikasyon ile toplarsiniz. Collector ve exporter mimarisi, bulut saglayicilariyla uyumlu calisir.`,
    views: 298,
    author: 'selincloud',
    categories: ['bulut-teknolojileri']
  },
  {
    title: 'Veri Bilimi Projelerinde Model Monitoringi',
    slug: 'veri-bilimi-projelerinde-model-monitoringi',
    content: `Model performansinin sahada dusmesini engellemek icin izleme zorunlu.

Drift metrikleri, veri dagilimi ve performans skorlarinin otomatik toplanmasi gerekir. Alert sistemi ile kritik sapmalar erken yakalanir.`,
    views: 254,
    author: 'mertdata',
    categories: ['veri-bilimi']
  },
  {
    title: 'Mobil Uygulamalarda Performans Takibi',
    slug: 'mobil-uygulamalarda-performans-takibi',
    content: `Mobil uygulamalar icin FPS, uygulama acilis suresi ve enerji tuketimi kritik metriklerdir.

  Gelistirici olarak Crashlytics, Sentry ve Firebase Performance gibi araclari entegre etmelisiniz.`,
    views: 190,
    author: 'kaaneditor',
    categories: ['mobil-uygulamalar']
  },
  {
    title: 'Design System Olustururken Dikkat Edilmesi Gerekenler',
    slug: 'design-system-olustururken-dikkat-edilmesi-gerekenler',
    content: `Design system, ekip icin ortak bir dil kurar.

Renk paleti, tipografi, komponent davranislari ve dokumantasyon birarada olmali. Kod ve tasarim ekipleri ortak repository uzerinde calismali.`,
    views: 176,
    author: 'meliseditor',
    categories: ['web-gelistirme']
  },
  {
    title: 'Edge Computing ile Mikro Hizmetlerin Dagitim Stratejisi',
    slug: 'edge-computing-ile-mikro-hizmetlerin-dagitim-stratejisi',
    content: `Edge computing, kullaniciya yakin noktalarda veriyi isler.

Mikro hizmetleri edge node'lara tasirken versiyonlama, veri senkronu ve guvenlik politikalarini yeniden dusunmek gerekir.`,
    views: 210,
    author: 'selincloud',
    categories: ['bulut-teknolojileri', 'yazilim-trendleri']
  },
  {
    title: 'GraphQL API Tasariminda En Iyi Pratikler',
    slug: 'graphql-api-tasariminda-en-iyi-pratikler',
    content: `Schema tasariminda yalnizca ihtiyac duyulan alanlari expose edin.

Resolver katmanini moduler hale getirin ve veri kaynagi baglantilarini cache ile destekleyin.`,
    views: 233,
    author: 'aylindev',
    categories: ['web-gelistirme']
  },
  {
    title: 'Girisimlerde Teknik Borc Yoneticiligi',
    slug: 'girisimlerde-teknik-borc-yoneticiligi',
    content: `Hizli ilerleyen girisimlerde teknik borc kaciniImazdir ancak yonetilebilir.

  Sprint sonlarinda refactor oturumlari planlayin, borc listesini backlogda kategorize edin ve yatirimci iletisiminde teknik riskleri seffaf tutun.`,
    views: 172,
    author: 'denizadmin',
    categories: ['girisimcilik']
  },
  {
    title: 'Python ile ETL Surecleri Otomatize Etme',
    slug: 'python-ile-etl-surecleri-otomatize-etme',
    content: `Airflow ve Prefect gibi araclar ETL planlamasini kolaylastirir.

Veri kalitesini saglamak icin dagiticilar arasi veri dogrulama kurallari yazin ve hatali kayitlari bekletip manuel incelemeye yollayin.`,
    views: 289,
    author: 'mertdata',
    categories: ['veri-bilimi']
  },
  {
    title: 'SwiftUI ile iOS 18 Yenilikleri',
    slug: 'swiftui-ile-ios-18-yenilikleri',
    content: `SwiftUI ile gelen yeni layout protokolleri, adaptif arayuzleri daha kolay kurmanizi saglar.

  Observation framework, state yonetimini daha sade hale getiriyor. WidgetKit ile ortak bilesenleri paylasmak mumkun.`,
    views: 204,
    author: 'kaaneditor',
    categories: ['mobil-uygulamalar']
  },
  {
    title: 'Takim Ici Mentorluk Programi Olusturma',
    slug: 'takim-ici-mentorluk-programi-olusturma',
    content: `Mentorluk, deneyimli gelistiricilerin bilgi transferini hizlandirir.

Program icerisinde hedef belirleme, duzenli geribildirim ve uzmanlik oturumlarini dahil edin.`,
    views: 165,
    author: 'denizadmin',
    categories: ['girisimcilik', 'yazilim-trendleri']
  },
  {
    title: 'Yapay Zeka Destekli Kod Inceleme Sureci',
    slug: 'yapay-zeka-destekli-kod-inceleme-sureci',
    content: `AI tabanli kod inceleme araclari, statik analizle birlesince hatalari erken yakalar.

Ancak son karar yine ekibin deneyimli gelistiricilerine aittir. Araclar gorsel raporlar sunarak duzeltmeleri hizlandirir.`,
    views: 315,
    author: 'meliseditor',
    categories: ['yazilim-trendleri']
  },
  {
    title: 'Teknoloji Girisimlerinde Yatirim Sunumu Hazirlama',
    slug: 'teknoloji-girisimlerinde-yatirim-sunumu-hazirlama',
    content: `Yatirimcilar, urun-pazar uyumu kadar teknik kapasiteyi de inceler.

Sunum icin finansal tahminler, teknik yol haritasi ve ekip yetkinliklerini dengeleyen bir anlatim kurun.`,
    views: 221,
    author: 'denizadmin',
    categories: ['girisimcilik']
  }
];

async function main() {
  console.log('🌱 Turkce seed verisi yukleniyor...');

  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('📁 Kategoriler ekleniyor...');
  const createdCategories = await Promise.all(
    categoryData.map((category) => prisma.category.create({ data: category }))
  );
  const categoryMap = new Map(createdCategories.map((category) => [category.slug, category.id]));

  console.log('👥 Kullanici hesaplari olusturuluyor...');
  const hashedPassword = await bcryptjs.hash('Parola123!', 10);
  const createdUsers = await Promise.all(
    userData.map((user) =>
      prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
          status: 'ACTIVE',
          emailVerified: new Date()
        }
      })
    )
  );
  const userMap = new Map(createdUsers.map((user) => [user.username, user.id]));

  console.log('📝 Makaleler kaydediliyor...');
  await Promise.all(
    postData.map((post) =>
      prisma.post.create({
        data: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          published: true,
          viewCount: post.views,
          authorId: userMap.get(post.author)!,
          categories: {
            connect: post.categories
              .map((slug) => categoryMap.get(slug))
              .filter((id): id is string => Boolean(id))
              .map((id) => ({ id }))
          }
        }
      })
    )
  );

  console.log('✅ Turkce seed verisi basariyla eklendi!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Seed islemi sirasinda hata olustu:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
