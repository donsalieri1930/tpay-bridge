UPDATE tblarchiwumrozliczen
SET platnosc_dokonana = :paid
WHERE `Nr rachunku` = :invoice_id AND platnosc_dokonana != :paid;
