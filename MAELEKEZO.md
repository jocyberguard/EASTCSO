# Maelekezo ya Kuendesha Mfumo (Local Setup)

Mwongozo huu unaelekeza namna ya kuendesha mfumo huu kwenye kompyuta yako (locally) kwa kutumia XAMPP au WAMP.

## Hatua za Kufuata

1. **Washa XAMPP/WAMP Server**
   Fungua XAMPP Control Panel yako na uhakikishe umewasha (Start) huduma zifuatazo:
   - **Apache** (Inahitajika ili kusoma mafaili ya PHP)
   - **MySQL** (Inahitajika kwa ajili ya kanzidata/Database)

2. **Tumia Kivinjari (Browser)**
   **MUHIMU:** Usitumie kitufe cha "Go Live" (Live Server extension) kilichopo kwenye VS Code kwa sababu hakiwezi kusoma wala kutafsiri mafaili ya PHP. Badala yake, fungua kivinjari chako (Chrome, Firefox, Edge n.k.) na uandike anwani ifuatayo moja kwa moja:
   👉 `http://localhost/EASTCSO/index.html` (au `http://localhost/EASTCSO/`)

3. **Tengeneza Database (Kwa Mara ya Kwanza Tu)**
   Ili mfumo ufanye kazi vizuri na kuweza kuhifadhi taarifa, fungua anwani ifuatayo kwenye kivinjari chako. Hii itatengeneza *tables* zote na kuweka taarifa za kuanzia (default data) moja kwa moja:
   👉 `http://localhost/EASTCSO/backend/init.php`

---

## Changamoto Zinazoweza Kujitokeza na Utatuzi Wake

### 1. Kosa la "Backend Not Responding"
**Sababu:** Mara nyingi husababishwa na kutumia VS Code "Live Server" (ambayo inafungua anwani kama `http://127.0.0.1:5500`) badala ya kutumia Apache (`localhost`).
**Utatuzi:** Fuata Hatua ya 2 hapo juu na ufungue mfumo kupitia `http://localhost/...`.

### 2. Kosa la Kuunganisha Database (Database Connection Error)
**Sababu:** Huenda MySQL haijawashwa kwenye XAMPP, au taarifa za kuunganisha database zilizopo kwenye faili la `backend/config.php` sio sahihi.
**Utatuzi:**
- Hakikisha umewasha MySQL kwenye XAMPP Control Panel.
- Fungua faili la `backend/config.php` na uhakikishe taarifa zipo hivi (kama hujabadili password ya XAMPP):
  ```php
  $db_host = 'localhost';
  $db_name = 'eastc_db';
  $db_user = 'root';
  $db_pass = '';
  ```

### 3. Taarifa Hazionekani Kwenye Mfumo (Blank Data)
**Sababu:** Huenda hukutengeneza *tables* za database, au mfumo haujaweka taarifa zozote.
**Utatuzi:** Hakikisha unafuata Hatua ya 3 kwa kufungua faili la `init.php` kwenye browser ili mfumo ujiwekee taarifa zake za msingi.

### 4. Picha Kutokupanda (Image Upload Failing)
**Sababu:** Ruhusa ya kuandika kwenye folda (Folder Permissions) inaweza kuwa imezuiwa, au folda la kuhifadhi picha halipo.
**Utatuzi:** Hakikisha folda linaitwa `uploads` lipo ndani ya folda la `backend/` na lina ruhusa ya kuandika na kusoma.

---

## Taarifa za Kuingia Kwenye Mfumo (Admin Login Credentials)

Ili kuingia kwenye mfumo kama Msimamizi (Admin) na kuweza kubadilisha taarifa (kama vile kuongeza matukio, viongozi, matangazo, n.k.), tumia taarifa hizi ambazo zipo kwenye faili la `backend/config.php`:

- **Jina (Username):** `admin`
- **Nenosiri (Password):** `eastc2026`
