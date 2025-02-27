Aşağıda, belirtilen dosyalardan yalnızca RPC sorgusu yapan fonksiyonları listeledim:

### Arena Dizinindeki RPC Sorguları
1. **`BattleLog.tsx`**
   - **Fonksiyon:** `loadBattles`
     - **Açıklama:** Son savaşları kontrat üzerinden okur.
     - **Kullanım:** 

2. **`ForgeGladiator.tsx`**
   - **Fonksiyonlar:**
     - **`fetchGladiatorData`**
       - **Açıklama:** Gladyatör bilgilerini getirir.
       - **Kullanım:** 
     - **`checkIsGladiator`**
       - **Açıklama:** Kullanıcının gladyatör olup olmadığını kontrol eder.
       - **Kullanım:** 
     - **`checkGonadBalance`**
       - **Açıklama:** Kullanıcının GONAD bakiyesini kontrol eder.
       - **Kullanım:** 
     - **`checkAllowance`**
       - **Açıklama:** Kullanıcının GONAD için izin durumunu kontrol eder.
       - **Kullanım:** 
     - **`checkEarnings`**
       - **Açıklama:** Kullanıcının toplam kazancını kontrol eder.
       - **Kullanım:** 

3. **`BattleArena.tsx`**
   - **Fonksiyonlar:**
     - **`checkAllowance`**
       - **Açıklama:** Kullanıcının izin durumunu kontrol eder.
       - **Kullanım:** 
     - **`useReadContract`**
       - **Açıklama:** Oyuncunun gladyatörünü ve rakip gladyatörünü okur.
       - **Kullanım:** 

4. **`BattleResultModal.tsx`**
   - **Fonksiyonlar:**
     - **`useReadContract`**
       - **Açıklama:** Kazanan ve kaybeden gladyatör bilgilerini okur.
       - **Kullanım:** 

5. **`SocialFeatures.tsx`**
   - **Fonksiyonlar:**
     - **`fetchFlexStatus`**
       - **Açıklama:** Kullanıcının flex durumunu kontrol eder.
       - **Kullanım:** 

6. **`Airdrop.tsx`**
   - **Fonksiyonlar:**
     - **`fetchAirdropInfo`**
       - **Açıklama:** Airdrop bilgilerini getirir.
       - **Kullanım:** 

7. **`Presale.tsx`**
   - **Fonksiyonlar:**
     - **`fetchPresaleInfo`**
       - **Açıklama:** Presale bilgilerini getirir.
       - **Kullanım:** 

8. **`GladiatorContext.tsx`**
   - **Fonksiyonlar:**
     - **`fetchGladiators`**
       - **Açıklama:** Tüm gladyatör adreslerini alır ve her biri için verileri getirir.
       - **Kullanım:** 

9. **`SocialFeedContext.tsx`**
   - **Fonksiyonlar:**
     - **`extractEventData`**
       - **Açıklama:** Log verilerini decode eder.
       - **Kullanım:** 

10. **`TokenContext.tsx`**
    - **Fonksiyonlar:**
      - **`fetchBalance`**
        - **Açıklama:** Kullanıcının token bakiyesini kontrol eder.
        - **Kullanım:** 

11. **`useGladiatorImages.ts`**
    - **Fonksiyonlar:**
      - **`setGladiatorImage`**
        - **Açıklama:** Gladyatör imajını ayarlar ve API'ye gönderir.
        - **Kullanım:** 

Bu liste, yalnızca RPC sorgusu yapan fonksiyonları içermektedir. Eğer daha fazla bilgiye ihtiyaç duyarsanız, belirtebilirsiniz.
