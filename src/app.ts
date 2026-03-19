import dns from "node:dns";
import axios from "axios";
import chalk from "chalk";
import * as readline from "node:readline/promises";

dns.setDefaultResultOrder("ipv4first");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

        if (isNaN(miktar)) {
            throw new Error("Geçersiz bir miktar girdiniz.");
        }

        console.log(chalk.gray("\nVeriler çekiliyor..."));

        const config = {
            headers: { 
                'User-Agent': 'Mozilla/5.0',
                'Connection': 'close'
            },
            timeout: 15000
        };

        const dovizRes = await axios.get(`https://open.er-api.com/v6/latest/${anaBirim === 'BTC' ? 'USD' : anaBirim}`, config);
        const btcRes = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,try", config);

        if (!dovizRes.data || !btcRes.data) {
            throw new Error("Sunucudan yanıt alınamadı.");
        }

        const kurlar = dovizRes.data.rates;
        const btcFiyat = btcRes.data.bitcoin;

        console.log(chalk.cyan.bold(`\n--- ${miktar.toLocaleString('tr-TR')} ${anaBirim} Sonuçları ---`));

        if (anaBirim === "BTC") {
            yazdir("Lira", miktar * btcFiyat.try, "TRY");
            yazdir("Dolar", miktar * btcFiyat.usd, "USD");
            yazdir("Euro", miktar * btcFiyat.eur, "EUR");
        } else {
            const takipEdilenler = ["TRY", "USD", "EUR", "GBP"];
            takipEdilenler.forEach(b => {
                if (kurlar[b] && b !== anaBirim) {
                    yazdir(b, miktar * kurlar[b], b);
                }
            });

            const miktarInUSD = anaBirim === "USD" ? miktar : miktar / kurlar["USD"];
            const btcSonuc = miktarInUSD / btcFiyat.usd;
            console.log(`${chalk.white("Bitcoin:".padEnd(9))} ${chalk.hex("#FFA500")(btcSonuc.toFixed(8))} BTC`);
        }

    } catch (err: any) {
        console.log(chalk.red("\n--- BAĞLANTI HATASI ---"));
        console.log(chalk.white("Hata Kodu:"), err.code || "Bilinmiyor");
        console.log(chalk.white("Mesaj:"), err.message);
    } finally {
        const cevap = await rl.question(chalk.blue("\nTekrar denemek ister misiniz? (e/h): "));
        if (cevap.toLowerCase() === "e") {
            await dovizCevirici();
        } else {
            console.log(chalk.magenta("Sistem kapatıldı."));
            rl.close();
            process.exit();
        }
    }
}

function yazdir(etiket: string, deger: number, birim: string) {
    const formatliDeger = deger.toLocaleString('tr-TR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
    console.log(`${chalk.white((etiket + ":").padEnd(9))} ${chalk.green(formatliDeger)} ${birim}`);
}

dovizCevirici();
