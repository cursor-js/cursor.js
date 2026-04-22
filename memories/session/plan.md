## Plan: Theme Plugin Implementation

Bu plan, `ThemePlugin` adlı yeni bir eklenti aracılığıyla cursor (.cursor, pointer, text vb.) durumlarının otomatik algılanması ve SVG/Hotspot (merkez vs. sol-üst) ayarlamalarının yapılmasını hedeflenmektedir.

**Steps**

1. **Branch Oluşturma**: `git-flow-branch-creator` aracı kullanılarak `feature/theme-plugin` dallanması yapılır.
2. **Theme Plugin Core Geliştirimi**:
   - `packages/core/src/plugins/ThemePlugin.ts` dosyası oluşturulacak.
   - **ThemePack ve Animasyon Mimarisi**: `ThemePlugin` dışarıdan aldığı temayı render ederken animasyon desteği sunabilmek için Data Attribute'ler ve Lifecycle fonksiyonları hibrit kullanılacak.
     - `ThemePack` içindeki her bir imleç (`default`, `pointer` vb.) için `html` (SVG string) ve opsiyonel `onStateChange?(element: HTMLElement, state: Record<string, any>)` fonksiyonu sağlanabilecek.
     - CSS-bazlı basit animasyonlar için `ThemePlugin` otomatik olarak `Cursor`'ın mevcut state'ini wrapper'a attribute olarak ekleyecek (örn. `<div data-cursor-state-hover="true" data-cursor-state-pressing="true">`). Bu sayede tema yazarının sadece CSS `transition` özellikleri kullanması yetecek. Bütün karmaşık animasyonlar ise `onStateChange` parametresindeki DOM manipülasyonu ile çözülebilecek.
   - Kütüphane, ücretsiz ve standart kullanım için `defaultTheme` adında varsayılan bir imleç paketini export edecek (`default`, `pointer` ve `text` SVG'lerini barındıran obje).
   - Eklenti içi state yönetimi için, diğer eklentilerle tutarlı olması adına `theme: { cursor: 'text' | 'pointer' | 'default' }` isim uzayı (namespace) kullanılacak.
   - Hotspot yönetimi için, wrapper `<div class="cursor-svg-wrapper">` kullanılarak, origin ofsetlemesi yapılacak.
   - `onMove` veya plugin state dinlenerek `document.elementFromPoint` üzerinden element cursor'ı CSS referansı (getComputedStyle) veya tag referansı ile hesaplanacak. (_depends on step 2_)
3. **GhostCursor Uyumluluğu (Minimal Fallback)**:
   - `GhostCursor`'ın içerisindeki mevcut karmaşık Windows-benzeri default SVG kaldırılacak.
   - Yerine `ThemePlugin` yüklü olmadığında görünecek çok basit, 16px çapında yarı saydam bir nokta (örn. 16x16px `border-radius: 50%`, `background: rgba(0,0,0,0.5)`) eklenecek.
   - `ThemePlugin` dahil edildiğinde bu basit noktayı hazırladığı SVG wrapper ile override edecek. (_parallel with step 2_)
4. **Test Yazımı (TDD yaklaşımı)**:
   - `packages/core/src/plugins/ThemePlugin.test.ts` ile `elementFromPoint` mock'lanıp, text input'a gelindiğinde SVG'nin `text` cursor için hotspot ile değiştiği doğrulanacak.
   - `pnpm test` kullanılarak tüm unit testler yeşil olana kadar devam edilecek.
5. **Docs/Demo Güncellemeleri**:
   - `apps/docs/src/components/app/PluginDemos.tsx` içerisine yeni `ThemeDemo` eklenecek. Ancak bu kütüphanenin temel (core) bir gereksinimi gibi konumlandırıldığı için demo içindeki "Enable" butonu/switch'i **disabled (tıklanamaz) ve varsayılan olarak seçili (checked)** şekilde gösterilecek. Böylece kullanıcılara işlevin hep devrede olduğu ve temel bir görsel motor özelliği olduğu vurgulanacak.
   - Ana `ClientPage` ortamı da varsa yeni temadan faydalanacak.
6. **Kullanıcı Onayı**:
   - TDD işlemleri bitince, değişiklikler kullanıcıya `vscode_askQuestions` üzerinden sunulacak ("Do you approve...?"). Onay verilmezse (No) beklenilecek.
7. **Versioning ve Pull Request**:
   - Değişiklikler manuel markdown changesets ile versiyonlanacak (`patch` veya `minor`).
   - `git add .`, commit mesajı analizi (`git-commit`), Git Push ve Github PR oluşturma adımları sırasıyla yapılacak.

**Relevant files**

- `packages/core/src/plugins/ThemePlugin.ts` — Yeni plugin sınıfı ve auto cursor hesaplama mantığı (getComputedStyle kontrolü vb.).
- `packages/core/src/plugins/ThemePlugin.test.ts` — Unit testler (mocklanmış layout ile form elemanları testleri).
- `packages/core/src/plugins/index.ts` — Plugin'i dışarı aktaracak (export).
- `apps/docs/src/components/app/PluginDemos.tsx` — Görsel testler ve web dokümantasyon entegrasyonu için.

**Verification**

1. Test command `pnpm test` çalıştırılıp `ThemePlugin` unit testlerinin başarıyla geçtiği izlenir.
2. UI üzerinde bir local built demo sunucusu (`pnpm dev` in args: docs) kaldırılarak text input üzerinde I-beam (hotspot center), dışarıda arrow pointer çıktığı elle teyit edilir.

**Decisions**

- Performans için `document.elementFromPoint` onMove esnasında her frame çalışacak. Vanilla DOM'da bu çok ağır olmasa da lastElement cache'i kullanılarak computedStyle okunma maliyeti izole edilecek.
- Hotspot yönetimi, `GhostCursor` koordinatlarını direkt değiştirmek yerine CSS Transform içerisinde bir alt wrapper kullanarak çözülecek, böylece API uyumluluğu kırılmamış olacak.

**Further Considerations**

1. Varsayılan SVG'lerin dizaynı hakkında - Basit beyaz-siyah renkli klasik Windows XP/CSS default imleç setini implement etmem uygun mudur?
2. `auto: true` varsayılan olarak açık olmalı mı?
