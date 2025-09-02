import { infoPromise, uuid } from "./before-dom";


function showInvalid() {
    const el = document.getElementById("content");
    el!.innerHTML = `
    <div class="container is-max-desktop">
      <p class="is-size-5 mb-1"><strong>Nieprawidłowy identyfikator</strong></p>
      <p>Upewnij się, że korzystasz z linku pochodzącego z <u>aktualnej</u> wiadomości email.</p>
    </div>`;
}

const main = async () => {
    let data
    try {
        data = await infoPromise;
        if (!data) { showInvalid(); return; }
    } catch {
        showInvalid();
        return;
    }

    const invoiceIDEl = document.getElementById("invoiceID")!;
    const invoiceNameEl = document.getElementById("invoiceName")!;
    const amountEl = document.getElementById("amount")!;
    const billingMonthEl = document.getElementById("billingMonth")!;
    const payerSel = document.getElementById("payer") as HTMLSelectElement;
    const paidEl = document.getElementById("paid")!;
    const ctaBtn = document.getElementById("cta") as HTMLButtonElement;

    if (data.paid) {
        paidEl.classList.add("is-success");
        paidEl.textContent = "Opłacony";
        payerSel.disabled = true;
        ctaBtn.disabled = true;
    }

    invoiceIDEl.textContent = data.invoiceID;
    invoiceNameEl.textContent = data.invoiceName;
    amountEl.textContent = `${data.amount} PLN`;
    billingMonthEl.textContent = data.billingMonth;

    payerSel.querySelector<HTMLOptionElement>('option[value="0"]')!.text =
        `${data.payer0Name} (${data.payer0Email})`;
    payerSel.querySelector<HTMLOptionElement>('option[value="1"]')!.text =
        `${data.payer1Name} (${data.payer1Email})`;

    ctaBtn.addEventListener("click", async () => {
        ctaBtn.disabled = true;
        ctaBtn.classList.add("is-loading");
        try {
            const u = new URL("/api/create", location.origin);
            u.searchParams.set("uuid", uuid);
            u.searchParams.set("payer", payerSel.value);
            const r = await fetch(u);
            if (!r.ok) throw new Error();
            const { url } = await r.json();
            location.assign(url);
        } catch {
            ctaBtn.disabled = false;
            ctaBtn.classList.remove("is-loading");
        }
    });
};

// todo: make all scripts async and wait for DOM before running
main()
