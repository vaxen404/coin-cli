import dns from "node:dns";
import axios from "axios"
dns.setDefaultResultOrder("ipv4first");

import chalk from "chalk";
import * as readline from "node:readline/promises";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function dovizCevirici() {
    console.clear();
    console.log(chalk.blue.bold("\n====================================="));
    console.log(chalk.yellow.bold("    🌍 EVRENSEL DÖVİZ ÇEVİRİCİ CLI 💰"));
    console.log(chalk.blue.bold("=====================================\n"));

    try {
        const inputBirim = await rl.question("Hangi birimden çevirmek istersiniz? (örn: USD, TRY, EUR, BTC): ");
        const anaBirim = inputBirim.toUpperCase().trim();
        
        const miktarStr = await rl.question(`Kaç ${anaBirim} çevirmek istersiniz?: `);
        const miktar = parseFloat(miktarStr);

        if (isNaN(miktar)) throw new Error("Geçersiz miktar!");

        console.log(chalk.gray("\nVeriler güncelleniyor..."));

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            },
            timeout: 10000 
        };

        console.log(chalk.gray("Döviz kurları alınıyor..."));
        const dovizRes = await axios.get(`https://open.er-api.com/v6/latest/${anaBirim === 'BTC' ? 'USD' : anaBirim}`, options);
        
        console.log(chalk.gray("Kripto verileri alınıyor..."));
        const btcRes = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,try", options);

        const kurlar = dovizRes.data.rates;
        const btcFiyat = btcRes.data.bitcoin;

        if (!kurlar || !btcFiyat) {
            throw new Error("Sunucudan boş veri döndü.");
        }

        console.log(chalk.cyan.bold(`\n--- ${miktar.toLocaleString('tr-TR')} ${anaBirim} ---`));

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
            console.log(`${chalk.white("Bitcoin:".padEnd(8))} ${chalk.hex("#FFA500")(btcSonuc.toFixed(8))} BTC`);
        }

    } catch (err: any) {
        console.log(chalk.red(`\nHata: ${err.message}`));
    } finally {
        const cevap = await rl.question(chalk.blue("\nTekrar denemek ister misiniz? (e/h): "));
        if (cevap.toLowerCase() === "e") {
            await dovizCevirici();
        } else {
            console.log(chalk.magenta("\nSistem kapatıldı! İyi günler."));
            rl.close();
            process.exit();
        }
    }
}

function yazdir(etiket: string, deger: number, birim: string) {
    console.log(`${chalk.white((etiket + ":").padEnd(8))} ${chalk.green(deger.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} ${birim}`);
}

dovizCevirici();
