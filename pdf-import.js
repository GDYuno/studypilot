// Browser-side import of lecture PDFs downloaded from ILIAS.
// No credentials, cookies, or private PDFs are uploaded to GitHub.
async function importPDFs(){
 const course=selected('learnCourse'),input=document.getElementById('pdfInput'),status=document.getElementById('pdfStatus');
 const files=Array.from(input?.files||[]);
 if(!course)return alert('Bitte zuerst ein Modul anlegen.');
 if(!files.length)return alert('Bitte PDF-Dateien auswählen.');
 const button=document.querySelector('button[onclick="importPDFs()"]');
 if(button)button.disabled=true;
 let imported=0,skipped=0;
 try{
  status.textContent='PDF-Lesemodul wird geladen …';
  const pdf=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
  pdf.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  files.sort((a,b)=>a.name.localeCompare(b.name,'de',{numeric:true}));
  for(const file of files){
   if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'){skipped++;continue}
   const bytes=new Uint8Array(await file.arrayBuffer());
   const digest=await crypto.subtle.digest('SHA-256',bytes);
   const hash=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
   if(course.slides.some(s=>s.fileHash===hash)){skipped++;continue}
   status.textContent='Lese '+file.name+' …';
   const doc=await pdf.getDocument({data:bytes}).promise;
   let slides=[];
   for(let n=1;n<=doc.numPages;n++){
    const page=await doc.getPage(n),items=(await page.getTextContent()).items;
    const lines=[];let lastY=null,line='';
    for(const item of items){
      const y=Math.round(item.transform?.[5]||0);
      if(lastY!==null&&Math.abs(y-lastY)>3){if(line.trim())lines.push(line.trim());line=''}
      line+=String(item.str||'')+' ';lastY=y;
    }
    if(line.trim())lines.push(line.trim());
    const body=lines.join('\n').trim();
    const title=file.name+' · Seite '+n;
    slides.push({title,body:body||'Kein auslesbarer Text. Bei Scans wird eine OCR-Funktion benötigt.',question:'Erkläre die wichtigsten Begriffe und Aussagen dieser Folie in eigenen Worten.',options:[],answer:'',fileHash:hash,sourceFile:file.name,sourcePage:n,imported:true});
   }
   course.slides.push(...slides);imported+=slides.length;
   // Persist after each complete PDF to avoid losing work on iPad.
   save();
  }
  status.textContent=imported+' Seiten importiert. '+skipped+' bereits vorhandene oder ungültige Datei(en) übersprungen. Importierte Folien enthalten keine erfundenen Quizantworten.';
  input.value='';
 }catch(e){status.textContent='Import fehlgeschlagen: '+e.message+'. Bereits importierte Dateien bleiben gespeichert.'}
 finally{if(button)button.disabled=false}
}
