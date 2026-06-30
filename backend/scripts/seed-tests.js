const mongoose = require("mongoose");
require("dotenv").config({ path: "/Users/nguyenminhtien/Documents/Documents - Mac Nguyen Minh Tien/Kì 8 - Summer 2026/WDP301/WDP-1/project_WDP/backend/.env" });

const Course = require("../Models/MongoDB/Course");
const Path = require("../Models/MongoDB/Path");
const Test = require("../Models/MongoDB/Test");
const TestQuestionCollection = require("../Models/MongoDB/TestQuestionCollection");
const TestQuestion = require("../Models/MongoDB/TestQuestion");
const TestQuestionChoice = require("../Models/MongoDB/TestQuestionChoice");
const QuestionType = require("../Models/MongoDB/QuestionType");

const SAMPLE_QUESTIONS = [
  {
    title: "Choose the word closest in meaning to 'abundant':",
    choices: [
      { title: "Plentiful", isTrue: true },
      { title: "Scarce", isTrue: false },
      { title: "Rare", isTrue: false },
      { title: "Small", isTrue: false }
    ]
  },
  {
    title: "Complete the sentence: If it rains tomorrow, we ___ the picnic.",
    choices: [
      { title: "will cancel", isTrue: true },
      { title: "would cancel", isTrue: false },
      { title: "cancel", isTrue: false },
      { title: "canceled", isTrue: false }
    ]
  },
  {
    title: "Which of the following is a synonym of 'implement'?",
    choices: [
      { title: "Execute", isTrue: true },
      { title: "Delay", isTrue: false },
      { title: "Ignore", isTrue: false },
      { title: "Destroy", isTrue: false }
    ]
  },
  {
    title: "Choose the correct spelling:",
    choices: [
      { title: "Accommodation", isTrue: true },
      { title: "Acomodation", isTrue: false },
      { title: "Accomodation", isTrue: false },
      { title: "Acommodation", isTrue: false }
    ]
  },
  {
    title: "What is the past participle of 'write'?",
    choices: [
      { title: "Written", isTrue: true },
      { title: "Wrote", isTrue: false },
      { title: "Writing", isTrue: false },
      { title: "Writed", isTrue: false }
    ]
  }
];

async function seed() {
  const uri = process.env.MONGO_URI;
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected successfully!");

  try {
    // 1. Get or create a short QuestionType
    let mcType = await QuestionType.findOne();
    if (!mcType) {
      mcType = await QuestionType.create({ name: "Quiz" });
    }
    console.log("Using QuestionType:", mcType.name, "ID:", mcType._id);

    // 2. Fetch all courses
    const courses = await Course.find();
    console.log(`Found ${courses.length} courses to seed tests for.`);

    for (const course of courses) {
      console.log(`\n--------------------------------------------`);
      console.log(`Seeding tests for course: "${course.courseName}"`);
      console.log(`--------------------------------------------`);

      // Get paths (chapters)
      const paths = await Path.find({ courseId: course._id });
      console.log(`Found ${paths.length} chapters (paths).`);

      // Create a final test for the course
      let finalTest = await Test.findOne({ courseId: course._id, pathId: null });
      if (!finalTest) {
        const targetPath = paths[paths.length - 1] || paths[0];
        if (!targetPath) {
          console.warn(`No chapters found for course ${course.courseName}, skipping final test.`);
          continue;
        }

        finalTest = await Test.create({
          courseId: course._id,
          pathId: targetPath._id,
          instructorId: course.instructorId || null
        });
        console.log(`Created final test linked to path ${targetPath.pathName}`);
      }

      // Create chapter tests
      for (const path of paths) {
        let chapterTest = await Test.findOne({ courseId: course._id, pathId: path._id });
        if (!chapterTest) {
          chapterTest = await Test.create({
            courseId: course._id,
            pathId: path._id,
            instructorId: course.instructorId || null
          });
          console.log(`Created test for chapter: "${path.pathName}"`);
        }

        // Add questions to the test
        let collection = await TestQuestionCollection.findOne({ testId: chapterTest._id });
        if (!collection) {
          collection = await TestQuestionCollection.create({ testId: chapterTest._id });
        }

        // Check if collection already has questions
        const existingQuestionsCount = await TestQuestion.countDocuments({ collectionId: collection._id });
        if (existingQuestionsCount === 0) {
          console.log(`Adding ${SAMPLE_QUESTIONS.length} questions to test...`);
          for (const sq of SAMPLE_QUESTIONS) {
            const qDoc = await TestQuestion.create({
              collectionId: collection._id,
              title: sq.title,
              typeId: mcType._id
            });

            // Add choices
            let order = 1;
            for (const choice of sq.choices) {
              await TestQuestionChoice.create({
                questionId: qDoc._id,
                title: choice.title,
                order: order++,
                isTrue: choice.isTrue
              });
            }
          }
          console.log(`Successfully added questions & choices!`);
        } else {
          console.log(`Test already has ${existingQuestionsCount} questions.`);
        }
      }
    }

    console.log("\n=========================================");
    console.log("🎉 Test Seeding Completed Successfully!");
    console.log("=========================================");
  } catch (err) {
    console.error("Test seeding failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
