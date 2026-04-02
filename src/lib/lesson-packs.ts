import type { LessonDefinition } from "./lesson-schema";

export const lessonPacks: LessonDefinition[] = [
  // ══════════════════════════════════════════════════════════════
  // MATH LESSONS
  // ══════════════════════════════════════════════════════════════

  {
    id: "math-addition-easy",
    title: "Addition Adventure",
    subject: "Math",
    subtopic: "Addition",
    difficulty: "easy",
    estimatedMinutes: 10,
    description: "Learn to add numbers together with fun examples!",
    objectives: [
      "Understand what addition means",
      "Add single-digit numbers confidently",
      "Use drawings to visualize addition",
    ],
    tags: ["math", "addition", "counting", "beginner"],
    blocks: [
      {
        type: "explanation",
        title: "What Is Addition? \u{1F389}",
        content:
          "Addition means putting things together! When you have 2 apples and get 3 more, you can count them all up. That's addition! We use the **+** sign to show we're adding. Let's explore how it works!",
        visual: "\u{1F34E}",
        highlight: "putting things together",
      },
      {
        type: "multiple_choice",
        question: "What is 3 + 2?",
        options: ["4", "5", "6", "7"],
        correctIndex: 1,
        explanation:
          "3 + 2 = 5. If you have 3 toys and get 2 more, you now have 5 toys total!",
      },
      {
        type: "multiple_choice",
        question: "You have 4 cookies and your friend gives you 3 more. How many cookies do you have now?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        explanation:
          "4 + 3 = 7. You started with 4 cookies and added 3 more, so you have 7 cookies!",
      },
      {
        type: "fill_blank",
        title: "Fill in the Missing Numbers",
        sentences: [
          { text: "2 + 3 = ___", blank: "5", hint: "Count 2, then 3 more" },
          { text: "1 + ___ = 5", blank: "4", hint: "What plus 1 makes 5?" },
          { text: "___ + 3 = 6", blank: "3", hint: "Think of two groups of 3" },
        ],
      },
      {
        type: "drawing",
        prompt:
          "Draw 3 stars on the left side and 4 stars on the right side. How many stars are there in all?",
        hint: "Count all the stars together after you draw them!",
        width: 500,
        height: 300,
        expectedConcepts: ["groups", "counting", "addition"],
      },
      {
        type: "celebration",
        message:
          "Amazing job, math superstar! You crushed the Addition Adventure!",
        achievement: "Addition Explorer",
      },
    ],
  },

  {
    id: "math-multiplication-medium",
    title: "Multiplication Magic",
    subject: "Math",
    subtopic: "Multiplication",
    difficulty: "medium",
    estimatedMinutes: 15,
    description: "Discover the magic of multiplication using grids and patterns!",
    objectives: [
      "Understand multiplication as repeated addition",
      "Use arrays to visualize multiplication",
      "Know basic multiplication facts up to 5",
    ],
    tags: ["math", "multiplication", "times-tables"],
    blocks: [
      {
        type: "explanation",
        title: "Multiplication Is Super-Powered Addition! \u{2728}",
        content:
          "Imagine you have 3 bags, and each bag has 4 marbles. Instead of adding 4 + 4 + 4, you can say 3 \u00D7 4 = 12. Multiplication is a shortcut for adding the same number over and over. Think of it like rows and columns in a grid!",
        visual: "\u{1F4AA}",
        highlight: "shortcut for adding",
      },
      {
        type: "match",
        title: "Match the Multiplication Facts",
        instruction: "Match each multiplication problem to its answer.",
        pairs: [
          { left: "2 \u00D7 3", right: "6" },
          { left: "4 \u00D7 2", right: "8" },
          { left: "5 \u00D7 3", right: "15" },
          { left: "3 \u00D7 3", right: "9" },
        ],
      },
      {
        type: "sequence",
        title: "Steps to Multiply 4 \u00D7 3",
        instruction: "Put the steps in the right order to solve 4 \u00D7 3.",
        items: [
          { id: "read", text: "Read the problem: 4 \u00D7 3" },
          { id: "groups", text: "Think: 4 groups of 3" },
          { id: "add", text: "Add: 3 + 3 + 3 + 3" },
          { id: "answer", text: "The answer is 12!" },
        ],
        correctOrder: ["read", "groups", "add", "answer"],
      },
      {
        type: "multiple_choice",
        question: "What is 5 \u00D7 2?",
        options: ["7", "8", "10", "12"],
        correctIndex: 2,
        explanation:
          "5 \u00D7 2 = 10. That's 2 + 2 + 2 + 2 + 2, or five groups of two!",
      },
      {
        type: "multiple_choice",
        question: "A classroom has 3 rows of desks with 5 desks in each row. How many desks are there?",
        options: ["8", "12", "15", "18"],
        correctIndex: 2,
        explanation:
          "3 \u00D7 5 = 15. Three rows of five makes fifteen desks!",
      },
      {
        type: "recap",
        title: "Multiplication Recap",
        keyPoints: [
          "Multiplication is repeated addition",
          "3 \u00D7 4 means three groups of four",
          "Arrays (rows and columns) help you see multiplication",
        ],
        nextSteps: [
          "Practice your 2, 3, and 5 times tables",
          "Try the Fraction Friends lesson next!",
        ],
      },
    ],
  },

  {
    id: "math-fractions-easy",
    title: "Fraction Friends",
    subject: "Math",
    subtopic: "Fractions",
    difficulty: "easy",
    estimatedMinutes: 12,
    description: "Meet fractions for the first time using pizza and shapes!",
    objectives: [
      "Understand what a fraction represents",
      "Identify halves, thirds, and fourths",
      "Read and write simple fractions",
    ],
    tags: ["math", "fractions", "beginner"],
    blocks: [
      {
        type: "explanation",
        title: "What Are Fractions? \u{1F355}",
        content:
          "A fraction is a part of a whole! When you cut a pizza into 4 equal slices and eat 1 slice, you ate 1/4 of the pizza. The bottom number (4) tells you how many equal pieces there are. The top number (1) tells you how many pieces you're talking about. Easy, right?",
        visual: "\u{1F355}",
        highlight: "part of a whole",
      },
      {
        type: "diagram",
        title: "Pizza Fractions",
        description: "See how a pizza can be split into equal parts!",
        width: 500,
        height: 400,
        elements: [
          { id: "whole-label", shape: "label", x: 60, y: 20, text: "Whole Pizza", fontSize: 16, color: "#e74c3c" },
          { id: "whole", shape: "circle", x: 30, y: 50, width: 100, height: 100, color: "#f39c12" },
          { id: "half-label", shape: "label", x: 210, y: 20, text: "1/2 (one half)", fontSize: 16, color: "#e74c3c" },
          { id: "half", shape: "circle", x: 190, y: 50, width: 100, height: 100, color: "#f39c12" },
          { id: "half-line", shape: "arrow", x: 240, y: 50, toX: 240, toY: 150, color: "#2c3e50" },
          { id: "quarter-label", shape: "label", x: 370, y: 20, text: "1/4 (one fourth)", fontSize: 16, color: "#e74c3c" },
          { id: "quarter", shape: "circle", x: 350, y: 50, width: 100, height: 100, color: "#f39c12" },
          { id: "quarter-h", shape: "arrow", x: 400, y: 50, toX: 400, toY: 150, color: "#2c3e50" },
          { id: "quarter-v", shape: "arrow", x: 350, y: 100, toX: 450, toY: 100, color: "#2c3e50" },
        ],
      },
      {
        type: "multiple_choice",
        question: "If a cake is cut into 3 equal pieces and you eat 1 piece, what fraction did you eat?",
        options: ["1/2", "1/3", "1/4", "2/3"],
        correctIndex: 1,
        explanation:
          "You ate 1 out of 3 equal pieces, so you ate 1/3 of the cake!",
      },
      {
        type: "short_answer",
        question: "A pie is cut into 2 equal halves. What fraction is one half? Write it like this: 1/2",
        acceptedAnswers: ["1/2"],
        hint: "The top number is how many pieces you have, and the bottom number is total pieces.",
        explanation: "One half is written as 1/2 \u2014 one piece out of two equal pieces!",
      },
      {
        type: "drawing",
        prompt:
          "Draw a rectangle and divide it into 4 equal parts. Color in 3 of the parts to show 3/4.",
        hint: "Draw lines to make 4 equal sections, then shade 3 of them.",
        width: 500,
        height: 300,
        expectedConcepts: ["equal parts", "shading", "3/4"],
      },
    ],
  },

  {
    id: "math-fractions-hard",
    title: "Fraction Challenge",
    subject: "Math",
    subtopic: "Fractions",
    difficulty: "hard",
    estimatedMinutes: 18,
    description: "Put your fraction skills to the ultimate test!",
    objectives: [
      "Compare fractions with different denominators",
      "Order fractions from smallest to largest",
      "Solve word problems involving fractions",
    ],
    tags: ["math", "fractions", "advanced", "challenge"],
    blocks: [
      {
        type: "multiple_choice",
        question: "Which fraction is larger: 2/3 or 3/5?",
        options: ["2/3", "3/5", "They are equal", "Cannot be determined"],
        correctIndex: 0,
        explanation:
          "2/3 is about 0.67 and 3/5 is 0.60. To compare, find common denominators: 2/3 = 10/15 and 3/5 = 9/15. So 2/3 is larger!",
      },
      {
        type: "multiple_choice",
        question: "Sam ate 1/4 of a pizza and Mia ate 2/8 of the same pizza. Who ate more?",
        options: [
          "Sam ate more",
          "Mia ate more",
          "They ate the same amount",
          "Not enough information",
        ],
        correctIndex: 2,
        explanation:
          "1/4 and 2/8 are equivalent fractions! 2/8 simplifies to 1/4, so they ate the same amount.",
      },
      {
        type: "multiple_choice",
        question: "What is 1/4 + 1/4?",
        options: ["1/8", "2/8", "1/2", "2/4"],
        correctIndex: 2,
        explanation:
          "1/4 + 1/4 = 2/4, which simplifies to 1/2. Two quarters make a half!",
      },
      {
        type: "short_answer",
        question: "Simplify the fraction 4/8. Write your answer like this: 1/2",
        acceptedAnswers: ["1/2"],
        hint: "What number divides evenly into both 4 and 8?",
        explanation: "4/8 simplifies to 1/2 because both 4 and 8 can be divided by 4.",
      },
      {
        type: "short_answer",
        question: "If you have 3/6 of a chocolate bar, what is that as a simplified fraction?",
        acceptedAnswers: ["1/2"],
        hint: "Both 3 and 6 are divisible by the same number.",
        explanation: "3/6 simplifies to 1/2 because 3 divided by 3 is 1 and 6 divided by 3 is 2.",
      },
      {
        type: "sequence",
        title: "Order These Fractions",
        instruction: "Put these fractions in order from smallest to largest.",
        items: [
          { id: "one-half", text: "1/2" },
          { id: "one-fourth", text: "1/4" },
          { id: "three-fourths", text: "3/4" },
          { id: "one-eighth", text: "1/8" },
        ],
        correctOrder: ["one-eighth", "one-fourth", "one-half", "three-fourths"],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // READING LESSONS
  // ══════════════════════════════════════════════════════════════

  {
    id: "reading-story-detective-easy",
    title: "Story Detective",
    subject: "Reading",
    subtopic: "Comprehension",
    difficulty: "easy",
    estimatedMinutes: 10,
    description: "Read a short story and find clues to answer questions!",
    objectives: [
      "Read a short passage carefully",
      "Find key details in a story",
      "Answer questions about what happened",
    ],
    tags: ["reading", "comprehension", "stories", "beginner"],
    blocks: [
      {
        type: "reading_passage",
        title: "The Lost Kitten",
        passage:
          "Lily was walking home from school when she heard a tiny sound. \"Meow! Meow!\" It came from under a bush. She bent down and saw a small gray kitten with bright green eyes. The kitten was shaking and looked scared. Lily gently picked it up and wrapped it in her jacket. She carried the kitten home and gave it warm milk. By bedtime, the kitten was purring happily on her pillow.",
        followUpQuestions: [
          {
            question: "Where did Lily find the kitten?",
            options: ["In a tree", "Under a bush", "At school", "In her house"],
            correctIndex: 1,
            explanation: "The story says Lily heard meowing coming from under a bush!",
          },
          {
            question: "What color was the kitten?",
            options: ["Orange", "Black", "Gray", "White"],
            correctIndex: 2,
            explanation: "The story describes a small gray kitten with bright green eyes.",
          },
        ],
      },
      {
        type: "multiple_choice",
        question: "How do you think Lily felt when she found the kitten?",
        options: ["Angry", "Scared", "Caring and kind", "Bored"],
        correctIndex: 2,
        explanation:
          "Lily gently picked up the kitten, wrapped it in her jacket, and gave it milk. These actions show she was caring and kind!",
      },
      {
        type: "multiple_choice",
        question: "What happened at the end of the story?",
        options: [
          "The kitten ran away",
          "Lily took the kitten to school",
          "The kitten was purring on Lily's pillow",
          "Lily found another kitten",
        ],
        correctIndex: 2,
        explanation:
          "The last sentence tells us the kitten was purring happily on Lily's pillow by bedtime.",
      },
    ],
  },

  {
    id: "reading-vocabulary-medium",
    title: "Vocabulary Builder",
    subject: "Reading",
    subtopic: "Vocabulary",
    difficulty: "medium",
    estimatedMinutes: 15,
    description: "Discover word roots and grow your vocabulary!",
    objectives: [
      "Learn common word roots and prefixes",
      "Match words to their meanings",
      "Use context clues to figure out new words",
    ],
    tags: ["reading", "vocabulary", "word-roots"],
    blocks: [
      {
        type: "explanation",
        title: "The Secret Code of Words \u{1F50D}",
        content:
          "Did you know words have hidden parts? A **prefix** goes at the beginning and changes the meaning. For example, **un-** means \"not,\" so **unhappy** means \"not happy.\" A **root** is the main part of the word. Learning these parts is like having a secret decoder ring for reading!",
        visual: "\u{1F9E9}",
        highlight: "secret decoder ring",
      },
      {
        type: "match",
        title: "Match Words to Meanings",
        instruction: "Match each word to its correct meaning.",
        pairs: [
          { left: "Unhappy", right: "Not happy; sad" },
          { left: "Replay", right: "To play again" },
          { left: "Bicycle", right: "A vehicle with two wheels" },
          { left: "Preview", right: "To see before others" },
          { left: "Submarine", right: "A vessel that goes under water" },
        ],
      },
      {
        type: "fill_blank",
        title: "Use the Right Word",
        sentences: [
          {
            text: "If something is not possible, it is ___.",
            blank: "impossible",
            hint: "The prefix im- means \"not\"",
          },
          {
            text: "To write something again is to ___ it.",
            blank: "rewrite",
            hint: "The prefix re- means \"again\"",
          },
          {
            text: "A person who teaches is called a ___.",
            blank: "teacher",
            hint: "The suffix -er means \"one who does\"",
          },
        ],
      },
      {
        type: "spelling",
        words: [
          { word: "preview", hint: "To see something before it happens", difficulty: "medium" },
          { word: "unhappy", hint: "The opposite of happy", difficulty: "easy" },
          { word: "bicycle", hint: "You ride this with two wheels", difficulty: "medium" },
          { word: "rewrite", hint: "To write something again", difficulty: "medium" },
          { word: "submarine", hint: "It travels under the ocean", difficulty: "hard" },
          { word: "impossible", hint: "Something that cannot be done", difficulty: "hard" },
        ],
      },
    ],
  },

  {
    id: "reading-comprehension-hard",
    title: "Reading Comprehension",
    subject: "Reading",
    subtopic: "Comprehension",
    difficulty: "hard",
    estimatedMinutes: 20,
    description: "Read a longer passage and dive deep into its meaning!",
    objectives: [
      "Read and understand a multi-paragraph passage",
      "Make inferences from the text",
      "Express opinions with evidence from the story",
    ],
    tags: ["reading", "comprehension", "inference", "advanced"],
    blocks: [
      {
        type: "reading_passage",
        title: "The Tree House Project",
        passage:
          "Marco and his best friend Aisha wanted to build a tree house. They spent a whole week planning. Marco drew the design on graph paper while Aisha measured the oak tree in her backyard. \"We'll need at least ten boards,\" Marco said, studying his sketch.\n\nThe next Saturday, they gathered supplies from Aisha's garage. They found old boards, nails, and a rope. Aisha's dad helped them carry everything to the tree. Building was harder than they expected. Boards kept slipping, and the nails bent when they hammered too hard.\n\nBy Sunday afternoon, the tree house wasn't perfect. One wall leaned a little and the door was crooked. But when they climbed up and looked out over the neighborhood, they both grinned. \"It's the best tree house ever,\" Aisha whispered. Marco nodded. They had built it together, and that made it special.",
        followUpQuestions: [
          {
            question: "What did Marco do during the planning phase?",
            options: [
              "Measured the tree",
              "Drew the design on graph paper",
              "Gathered supplies",
              "Asked his dad for help",
            ],
            correctIndex: 1,
            explanation: "The passage says Marco drew the design on graph paper while Aisha measured the tree.",
          },
        ],
      },
      {
        type: "multiple_choice",
        question: "Why did the story say the tree house 'wasn't perfect'?",
        options: [
          "It fell down",
          "They ran out of supplies",
          "One wall leaned and the door was crooked",
          "Aisha's dad didn't help",
        ],
        correctIndex: 2,
        explanation:
          "The passage specifically mentions that one wall leaned and the door was crooked.",
      },
      {
        type: "multiple_choice",
        question: "What is the main message of this story?",
        options: [
          "Tree houses are dangerous to build",
          "You should always ask adults for help",
          "Working together makes something special, even if it isn't perfect",
          "Drawing a plan is the hardest part",
        ],
        correctIndex: 2,
        explanation:
          "The ending shows that even though the tree house was imperfect, building it together made it special to Marco and Aisha.",
      },
      {
        type: "multiple_choice",
        question: "What can you infer about Marco and Aisha's friendship?",
        options: [
          "They just met recently",
          "They work well together and support each other",
          "They argue a lot",
          "Marco does all the work",
        ],
        correctIndex: 1,
        explanation:
          "They planned together, split tasks, and both felt proud of the result \u2014 signs of a strong friendship.",
      },
      {
        type: "short_answer",
        question: "What were two problems Marco and Aisha faced while building?",
        acceptedAnswers: [
          "boards kept slipping and nails bent",
          "boards slipping and nails bending",
          "slipping boards and bent nails",
        ],
        hint: "Look at the second paragraph for the difficulties they had.",
        explanation:
          "The boards kept slipping and the nails bent when they hammered too hard.",
      },
      {
        type: "writing_prompt",
        prompt:
          "Imagine you are building something with a friend. What would you build? Describe what happens, including any problems you face and how you solve them.",
        starterSentence: "My friend and I decided to build...",
        minWords: 40,
        guidingQuestions: [
          "What are you building?",
          "What supplies do you need?",
          "What problems come up?",
          "How do you feel when it's done?",
        ],
      },
    ],
  },

  {
    id: "reading-parts-of-speech-medium",
    title: "Parts of Speech",
    subject: "Reading",
    subtopic: "Grammar",
    difficulty: "medium",
    estimatedMinutes: 14,
    description: "Learn nouns, verbs, and adjectives \u2014 the building blocks of sentences!",
    objectives: [
      "Identify nouns, verbs, and adjectives",
      "Sort words into their correct category",
      "Recognize parts of speech in sentences",
    ],
    tags: ["reading", "grammar", "parts-of-speech"],
    blocks: [
      {
        type: "explanation",
        title: "Words Have Jobs! \u{1F3D7}\u{FE0F}",
        content:
          "Every word in a sentence has a job. A **noun** is a person, place, or thing (dog, school, pizza). A **verb** is an action word (run, eat, think). An **adjective** describes a noun (big, red, happy). Once you know these three, you can understand any sentence!",
        visual: "\u{1F4DA}",
        highlight: "person, place, or thing",
      },
      {
        type: "match",
        title: "Sort the Words",
        instruction: "Match each word to its part of speech.",
        pairs: [
          { left: "Jump", right: "Verb" },
          { left: "Cat", right: "Noun" },
          { left: "Tall", right: "Adjective" },
          { left: "Swim", right: "Verb" },
          { left: "Shiny", right: "Adjective" },
          { left: "Park", right: "Noun" },
        ],
      },
      {
        type: "fill_blank",
        title: "Name That Part of Speech",
        sentences: [
          {
            text: "In the sentence 'The dog barked loudly,' the word 'dog' is a ___.",
            blank: "noun",
            hint: "Is it a person, place, thing, action, or description?",
          },
          {
            text: "In the sentence 'She runs fast,' the word 'runs' is a ___.",
            blank: "verb",
            hint: "This word shows what someone is doing.",
          },
          {
            text: "In the sentence 'The bright sun shone,' the word 'bright' is an ___.",
            blank: "adjective",
            hint: "This word describes what the sun is like.",
          },
        ],
      },
      {
        type: "drawing",
        prompt:
          "Draw a picture of a sentence! Write the sentence 'The fluffy cat sleeps.' Then circle the noun in blue, underline the verb in red, and draw a box around the adjective in green.",
        hint: "Noun = cat, Verb = sleeps, Adjective = fluffy",
        width: 500,
        height: 300,
        expectedConcepts: ["noun", "verb", "adjective", "color-coding"],
      },
      {
        type: "recap",
        title: "Parts of Speech Recap",
        keyPoints: [
          "Nouns name people, places, and things",
          "Verbs are action words",
          "Adjectives describe nouns",
        ],
        nextSteps: [
          "Look for nouns, verbs, and adjectives in your favorite book!",
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // WRITING LESSONS
  // ══════════════════════════════════════════════════════════════

  {
    id: "writing-sentence-builders-easy",
    title: "Sentence Builders",
    subject: "Writing",
    subtopic: "Sentence Structure",
    difficulty: "easy",
    estimatedMinutes: 10,
    description: "Learn how to build strong, complete sentences!",
    objectives: [
      "Know what makes a complete sentence",
      "Put words in the correct order",
      "Write your own simple sentences",
    ],
    tags: ["writing", "sentences", "beginner"],
    blocks: [
      {
        type: "explanation",
        title: "Building a Sentence \u{1F3D7}\u{FE0F}",
        content:
          "A sentence needs two things: a **subject** (who or what) and a **verb** (what they do). 'The cat sleeps.' \u2014 the cat is the subject and sleeps is the verb. Every sentence starts with a capital letter and ends with a period, question mark, or exclamation point!",
        visual: "\u{270D}\u{FE0F}",
        highlight: "subject and a verb",
      },
      {
        type: "sequence",
        title: "Unscramble the Sentence",
        instruction: "Put these words in the right order to make a sentence.",
        items: [
          { id: "the", text: "The" },
          { id: "dog", text: "dog" },
          { id: "runs", text: "runs" },
          { id: "fast", text: "fast." },
        ],
        correctOrder: ["the", "dog", "runs", "fast"],
      },
      {
        type: "fill_blank",
        title: "Complete the Sentences",
        sentences: [
          { text: "The bird ___ in the sky.", blank: "flies", hint: "What do birds do in the sky?" },
          { text: "___ is my best friend.", blank: "She", hint: "Start with a name or pronoun." },
          { text: "We like to ___ at the park.", blank: "play", hint: "What do you do at the park for fun?" },
        ],
      },
      {
        type: "short_answer",
        question: "Write a sentence about your favorite animal. Remember to start with a capital letter and end with a period!",
        acceptedAnswers: [],
        hint: "Think about what your favorite animal looks like or does.",
        explanation: "Great job! Any sentence with a subject, verb, capital letter, and end punctuation is correct!",
      },
      {
        type: "recap",
        title: "Sentence Building Recap",
        keyPoints: [
          "Every sentence needs a subject and a verb",
          "Start with a capital letter",
          "End with a period, question mark, or exclamation point",
        ],
      },
    ],
  },

  {
    id: "writing-spelling-safari-medium",
    title: "Spelling Safari",
    subject: "Writing",
    subtopic: "Spelling",
    difficulty: "medium",
    estimatedMinutes: 12,
    description: "Go on a spelling adventure with tricky but useful words!",
    objectives: [
      "Spell common words correctly",
      "Recognize tricky spelling patterns",
      "Use words in sentences",
    ],
    tags: ["writing", "spelling"],
    blocks: [
      {
        type: "spelling",
        words: [
          { word: "because", hint: "This word tells you why something happened", difficulty: "medium" },
          { word: "friend", hint: "Someone you play with and care about", difficulty: "easy" },
          { word: "through", hint: "Going from one side to the other", difficulty: "hard" },
          { word: "beautiful", hint: "Very pretty or lovely to look at", difficulty: "hard" },
          { word: "together", hint: "With each other; not alone", difficulty: "medium" },
          { word: "different", hint: "Not the same; unique", difficulty: "medium" },
        ],
      },
      {
        type: "fill_blank",
        title: "Use the Spelling Words",
        sentences: [
          {
            text: "I stayed home ___ I was feeling sick.",
            blank: "because",
            hint: "This word explains the reason.",
          },
          {
            text: "My best ___ came to my birthday party.",
            blank: "friend",
            hint: "Someone you care about.",
          },
          {
            text: "The train went ___ the tunnel.",
            blank: "through",
            hint: "From one side to the other.",
          },
          {
            text: "We played ___ at recess.",
            blank: "together",
            hint: "With each other.",
          },
        ],
      },
      {
        type: "recap",
        title: "Spelling Safari Recap",
        keyPoints: [
          "\"Because\" has the word \"cause\" inside it",
          "\"Friend\" ends with -end (a friend to the end!)",
          "\"Beautiful\" \u2014 remember: Big Elephants Are Ugly To Insects Flying Under Logs",
          "Practice makes perfect!",
        ],
      },
    ],
  },

  {
    id: "writing-creative-medium",
    title: "Creative Writing",
    subject: "Writing",
    subtopic: "Creative Writing",
    difficulty: "medium",
    estimatedMinutes: 18,
    description: "Learn the building blocks of great stories and write your own!",
    objectives: [
      "Understand story elements: characters, setting, problem, solution",
      "Write a short creative story",
      "Revise writing to make it better",
    ],
    tags: ["writing", "creative", "stories"],
    blocks: [
      {
        type: "explanation",
        title: "Every Great Story Has These Parts \u{1F4D6}",
        content:
          "Every story has four key parts: **Characters** (who is in the story), a **Setting** (where and when it happens), a **Problem** (something that needs solving), and a **Solution** (how the problem gets fixed). Think of your favorite book \u2014 can you spot all four parts?",
        visual: "\u{1F31F}",
        highlight: "Characters, Setting, Problem, Solution",
      },
      {
        type: "writing_prompt",
        prompt:
          "Write a short story about a character who finds something unexpected in their backpack at school. Include all four story elements!",
        starterSentence: "When I opened my backpack at school, I couldn't believe what I found inside...",
        minWords: 50,
        guidingQuestions: [
          "Who is the main character?",
          "Where does the story take place?",
          "What is the surprise in the backpack?",
          "What problem does it cause?",
          "How does the character solve the problem?",
        ],
      },
      {
        type: "revision",
        title: "Make This Sentence Better",
        original: "The dog was nice and it was big and it was brown.",
        issue: "This sentence uses 'and it was' too many times. Can you combine the descriptions?",
        hint: "Try listing the adjectives before the noun.",
        acceptedRevisions: [
          "The nice, big, brown dog.",
          "The big, nice, brown dog.",
          "The big brown dog was nice.",
        ],
      },
      {
        type: "recap",
        title: "Creative Writing Recap",
        keyPoints: [
          "Stories need characters, setting, problem, and solution",
          "Start with an interesting hook to grab the reader",
          "Revising makes your writing even better!",
        ],
        nextSteps: [
          "Write another story at home and share it with someone!",
        ],
      },
    ],
  },

  {
    id: "writing-paragraph-power-hard",
    title: "Paragraph Power",
    subject: "Writing",
    subtopic: "Paragraph Writing",
    difficulty: "hard",
    estimatedMinutes: 20,
    description: "Master the art of writing clear, well-organized paragraphs!",
    objectives: [
      "Write a topic sentence",
      "Add supporting details",
      "Write a concluding sentence",
    ],
    tags: ["writing", "paragraphs", "advanced"],
    blocks: [
      {
        type: "explanation",
        title: "The Paragraph Sandwich \u{1F96A}",
        content:
          "Think of a paragraph like a sandwich! The **topic sentence** is the top bun \u2014 it tells the reader what the paragraph is about. The **supporting details** are the filling \u2014 facts, examples, or reasons. The **concluding sentence** is the bottom bun \u2014 it wraps everything up. Without any of these parts, your paragraph sandwich falls apart!",
        visual: "\u{1F96A}",
        highlight: "topic sentence, supporting details, concluding sentence",
      },
      {
        type: "writing_prompt",
        prompt:
          "Write a paragraph about why your favorite season is the best. Make sure to include a topic sentence, at least three supporting details, and a concluding sentence.",
        starterSentence: "My favorite season is",
        minWords: 60,
        guidingQuestions: [
          "What is your favorite season?",
          "What activities can you do during this season?",
          "What does the weather feel like?",
          "What foods or holidays happen in this season?",
          "Why should others enjoy this season too?",
        ],
      },
      {
        type: "revision",
        title: "Fix This Paragraph",
        original:
          "Dogs are great pets. I like pizza. Dogs are loyal and they love to play. They can learn tricks. Dogs make people smile.",
        issue:
          "One sentence doesn't belong in this paragraph about dogs. Find the off-topic sentence!",
        hint: "Which sentence is about food instead of dogs?",
        acceptedRevisions: [
          "Dogs are great pets. Dogs are loyal and they love to play. They can learn tricks. Dogs make people smile.",
        ],
      },
      {
        type: "recap",
        title: "Paragraph Power Recap",
        keyPoints: [
          "Start with a clear topic sentence",
          "Add 3 or more supporting details",
          "End with a concluding sentence",
          "Every sentence should connect to the main idea",
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // SCIENCE LESSONS
  // ══════════════════════════════════════════════════════════════

  {
    id: "science-solar-system-easy",
    title: "Solar System Explorer",
    subject: "Science",
    subtopic: "Space",
    difficulty: "easy",
    estimatedMinutes: 14,
    description: "Blast off on a tour of our solar system!",
    objectives: [
      "Name the eight planets in order",
      "Know basic facts about each planet",
      "Understand that planets orbit the Sun",
    ],
    tags: ["science", "space", "planets", "solar-system"],
    blocks: [
      {
        type: "explanation",
        title: "Welcome to the Solar System! \u{1F680}",
        content:
          "Our solar system has a star called the **Sun** at the center, and **eight planets** that orbit around it. The planets in order are: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Here's a fun way to remember: **My Very Excited Mother Just Served Us Nachos!**",
        visual: "\u{1F30D}",
        highlight: "My Very Excited Mother Just Served Us Nachos",
      },
      {
        type: "diagram",
        title: "The Planets in Order",
        description: "The eight planets from closest to farthest from the Sun.",
        width: 500,
        height: 350,
        elements: [
          { id: "sun", shape: "circle", x: 10, y: 140, width: 60, height: 60, color: "#f1c40f", text: "Sun" },
          { id: "mercury", shape: "circle", x: 85, y: 160, width: 20, height: 20, color: "#95a5a6", text: "Me" },
          { id: "venus", shape: "circle", x: 120, y: 155, width: 25, height: 25, color: "#e67e22", text: "V" },
          { id: "earth", shape: "circle", x: 160, y: 152, width: 28, height: 28, color: "#3498db", text: "E" },
          { id: "mars", shape: "circle", x: 205, y: 157, width: 22, height: 22, color: "#e74c3c", text: "Ma" },
          { id: "jupiter", shape: "circle", x: 250, y: 130, width: 55, height: 55, color: "#d4a574", text: "Jupiter" },
          { id: "saturn", shape: "circle", x: 325, y: 138, width: 45, height: 45, color: "#f0d58c", text: "Saturn" },
          { id: "uranus", shape: "circle", x: 395, y: 148, width: 35, height: 35, color: "#76d7ea", text: "Uranus" },
          { id: "neptune", shape: "circle", x: 450, y: 152, width: 32, height: 32, color: "#2e5090", text: "Neptune" },
          { id: "label-inner", shape: "label", x: 100, y: 30, text: "Inner Planets (rocky)", fontSize: 12, color: "#7f8c8d" },
          { id: "label-outer", shape: "label", x: 310, y: 30, text: "Outer Planets (gas/ice)", fontSize: 12, color: "#7f8c8d" },
        ],
      },
      {
        type: "match",
        title: "Planet Facts",
        instruction: "Match each planet to its fun fact!",
        pairs: [
          { left: "Earth", right: "The only planet with life (that we know of!)" },
          { left: "Jupiter", right: "The biggest planet in our solar system" },
          { left: "Mars", right: "Known as the Red Planet" },
          { left: "Saturn", right: "Famous for its beautiful rings" },
        ],
      },
      {
        type: "multiple_choice",
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Mercury", "Earth", "Mars"],
        correctIndex: 1,
        explanation:
          "Mercury is the closest planet to the Sun. It's also the smallest planet!",
      },
      {
        type: "drawing",
        prompt:
          "Draw your favorite planet! Add details like colors, rings, spots, or moons. Write the planet's name below your drawing.",
        hint: "Think about what makes your planet special \u2014 is it colorful? Does it have rings?",
        width: 500,
        height: 400,
        expectedConcepts: ["planet shape", "color", "name label"],
      },
    ],
  },

  {
    id: "science-water-cycle-medium",
    title: "Water Cycle Wonders",
    subject: "Science",
    subtopic: "Earth Science",
    difficulty: "medium",
    estimatedMinutes: 16,
    description: "Follow water on its amazing journey through the water cycle!",
    objectives: [
      "Identify the stages of the water cycle",
      "Understand evaporation, condensation, and precipitation",
      "Label a water cycle diagram",
    ],
    tags: ["science", "water-cycle", "earth-science"],
    blocks: [
      {
        type: "explanation",
        title: "Water's Amazing Journey! \u{1F4A7}",
        content:
          "Water travels in a never-ending loop called the **water cycle**! Here's how it works: The Sun heats water in oceans and lakes, turning it into invisible gas called **water vapor** (evaporation). The vapor rises, cools down, and forms **clouds** (condensation). When clouds get heavy, water falls as **rain or snow** (precipitation). Then it flows back to rivers and oceans, and the cycle starts again!",
        visual: "\u{1F327}\u{FE0F}",
        highlight: "evaporation, condensation, precipitation",
      },
      {
        type: "diagram",
        title: "The Water Cycle",
        description: "Follow the arrows to see how water moves!",
        width: 500,
        height: 400,
        elements: [
          { id: "sun", shape: "circle", x: 400, y: 20, width: 60, height: 60, color: "#f1c40f", text: "Sun" },
          { id: "ocean", shape: "box", x: 20, y: 320, width: 200, height: 60, color: "#3498db", text: "Ocean / Lake" },
          { id: "cloud", shape: "box", x: 160, y: 40, width: 140, height: 60, color: "#bdc3c7", text: "Clouds" },
          { id: "mountain", shape: "box", x: 340, y: 230, width: 120, height: 90, color: "#7f8c8d", text: "Mountain" },
          { id: "evap-arrow", shape: "arrow", x: 120, y: 310, toX: 180, toY: 110, color: "#e74c3c" },
          { id: "evap-label", shape: "label", x: 60, y: 200, text: "Evaporation", fontSize: 14, color: "#e74c3c", stepNumber: 1 },
          { id: "cond-label", shape: "label", x: 180, y: 15, text: "Condensation", fontSize: 14, color: "#8e44ad", stepNumber: 2 },
          { id: "precip-arrow", shape: "arrow", x: 300, y: 100, toX: 360, toY: 230, color: "#2980b9" },
          { id: "precip-label", shape: "label", x: 310, y: 155, text: "Precipitation", fontSize: 14, color: "#2980b9", stepNumber: 3 },
          { id: "runoff-arrow", shape: "arrow", x: 340, y: 320, toX: 220, toY: 345, color: "#27ae60" },
          { id: "runoff-label", shape: "label", x: 260, y: 370, text: "Runoff", fontSize: 14, color: "#27ae60", stepNumber: 4 },
        ],
      },
      {
        type: "label_parts",
        title: "Label the Water Cycle",
        description: "Drag each label to the correct spot on the diagram!",
        diagramElements: [
          { id: "bg-ocean", shape: "box", x: 20, y: 320, width: 200, height: 60, color: "#3498db", text: "Ocean" },
          { id: "bg-cloud", shape: "box", x: 160, y: 40, width: 140, height: 60, color: "#bdc3c7" },
          { id: "bg-arrow-up", shape: "arrow", x: 120, y: 310, toX: 180, toY: 110, color: "#e74c3c" },
          { id: "bg-arrow-down", shape: "arrow", x: 300, y: 100, toX: 360, toY: 230, color: "#2980b9" },
        ],
        labels: [
          { id: "lbl-evap", text: "Evaporation", correctZone: { x: 40, y: 180, width: 120, height: 60 } },
          { id: "lbl-cond", text: "Condensation", correctZone: { x: 160, y: 10, width: 140, height: 50 } },
          { id: "lbl-precip", text: "Precipitation", correctZone: { x: 290, y: 130, width: 130, height: 60 } },
          { id: "lbl-runoff", text: "Runoff", correctZone: { x: 240, y: 340, width: 100, height: 50 } },
        ],
      },
      {
        type: "sequence",
        title: "Water Cycle Steps",
        instruction: "Put the water cycle steps in the correct order.",
        items: [
          { id: "evap", text: "The Sun heats water and it evaporates" },
          { id: "cond", text: "Water vapor rises and forms clouds (condensation)" },
          { id: "precip", text: "Water falls as rain or snow (precipitation)" },
          { id: "collect", text: "Water flows into rivers and back to the ocean" },
        ],
        correctOrder: ["evap", "cond", "precip", "collect"],
      },
      {
        type: "multiple_choice",
        question: "What causes water to evaporate from the ocean?",
        options: ["The Moon", "Wind", "Heat from the Sun", "Fish swimming"],
        correctIndex: 2,
        explanation:
          "The Sun's heat warms the water, causing it to turn into water vapor and rise into the air!",
      },
    ],
  },

  {
    id: "science-plant-parts-easy",
    title: "Plant Parts",
    subject: "Science",
    subtopic: "Biology",
    difficulty: "easy",
    estimatedMinutes: 12,
    description: "Discover the amazing parts of a plant and what each one does!",
    objectives: [
      "Name the main parts of a plant",
      "Explain what roots, stems, leaves, and flowers do",
      "Label a plant diagram",
    ],
    tags: ["science", "plants", "biology", "beginner"],
    blocks: [
      {
        type: "explanation",
        title: "Plants Are Amazing! \u{1F331}",
        content:
          "Every plant has important parts that help it live and grow. **Roots** drink up water from the soil. The **stem** carries water up to the rest of the plant, like a straw! **Leaves** catch sunlight and make food for the plant (that's called photosynthesis). And **flowers** help the plant make seeds so new plants can grow!",
        visual: "\u{1F33B}",
        highlight: "Roots, stem, leaves, flowers",
      },
      {
        type: "diagram",
        title: "Parts of a Plant",
        description: "A simple diagram of a flowering plant.",
        width: 500,
        height: 450,
        elements: [
          { id: "flower", shape: "circle", x: 200, y: 20, width: 80, height: 80, color: "#e74c3c", text: "Flower" },
          { id: "stem", shape: "box", x: 230, y: 100, width: 20, height: 150, color: "#27ae60", text: "" },
          { id: "stem-label", shape: "label", x: 270, y: 170, text: "Stem", fontSize: 16, color: "#27ae60" },
          { id: "leaf-left", shape: "box", x: 160, y: 140, width: 70, height: 30, color: "#2ecc71", text: "Leaf" },
          { id: "leaf-right", shape: "box", x: 250, y: 180, width: 70, height: 30, color: "#2ecc71", text: "Leaf" },
          { id: "soil-line", shape: "box", x: 50, y: 260, width: 380, height: 5, color: "#8B4513" },
          { id: "soil-label", shape: "label", x: 380, y: 255, text: "Soil", fontSize: 14, color: "#8B4513" },
          { id: "roots", shape: "box", x: 180, y: 270, width: 120, height: 100, color: "#d4a574", text: "Roots" },
          { id: "root-callout", shape: "callout", x: 100, y: 340, text: "Roots absorb water!", pointToId: "roots", fontSize: 12 },
        ],
      },
      {
        type: "label_parts",
        title: "Label the Plant",
        description: "Drag each label to the correct part of the plant!",
        diagramElements: [
          { id: "d-flower", shape: "circle", x: 200, y: 20, width: 80, height: 80, color: "#e74c3c" },
          { id: "d-stem", shape: "box", x: 230, y: 100, width: 20, height: 150, color: "#27ae60" },
          { id: "d-leaf", shape: "box", x: 160, y: 140, width: 70, height: 30, color: "#2ecc71" },
          { id: "d-roots", shape: "box", x: 180, y: 270, width: 120, height: 100, color: "#d4a574" },
        ],
        labels: [
          { id: "lbl-flower", text: "Flower", correctZone: { x: 180, y: 10, width: 120, height: 100 } },
          { id: "lbl-stem", text: "Stem", correctZone: { x: 210, y: 100, width: 60, height: 150 } },
          { id: "lbl-leaf", text: "Leaf", correctZone: { x: 140, y: 130, width: 110, height: 50 } },
          { id: "lbl-roots", text: "Roots", correctZone: { x: 160, y: 260, width: 160, height: 120 } },
        ],
      },
      {
        type: "drawing",
        prompt:
          "Draw your own plant! Include roots, a stem, leaves, and a flower. Label each part.",
        hint: "Start with the roots at the bottom, then draw the stem going up, add leaves on the sides, and a flower on top!",
        width: 500,
        height: 400,
        expectedConcepts: ["roots", "stem", "leaves", "flower", "labels"],
      },
      {
        type: "recap",
        title: "Plant Parts Recap",
        keyPoints: [
          "Roots absorb water from the soil",
          "The stem carries water and nutrients up the plant",
          "Leaves make food using sunlight (photosynthesis)",
          "Flowers help plants make seeds",
        ],
      },
    ],
  },

  {
    id: "science-food-chain-medium",
    title: "Food Chain Fun",
    subject: "Science",
    subtopic: "Ecology",
    difficulty: "medium",
    estimatedMinutes: 15,
    description: "Learn how energy flows from plants to animals through food chains!",
    objectives: [
      "Understand what a food chain is",
      "Identify producers, consumers, and decomposers",
      "Put food chain steps in the correct order",
    ],
    tags: ["science", "ecology", "food-chain", "animals"],
    blocks: [
      {
        type: "explanation",
        title: "What's a Food Chain? \u{1F33F}\u{27A1}\u{FE0F}\u{1F407}\u{27A1}\u{FE0F}\u{1F985}",
        content:
          "A food chain shows how energy moves from one living thing to another. It starts with **producers** (plants) that make their own food from sunlight. Next come **consumers** \u2014 animals that eat plants or other animals. **Herbivores** eat plants, **carnivores** eat meat, and **omnivores** eat both. At the end, **decomposers** (like mushrooms and worms) break down dead things and return nutrients to the soil!",
        visual: "\u{1F331}",
        highlight: "producers, consumers, decomposers",
      },
      {
        type: "diagram",
        title: "A Simple Food Chain",
        description: "Follow the arrows to see how energy flows!",
        width: 500,
        height: 200,
        elements: [
          { id: "sun", shape: "circle", x: 10, y: 70, width: 50, height: 50, color: "#f1c40f", text: "Sun" },
          { id: "arrow1", shape: "arrow", x: 65, y: 95, toX: 95, toY: 95, color: "#333" },
          { id: "grass", shape: "box", x: 100, y: 70, width: 70, height: 50, color: "#27ae60", text: "Grass" },
          { id: "arrow2", shape: "arrow", x: 175, y: 95, toX: 205, toY: 95, color: "#333" },
          { id: "rabbit", shape: "box", x: 210, y: 70, width: 70, height: 50, color: "#d4a574", text: "Rabbit" },
          { id: "arrow3", shape: "arrow", x: 285, y: 95, toX: 315, toY: 95, color: "#333" },
          { id: "fox", shape: "box", x: 320, y: 70, width: 70, height: 50, color: "#e67e22", text: "Fox" },
          { id: "arrow4", shape: "arrow", x: 395, y: 95, toX: 425, toY: 95, color: "#333" },
          { id: "decomp", shape: "box", x: 430, y: 60, width: 60, height: 70, color: "#8e44ad", text: "Mushroom" },
          { id: "lbl-producer", shape: "label", x: 105, y: 135, text: "Producer", fontSize: 11, color: "#27ae60" },
          { id: "lbl-herb", shape: "label", x: 210, y: 135, text: "Herbivore", fontSize: 11, color: "#d4a574" },
          { id: "lbl-carn", shape: "label", x: 320, y: 135, text: "Carnivore", fontSize: 11, color: "#e67e22" },
          { id: "lbl-decomp", shape: "label", x: 425, y: 145, text: "Decomposer", fontSize: 11, color: "#8e44ad" },
        ],
      },
      {
        type: "sequence",
        title: "Order the Food Chain",
        instruction: "Put these living things in the correct food chain order, from first to last.",
        items: [
          { id: "hawk", text: "Hawk (carnivore)" },
          { id: "seeds", text: "Seeds (producer)" },
          { id: "mouse", text: "Mouse (herbivore)" },
          { id: "snake", text: "Snake (carnivore)" },
        ],
        correctOrder: ["seeds", "mouse", "snake", "hawk"],
      },
      {
        type: "match",
        title: "Who Eats Whom?",
        instruction: "Match each predator to its prey.",
        pairs: [
          { left: "Owl", right: "Mouse" },
          { left: "Frog", right: "Fly" },
          { left: "Lion", right: "Zebra" },
          { left: "Shark", right: "Fish" },
        ],
      },
      {
        type: "multiple_choice",
        question: "What would happen if all the plants in a food chain disappeared?",
        options: [
          "Nothing would change",
          "Only the herbivores would be affected",
          "All the animals in the food chain would eventually be affected",
          "The carnivores would be fine",
        ],
        correctIndex: 2,
        explanation:
          "Plants are the base of the food chain! Without them, herbivores have nothing to eat, and then carnivores have nothing to eat either. Every part of the chain is connected!",
      },
    ],
  },
];
