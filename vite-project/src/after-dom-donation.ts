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

    const familyEl = document.getElementById("familyName")!;
    const payerSel = document.getElementById("payer") as HTMLSelectElement;
    const ctaBtn = document.getElementById("cta") as HTMLButtonElement;
    const amountInput = document.getElementById("amountInput") as HTMLInputElement;
    const presetContainer = document.getElementById("presetAmounts");

    familyEl.textContent = data.payers;

    payerSel.querySelector<HTMLOptionElement>('option[value="0"]')!.text =
        `${data.payer0Name} (${data.payer0Email})`;
    payerSel.querySelector<HTMLOptionElement>('option[value="1"]')!.text =
        `${data.payer1Name} (${data.payer1Email})`;

    // clicking a preset fills the amount input and highlights the button
    // helper that performs the create-donation request with a given amount
    async function submitAmount(amount: string) {
        ctaBtn.disabled = true;
        ctaBtn.classList.add("is-loading");
        try {
            const u = new URL("/api/create-donation", location.origin);
            u.searchParams.set("uuid", uuid);
            u.searchParams.set("payer", payerSel.value);
            u.searchParams.set("amount", amount);
            const r = await fetch(u);
            if (!r.ok) throw new Error();
            const { url } = await r.json();
            location.assign(url);
        } catch {
            ctaBtn.disabled = false;
            ctaBtn.classList.remove("is-loading");
        }
    }

    presetContainer?.addEventListener('click', e => {
        const t = e.target as HTMLElement;
        const v = t.dataset.amt;
        if (v) {
            submitAmount(v);
        }
    });

    ctaBtn.addEventListener("click", () => {
        submitAmount(amountInput.value);
    });
};

// todo: make all scripts async and wait for DOM before running
main()
