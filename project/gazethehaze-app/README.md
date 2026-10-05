# Haze Gaze: hands-off setup (GitHub, free)

The page reads files in `data/`. A scheduled job refreshes them from NEA twice a day and republishes the site. You set it up once.

1. **Create a GitHub repository** and upload everything in this folder (keep the `.github` and `scripts` folders).
2. **Add your payment QR code.** Put the image in the repo root as `payment-qr.png`. The pop-up already asks people to put "Haze" in the payment message.
3. **Turn on Pages:** Settings > Pages > Source: **GitHub Actions**.
4. **Run it once:** Actions tab > "Update NEA data and publish" > Run workflow. The first run downloads the full history from data.gov.sg (it can take a while), then publishes. Your site address appears in the job summary.
5. That's it. It runs again at 00:20 and 12:20 Singapore time, and the page also checks NEA live for today whenever it is open.

## If the first run fails
* Open the failed run and read the message. If it says the bulk download wasn't ready or the CSV header wasn't recognised, download `Historical24hrPSI.csv` from data.gov.sg yourself, commit it as `data/source/Historical24hrPSI.csv`, and run the workflow again.
* If you see rate-limit errors, register for a free API key at data.gov.sg and add it under Settings > Secrets and variables > Actions as `DATA_GOV_SG_API_KEY`.

## Good to know
* Preview the design without data by adding `?sample` to the page address (it is clearly labelled as sample data).
* Files in `data/`: `daily.json` (highest per day), `daily-min.json` (lowest per day), one hourly file per year, and `meta.json`.
* Daily value = the highest regional 24-hour PSI reading that day. Hourly squares show the highest of the five regions; the map shows each region.
* Weather overlays and real cause attribution are not connected yet. Cause tags on the page are placeholders.
* GitHub can pause scheduled workflows on repositories with no activity for 60 days. The daily data commits normally keep it active, but check the Actions tab now and then.
* Data: National Environment Agency via data.gov.sg, Singapore Open Data Licence.

## Check it on your own computer first
1. Download `Historical24hrPSI.csv` from data.gov.sg and save it as `data/source/Historical24hrPSI.csv` (create the `source` folder).
2. In this folder run: `SKIP_LIVE=1 node scripts/update.mjs` (Node 20 or newer). On Windows PowerShell: `$env:SKIP_LIVE=1; node scripts/update.mjs`. This reads the CSV and writes the files in `data/`. Without `SKIP_LIVE` it also asks NEA for the recent days, one every couple of seconds, which can take a while if the CSV is old.
3. Start a small web server in this folder: `python3 -m http.server 8000`, then open http://localhost:8000. Opening `index.html` by double-clicking will not load the data files.
4. If you are happy, upload the whole folder, including the generated `data/` files, to GitHub. The first publish then already has the full history.
If step 2 reports an unrecognised header or no rows, send me the first few lines of the CSV.
