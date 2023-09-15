

const myCards = [];

function FlashCard(title, question){
    this.title = title;
    this.question = question
}


function add(){
    console.log("check")
}
const board = document.getElementById("artboard");

function addCard(question, answer){
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
    answerText.innerHTML = answer

    const cardFront = document.createElement("div");
    cardFront.classList.add("card__side","card__side--front");
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
    questionText.innerHTML = question
}   

const addCardButton = document.getElementById("createCard");

//Button event to add card
addCardButton.addEventListener("click", ()=>
 addCard("textquestion","answrrrrtTEXT"))