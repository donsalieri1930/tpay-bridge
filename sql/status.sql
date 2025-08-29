UPDATE tblarchiwumrozliczen
SET
    platnosc_dokonana = :paid,
    data_platnosci = NOW(),
    id_transakcji = :tr_id
WHERE `Nr rachunku` = :invoice_id AND platnosc_dokonana != :paid;
