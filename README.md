# Oklart - En väderapplikation med osäkerhetsvisualisering
TNM094 Kandidatprojekt 2016

<div style="text-align: center;"><img src="http://i.imgur.com/vUjHypg.png" width="250"></div>

## Projekt E (Väder-app med osäkerhetsvisualisering)
Målet med projektet är att skapa en webbaserad väder-applikation som använder sig av SMHIs API för väderdata för att visa, utoöver traditionella data, även spatiella och temporala osäkerheter. 
T ex om API:et rapporterar att det ska vara solsken i Norrköping men regn nära inpå så ska applikationen visa att det ändå finns risk för regn i Norrköping. 
Andra potentiella källor för osäkerhet är ensemble-prognoser och att jämföra alternativa källor såsom Yr och SMHI.

## Test
För att testa applikationen måste du ha [npm](https://nodejs.org/ "Nodejs") och [bower](http://bower.io/ "Bower") installerat.

Därefter ladda ner .zip-filen, gå in i terminalen och ställ dig i mappen SMHIApp. Kör därefter kommandona:
```
npm install
```
```
npm start
```
En lokal server startar på datorn, öppna webläsare och skriv url:en [http://localhost:3000](http://localhost:3000 "Localhost") 

## Versioner

### v2.0 (Apr 8, 2016)
* Uppdaterat utseende
* La till slider för tid
* Uppdaterad karta

### v1.0 (Mar 4, 2016)
* Första version
* Användartestning

## Gruppmedlemmar
- Daniel Böök
- Johanna Elmesiöö
- Matthias Berg
- Adam Söderström
- Emil Juopperi
- Jens Kaske
