# 🧠 Bright Minds

**An age-adaptive learning app for children with Down syndrome, ages 4–10**

Bright Minds grows with your child. Pick your age range at the start and get learning content that's perfectly matched — from counting apples at age 4 to logic puzzles and world geography at age 10.

---

## 🎯 Age Tiers

| Tier | Ages | Name | Worlds |
|------|------|------|--------|
| 🌱 | 4–5 | Little Explorer | Numbers, Colors, Feelings, Animals, Shapes, Friends |
| 🚀 | 6–7 | Rising Star | Reading & Letters, Maths, Feelings, Animals, Science, Friends |
| ⚡ | 8–10 | Super Thinker | Reading & Words, Maths, Science, World & People, Logic, Life Skills |

**144 total questions** — 3 tiers × 6 worlds × 8 questions, all shuffled each session.

---

## ✨ Features

- **Age picker on launch** — 3 tiers with different visuals, vocabulary, and difficulty
- **Full theme change per tier** — warm/bubbly (4–5), energetic/teal (6–7), sharp/blue (8–10)
- **Child Mode** — child plays independently, large buttons, confetti rewards
- **Guide Mode** — a tip for the caregiver/teacher on every single question
- **Streak tracking** — 🔥 fire streak appears after 3 correct in a row
- **Star ratings per world** — best score saved in browser, shown on home screen
- **No login, no ads, no data sent anywhere** — fully private, works offline

---

## 🚀 Live App

```
https://YOUR-USERNAME.github.io/bright-minds/
```

---

## 🏃 Run Locally

```bash
git clone https://github.com/YOUR-USERNAME/bright-minds.git
cd bright-minds
open index.html   # macOS
# or just double-click index.html on Windows
```

No build step needed — pure HTML, CSS, and JavaScript.

---

## 📁 File Structure

```
bright-minds/
├── index.html              # App shell — all screens
├── css/
│   └── style.css           # Age-adaptive theming + all layouts
├── js/
│   ├── data.js             # All 144 questions across 3 tiers
│   └── app.js              # Game logic, scoring, streaks
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploys to GitHub Pages on push
└── README.md
```

---

## 🧩 Adding Questions

Open `js/data.js` and add to any world's `questions` array:

```js
{
  icon: '🦊',
  text: 'What sound does a fox make?',
  sub: 'Think of the forest!',
  choices: [
    { e: '🐕', l: 'Woof' },
    { e: '🦊', l: 'Screech!' },
    { e: '😺', l: 'Meow' },
    { e: '🐄', l: 'Moo' },
  ],
  answer: '🦊',
  praise: 'Foxes screech — what a sound! 🦊',
  tip: 'Play a fox sound on YouTube! Foxes are clever animals.',
},
```

---

## ♿ Inclusive Design Principles

- No time pressure anywhere
- Large tap targets (minimum 84px height on buttons)
- Positive reinforcement only — encouraging messages for wrong answers too
- Questions shuffled every session — fresh each time
- High contrast, clear Baloo 2 + Nunito fonts
- Keyboard accessible (Tab + Enter navigation)
- Streak & score to motivate without punishing

---

## 📜 License

MIT — free to use, adapt, and share for educational purposes.

---
