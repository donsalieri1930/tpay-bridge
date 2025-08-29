SELECT Rodzina, Dziecko, `Do zaplaty`, `Nr rachunku`, `Nota za`, R.EmailMamy, R.EmailTaty, R.ImieMamy, R.ImieTaty, platnosc_dokonana, R.NazwiskoMamy, R.NazwiskoTaty
FROM tblarchiwumrozliczen AS A
JOIN r_storodzina AS R ON A.`ID rodziny` = R.id
WHERE UUID= :uuid;