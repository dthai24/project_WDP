const mongoose = require("mongoose");
require("dotenv").config({ path: "/Users/nguyenminhtien/Documents/Documents - Mac Nguyen Minh Tien/Kì 8 - Summer 2026/WDP301/WDP-1/project_WDP/backend/.env" });

const TestQuestionCollection = require("/Users/nguyenminhtien/Documents/Documents - Mac Nguyen Minh Tien/Kì 8 - Summer 2026/WDP301/WDP-1/project_WDP/backend/models/MongoDB/TestQuestionCollection");
const TestQuestion = require("/Users/nguyenminhtien/Documents/Documents - Mac Nguyen Minh Tien/Kì 8 - Summer 2026/WDP301/WDP-1/project_WDP/backend/models/MongoDB/TestQuestion");
const TestQuestionChoice = require("/Users/nguyenminhtien/Documents/Documents - Mac Nguyen Minh Tien/Kì 8 - Summer 2026/WDP301/WDP-1/project_WDP/backend/models/MongoDB/TestQuestionChoice");
const QuestionType = require("/Users/nguyenminhtien/Documents/Documents - Mac Nguyen Minh Tien/Kì 8 - Summer 2026/WDP301/WDP-1/project_WDP/backend/models/MongoDB/QuestionType");

const EXTRA_QUESTIONS = [
  {
    title: "Which word is the antonym of 'benevolent'?",
    choices: [
      { title: "Malicious", isTrue: true },
      { title: "Kind", isTrue: false },
      { title: "Generous", isTrue: false },
      { title: "Compassionate", isTrue: false }
    ]
  },
  {
    title: "She ___ to the office every day by bus.",
    choices: [
      { title: "commutes", isTrue: true },
      { title: "commuted", isTrue: false },
      { title: "commuting", isTrue: false },
      { title: "will commute", isTrue: false }
    ]
  },
  {
    title: "Which sentence is grammatically correct?",
    choices: [
      { title: "He has been working here since 2020.", isTrue: true },
      { title: "He has been working here for 2020.", isTrue: false },
      { title: "He have been working here since 2020.", isTrue: false },
      { title: "He has been work here since 2020.", isTrue: false }
    ]
  },
  {
    title: "Choose the correct preposition: She is interested ___ learning English.",
    choices: [
      { title: "in", isTrue: true },
      { title: "on", isTrue: false },
      { title: "at", isTrue: false },
      { title: "for", isTrue: false }
    ]
  },
  {
    title: "What does 'procrastinate' mean?",
    choices: [
      { title: "To delay or postpone action", isTrue: true },
      { title: "To act immediately", isTrue: false },
      { title: "To celebrate", isTrue: false },
      { title: "To organize", isTrue: false }
    ]
  },
  {
    title: "The meeting has been ___ until next Monday.",
    choices: [
      { title: "postponed", isTrue: true },
      { title: "promoted", isTrue: false },
      { title: "produced", isTrue: false },
      { title: "prevented", isTrue: false }
    ]
  },
  {
    title: "Which word is a noun?",
    choices: [
      { title: "Achievement", isTrue: true },
      { title: "Achieve", isTrue: false },
      { title: "Achievable", isTrue: false },
      { title: "Achieving", isTrue: false }
    ]
  },
  {
    title: "If I ___ you, I would study harder.",
    choices: [
      { title: "were", isTrue: true },
      { title: "am", isTrue: false },
      { title: "was", isTrue: false },
      { title: "be", isTrue: false }
    ]
  },
  {
    title: "Choose the correct form: By the time we arrived, the movie ___.",
    choices: [
      { title: "had already started", isTrue: true },
      { title: "already started", isTrue: false },
      { title: "has already started", isTrue: false },
      { title: "was already start", isTrue: false }
    ]
  },
  {
    title: "What is the plural form of 'phenomenon'?",
    choices: [
      { title: "Phenomena", isTrue: true },
      { title: "Phenomenons", isTrue: false },
      { title: "Phenomenas", isTrue: false },
      { title: "Phenomenes", isTrue: false }
    ]
  },
  {
    title: "She speaks English ___ than her brother.",
    choices: [
      { title: "more fluently", isTrue: true },
      { title: "more fluent", isTrue: false },
      { title: "most fluently", isTrue: false },
      { title: "fluenter", isTrue: false }
    ]
  },
  {
    title: "Which sentence uses the passive voice correctly?",
    choices: [
      { title: "The letter was written by Mary.", isTrue: true },
      { title: "Mary was written the letter.", isTrue: false },
      { title: "The letter written by Mary.", isTrue: false },
      { title: "The letter is write by Mary.", isTrue: false }
    ]
  },
  {
    title: "Choose the correct word: The company's ___ have increased by 20%.",
    choices: [
      { title: "profits", isTrue: true },
      { title: "prophet", isTrue: false },
      { title: "profited", isTrue: false },
      { title: "profiting", isTrue: false }
    ]
  },
  {
    title: "I wish I ___ more time to finish the project.",
    choices: [
      { title: "had", isTrue: true },
      { title: "have", isTrue: false },
      { title: "having", isTrue: false },
      { title: "will have", isTrue: false }
    ]
  },
  {
    title: "Which word best completes: 'The professor gave a very ___ lecture.'",
    choices: [
      { title: "comprehensive", isTrue: true },
      { title: "comprehend", isTrue: false },
      { title: "comprehension", isTrue: false },
      { title: "comprehensively", isTrue: false }
    ]
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const mcType = await QuestionType.findOne();
  if (!mcType) {
    console.error("No QuestionType found. Run seed-tests.js first.");
    process.exit(1);
  }

  const collections = await TestQuestionCollection.find().lean();
  console.log("Found " + collections.length + " test collections.");

  for (const col of collections) {
    const existingCount = await TestQuestion.countDocuments({ collectionId: col._id });
    console.log("\nCollection " + col._id + " currently has " + existingCount + " questions.");

    let order = existingCount + 1;

    for (const sq of EXTRA_QUESTIONS) {
      const exists = await TestQuestion.findOne({ collectionId: col._id, title: sq.title });
      if (exists) continue;

      const qDoc = await TestQuestion.create({
        collectionId: col._id,
        title: sq.title,
        typeId: mcType._id,
        order: order++
      });

      let choiceOrder = 1;
      for (const choice of sq.choices) {
        await TestQuestionChoice.create({
          questionId: qDoc._id,
          title: choice.title,
          order: choiceOrder++,
          isTrue: choice.isTrue
        });
      }
    }

    const newCount = await TestQuestion.countDocuments({ collectionId: col._id });
    console.log("Collection " + col._id + " now has " + newCount + " questions.");
  }

  console.log("\nDone! Added 15 extra questions to each test.");
  await mongoose.disconnect();
}

run().catch(function(err) { console.error(err); process.exit(1); });
