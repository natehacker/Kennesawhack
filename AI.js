const OpenAI = require('openai');

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


const openai_api_key = "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";
const openai = new OpenAI({
    //organization: "org-MSNC0HOVekCkygcdmeciX6jS",
    apiKey: openai_api_key,
});

let topic = "Calculus";

let notes = `-Stars and bars theorem, important.
- Remember polynomial identities, will be on the test!
- Find online calculus resources for extra study.`;

let notePrompt = 
    `I have "notes" below. Please "optimize" the notes by inferring the topic they are talking about 
    and generating additional relevant content (return nothing if unsure on what to add). 
    Have no markdown in your answer. Do not keep things too concise nor too lengthy (50-60 words max), 
    let each bullet be filled with helpful info:

    "${notes}}"
    `;

let cardPrompt = 
    `Generate "flash cards", where a "flash card" should take the form of a "front" and back" response.
    The flash cards should contain conceptual questions on the following topic, and be limited to 9 cards: ${topic}`


let tempNotesRes = `- **Stars and Bars Theorem**: Crucial combinatorics concept for distributing items into groups. Understand its applications in real-world scenarios like allocating tasks among workers or distributing prizes.

- **Polynomial Identities**: Essential for upcoming test; focus on quadratic formula, difference of squares, and sum/difference of cubes. Practice simplifying expressions and solving equations using these identities.

- **Online Calculus Resources**: Enhance calculus skills with resources like Khan Academy, Coursera, and MIT OpenCourseWare. Utilize video lectures, practice problems, and online communities for a comprehensive learning experience.`

let tempFlashcardsRes = `Flash Card 1

Front: What is the primary goal of differential calculus?
Back: Differential calculus aims to understand and compute rates of change, particularly how functions change at specific points.
Flash Card 2

Front: What is the primary goal of integral calculus?
Back: Integral calculus focuses on finding the accumulation of quantities, such as area under curves or total change over an interval.
Flash Card 3

Front: What is the derivative of a function, and what does it represent?
Back: The derivative measures the rate of change of a function. It represents the slope of the tangent line to the function's graph at a given point.
Flash Card 4

Front: What is an indefinite integral?
Back: An indefinite integral represents the antiderivative of a function, essentially finding a family of functions whose derivative is the original function.
Flash Card 5

Front: How is the definite integral different from the indefinite integral?
Back: The definite integral computes the net accumulation of a function over a specific interval, resulting in a numerical value, while the indefinite integral yields a function family.
Flash Card 6

Front: What is the Fundamental Theorem of Calculus?
Back: The Fundamental Theorem of Calculus states that integration and differentiation are inverse operations, connecting indefinite integrals and definite integrals.
Flash Card 7

Front: What is the chain rule in calculus, and why is it important?
Back: The chain rule allows you to find the derivative of composite functions by breaking them down into simpler parts. It is essential for analyzing complex functions.
Flash Card 8

Front: What is the concept of a limit in calculus?
Back: A limit describes the behavior of a function as it approaches a particular value or point. It is foundational in calculus and essential for continuity and differentiation.
Flash Card 9

Front: How do you find the area under a curve using calculus?
Back: The area under a curve can be found using definite integrals, where you integrate the function over a specified interval to calculate the area enclosed by the curve and the x-axis.
Flash Card 10

Front: What is the Mean Value Theorem, and what does it state?
Back: The Mean Value Theorem states that if a function is continuous on a closed interval, there exists at least one point within that interval where the instantaneous rate of change (derivative) is equal to the average rate of change.`

function cleanNotesResponse(text)
{
    return text.replaceAll("**", ""); // Remove markup
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
            backTxt = backTxt.substring(0, backTxt.indexOf("Flash Card")); // remove flash card text
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

let tempCleanedRes = cleanFlashcardsResponse(tempFlashcardsRes);
console.log("Number of cards: " + tempCleanedRes.length);
console.log("All Cards\n====================================\n");

tempCleanedRes.forEach((card) => {
    console.log("Front:\n" + card.frontTxt);
    console.log("Back:\n" + card.backTxt + "\n")
})