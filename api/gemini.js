// ეს არის ჩვენი "შავი ყუთი" - Vercel Serverless Function
export default async function handler(request, response) {
  
  // 1. ვამოწმებთ, რომ მოთხოვნა მოდის სწორი მეთოდით (POST)
  if (request.method !== 'POST') {
    // 405 ნიშნავს "აკრძალული მეთოდი"
    return response.status(405).json({ message: 'Csak POST kerelmek engedelyezettek' }); // უბრალოდ შეტყობინება
  }

  // 2. ვიღებთ პრომპტს, რასაც მომხმარებელი წერს საიტზე
  const { prompt } = request.body;

  if (!prompt) {
    // 400 ნიშნავს "ცუდი მოთხოვნა"
    return response.status(400).json({ message: 'Promt szukseges' }); // პრომპტი აუცილებელია
  }

  // 3. ვიღებთ ჩვენს საიდუმლო გასაღებს Vercel-ის "სეიფიდან"
  // process.env არის გზა Vercel-ის "სეიფისკენ"
  const API_KEY = process.env.GEMINI_API_KEY;
  
  // Google-ის მისამართი, სადაც "სამზარეულოა"
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

  // 4. ვამზადებთ მოთხოვნას Google-ისთვის გასაგებ ენაზე (JSON ფორმატი)
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    // 5. ვაგზავნით მოთხოვნას Google-ის "სამზარეულოში"
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await geminiResponse.json();

    // 6. ამოვიღებთ სუფთა ტექსტს მიღებული პასუხიდან
    // (ვამოწმებთ, რომ პასუხი ნამდვილად მოვიდა და ცარიელი არ არის)
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      console.error('Gemini API Error or empty response:', data);
      // 500 ნიშნავს "სერვერის შიდა შეცდომა"
      return response.status(500).json({ message: 'Nem kaptam ertelmes valaszt a Geminitol', details: data });
    }
    
    // ვიღებთ გენერირებულ ტექსტს
    const generatedText = data.candidates[0].content.parts[0].text;

    // 7. პასუხს ვუბრუნებთ ჩვენს საიტს (front-end-ს)
    // 200 ნიშნავს "წარმატება"
    return response.status(200).json({ text: generatedText });

  } catch (error) {
    // ეს კოდი იმუშავებს, თუ ინტერნეტი გაითიშა ან სერვერი მიუწვდომელია
    console.error('Szerver oldali hiba:', error);
    return response.status(500).json({ message: 'Nem sikerult a Gemini elerese' });
  }
}
