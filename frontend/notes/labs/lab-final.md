# Final Lab

For the final lab, you can choose to do any of the following:

- Pomodoro
  - The "_I am new and repitition would be helpful so I can start to get the mental model_" lab.
  - You can redo the pomodoro lab. Create a new area called `pomodoro-final` and adjust the instructions approppriately.
- Text Analyzer Lab
  - The "_I'm doing pretty good, but want more practice with signals, computed, etc._" lab.
- Todo-Mvc
  - The "_I'm doing pretty good, but I want more practice with the Signal Store_" lab.
- Books
  - The "_I'm doing great, and want to experiment with API interactions_" lab.

- Other stuff, extra credit?
  - Create a form that allows a catalog item to be added to a vendor.

## Instructions

I'll share the repository URL in class. Once you have it:

### 1. Fork the repo

Using the [GitHub CLI](https://cli.github.com):

```bash
gh repo fork https://github.com/JeffryGonzalez/applied-angular-may-2026 --clone=false
```

> If you've never used `gh` before, run `gh auth login` first.

### 2. Clone your fork

We'll all work out of the same directory so the paths in any pair-programming or screen-sharing match up:

```bash
mkdir -p ~/student/class/lab
cd ~/student/class/lab
gh repo clone <your-github-username>/applied-angular-may-2026
cd applied-angular-may-2026/frontend
```

### 3. Create a branch named after you

```bash
git checkout -b <yourname>
```

Use whatever form of your name is recognizable — `jane-doe`, `jdoe`, etc. One branch per student.

### 4. Install dependencies

```bash
npm ci
```

`npm ci` (not `npm install`) — it installs exactly what's in `package-lock.json` and is faster for a fresh clone.

### 5. Pick a lab and work through it

Pick one of the four labs above. The lab files are in this `notes/labs` directory.

### 6. Commit often

Small, frequent commits beat one giant end-of-day commit. After each meaningful step (a sprint finished, a test passing, a component working), commit:

```bash
git add .
git commit -m "short message describing what you just did"
```

If you get stuck or break something, frequent commits make it easy to back up to a known-good state.

### 7. Push and open a PR at the end of the day

```bash
git push -u origin <your-name>
gh pr create --fill
```

`--fill` uses your branch name and commit messages to populate the title and body — edit them if you want. The PR opens against the upstream repo. I'll review them after class.
