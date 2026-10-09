/* Bank soal bertingkat — KB3 & KB4 (KB1 & KB2 hanya materi + contoh, tanpa kuis) */
window.MTKQuestions = {
kb3:{
mudah:[
 {q:"Diketahui f(x)=x+3, g(x)=4x+5. (f∘g)(x) = …",choices:["4x+8","4x+17","3x+8","4x+5"],answer:0,discuss:"f(g)= (4x+5)+3 = 4x+8."},
 {q:"Dengan f,g yang sama, (g∘f)(x) = …",choices:["4x+8","4x+17","4x+5","x+8"],answer:1,discuss:"g(f)=4(x+3)+5=4x+17."},
 {q:"Diketahui f(x)=x+3, h(x)=3x−9. (f∘h)(x) = …",choices:["3x−6","3x","12x+6","3x−9"],answer:0,discuss:"(3x−9)+3=3x−6."},
 {q:"(h∘f)(x) untuk f,h di atas = …",choices:["3x−6","3x","3x+9","x"],answer:1,discuss:"h(f)=3(x+3)−9=3x."},
 {q:"(g∘h)(x) dengan g=4x+5, h=3x−9 adalah …",choices:["12x−31","12x+6","12x−4","7x−4"],answer:0,discuss:"4(3x−9)+5=12x−31."}
],
sedang:[
 {q:"(h∘g)(x) dengan g=4x+5, h=3x−9 adalah …",choices:["12x−31","12x+6","12x+15","12x−4"],answer:1,discuss:"3(4x+5)−9=12x+6."},
 {q:"Jika f(x)=2x+1, g(x)=x−4, maka (f∘g)(2) = …",choices:["−3","−5","1","5"],answer:0,discuss:"g(2)=−2; f(−2)=−3."},
 {q:"(f∘g∘h)(x) dengan f=x+3,g=4x+5,h=3x−9 adalah …",choices:["12x−28","12x−19","12x+15","12x+42"],answer:0,discuss:"f(g(h))=f(12x−31)=12x−28."},
 {q:"(g∘f∘h)(x) = g(f(h(x))) untuk kasus papan tulis = …",choices:["12x−28","12x−19","12x+15","12x+42"],answer:1,discuss:"f(h)=3x−6; g=4(3x−6)+5=12x−19."},
 {q:"Invers dari f(x)=x+3 adalah …",choices:["x−3","−x+3","3x","x/3"],answer:0,discuss:"y=x+3 → x=y−3 → f⁻¹=x−3."}
],
sulit:[
 {q:"(h∘f∘g)(x) = h(f(g(x))) untuk kasus papan tulis = …",choices:["12x+15","12x+42","12x−28","12x+6"],answer:0,discuss:"f(g)=4x+8; h=3(4x+8)−9=12x+15."},
 {q:"(h∘g∘f)(x) = h(g(f(x))) untuk kasus papan tulis = …",choices:["12x+42","12x+15","12x−28","4x+17"],answer:0,discuss:"g(f)=4x+17; h=3(4x+17)−9=12x+42."},
 {q:"Invers dari g(x)=4x+5 adalah …",choices:["(x−5)/4","(x+5)/4","4x−5","x/4−5"],answer:0,discuss:"y=4x+5 → x=(y−5)/4."},
 {q:"Jika (f∘g)(x)=4x+8 dan f(x)=x+3, maka g(x)=…",type:"isian",answer:"4x+5",discuss:"f(g)=g+3=4x+8 → g=4x+5."},
 {q:"Jika h(x)=3x−9, nilai h⁻¹(0) = …",type:"isian",answer:"3",discuss:"h⁻¹=(x+9)/3; (0+9)/3=3."}
]},
kb4:{
mudah:[
 {q:"Program linear berkaitan dengan …",choices:["optimasi dengan pertidaksamaan linear","lingkaran","fungsi kuadrat","peluang"],answer:0,discuss:"Maksimum/minimum dengan kendala linear."},
 {q:"Daerah himpunan penyelesaian dari x≥0, y≥0 terletak di kuadran …",choices:["I","II","III","IV"],answer:0,discuss:"x,y non-negatif = kuadran I."},
 {q:"Garis 2x+y=6 memotong sumbu-X di …",choices:["(3,0)","(0,6)","(6,0)","(0,3)"],answer:0,discuss:"y=0 → x=3."},
 {q:"Bentuk umum kendala program linear 2 variabel …",choices:["ax+by≤c","ax²+by≤c","aˣ+bˣ≤c","ax+by=c²"],answer:0,discuss:"Linear, pangkat 1."},
 {q:"Titik (0,0) terhadap garis x+y=4 berada di daerah …",choices:["0+0<4 (memenuhi ≤)","tidak memenuhi","tepat pada garis","tak tentu"],answer:0,discuss:"0<4 benar."}
],
sedang:[
 {q:"Nilai maksimum z=3x+2y di titik (0,0),(4,0),(0,3) adalah …",choices:["12","6","10","8"],answer:0,discuss:"(4,0):12; (0,3):6 → maks 12."},
 {q:"DHP dari x+y≤4, x≥0, y≥0 memiliki titik sudut …",choices:["(0,0),(4,0),(0,4)","(4,4) saja","(2,2) saja","tak hingga sudut"],answer:0,discuss:"Segitiga dengan 3 titik sudut."},
 {q:"Model: x+y≤10, 2x+y≤14. Titik potong kedua garis …",choices:["(4,6)","(5,5)","(7,0)","(0,10)"],answer:0,discuss:"Kurangkan: x=4 → y=6."},
 {q:"Nilai minimum z=x+3y pada (0,0),(4,0),(0,4) adalah …",choices:["0","4","12","16"],answer:0,discuss:"Di (0,0)=0 terkecil."},
 {q:"Jika z=2x+5y, z pada titik (2,3) = …",type:"isian",answer:"19",discuss:"4+15=19."}
],
sulit:[
 {q:"Maksimum z=5x+4y dengan x+y≤8, x+2y≤10, x,y≥0. Titik optimum …",choices:["(6,2) → 38","(8,0) → 40","(0,5) → 20","(4,4) → 36"],answer:1,discuss:"Cek: (8,0) memenuhi (8≤8, 8≤10) z=40; (6,2) z=38; jadi maks di (8,0)=40."},
 {q:"Nilai optimum selalu terletak di …",choices:["titik sudut DHP","tengah DHP","sembarang titik","di luar DHP"],answer:0,discuss:"Teorema titik ekstrim."},
 {q:"Keuntungan maks: 3x+5y, x+y≤6, x≥1, y≥1. Optimum di …",choices:["(1,5)→28","(5,1)→20","(3,3)→24","(1,1)→8"],answer:0,discuss:"3+25=28 terbesar."},
 {q:"Garis selidik z=2x+y. Gradien garis selidik …",type:"isian",answer:"-2",discuss:"y=−2x+z → m=−2."},
 {q:"DHP kosong jika kendala …",choices:["x≥5 dan x≤2","x+y≤10","x≥0","y≥0"],answer:0,discuss:"Bertentangan."}
]}
};
