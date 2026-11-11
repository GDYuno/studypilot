// StudyPilot AI backend for Cloudflare Workers.
// Set OPENAI_API_KEY as a Worker secret. Set ALLOWED_ORIGIN to your GitHub Pages origin.
// No ILIAS passwords, sessions, PDFs, or generated content are stored by this Worker.
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "https://gdyuno.github.io";
    const headers = {"Access-Control-Allow-Origin": allowed,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json","Cache-Control":"no-store"};
    if (request.method === "OPTIONS") return new Response(null,{status:204,headers});
    if (origin !== allowed) return new Response(JSON.stringify({error:"Origin not allowed"}),{status:403,headers});
    if (new URL(request.url).pathname !== "/api/generate" || request.method !== "POST") return new Response(JSON.stringify({error:"Not found"}),{status:404,headers});
    if (!env.OPENAI_API_KEY) return new Response(JSON.stringify({error:"Server API key missing"}),{status:503,headers});
    let body;try{body=await request.json()}catch{return new Response(JSON.stringify({error:"Invalid JSON"}),{status:400,headers})}
    const content=String(body?.content||"").slice(0,12000);
    if(content.length<50)return new Response(JSON.stringify({error:"Zu wenig Folientext"}),{status:400,headers});
    try{
      const upstream=await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",headers:{"Authorization":"Bearer "+env.OPENAI_API_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({model:env.OPENAI_MODEL||"gpt-4.1-mini",temperature:0.3,response_format:{type:"json_object"},messages:[
          {role:"system",content:"Du bist ein präziser Tutor für deutsche Hochschulstudierende. Nutze ausschließlich den gegebenen Folientext als Quelle. Antworte als JSON-Objekt mit explanation (verständliche Erklärung auf Deutsch) und quiz (Array von genau 3 Objekten mit question, options (genau 3 kurze Antworten), answer (exakt eine der options)). Erfinde keine Fakten. Bei unlesbarem Text gib quiz als leeres Array."},
          {role:"user",content:"Folientitel: "+String(body?.title||"")+". Folientext: "+content}
        ]})
      });
      const data=await upstream.json();
      if(!upstream.ok)throw Error("AI request failed ("+upstream.status+")");
      const parsed=JSON.parse(data.choices?.[0]?.message?.content||"{}");
      return new Response(JSON.stringify({explanation:String(parsed.explanation||""),quiz:Array.isArray(parsed.quiz)?parsed.quiz.slice(0,3):[]}),{headers});
    }catch(e){return new Response(JSON.stringify({error:String(e.message||e)}),{status:502,headers})}
  }
};