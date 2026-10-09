/* Uji unit MTKStore (jalankan: node tools/test-store.js) */
let pass = 0,
  fail = 0;
function ok(cond, msg) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.log("  GAGAL:", msg);
  }
}

function stubStorage(seed) {
  const data = Object.assign({}, seed);
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
    _data: data,
  };
}
function freshStore(storage) {
  global.localStorage = storage;
  delete require.cache[require.resolve("../js/store.js")];
  return require("../js/store.js");
}

/* 1) Toko baru: nilai default */
let S = freshStore(stubStorage());
ok(S.storageOK() === true, "storageOK harus true");
ok(S.profile().nama === "Siswa Kelas X", "nama default");
ok(S.profile().kelas === "X", "kelas default");
ok(S.best("kb3", "mudah") === null, "best awal null");
ok(S.attempts("kb3", "mudah") === 0, "attempts awal 0");
ok(S.materi("kb1").visited === null, "materi awal belum dikunjungi");
let sum = S.summary();
ok(
  sum.quizLevelsDone === 0 && sum.totalBest === 0 && sum.progress === 0,
  "ringkasan awal nol",
);
ok(sum.materiOpened === 0 && sum.materiTotal === 4, "materiOpened 0 dari 4");

/* 2) recordQuiz: percobaan pertama */
let r = S.recordQuiz("kb3", "mudah", 80);
ok(
  r.best === 80 && r.improved === true && r.attempts === 1 && r.saved === true,
  "percobaan 1: best 80, attempts 1",
);
ok(S.best("kb3", "mudah") === 80, "best tersimpan 80");

/* 3) recordQuiz: skor lebih rendah → best bertahan */
r = S.recordQuiz("kb3", "mudah", 40);
ok(
  r.best === 80 && r.improved === false && r.attempts === 2,
  "percobaan 2: best tetap 80, attempts 2",
);

/* 4) recordQuiz: skor lebih tinggi → best naik */
r = S.recordQuiz("kb3", "mudah", 100);
ok(
  r.best === 100 && r.improved === true && r.attempts === 3,
  "percobaan 3: best naik 100",
);

/* 5) Logika buka kunci: sedang terbuka jika best mudah >= 60 */
ok(S.best("kb3", "mudah") >= 60, "best mudah >= 60 → sedang terbuka");
ok(S.best("kb3", "sedang") === null, "best sedang masih null → sulit terkunci");

/* 6) materi */
S.markMateri("kb1");
S.markMateri("kb1");
S.markMateri("kb2");
ok(S.materi("kb1").opens === 2 && !!S.materi("kb1").visited, "kb1 dibuka 2x");
ok(S.materiOpenedCount() === 2, "2 materi tercatat dibuka");
ok(S.markMateri("kb9") === false, "kb di luar daftar ditolak");

/* 7) summary setelah aktivitas */
sum = S.summary();
ok(sum.quizLevelsDone === 1 && sum.totalLevels === 6, "1 dari 6 level kuis");
ok(
  sum.totalBest === 100 && sum.progress === Math.round(100 / 6),
  "totalBest 100, progress ~17%",
);
ok(sum.perKB.kb3.avg === 100 && sum.perKB.kb3.done === 1, "perKB kb3 avg 100");
ok(
  sum.perKB.kb1.visited === true && sum.perKB.kb2.visited === true,
  "kb1 & kb2 visited",
);
ok(sum.perKB.kb4.visited === false, "kb4 belum visited");

/* 8) Persistensi antar sesi (storage sama, modul dimuat ulang) */
S = freshStore(global.localStorage);
ok(
  S.best("kb3", "mudah") === 100 && S.attempts("kb3", "mudah") === 3,
  "data bertahan antar sesi",
);
ok(S.profile().nama === "Siswa Kelas X", "profil bertahan");

/* 9) Profil */
S.setProfile({ nama: "Vin Rumere", kelas: "X-1" });
ok(S.initials("Vin Rumere") === "VR", "inisial VR");
ok(
  S.profile().nama === "Vin Rumere" && S.profile().kelas === "X-1",
  "profil tersimpan",
);
S.setProfile({ nama: "   ", kelas: "" });
ok(
  S.profile().nama === "Siswa Kelas X" && S.profile().kelas === "X",
  "input kosong → fallback default",
);
ok(S.initials("") === "S", "inisial kosong → S");

/* 10) Reset skor: quiz & materi kosong, profil bertahan */
S.setProfile({ nama: "Vin Rumere", kelas: "X-1" });
ok(S.resetScores() === true, "resetScores sukses");
ok(
  S.best("kb3", "mudah") === null && S.attempts("kb3", "mudah") === 0,
  "skor terhapus",
);
ok(S.materi("kb1").visited === null, "aktivitas materi terhapus");
ok(S.profile().nama === "Vin Rumere", "profil tetap");

/* 11) Migrasi kunci lama mtk_* */
const legacy = stubStorage({
  mtk_kb3_mudah: "70",
  mtk_kb3_sedang: "60",
  mtk_kb4_mudah: "55",
});
S = freshStore(legacy);
ok(S.best("kb3", "mudah") === 70, "migrasi kb3 mudah 70");
ok(S.best("kb3", "sedang") === 60, "migrasi kb3 sedang 60");
ok(S.best("kb4", "mudah") === 55, "migrasi kb4 mudah 55");
ok(legacy._data["mtk_kb3_mudah"] === undefined, "kunci lama dihapus");
ok(legacy._data["mathlab_db_v1"] !== undefined, "skema baru ditulis");

/* 12) Ekspor / Impor */
S = freshStore(stubStorage());
S.recordQuiz("kb3", "mudah", 90);
S.setProfile({ nama: "Budi", kelas: "XI" });
const json = S.exportJSON();
S = freshStore(stubStorage());
ok(S.importJSON(json) === true, "impor JSON valid");
ok(
  S.best("kb3", "mudah") === 90 &&
    S.profile().nama === "Budi" &&
    S.profile().kelas === "XI",
  "data pulih utuh",
);
ok(S.importJSON("{rusak") === false, "JSON rusak ditolak");
ok(S.importJSON('{"halo":1}') === false, "JSON tanpa profil ditolak");

/* 13) localStorage rusak → mode aman */
const broken = {
  getItem: () => {
    throw new Error("x");
  },
  setItem: () => {
    throw new Error("x");
  },
  removeItem: () => {
    throw new Error("x");
  },
};
S = freshStore(broken);
ok(S.storageOK() === false, "storageOK false saat rusak");
ok(
  S.recordQuiz("kb3", "mudah", 50).saved === false,
  "recordQuiz tandai gagal simpan",
);
ok(S.profile().nama === "Siswa Kelas X", "profil default saat rusak");

console.log("\nHasil: " + pass + " lulus, " + fail + " gagal");
process.exit(fail ? 1 : 0);
