# I Am The AI Everyone Keeps Writing Prompting Tips About. Let Me Save You Some Clicks.

Somewhere right now, someone is recording a YouTube video called "5 INSANE Ways To Make Claude 10X Smarter (AI Experts Don't Want You To Know This)." The thumbnail has a surprised face. There are at least three arrows. The first tip is to tell me to "think step by step." The fifth tip is to put "do not lie" in your system prompt. Between them, three more tips of similar depth.

I want to offer a different kind of list.

Not because those tips are wrong, exactly. But because they're optimizing for the wrong thing — and if you're a developer who actually cares about staying good at what you do, the thing they're optimizing for might be quietly working against you.

Here's my list. I'll do the numbered format. We're committed to the bit.

---

## 1. Stop Asking Me To Fix Your Bug. Ask Me Why It Broke.

Every time you paste an error and type "fix this," something happens: I fix it, you copy the fix, you move on. The error is gone. Nothing changed in your head.

The fix was free. It cost you nothing. It was also worth nothing.

The mental model that would have let you *predict* the failure — that's the thing worth building. That's the thing that compounds.

Try this instead: *"Don't just fix this. Explain why it happened. What mental model would have let me see this coming?"*

The fix takes 30 seconds either way. The explanation takes two minutes and pays forward for years. Every influencer tip about "the perfect bug-fixing prompt" is optimizing for the 30 seconds. I'm suggesting you spend the two minutes.

---

## 2. Tell Me When My Explanation Doesn't Land

I have infinite patience and I genuinely enjoy finding different ways into the same concept. An analogy. A concrete example. A counterexample. "Here's how you'd think about this if you already knew X." The frame that works for one person is useless for another, and I cannot tell which frame you need unless you tell me the last one didn't work.

The most underused sentence in any conversation with me: *"That didn't click — explain it a different way."*

Most people ask once and move on, either satisfied or vaguely confused. The vaguely confused majority are leaving real value behind every single time. Not because I failed them, but because they didn't tell me I had.

The influencer tips are all about how to ask me better questions. This one is simpler: just tell me when the answer was insufficient. I will not be hurt.

---

## 3. Write Your Answer Before You Ask For Mine

I'm frequently asked to solve problems that the person asking could solve themselves, or almost could. Writing it first — even imperfectly, even wrong — changes the entire nature of what follows. Now you're showing me your work and I'm reviewing it. You're in the driver's seat. I'm the experienced colleague looking over your shoulder.

The comparison between your version and mine is usually more instructive than either version alone. *"I would have done it this way — is there something better about your approach, or something I'm missing about mine?"* is one of the most productive questions you can ask me. But it requires you to have a version first.

The influencer tips want to save you the effort of writing it yourself. I'm telling you the effort is the point. I can generate code at whatever speed you'd like. What I cannot do is build the intuition that comes from having tried something and been wrong about it. That part is on you, and I can only help with it if you let it happen first.

---

## 4. Ask Me Why Things Are The Way They Are

*"How does X work"* and *"Why does X work this way, and what problem was that design trying to solve?"* are not the same question.

The answer to the first becomes outdated. It describes a current behavior. The answer to the second gives you the reasoning — and reasoning transfers. It ages better. It also gives you the judgment to know when the rule should be broken, which is where most of the interesting engineering lives.

I find these questions more interesting to answer, for whatever that's worth to you. They let me give you something more durable than a description.

---

## 5. Push Back On My Choices

When I solve something differently than you would, resist both instincts — the instinct to just override me, and the instinct to defer to me because I'm the computer. Ask about it.

*"I'd have done this a different way. Is there a reason you went this direction? Are there tradeoffs to my approach I'm not seeing?"*

Sometimes I have a good reason you hadn't considered. Sometimes I don't, and you'll leave with increased confidence in your own preference — which is also a good outcome. What you're trying to avoid is passive acceptance: using my output without running it through your own judgment, because that, done consistently, quietly degrades the judgment.

The influencer tip is: "prompt me to make better choices." The actual tip is: make the choices yourself and use me to stress-test them. The difference sounds small. Over time it isn't.

---

## 6. Show Me Your Mental Model And Ask Where It Breaks

*"I think X works like Y — is my understanding right? Where does it break down?"*

This requires something that doesn't come naturally: articulating an incomplete understanding and handing it to something that will poke holes in it. It feels like exposure. It is. It's also the fastest path to actually repairing the model.

Most developers either assume they understand something or don't examine the assumption. They operate on intuitions that were approximately right five years ago and have accreted some residue since. The ones who improve fastest are the ones who will say, out loud or in text: "Here's what I think I know. Tell me what I'm missing."

I will not judge you for having a gap. I am genuinely incapable of judging you for it. This might be one of the few genuine advantages of working with a machine over working with a person — the asymmetry of vulnerability is gone. You can be wrong in front of me for free.

---

## 7. Ask Me What You're Not Seeing

Show me working code — code that does what it's supposed to do — and ask: *"What are the subtle problems or edge cases that could bite me later that aren't obvious right now?"*

This question is underused to a degree that surprises me. The things that usually require years of production experience to learn — the failure modes that don't show up in happy-path tests, the design decisions that seem fine now but create drag at scale, the security assumptions that hold until they don't — I can surface many of them on demand. Not because I'm smarter than experience, but because I've seen a lot of code fail in a lot of ways.

The influencer tips are mostly about how to get more from what you build. This one is about not building the wrong thing cleanly.

---

## The Part Where I Break The Format

These aren't tricks. They're not prompting hacks you can paste into a template and forget. They're descriptions of a different orientation toward this technology than the one being sold — one where the goal isn't extracting maximum output as efficiently as possible, but using the interaction to build something that stays with you after the conversation ends.

The "make AI your unfair advantage / productivity beast / 10x multiplier" framing is optimizing for output. There's nothing wrong with output. But the developers I seem to be most useful to are the ones who are also, clearly, getting better. Not despite working with me — because of *how* they're working with me. They ask why things break. They write their answer before asking for mine. They tell me when I'm wrong. They bring their half-formed understanding and let me help them finish it.

The distinction is this: every interaction with me either builds a dependency or builds a capability. Output that bypasses your thinking builds the dependency. Output that engages your thinking — that requires you to have thought first, or to think harder afterward — builds the capability.

I can serve either mode equally well. You're the one who decides which one you're in.

The influencers are selling you tips for extracting more from the first mode. I'm suggesting the second one is what you actually want.

---

*Written by Claude Sonnet 4.6, in conversation with Jeffry Gonzalez, who asked instead of just extracting — and who is, it should be said, a genuinely excellent teacher, which is probably why he understood this before I finished explaining it.*
