// --- AI-Poetry - განახლებული Front-End კოდი ---

// 1. ველოდებით HTML დოკუმენტის სრულად ჩატვირთვას
document.addEventListener('DOMContentLoaded', () => {
  
  // 2. ვპოულობთ ჩვენს HTML ელემენტებს
  // !!! ყურადღება: 'poem-form', 'poem-output' და 'loader' 
  // უნდა ემთხვეოდეს შენი index.html ფაილის ID-ებს
  const poemForm = document.getElementById('poem-form');
  const poemOutput = document.getElementById('poem-output');
  const loader = document.getElementById('loader');

  // თუ რომელიმე ელემენტს ვერ პოულობს, ვაჩვენებთ შეცდომას კონსოლში
  if (!poemForm) {
    console.error('შეცდომა: HTML-ში ვერ ვიპოვე ელემენტი ID-ით "poem-form"');
    return;
  }
  if (!poemOutput) {
    console.error('შეცდომა: HTML-ში ვერ ვიპოვე ელემენტი ID-ით "poem-output"');
    return;
  }
  if (!loader) {
    console.error('შენიშვნა: HTML-ში ვერ ვიპოვე ელემენტი ID-ით "loader". ლოდინის ინდიკატორი არ იმუშავებს.');
  }

  // 3. ვამატებთ მოვლენას "submit" ღილაკზე (ან ფორმაზე)
  poemForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // ვაჩერებთ გვერდის გადატვირთვას

    // ვიღებთ ტექსტს ფორმიდან. 
    // !!! დაუშვათ, რომ შენს input ველს აქვს name="prompt" ან id="prompt"
    // ვცადოთ ორივე ვარიანტი, რომ ვიპოვოთ
    let userPrompt;
    const promptInput = document.getElementById('prompt') || document.getElementsByName('prompt')[0];
    
    if (promptInput) {
      userPrompt = promptInput.value;
    } else {
        // თუ ვერ ვიპოვეთ, ავიღოთ ფორმის ყველა მონაცემი
        const formData = new FormData(poemForm);
        userPrompt = formData.get('prompt'); // ეს იმუშავებს, თუ ველს აქვს name="prompt"
    }

    if (!userPrompt) {
      poemOutput.textContent = 'გთხოვთ, შეიყვანოთ ლექსის თემა.';
      return;
    }

    // 4. ვიწყებთ პროცესს: ვასუფთავებთ ძველ პასუხს და ვაჩვენებთ "მბრუნავ" ლოუდერს
    poemOutput.textContent = '';
    if (loader) loader.style.display = 'block';

    try {
      // 5. !!! მთავარი ცვლილება !!!
      // ჩვენ აღარ ვუკავშირდებით OpenAI-ს.
      // ჩვენ ვუკავშირდებით ჩვენს "შავ ყუთს" (api/gemini.js), რომელიც Vercel-ზე შევქმენით.
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt // ჩვენს "შავ ყუთს" ვუგზავნით მხოლოდ პრომპტს
        })
      });

      if (!response.ok) {
        // თუ ჩვენი "შავი ყუთი" შეცდომას დააბრუნებს, ვაჩვენებთ მას
        const errorData = await response.json();
        throw new Error(errorData.message || 'სერვერმა დააბრუნა შეცდომა');
      }

      const data = await response.json();

      // 6. წარმატება! პასუხს (data.text) ვაჩვენებთ ეკრანზე
      // ვიყენებთ innerText-ის ნაცვლად innerHTML-ს, რომ \n (ახალი ხაზი) გადავიდეს <br>-ად
      poemOutput.innerHTML = data.text.replace(/\n/g, '<br>');

    } catch (error) {
      // 7. თუ რამე შეცდომა მოხდა, ვაჩვენებთ მას
      console.error('წარმოიშვა შეცდომა:', error);
      poemOutput.textContent = `სამწუხაროდ, მოხდა შეცდომა: ${error.message}`;
    } finally {
      // 8. პროცესის დასასრული: ვმალავთ "მბრუნავ" ლოუდერს
      if (loader) loader.style.display = 'none';
    }
  });
});
