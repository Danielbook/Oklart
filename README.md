# Oklart - En väderapplikation med osäkerhetsvisualisering
TNM094 Kandidatprojekt 2016

## För att starta hemsida, laddda ner .zip fil, extrahera, gå in i terminalen, navigera till SMHIapp och skriv npm install. (Obs node och bower måste vara installerat på datorn).
Därefter kör du npm start för att starta servern. (körs på localhost:3000);

![Logo](http://i.imgur.com/gC2Mcf2.png)

## Projekt E (Väder-app med osäkerhetsvisualisering)
------
Målet med projektet är att skapa en webbaserad väder-applikation som använder sig av SMHIs API för väderdata för att visa, utoöver traditionella data, även spatiella och temporala osäkerheter. 
T ex om API:et rapporterar att det ska vara solsken i Norrköping men regn nära inpå så ska applikationen visa att det ändå finns risk för regn i Norrköping. 
Andra potentiella källor för osäkerhet är ensemble-prognoser och att jämföra alternativa källor såsom Yr och SMHI.

Versioner
---------
### v2.0 (Apr 8, 2016)
* Uppdaterat utseende
* La till slider för tid
* Uppdaterad karta

### v1.0 (Mar 4, 2016)
* Första version
* Användartestning

Gruppmedlemmar
------
- Daniel Böök
- Johanna Elmesiöö
- Matthias Berg
- Adam Söderström
- Emil Juopperi
- Jens Kaske

### Dokumentation
För att kompilera dokumentation, kör: npm run jsdoc