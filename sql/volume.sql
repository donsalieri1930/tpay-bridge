-- Paid invoice value for the public payment-volume badge.
SELECT COALESCE(SUM(`Do zaplaty`), 0)
FROM tblarchiwumrozliczen
WHERE platnosc_dokonana = 1
  AND `Nota za` >= :start_month;
