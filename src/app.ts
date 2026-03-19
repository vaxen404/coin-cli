import axios from "axios";
import chalk from "chalk";
import * as readline from "node:readline/promises";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function dovizCevirici() {
    console.clear();
    console.log(chalk.blue.bold("\n====================================="));
    console.log(chalk.yellow.bold("    🌍 EVRENSEL DÖVİZ ÇEVİRİCİ CLI 💰"));
    console.log(chalk.blue.bold("=====================================\n"));

    try {
        const inputBirim = await rl.question("Hangi birimden çevirmek istersiniz? (USD, TRY, EUR, BTC): ");
        const anaBirim = inputBirim.toUpperCase().trim() || "USD";
        
        const miktarStr = await rl.question(`Kaç ${anaBirim} çevirmek istersiniz?: `);
        const miktar = parseFloat(miktarStr);

        if (isNaN(miktar)) throw new Error("Geçersiz miktar!");

        console.log(chalk.gray("\nVeriler güncelleniyor..."));

        // Axios ile istek atıyoruz (headers ekleyerek bot korumasını geçiyoruz)
        const config = {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000 // 10 saniye sonra vazgeç (bağlantı takılı kalmasın)
        };

        const [dovizRes, btcRes] = await Promise.all([
            axios.get(`https://open.er-api.com/v6/latest/${anaBirim === 'BTC' ? 'USD' : anaBirim}`, config),
            axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,try", config)
        ]);

        const kurlar = dovizRes.data.rates;
        const btcFiyat = btcRes.data.bitcoin;

        console.log(chalk.cyan.bold(`\n--- ${miktar.toLocaleString()} ${anaBirim} ---`));

        if (anaBirim === "BTC") {
            yazdir("Lira", miktar * btcFiyat.try, "TRY");
            yazdir("USD", miktar * btcFiyat.usd, "USD");
            yazdir("EUR", miktar * btcFiyat.eur, "EUR");
        } else {
            ["TRY", "USD", "EUR", "GBP"].forEach(b => {
                if (kurlar[b] && b !== anaBirim) {
                    yazdir(b, miktar * kurlar[b], b);
                }
            });
            const miktarInUSD = anaBirim === "USD" ? miktar : miktar / kurlar["USD"];
            const btcSonuc = miktarInUSD / btcFiyat.usd;
            console.log(`${chalk.white("Bitcoin:".padEnd(9))} ${chalk.hex("#FFA500")(btcSonuc.toFixed(8))} BTC`);
        }

    } catch (err: any) {
        // Axios hatalarını daha detaylı yakalayalım
        if (err.response) {
            console.log(chalk.red(`\n❌ Sunucu Hatası: ${err.response.status}`));
        } else if (err.request) {
            console.log(chalk.red(`\n❌ Ağ Hatası: Sunucuya ulaşılamadı. İnternetinizi kontrol edin.`));
        } else {
            console.log(chalk.red(`\n❌ Hata: ${err.message}`));
        }
    } finally {
        const cevap = await rl.question(chalk.blue("\nTekrar denemek ister misiniz? (e/h): "));
        if (cevap.toLowerCase() === "e") {
            await dovizCevirici();
        } else {
            console.log(chalk.magenta("Sistem kapatıldı!"));
            rl.close();
            process.exit();
        }
    }
}

function yazdir(etiket: string, deger: number, birim: string) {
    console.log(`${chalk.white((etiket + ":").padEnd(9))} ${chalk.green(deger.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} ${birim}`);
}

dovizCevirici();
