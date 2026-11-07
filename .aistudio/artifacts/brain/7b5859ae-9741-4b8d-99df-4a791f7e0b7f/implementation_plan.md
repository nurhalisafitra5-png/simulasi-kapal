# Simulasi Maritim 3D & Augmented Reality: Teorema Sudut Lingkaran

Transformasi simulasi radar maritim 2D menjadi lingkungan 3D Three.js fotorealistik dan pengalaman Augmented Reality (AR) interaktif untuk memvisualisasikan serta membuktikan Teorema Sudut Pusat dan Sudut Keliling Lingkaran secara nyata di dunia nyata maupun di perairan 3D.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan klarifikasi pada Tahap 1, spesifikasi berikut telah disepakati dan menjadi acuan utama pengembangan:

- **Confirmed Decision 1: Pendekatan Augmented Reality (AR)**: Dual-mode AR menggunakan **WebXR Device API** untuk perangkat yang mendukung penempatan bidang AR di meja/lantai nyata (Hit-Test AR Session), dilengkapi **Universal Camera & Gyroscope Fallback** (akses streaming kamera belakang perangkat dengan orientasi sensor kompas gerak) agar dapat dinikmati di laptop, ponsel Android, iPhone, dan tablet tanpa kendala kompatibilitas.
- **Confirmed Decision 2: Gaya Visual & Lingkungan 3D**: Samudera 3D fotorealistik lengkap dengan simulasi gelombang laut dinamis (prosedural vertex displacement), siklus waktu pencahayaan (Siang Terang, Senja Emas, dan Malam Radar Taktis), efek kabut cakrawala laut (horizon fog), serta model 3D prosedural multi-bagian (Menara Radar Stasiun O di pulau karang, Pelampung suar A & B dengan lentera kelap-kelip, dan Kapal Patroli P berlantai kontainer).
- **Confirmed Decision 3: Interaksi & Sudut Pandang Kamera**: Sistem multi-kamera terpadu (Kamera Orbit Bebas 3D, Kamera Dek Kapal Patroli P sudut pandang pertama, Kamera Observasi Menara Radar O, dan Tampilan Taktis Atas 2D/2.5D), dilengkapi mode **Kuis Interaktif Teorema Sudut** dengan tantangan sudut acak dan penilaian instan.
- **Confirmed Decision 4: Kontrol Ergonomis Zero-Occlusion**: Seluruh instrumen kontrol ditempatkan pada dok bawah kompak (*collapsible bottom dock*) dengan tombol *Zen Mode* untuk menyembunyikan HUD agar tampilan 3D dan AR bebas halangan 100%.

---

### 1. Overview & Core Concept

- **What It Does**: Aplikasi ini menghadirkan laboratorium matematika maritim 3D dan AR interaktif. Pengguna memanipulasi posisi Kapal Pengawas $P$ serta Pelampung Target $A$ dan $B$ di atas lingkaran perairan. Sistem secara real-time menghitung dan memproyeksikan sinar pancaran radar ($\angle AOB$, Sudut Pusat) dan sudut optik pandang kapal ($\angle APB$, Sudut Keliling), membuktikan secara visual dan matematis bahwa $\angle APB = \frac{1}{2} \angle AOB$ pada busur yang sama di sudut mana pun kapal berada.
- **Target Audience / Persona**: Siswa SMP/SMA, mahasiswa, guru matematika, instruktur maritim, dan pecinta visualisasi sains interaktif yang memerlukan pemahaman intuitif terhadap konsep geometri sudut lingkaran melalui konteks navigasi maritim nyata.
- **Key Value**: Mengubah rumus abstrak geometri menjadi pengalaman spasial yang dapat diraba, dilihat dari dek kapal, diamati dari puncak mercusuar radar, atau diproyeksikan langsung ke meja belajar melalui kamera ponsel AR.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Eksplorasi Spasial 3D**:
   - Pengguna membuka aplikasi langsung ke pemandangan samudera 3D luas dengan gelombang air laut berkilau, pulau radar di tengah, dua pelampung menyala, dan kapal patroli di tepi lingkaran.
   - Pengguna dapat memutar, memperbesar (*zoom*), atau menggeser sudut pandang bebas dengan mouse/touch.
   - Menggeser Kapal $P$ atau Pelampung $A/B$ langsung di air 3D (via 3D raycasting drag) atau menggunakan slider derajat presisi di dok bawah. Sudut $\angle AOB$ dan $\angle APB$ diperbarui seketika dengan berkas sinar laser dan busur derajat 3D.
2. **Pergantian Sudut Pandang Kamera**:
   - **Orbit Bebas**: Mengamati geometri lingkaran keseluruhan dari berbagai sudut elevasi.
   - **Dek Kapal P**: Kamera berada di anjungan kapal melihat langsung ke arah Pelampung A dan Pelampung B (melihat sudut $\alpha$ terbentuk di depan mata).
   - **Menara Radar O**: Sudut pandang ketinggian menara radar memindai kedua pelampung (melihat sudut $2\alpha$).
   - **Taktis 2D/2.5D Top-Down**: Tampilan peta radar ortogonal untuk analisis geometri murni.
3. **Pengalaman Augmented Reality (AR)**:
   - Pengguna menekan tombol "Aktifkan AR" di dok kontrol.
   - Jika perangkat mendukung WebXR AR: Kamera terbuka, mendeteksi permukaan meja/lantai dengan reticle penargetan, dan menempatkan seluruh miniatur stasiun radar laut 3D secara stabil.
   - Jika menggunakan browser standar/desktop: Mode Passthrough Kamera aktif dengan overlay kompas giroskopik, memproyeksikan radar di depan pandangan kamera pengguna.
   - Pengguna dapat berjalan mengitari miniatur radar di meja fisik untuk memeriksa sudut dari berbagai sisi.
4. **Mode Kuis & Tantangan Teorema**:
   - Membuka modul kuis tantangan interaktif. Radar memberikan misi: "Arahkan Kapal P sehingga sudut pandang $\angle APB = 35^\circ$ ketika sudut radar pusat adalah $70^\circ$!" atau pertanyaan pilihan ganda dengan verifikasi visual instan.

#### Visual Identity & Theme
- **Aesthetic Direction**: *Maritime Deep-Tech & Clean Scientific Instrument*. Nuansa pusat komando navigasi maritim modern yang elegan, tanpa elemen "slop" AI, tanpa tombol ungu klise, dan tanpa indikator berkedip dekoratif palsu.
- **Color Palette & Atmosphere**:
  - *Dominant Canvas (60%)*: Samudera biru tua `#030A16` hingga `#0A1C36` dengan pencahayaan PBR dan pantulan air laut.
  - *Structural Surfaces (30%)*: Panel dok gelap solid bertekstur arang laut `#0B1324` dengan garis batas halus (`border-slate-800`).
  - *Focal Accents (10%)*:
    - **Sudut Pusat Radar $\angle AOB$**: Oranye hangat nautika (`#F97316` / `#F59E0B`), mewakili suar pemancar stasiun pusat.
    - **Sudut Keliling Kapal $\angle APB$**: Cyan elektrik laut (`#06B6D4` / `#22D3EE`), mewakili garis bidik optik kapal.
    - **Busur Terpotong (Arc AB)**: Gradasi hijau zamrud laut (`#10B981`) di tepi lingkaran.
- **Typography & Hierarchy**:
  - Judul & Header: **Plus Jakarta Sans** (SemiBold & Bold), modern dan tegas.
  - Nilai Derajat & Bukti Rumus: **JetBrains Mono** dengan `tabular-nums` untuk perataan angka matematis yang akurat.
  - Teks Penjelasan & Narasi: **DM Sans** (Regular 400 & Medium 500) dengan kontras keterbacaan tinggi.
- **Component Styling & Layout**:
  - **Zero Viewport Occlusion**: Viewport 3D/AR mengisi 100% layar (`100vw x 100vh`).
  - **Collapsible Bottom Dock**: Seluruh kontrol posisi kapal, pelampung, waktu pencahayaan, mode kamera, tombol AR, dan kuis disatukan dalam satu dok horizontal rapi di bagian bawah layar dengan tombol sembunyikan/tampilkan (*Zen Mode*).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Path Augmented Reality (WebXR + Camera Video Stream & DeviceOrientation Fallback)**
  - *Chosen Approach*: Membangun arsitektur AR adaptif: memeriksa ketersediaan `navigator.xr?.isSessionSupported('immersive-ar')`. Bila didukung, jalankan WebXR session dengan Three.js WebXR Manager dan reticle penempatan bidang. Bila tidak didukung (atau di browser desktop/iOS Chrome), aktifkan mode Camera Passthrough menggunakan `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` yang merender feed kamera di balik canvas 3D transparan dengan orientasi kontrol sensor gerak.
  - *Why*: Memastikan fitur AR dapat diakses oleh 100% pengguna di berbagai jenis perangkat tanpa kegagalan layar hitam.
  - *Alternatives Considered*: Hanya WebXR murni akan mengecualikan sebagian besar browser desktop dan iOS Safari standar tanpa flag khusus.
- **Decision 2: Pemodelan 3D Prosedural Berstandar Tinggi (Composite 3–12 Part Models & Zero External 404s)**
  - *Chosen Approach*: Merakit Kapal Patroli P, Menara Radar O, dan Pelampung A/B dari gabungan geometri prosedural (`ExtrudeGeometry` lambung kapal, kabin berteras, cerobong, tumpukan kontainer, tiang kisi antena menara, piringan radar berputar, pelampung kerucut berlampu fresnel) dengan material `MeshStandardMaterial` / `MeshPhysicalMaterial`. Semua tekstur dibuat via HTML5 2D Canvas procedurally.
  - *Why*: Menghindari ketergantungan file `.glb` eksternal yang rentan 404 atau CORS di lingkungan sandbox, dengan waktu muat instan dan performa 60 FPS tinggi.
- **Decision 3: Water Shaders & Efek Gelombang Laut Dinamis**
  - *Chosen Approach*: Membuat permukaan samudera dengan mesh bidang berdensitas teratur (`PlaneGeometry`) yang diberi animasi perpindahan gelombang sinus/gerstner ganda, serta shader material dengan kedalaman warna air laut, specular highlight matahari/bulan, dan busa pantai di sekitar pulau.
  - *Why*: Memberikan kesan realistis bahwa objek maritim benar-benar mengapung di lautan bebas, dengan goyangan alami (*buoyancy bobbing*) pada kapal dan pelampung.
- **Decision 4: Sistem Raycasting Drag 3D Langsung**
  - *Chosen Approach*: Pengguna dapat mengklik dan menarik langsung Pelampung A, Pelampung B, atau Kapal P di atas permukaan air 3D menggunakan raycaster Three.js yang diproyeksikan ke bidang horizontal lingkaran, di samping slider numerik di panel kontrol.

---

### 4. Technical Architecture & Data Strategy

#### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REACT APPLICATION ROOT (App.tsx)                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │                                                             │
        ▼                                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     THREE.JS 3D / AR STAGE    │             │       DOM HUD & CONTROLS      │
│     (CanvasMountRef Container)│             │      (Zero-Occlusion Dock)    │
├───────────────────────────────┤             ├───────────────────────────────┤
│ • WebGLRenderer / XR Manager  │             │ • Top Header (Ringkas & Judul)│
│ • PBR Studio Environment      │◄───────────►│ • Real-time Stats Card (2α/α) │
│ • OceanWaterPlane (Waves)     │  Shared     │ • Camera Switcher (4 Mode)    │
│ • RadarIsland & Tower (O)     │  Geometry   │ • Collapsible Controls Dock   │
│ • Buoy A & Buoy B Groups      │  State      │ • AR Toggle (WebXR / Camera)  │
│ • PatrolShip P (Multi-part)   │             │ • Quiz & Math Verification    │
│ • Raycaster Drag Interactor   │             │ • Lighting Time-of-Day Mode   │
│ • 3D Angle Arcs & Light Beams │             └───────────────────────────────┘
└───────────────┬───────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    AR PIPELINE CONTROLLER                   │
├─────────────────────────────────────────────────────────────┤
│ • WebXR 'immersive-ar' Session (Surface Hit-Test & Anchor)  │
│ • Fallback Video Capture (Webcam / Back-facing Device Cam)  │
│ • DeviceOrientation / Gyroscope Motion Camera Tracker       │
└─────────────────────────────────────────────────────────────┘
```

#### Data Model & Math Logic
```typescript
interface SimulationAngles {
  angleA: number;     // Radian posisi Pelampung A pada perimeter [0, 2π)
  angleB: number;     // Radian posisi Pelampung B pada perimeter [0, 2π)
  angleP: number;     // Radian posisi Kapal P pada perimeter [0, 2π)
  centralAngleDeg: number;    // ∠AOB = 2α (derajat)
  inscribedAngleDeg: number;  // ∠APB = α (derajat)
}

interface CameraPreset {
  id: 'orbit' | 'ship' | 'tower' | 'tactical';
  name: string;
  fov: number;
  position: [number, number, number];
  target: [number, number, number];
}

interface QuizQuestion {
  id: number;
  type: 'adjust_target' | 'calculate';
  prompt: string;
  targetAngleA: number;
  targetAngleB: number;
  expectedAngleP?: number;
  targetDegrees?: number;
  explanation: string;
}
```

#### Rumus Matematika Inti
1. **Posisi 3D Titik pada Lingkaran**:
   - $X = R \cdot \cos(\theta)$
   - $Z = R \cdot \sin(\theta)$
   - $Y = \text{WaveHeight}(X, Z, t)$ (efek terapung)
2. **Sudut Pusat ($\angle AOB$)**:
   - $\Delta \theta = |\theta_B - \theta_A|$
   - Jika $\Delta \theta > \pi$, maka $\Delta \theta = 2\pi - \Delta \theta$
   - $\angle AOB = \Delta \theta \times \frac{180}{\pi}$
3. **Sudut Keliling ($\angle APB$)**:
   - Berdasarkan Teorema Sudut Lingkaran yang menghadap busur yang sama:
   - $\angle APB = \frac{1}{2} \angle AOB$
   - Terverifikasi mutlak di semua posisi $P$ pada busur mayor/minor yang bersesuaian.

---

### Implementation Phasing & Work Items

1. **Dependensi**: Memasang paket `three` dan `@types/three` untuk rendering 3D WebGL dan WebXR.
2. **Procedural 3D Asset Modules**:
   - `src/three/models/PatrolShip.ts`: Model kapal patroli 3D (lambung, kabin komando, radar mast, kontainer warna-warni, wake trail air).
   - `src/three/models/RadarStation.ts`: Pulau karang dasar, menara radar berkisi, lampu suar, piringan radar berputar.
   - `src/three/models/Buoy.ts`: Pelampung maritim silinder-kerucut dengan cincin apung dan lampu navigasi merah/hijau.
   - `src/three/environment/OceanWater.ts`: Permukaan samudera 3D animasi ombak dengan material reflektif.
   - `src/three/geometry/AngleVisualization.ts`: Garis berkas laser 3D (O ke A/B, P ke A/B) dan busur derajat 3D melayang.
3. **AR & Motion Controller**:
   - `src/three/ar/ARManager.ts`: Menangani inisialisasi WebXR `immersive-ar`, reticle hit-test, serta fallback kamera video + orientasi perangkat.
4. **Interactive HUD & UI**:
   - `src/components/NavigationHeader.tsx`: Header satu baris elegan dengan status mode.
   - `src/components/MathVerificationHUD.tsx`: Kartu sudut real-time dengan bukti rumus interaktif $\angle APB = \frac{1}{2} \angle AOB$.
   - `src/components/ControlsDock.tsx`: Dok kontrol bawah yang dapat diciutkan (*collapsible*), dengan slider posisi, pilihan waktu (Siang/Senja/Malam), pilihan kamera, tombol AR, dan akses kuis.
   - `src/components/QuizModal.tsx`: Dialog kuis edukatif interaktif dengan tantangan sudut dan umpan balik langsung.
5. **Kompilasi & Verifikasi**: Memastikan build TypeScript, linting, dan responsivitas layar bebas error.
