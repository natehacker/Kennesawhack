class Flashcard 
{
    constructor(frontTxt, backTxt) 
    {
      this.frontTxt = frontTxt;
      this.backTxt = backTxt;

      this.currentTxt = frontTxt;
    }

    flip()
    {
        this.currentTxt = this.currentTxt === this.frontTxt ? this.backTxt : this.frontTxt;
    }
}

async function postAPIData(inputTxt) {
    // Default options are marked with *
    const url = "https://api.openai.com/v1/chat/completions";
    const api_key = "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";
    const data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": inputTxt}],
        "temperature": 0.7
      };

    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + api_key // + token
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    return response.json(); // JSON object representing response
};

function enhanceNotes(text, notesObj)
{
    const notePrompt = 
    `I have "notes" below. Please "optimize" the notes by inferring the topic they are talking about 
    and generating additional relevant content (return nothing if unsure on what to add). 
    Have no markdown in your answer. Do not keep things too concise nor too lengthy (50-60 words max), 
    let each bullet be filled with helpful info: "${text}}"
    `;

    console.log("Generating notes...");

    postAPIData(notePrompt).then((json) => 
    {
        let msg = json['choices'][0]['message']['content'];
        console.log("Got msg:\n" + msg + "\n\n");
        let parsedEnhancedNotes = cleanNotesResponse(msg);
        //console.log("Got enhanced notes:\n" + parsedEnhancedNotes + "\n\n");

        text = parsedEnhancedNotes; // Must set this as notesObj is expecting text obj

        notesObj.push({
            text,
            date: new Date(Date.now()).toLocaleString(),
        });
    });
}

function cleanNotesResponse(text)
{
    text = text.replaceAll("**", ""); // Remove markup

    return text;
}

function cleanFlashcardsResponse(text)
{
    text = text.replaceAll("**", "").replaceAll("\n", ""); // Remove markup
    let flashcards = [];
    let allPos = getAllFrontAndBackPos(text);

    for (let index = 0; index < allPos.length; index+=2) 
    {
        const frontPos = allPos[index];
        const backPos = allPos[index + 1];

        let frontTxt = text.substring(frontPos, backPos);
        let backTxt = "";

        if (index + 2 < allPos.length - 1)
        {
            backTxt = text.substring(backPos + "Back: ".length, allPos[index + 2] - "Front: ".length); // back to next front

            let flashCardNumPos = backTxt.indexOf("Flash Card");
            if (flashCardNumPos > -1)
                backTxt = backTxt.substring(0, flashCardNumPos); // remove flash card text
        }
        else
            backTxt = text.substring(backPos + "Back: ".length); // last card, so dont try to go to next front

        let newCard = new Flashcard(frontTxt, backTxt);
        flashcards.push(newCard);
    }

    return flashcards;
}

function getAllFrontAndBackPos(text)
{
    let pos = [];
    let finishedParsing = false;

    let frontPos = text.indexOf("Front:");
    let backPos = text.indexOf("Back:");
    
    while (!finishedParsing)
    {
        if (frontPos != -1)
        {
            pos.push(frontPos + "Front: ".length); // Don't want to include "front:" part
            pos.push(backPos); // Always a back if theres a front, also don't want to include "back:" part

            frontPos = text.indexOf("Front:", backPos + "Back:".length);
            backPos = text.indexOf("Back:", backPos + "Back:".length);

            continue;
        }

        finishedParsing = true;
    }

    return pos;
}
  
function addCard(question, answer) 
{
    const board = document.getElementById("artboard");

    const newCard = document.createElement("div");
    newCard.className = "card";
    board.appendChild(newCard);
  
    const cardBack = document.createElement("div");
    cardBack.classList.add("card__side", "card__side--back");
    newCard.appendChild(cardBack);
  
    const cardDetails = document.createElement("div");
    cardDetails.className = "card__details";
    cardBack.appendChild(cardDetails);
  
    // Card answer Text
    const answerText = document.createElement("p");
    cardDetails.appendChild(answerText);
    // answerText.innerHTML = document.getElementById("answer").value;
    answerText.innerHTML = answer;
  
    const cardFront = document.createElement("div");
    cardFront.classList.add("card__side", "card__side--front");
    newCard.appendChild(cardFront);
  
    const cardTheme = document.createElement("div");
    cardTheme.className = "card__theme";
    cardFront.appendChild(cardTheme);
  
    const cardThemeBox = document.createElement("div");
    cardThemeBox.className = "card__theme-box";
    cardTheme.appendChild(cardThemeBox);
  
    // Card question text
    const questionText = document.createElement("p");
    questionText.className = "card__title";
    cardThemeBox.appendChild(questionText);
    questionText.innerHTML = question;
}

const addCardButton = document.getElementById("register-link");
  
//Button event to add card
addCardButton.addEventListener("click", () =>
{
    let topic = document.getElementById("password").value;
    let cardPrompt = 
    `Generate "flash cards", where a "flash card" should take the form of a "front" and back" response.
    The flash cards should contain conceptual questions on the following topic, and be limited to 9 cards or less: ${topic}`;

    console.log("Generating flash cards for topic: " + topic);

    postAPIData(cardPrompt).then((json) => 
    {
        let msg = json['choices'][0]['message']['content'];
        console.log("Got msg:\n" + msg + "\n\n");
        let parsedFlashcards = cleanFlashcardsResponse(msg);

        parsedFlashcards.forEach(card => 
        {
            console.log("front: " + card.frontTxt + "\n");
            console.log("back: " + card.backTxt);
        });

        parsedFlashcards.forEach(card =>
        {
            addCard(card.frontTxt, card.backTxt);
        });
    });
});