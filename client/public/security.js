/* Natal Farma V7 — utilitários de segurança do modo local/demonstração.
   Em produção, autenticação deve ficar no Supabase Auth + RLS. */
(function(){
  'use strict';
  function hex(bytes){ return Array.from(bytes).map(function(b){return b.toString(16).padStart(2,'0');}).join(''); }
  function rotr(n,x){ return (x>>>n)|(x<<(32-n)); }
  function sha256(ascii){
    var mathPow=Math.pow,maxWord=mathPow(2,32),lengthProperty='length',i,j,result='',words=[],asciiBitLength=ascii[lengthProperty]*8;
    var hash=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],primeCounter=k[lengthProperty],isComposite={};
    for(var candidate=2;primeCounter<64;candidate++){ if(!isComposite[candidate]){ for(i=0;i<313;i+=candidate)isComposite[i]=candidate; hash[primeCounter]=(mathPow(candidate,.5)*maxWord)|0; k[primeCounter++]=(mathPow(candidate,1/3)*maxWord)|0; } }
    ascii+='\x80'; while(ascii[lengthProperty]%64-56) ascii+='\x00';
    for(i=0;i<ascii[lengthProperty];i++){ j=ascii.charCodeAt(i); if(j>>8) throw new Error('sha256 suporta texto UTF-8 convertido'); words[i>>2]|=j<<((3-i)%4)*8; }
    words[words[lengthProperty]]=((asciiBitLength/maxWord)|0); words[words[lengthProperty]]=asciiBitLength;
    for(j=0;j<words[lengthProperty];){ var w=words.slice(j,j+=16),oldHash=hash.slice(0),a=hash[0],b=hash[1],c=hash[2],d=hash[3],e=hash[4],f=hash[5],g=hash[6],h=hash[7];
      for(i=0;i<64;i++){ var w15=w[i-15],w2=w[i-2]; var wi=i<16?w[i]:(w[i-16]+(rotr(7,w15)^rotr(18,w15)^(w15>>>3))+w[i-7]+(rotr(17,w2)^rotr(19,w2)^(w2>>>10)))|0; w[i]=wi;
        var t1=(h+(rotr(6,e)^rotr(11,e)^rotr(25,e))+((e&f)^((~e)&g))+k[i]+wi)|0; var t2=((rotr(2,a)^rotr(13,a)^rotr(22,a))+((a&b)^(a&c)^(b&c)))|0;
        h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0; }
      hash=[(oldHash[0]+a)|0,(oldHash[1]+b)|0,(oldHash[2]+c)|0,(oldHash[3]+d)|0,(oldHash[4]+e)|0,(oldHash[5]+f)|0,(oldHash[6]+g)|0,(oldHash[7]+h)|0]; }
    for(i=0;i<8;i++) for(j=3;j+1;j--) { var bb=(hash[i]>>(j*8))&255; result+=bb.toString(16).padStart(2,'0'); }
    return result;
  }
  function utf8(s){ return unescape(encodeURIComponent(String(s))); }
  function portable(password,salt){
    var x=utf8(String(salt)+'|'+String(password)+'|NatalFarmaV7');
    var h=sha256(x);
    for(var i=0;i<1200;i++) h=sha256(utf8(h+'|'+salt+'|'+i));
    return h;
  }
  function hasSubtle(){ return !!(window.crypto && window.crypto.subtle && window.TextEncoder); }
  async function derive(password,salt){
    if(!hasSubtle()) return portable(password,salt);
    var enc=new TextEncoder();
    var key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
    var bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:150000,hash:'SHA-256'},key,256);
    return hex(new Uint8Array(bits));
  }
  function randomSalt(){
    if(window.crypto && crypto.getRandomValues){ var a=new Uint8Array(16);crypto.getRandomValues(a);return hex(a); }
    var out=''; for(var i=0;i<32;i++) out+=Math.floor(Math.random()*16).toString(16); return out;
  }
  async function verify(password,user){
    if(!user) return false;
    if(user.scheme==='portable') return portable(password,user.salt)===user.hash;
    if(hasSubtle()){ try{ if(await derive(password,user.salt)===user.hash) return true; }catch(e){} }
    return !!user.fallbackHash && portable(password,user.salt)===user.fallbackHash;
  }
  async function createPassword(password){
    var salt=randomSalt(), fallbackHash=portable(password,salt);
    if(hasSubtle()){ try{return {salt:salt,hash:await derive(password,salt),fallbackHash:fallbackHash,scheme:'pbkdf2'};}catch(e){} }
    return {salt:salt,hash:fallbackHash,fallbackHash:fallbackHash,scheme:'portable'};
  }
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];});}
  window.NFSecurity={derive:derive,verify:verify,createPassword:createPassword,randomSalt:randomSalt,portable:portable,escape:escapeHtml};
})();
