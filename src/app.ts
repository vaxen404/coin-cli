import axios from "axios";
import chalk from "chalk";
import * as readline from "node:readline/promises"

const rl = readline.createInterface({input: process.stdin, output: process.stdout});

async function dovizCevirici() {
    console.clear();
    console.log(chalk.blue.bold("\n====================================="));
    console.log(chalk.yellow.bold("   🌍 EVRENSEL DÖVİZ ÇEVİRİCİ CLI 💰"));
    console.log(chalk.blue.bold("=====================================\n"));

    try{
        const anaBirim = (await rl.question("Hangi birimden çevirmek istersiniz? (örn: USD, TRY, EUR, BTC): ")).toLocaleUpperCase()
        const miktarStr = await rl.question(`Kaç ${anaBirim} çevirmek istersiniz?: `)
        const miktar = parseFloat(miktarStr)

        if(isNaN(miktar)) throw new Error(chalk.red("Geçersiz miktar!"))
        
        console.log(chalk.gray("\nVeriler güncelleniyor..."));

        const dovizRes = await axios.get(`https://open.er-api.com/v6/latest/${anaBirim === 'BTC' ? 'USD' : anaBirim}`);
        const btcRes = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,try")

        const kurlar = dovizRes.data.rates
        const btcFiyat = btcRes.data.bitcoin

        console.log(chalk.cyan.bold(`\n---${miktar} ${anaBirim}---`));

        if(anaBirim === "BTC"){
            yazdir("Lira", miktar * btcFiyat.try, "TRY")
            yazdir("USD", miktar * btcFiyat.usd, "USD")
            yazdir("EUR", miktar * btcFiyat.eur, "EUR")
        }else{
            ["TRY","USD","EUR","GBP"].forEach(b => {
                if(kurlar[b]) yazdir(b, miktar * kurlar[b], b)
            })
            
            const btcSonuc = (miktar * kurlar["USD"]) / btcFiyat.usd
            console.log(`${chalk.white("Bitcoin:")} ${chalk.hex("#FFA500")(btcSonuc.toFixed(8))} BTC`);
        }
    }catch(err: any) {
        console.log(chalk.red(`Hata: ${err.message}`));
    }finally {
        const cevap = (await rl.question(chalk.blue("Tekrar denemek ister misiniz? (e/h): ")))
        cevap.toLowerCase() === "e" ? dovizCevirici() : (console.log("sistem kapatıldı!"), rl.close(), process.exit())
    }
}

      
function yazdir(etiket: string, deger: number, birim: string){
    console.log(`${chalk.white(etiket + ":")} ${chalk.green(deger.toLocaleString('tr-TR', {minimumFractionDigits: 2}))} ${birim}`);
}

dovizCevirici()