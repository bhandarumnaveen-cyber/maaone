/** Example enquiries and AI drafts for the home page demo and industry pages. Illustrative, not live AI. */

export type DemoLang = "hi" | "pa" | "en";

export const demoLangs: { id: DemoLang; label: string }[] = [
  { id: "hi", label: "हिंदी" },
  { id: "pa", label: "ਪੰਜਾਬੀ" },
  { id: "en", label: "English" },
];

export type DemoEnquiry = {
  id: string;
  industry: string;
  name: string;
  channel: "WhatsApp" | "Website";
  score: "Hot" | "Warm";
  message: string;
  replies: Record<DemoLang, string>;
};

export const demoEnquiries: DemoEnquiry[] = [
  {
    id: "ac",
    industry: "AC repair",
    name: "Rahul Sharma",
    channel: "WhatsApp",
    score: "Hot",
    message: "AC service kitne ka hai? Kal aa sakte ho?",
    replies: {
      hi: "नमस्ते राहुल जी! स्प्लिट AC की सर्विस ₹499 में होती है (गैस भरवानी हो तो उसका चार्ज अलग)। हमारे टेक्नीशियन कल सुबह 11 से 1 बजे के बीच आ सकते हैं। क्या मैं बुकिंग कर दूँ?",
      pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਰਾਹੁਲ ਜੀ! ਸਪਲਿਟ AC ਦੀ ਸਰਵਿਸ ₹499 ਦੀ ਹੈ (ਗੈਸ ਭਰਨੀ ਹੋਵੇ ਤਾਂ ਉਸਦਾ ਚਾਰਜ ਵੱਖਰਾ)। ਸਾਡਾ ਟੈਕਨੀਸ਼ੀਅਨ ਕੱਲ੍ਹ ਸਵੇਰੇ 11 ਤੋਂ 1 ਵਜੇ ਦੇ ਵਿਚਕਾਰ ਆ ਸਕਦਾ ਹੈ। ਕੀ ਮੈਂ ਬੁਕਿੰਗ ਕਰ ਦਿਆਂ?",
      en: "Namaste Rahul ji! A split AC service is ₹499 (gas top-up is extra if needed). Our technician can come tomorrow between 11 am and 1 pm. Shall I book it for you?",
    },
  },
  {
    id: "salon",
    industry: "Salon",
    name: "Simran Kaur",
    channel: "Website",
    score: "Hot",
    message: "Bridal makeup ka package kitne ka hai? 12 December ke liye",
    replies: {
      hi: "बधाई हो सिमरन जी! हमारा ब्राइडल पैकेज ₹15,000 से शुरू होता है — इसमें मेकअप, हेयर स्टाइलिंग और ड्रेपिंग शामिल है। 12 दिसंबर की तारीख़ खाली है। क्या आप इस हफ़्ते एक फ़्री ट्रायल बुक करना चाहेंगी?",
      pa: "ਬਹੁਤ ਬਹੁਤ ਵਧਾਈਆਂ ਸਿਮਰਨ ਜੀ! ਸਾਡਾ ਬ੍ਰਾਈਡਲ ਪੈਕੇਜ ₹15,000 ਤੋਂ ਸ਼ੁਰੂ ਹੁੰਦਾ ਹੈ — ਇਸ ਵਿੱਚ ਮੇਕਅੱਪ, ਹੇਅਰ ਸਟਾਈਲਿੰਗ ਅਤੇ ਡ੍ਰੇਪਿੰਗ ਸ਼ਾਮਲ ਹੈ। 12 ਦਸੰਬਰ ਦੀ ਤਾਰੀਖ਼ ਖਾਲੀ ਹੈ। ਕੀ ਤੁਸੀਂ ਇਸ ਹਫ਼ਤੇ ਮੁਫ਼ਤ ਟ੍ਰਾਇਲ ਬੁੱਕ ਕਰਨਾ ਚਾਹੋਗੇ?",
      en: "Congratulations Simran ji! Our bridal package starts at ₹15,000 and includes makeup, hair styling and draping. 12 December is available. Would you like to book a free trial this week?",
    },
  },
  {
    id: "clinic",
    industry: "Clinic",
    name: "Amit Verma",
    channel: "WhatsApp",
    score: "Hot",
    message: "Doctor sahab kal available hain? 2 din se bukhar hai",
    replies: {
      hi: "आपकी तबीयत ठीक न होने का अफ़सोस है, अमित जी। डॉ. मेहता कल सुबह 10:30 बजे और शाम 5 बजे उपलब्ध हैं। परामर्श फ़ीस ₹400 है। आपके लिए कौन-सा समय ठीक रहेगा? बुखार बहुत तेज़ हो तो कृपया आज ही क्लिनिक आ जाइए।",
      pa: "ਤੁਹਾਡੀ ਸਿਹਤ ਠੀਕ ਨਾ ਹੋਣ ਦਾ ਅਫ਼ਸੋਸ ਹੈ, ਅਮਿਤ ਜੀ। ਡਾ. ਮਹਿਤਾ ਕੱਲ੍ਹ ਸਵੇਰੇ 10:30 ਵਜੇ ਅਤੇ ਸ਼ਾਮ 5 ਵਜੇ ਮਿਲ ਸਕਦੇ ਹਨ। ਸਲਾਹ ਦੀ ਫ਼ੀਸ ₹400 ਹੈ। ਤੁਹਾਡੇ ਲਈ ਕਿਹੜਾ ਸਮਾਂ ਠੀਕ ਰਹੇਗਾ? ਜੇ ਬੁਖ਼ਾਰ ਬਹੁਤ ਤੇਜ਼ ਹੈ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਅੱਜ ਹੀ ਕਲੀਨਿਕ ਆ ਜਾਓ।",
      en: "Sorry to hear you're unwell, Amit ji. Dr Mehta is available tomorrow at 10:30 am and 5 pm. The consultation fee is ₹400. Which time suits you? If the fever is very high, please come to the clinic today.",
    },
  },
  {
    id: "property",
    industry: "Real estate",
    name: "Neha Gupta",
    channel: "Website",
    score: "Warm",
    message: "2BHK flat chahiye Mohali mein, budget 50 lakh",
    replies: {
      hi: "संपर्क करने के लिए धन्यवाद, नेहा जी! मोहाली में ₹50 लाख के बजट में हमारे पास तीन 2BHK विकल्प हैं — सेक्टर 80, सेक्टर 115 और एयरोसिटी में। क्या मैं फ़ोटो भेजूँ और इस वीकेंड साइट विज़िट रख दूँ?",
      pa: "ਸੰਪਰਕ ਕਰਨ ਲਈ ਧੰਨਵਾਦ, ਨੇਹਾ ਜੀ! ਮੋਹਾਲੀ ਵਿੱਚ ₹50 ਲੱਖ ਦੇ ਬਜਟ ਵਿੱਚ ਸਾਡੇ ਕੋਲ ਤਿੰਨ 2BHK ਵਿਕਲਪ ਹਨ — ਸੈਕਟਰ 80, ਸੈਕਟਰ 115 ਅਤੇ ਏਅਰੋਸਿਟੀ ਵਿੱਚ। ਕੀ ਮੈਂ ਫ਼ੋਟੋਆਂ ਭੇਜਾਂ ਅਤੇ ਇਸ ਵੀਕਐਂਡ ਸਾਈਟ ਵਿਜ਼ਿਟ ਰੱਖ ਦਿਆਂ?",
      en: "Thank you for reaching out, Neha ji! We have three 2BHK options in Mohali within ₹50 lakh — in Sector 80, Sector 115 and Aerocity. Shall I send photos and arrange a site visit this weekend?",
    },
  },
  {
    id: "coaching",
    industry: "Coaching",
    name: "Harpreet Singh",
    channel: "WhatsApp",
    score: "Hot",
    message: "Class 10 maths tuition ki fees kya hai? Batch kab se start hai?",
    replies: {
      hi: "रुचि दिखाने के लिए धन्यवाद, हरप्रीत जी! कक्षा 10 गणित बैच की फ़ीस ₹2,500 प्रति माह है — क्लास सोमवार से शुक्रवार शाम 5 से 6:30 बजे। नया बैच 4 नवंबर से शुरू हो रहा है और पहली क्लास फ़्री डेमो है। क्या मैं एक सीट बुक कर दूँ?",
      pa: "ਦਿਲਚਸਪੀ ਲਈ ਧੰਨਵਾਦ, ਹਰਪ੍ਰੀਤ ਜੀ! ਦਸਵੀਂ ਜਮਾਤ ਦੇ ਗਣਿਤ ਬੈਚ ਦੀ ਫ਼ੀਸ ₹2,500 ਮਹੀਨਾ ਹੈ — ਕਲਾਸਾਂ ਸੋਮਵਾਰ ਤੋਂ ਸ਼ੁੱਕਰਵਾਰ ਸ਼ਾਮ 5 ਤੋਂ 6:30 ਵਜੇ। ਨਵਾਂ ਬੈਚ 4 ਨਵੰਬਰ ਤੋਂ ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ ਅਤੇ ਪਹਿਲੀ ਕਲਾਸ ਮੁਫ਼ਤ ਡੈਮੋ ਹੈ। ਕੀ ਮੈਂ ਇੱਕ ਸੀਟ ਬੁੱਕ ਕਰ ਦਿਆਂ?",
      en: "Thanks for your interest, Harpreet ji! Our Class 10 Maths batch is ₹2,500 a month, with classes Monday to Friday, 5–6:30 pm. A new batch starts on 4 November and the first class is a free demo. Shall I reserve a seat?",
    },
  },
  {
    id: "interior",
    industry: "Interior design",
    name: "Vikram Singh",
    channel: "Website",
    score: "Warm",
    message: "3BHK ka modular kitchen aur wardrobe karwana hai, estimate chahiye",
    replies: {
      hi: "धन्यवाद विक्रम जी! 3BHK के लिए मॉड्यूलर किचन और वार्डरोब का खर्च आमतौर पर ₹3.5–5 लाख होता है, जो मटीरियल पर निर्भर करता है। हमारे डिज़ाइनर मुफ़्त में आकर नाप लेंगे और 3D डिज़ाइन दिखाएँगे। आपके लिए शनिवार ठीक रहेगा या रविवार?",
      pa: "ਧੰਨਵਾਦ ਵਿਕਰਮ ਜੀ! 3BHK ਲਈ ਮਾਡਿਊਲਰ ਕਿਚਨ ਅਤੇ ਵਾਰਡਰੋਬ ਦਾ ਖ਼ਰਚਾ ਆਮ ਤੌਰ 'ਤੇ ₹3.5–5 ਲੱਖ ਹੁੰਦਾ ਹੈ, ਜੋ ਮਟੀਰੀਅਲ 'ਤੇ ਨਿਰਭਰ ਕਰਦਾ ਹੈ। ਸਾਡਾ ਡਿਜ਼ਾਈਨਰ ਮੁਫ਼ਤ ਆ ਕੇ ਨਾਪ ਲਵੇਗਾ ਅਤੇ 3D ਡਿਜ਼ਾਈਨ ਦਿਖਾਵੇਗਾ। ਤੁਹਾਡੇ ਲਈ ਸ਼ਨੀਵਾਰ ਠੀਕ ਰਹੇਗਾ ਜਾਂ ਐਤਵਾਰ?",
      en: "Thank you, Vikram ji! A modular kitchen and wardrobes for a 3BHK usually cost ₹3.5–5 lakh, depending on materials. Our designer can visit free of charge to measure up and show you a 3D design. Would Saturday or Sunday suit you?",
    },
  },
];

/** The four shown on the home page. */
export const homeDemo = demoEnquiries.filter((e) => ["ac", "salon", "clinic", "property"].includes(e.id));
