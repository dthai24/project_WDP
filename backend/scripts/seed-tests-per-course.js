/**
 * seed-tests-per-course.js
 * Tạo đề thi riêng biệt cho từng chương của mỗi khoá học
 * Mỗi đề có 5 câu hỏi với nội dung phù hợp chủ đề chương
 *
 * Run: node scripts/seed-tests-per-course.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Course   = require('../models/MongoDB/Course');
const Path     = require('../models/MongoDB/Path');
const Test     = require('../models/MongoDB/Test');
const TestQuestionCollection = require('../models/MongoDB/TestQuestionCollection');
const TestQuestion = require('../models/MongoDB/TestQuestion');
const TestQuestionChoice = require('../models/MongoDB/TestQuestionChoice');
const QuestionType = require('../models/MongoDB/QuestionType');
const User     = require('../models/MongoDB/User');

// ─── Ngân hàng câu hỏi theo từ khoá chương ──────────────────────────────────
const QUESTION_BANK = {
  'alphabet a': [
    { q: 'Which letter comes after "C"?', choices: ['D','E','B','F'], correct: 0 },
    { q: 'What sound does "B" make?', choices: ['/b/ as in ball','/d/ as in dog','/p/ as in pen','/g/ as in go'], correct: 0 },
    { q: 'How many letters are in the English alphabet?', choices: ['26','24','28','30'], correct: 0 },
    { q: 'Which letter is a vowel?', choices: ['E','B','C','D'], correct: 0 },
    { q: 'What is the first letter of the alphabet?', choices: ['A','B','C','Z'], correct: 0 },
  ],
  'alphabet n': [
    { q: 'Which letter comes after "T"?', choices: ['U','S','V','W'], correct: 0 },
    { q: 'What sound does "Z" make?', choices: ['/z/ as in zoo','/s/ as in sun','/x/ as in fox','/c/ as in cat'], correct: 0 },
    { q: 'Which is the last letter of the alphabet?', choices: ['Z','X','Y','W'], correct: 0 },
    { q: '"N" sounds like the beginning of which word?', choices: ['Night','Kite','Fight','Might'], correct: 0 },
    { q: 'How many letters are from N to Z?', choices: ['13','12','14','11'], correct: 0 },
  ],
  'phonics': [
    { q: 'What short vowel sound does "CAT" have?', choices: ['/ae/ short a','/e/ short e','/i/ short i','/o/ short o'], correct: 0 },
    { q: 'Which word has a short /i/ sound?', choices: ['Bin','Bone','Bane','Bean'], correct: 0 },
    { q: '"DOG" has which short vowel?', choices: ['Short /o/','Short /a/','Short /u/','Short /e/'], correct: 0 },
    { q: 'Which word rhymes with "CUP"?', choices: ['Pup','Cap','Cop','Cip'], correct: 0 },
    { q: 'What sound does "PH" make?', choices: ['/f/ as in phone','/p/ as in pen','/b/ as in back','/h/ as in hat'], correct: 0 },
  ],
  'colors': [
    { q: 'What colour is the sky on a sunny day?', choices: ['Blue','Green','Red','Yellow'], correct: 0 },
    { q: 'Mixing red and white gives?', choices: ['Pink','Orange','Purple','Brown'], correct: 0 },
    { q: 'What colour are most leaves in summer?', choices: ['Green','Orange','Red','Blue'], correct: 0 },
    { q: 'How many primary colours are there?', choices: ['3','2','4','5'], correct: 0 },
    { q: 'What colour is a banana?', choices: ['Yellow','Red','Green','Blue'], correct: 0 },
  ],
  'food': [
    { q: 'Which of these is a fruit?', choices: ['Apple','Carrot','Potato','Onion'], correct: 0 },
    { q: 'What do cows give us?', choices: ['Milk','Eggs','Honey','Wool'], correct: 0 },
    { q: 'Which food group does bread belong to?', choices: ['Grains','Dairy','Protein','Fruit'], correct: 0 },
    { q: 'Plural of "tomato"?', choices: ['Tomatoes','Tomatos','Tomatoez','Tomatoos'], correct: 0 },
    { q: 'Which meal is eaten in the morning?', choices: ['Breakfast','Lunch','Dinner','Supper'], correct: 0 },
  ],
  'school': [
    { q: 'What do you use to write on a whiteboard?', choices: ['A marker','A pencil','A pen','A crayon'], correct: 0 },
    { q: 'Where do students sit in a classroom?', choices: ['At a desk','On the floor','In a bed','On a sofa'], correct: 0 },
    { q: 'What do you carry books in?', choices: ['A backpack','A suitcase','A bag','A box'], correct: 0 },
    { q: 'Who teaches students?', choices: ['A teacher','A doctor','A chef','A pilot'], correct: 0 },
    { q: 'What do you use to draw straight lines?', choices: ['A ruler','A brush','A scissor','An eraser'], correct: 0 },
  ],
  'greetings': [
    { q: 'How do you greet someone in the morning?', choices: ['Good morning!','Good night!','Goodbye!','See you!'], correct: 0 },
    { q: 'Response to "How are you?"', choices: ["I'm fine, thank you!",'My name is Tom.',"I'm 10 years old.",'I like pizza.'], correct: 0 },
    { q: 'Which phrase is used when leaving?', choices: ['Goodbye!','Hello!','Nice to meet you!','Good morning!'], correct: 0 },
    { q: 'What do you say when you first meet someone?', choices: ['Nice to meet you!','See you later!','Good night!','Thank you!'], correct: 0 },
    { q: 'Which is a formal greeting?', choices: ['Good evening.','Hey!','Yo!','Wassup!'], correct: 0 },
  ],
  'family': [
    { q: "What is your mother's mother called?", choices: ['Grandmother','Aunt','Sister','Cousin'], correct: 0 },
    { q: "What word is a male parent?", choices: ['Father','Uncle','Brother','Son'], correct: 0 },
    { q: 'Which word means a female sibling?', choices: ['Sister','Daughter','Mother','Aunt'], correct: 0 },
    { q: 'Children of your aunt or uncle are called?', choices: ['Cousins','Nephews','Nieces','Siblings'], correct: 0 },
    { q: "My parents' son is my ___", choices: ['Brother','Father','Uncle','Cousin'], correct: 0 },
  ],
  'daily': [
    { q: 'What do you do first thing in the morning?', choices: ['Wake up','Go to sleep','Eat dinner','Watch TV'], correct: 0 },
    { q: 'Activity before going to school?', choices: ['Have breakfast','Play football','Take a bath at night','Do homework'], correct: 0 },
    { q: '"She ___ her teeth every morning."', choices: ['brushes','brush','brushing','brushed'], correct: 0 },
    { q: 'What time do people wake up for school?', choices: ['In the morning','At midnight','In the evening','At noon'], correct: 0 },
    { q: 'Which verb means preparing food?', choices: ['Cook','Sleep','Run','Read'], correct: 0 },
  ],
  'present simple': [
    { q: 'She ___ to school every day.', choices: ['goes','go','going','gone'], correct: 0 },
    { q: 'Which sentence is in Present Simple?', choices: ['He reads books daily.','He is reading now.','He read yesterday.','He will read tomorrow.'], correct: 0 },
    { q: 'Do they ___ English?', choices: ['speak','speaks','speaking','spoke'], correct: 0 },
    { q: "She doesn't ___ meat.", choices: ['eat','eats','eating','eaten'], correct: 0 },
    { q: 'Signal word for Present Simple?', choices: ['Every day','Right now','Yesterday','Tomorrow morning'], correct: 0 },
  ],
  'present continuous': [
    { q: 'She ___ TV right now.', choices: ['is watching','watches','watched','watch'], correct: 0 },
    { q: 'Which sentence uses Present Continuous?', choices: ['They are playing football.','They play football daily.','They played last week.','They will play tomorrow.'], correct: 0 },
    { q: 'I ___ a book at the moment.', choices: ['am reading','reads','read','will read'], correct: 0 },
    { q: '"Listen!" — Which tense is implied?', choices: ['Present Continuous','Past Simple','Future','Present Perfect'], correct: 0 },
    { q: 'The baby ___ right now.', choices: ['is sleeping','sleeps','slept','will sleep'], correct: 0 },
  ],
  'past simple': [
    { q: 'She ___ to Paris last year.', choices: ['went','go','goes','going'], correct: 0 },
    { q: 'Past tense of "eat"?', choices: ['ate','eated','eaten','eating'], correct: 0 },
    { q: 'Signal word for Past Simple?', choices: ['Yesterday','Now','Tomorrow','Currently'], correct: 0 },
    { q: 'He ___ not come to school yesterday.', choices: ['did','does','is','was'], correct: 0 },
    { q: 'Past tense of "have"?', choices: ['had','haved','has','having'], correct: 0 },
  ],
  'shopping': [
    { q: 'How do you ask the price?', choices: ['How much is it?','Where is it?','What is it?','Who sells it?'], correct: 0 },
    { q: 'What do you say to buy something?', choices: ["I'll take it.","I don't want it.",'No, thank you.','Maybe later.'], correct: 0 },
    { q: 'Which phrase means a reduced price?', choices: ['On sale','Out of stock','Full price','Reserved'], correct: 0 },
    { q: 'Where do you pay in a shop?', choices: ['At the cash register','At the entrance','In the changing room','In the storeroom'], correct: 0 },
    { q: '"Can I ___ you?" — shop assistant asks:', choices: ['help','take','give','buy'], correct: 0 },
  ],
  'directions': [
    { q: 'What does "turn left" mean?', choices: ['Go to the left side','Go straight','Turn right','Go back'], correct: 0 },
    { q: 'Which phrase means across the road?', choices: ['Opposite','Next to','Behind','Above'], correct: 0 },
    { q: '"The bank is ___ the school and the park."', choices: ['between','behind','above','under'], correct: 0 },
    { q: 'What do you say when you need directions?', choices: ['Excuse me, can you help me?','I am lost forever.','I know the way.','Never mind.'], correct: 0 },
    { q: '"Go straight ahead" means:', choices: ['Continue forward','Turn around','Turn left','Stop here'], correct: 0 },
  ],
  'hobbies': [
    { q: '"I enjoy ___ football." Fill in:', choices: ['playing','play','played','plays'], correct: 0 },
    { q: 'Which is a hobby?', choices: ['Painting','Sleeping','Working','Commuting'], correct: 0 },
    { q: 'How do you ask about someone\'s hobby?', choices: ['What do you like doing?','Where do you come from?','How old are you?','What do you eat?'], correct: 0 },
    { q: '"She is ___ to music." Fill in:', choices: ['listening','listen','listened','listens'], correct: 0 },
    { q: 'Which verb collocates with "a book"?', choices: ['Read','Play','Watch','Cook'], correct: 0 },
  ],
  'perfect': [
    { q: 'I ___ never been to London.', choices: ['have','had','has','am'], correct: 0 },
    { q: 'She ___ finished when I called.', choices: ['had','has','have','is'], correct: 0 },
    { q: 'Signal word for Present Perfect?', choices: ['already','yesterday','last week','in 2010'], correct: 0 },
    { q: '"Have you ever ___ sushi?"', choices: ['eaten','eat','ate','eating'], correct: 0 },
    { q: 'By 2020, she ___ lived here for 10 years.', choices: ['had','has','have','was'], correct: 0 },
  ],
  'passive': [
    { q: 'The book ___ written by Shakespeare.', choices: ['was','is','were','am'], correct: 0 },
    { q: 'In passive voice, the focus is on:', choices: ['The action/object','The doer','The time','The place'], correct: 0 },
    { q: 'English ___ spoken worldwide.', choices: ['is','are','was','were'], correct: 0 },
    { q: 'The emails ___ sent every morning.', choices: ['are','is','was','have'], correct: 0 },
    { q: 'She was ___ by the loud noise.', choices: ['surprised','surprise','surprising','surprises'], correct: 0 },
  ],
  'reported': [
    { q: '"I like pizza" → She said she ___ pizza.', choices: ['liked','likes','like','liking'], correct: 0 },
    { q: '"Are you coming?" → He asked if I ___ coming.', choices: ['was','am','is','were'], correct: 0 },
    { q: 'In reported speech, "will" becomes:', choices: ['would','shall','should','could'], correct: 0 },
    { q: 'She said, "I can swim." → She said she ___ swim.', choices: ['could','can','will','may'], correct: 0 },
    { q: 'Reported speech shifts the tense:', choices: ['One step back','One step forward','No change','Double past'], correct: 0 },
  ],
  'ielts': [
    { q: 'IELTS Listening has ___ sections.', choices: ['4','3','5','2'], correct: 0 },
    { q: 'You should read the questions ___ listening.', choices: ['before','after','during break','never'], correct: 0 },
    { q: 'Skim reading means:', choices: ['Reading quickly for the main idea','Reading word by word','Translating carefully','Skipping the text'], correct: 0 },
    { q: 'IELTS Writing Task 2 minimum words?', choices: ['250','150','200','300'], correct: 0 },
    { q: '"Not Given" in T/F/NG means:', choices: ['Not mentioned in the text','False','True but hidden','Ambiguous'], correct: 0 },
  ],
  'business': [
    { q: 'A formal email should begin with:', choices: ['Dear Mr./Ms. [Name],','Hey!','Hi there,','Yo,'], correct: 0 },
    { q: 'Which is a good email sign-off?', choices: ['Kind regards,','Later!','Bye!','TTYL,'], correct: 0 },
    { q: 'An agenda is:', choices: ['A list of topics to discuss','A meeting room','A summary','A follow-up email'], correct: 0 },
    { q: '"BATNA" stands for:', choices: ['Best Alternative To a Negotiated Agreement','Business Approach To Negotiating','Basic Agreement Terms','Bilateral Agreement Numbers'], correct: 0 },
    { q: 'Signposting in a presentation means:', choices: ['Guiding the audience','Using many slides','Speaking loudly','Avoiding eye contact'], correct: 0 },
  ],
  'toeic': [
    { q: 'In TOEIC Part 1, you look at a ___ and choose the best description.', choices: ['Photograph','Graph','Map','Diagram'], correct: 0 },
    { q: 'TOEIC Listening has ___ questions total.', choices: ['100','50','200','75'], correct: 0 },
    { q: 'Part 5 of TOEIC tests:', choices: ['Grammar and vocabulary','Listening','Speaking','Writing'], correct: 0 },
    { q: 'A "triple passage" in TOEIC Part 7 means:', choices: ['Three related texts','One long text','Two texts','Four paragraphs'], correct: 0 },
    { q: 'TOEIC Reading has ___ questions.', choices: ['100','50','150','75'], correct: 0 },
  ],
  'academic': [
    { q: 'Which is NOT appropriate in academic writing?', choices: ["Contractions (don't)",'Passive voice','Complex sentences','Formal vocabulary'], correct: 0 },
    { q: 'APA in-text citation looks like:', choices: ['(Smith, 2020)','[Smith 2020]','Smith (2020p)','{Smith:2020}'], correct: 0 },
    { q: 'A paraphrase means:', choices: ['Restating in your own words','Copying exactly','Summarising briefly','Translating literally'], correct: 0 },
    { q: 'IMRaD stands for:', choices: ['Introduction, Methods, Results, Discussion','Introduction, Materials, Research, Data','Index, Methods, References, Discussion','Introduction, Models, Results, Data'], correct: 0 },
    { q: 'An abstract should be approximately:', choices: ['150-250 words','500-600 words','50-100 words','1000 words'], correct: 0 },
  ],
  'c2': [
    { q: 'If I had studied harder, I ___ the exam.', choices: ['would have passed','would pass','will pass','passed'], correct: 0 },
    { q: 'A metaphor is:', choices: ['A comparison without "like" or "as"','A comparison using "like"','Exaggeration','Using opposites'], correct: 0 },
    { q: '"Never ___ I seen such beauty." Complete:', choices: ['have','had','has','was'], correct: 0 },
    { q: 'Ethos in rhetoric refers to:', choices: ['Credibility and authority','Emotional appeal','Logical argument','Statistics'], correct: 0 },
    { q: 'Ellipsis is the technique of:', choices: ['Leaving out unnecessary words','Repeating for emphasis','Using long sentences','Adding detail'], correct: 0 },
  ],
};

function findQuestions(chapterTitle) {
  const lower = (chapterTitle || '').toLowerCase();
  for (const [key, questions] of Object.entries(QUESTION_BANK)) {
    if (lower.includes(key)) return questions;
  }
  // Fallback chung
  return [
    { q: 'Which is a correct English sentence?', choices: ['She goes to school every day.','She go to school every day.','She goed to school.','She going to school.'], correct: 0 },
    { q: 'What is the opposite of "ancient"?', choices: ['Modern','Old','Historic','Classic'], correct: 0 },
    { q: '"I ___ English for 5 years." Choose correct form:', choices: ['have been studying','study','studied','am studying'], correct: 0 },
    { q: 'Which word is a synonym for "happy"?', choices: ['Joyful','Sad','Angry','Confused'], correct: 0 },
    { q: 'What does "fluent" mean?', choices: ['Able to speak easily and accurately','Unable to communicate','Speaking slowly','Using simple words only'], correct: 0 },
  ];
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Kết nối MongoDB thành công\n');

  let mcType = await QuestionType.findOne();
  if (!mcType) {
    mcType = await QuestionType.create({ typeName: 'Multiple Choice', typeCode: 'MC' });
  }

  const instructor = await User.findOne().lean();
  const instructorId = instructor?._id;
  const courses = await Course.find().lean();
  console.log('Xử lý ' + courses.length + ' khoá học...\n');

  let created = 0, skipped = 0;

  for (const course of courses) {
    const paths = await Path.find({ courseId: course._id }).sort({ order: 1 }).lean();
    for (const path of paths) {
      const existing = await Test.findOne({ pathId: path._id });
      if (existing) { skipped++; continue; }

      const test = await Test.create({ pathId: path._id, courseId: course._id, instructorId });
      const collection = await TestQuestionCollection.create({ testId: test._id });
      const questions = findQuestions(path.pathName);

      let order = 1;
      for (const qData of questions) {
        const q = await TestQuestion.create({
          collectionId: collection._id,
          title: qData.q,
          typeId: mcType._id,
          order: order++,
        });
        let co = 1;
        for (let i = 0; i < qData.choices.length; i++) {
          await TestQuestionChoice.create({
            questionId: q._id,
            title: qData.choices[i],
            order: co++,
            isTrue: i === qData.correct,
          });
        }
      }

      const shortName = (course.courseName || '').substring(0, 30);
      console.log('  ✅ [' + shortName + '...] -> ' + path.pathName);
      created++;
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log('✅ Tạo mới: ' + created + ' đề | Bỏ qua: ' + skipped);
  console.log('══════════════════════════════════════');
  await mongoose.disconnect();
}

run().catch(function(err) { console.error('Lỗi:', err.message); process.exit(1); });
