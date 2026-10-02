/* The Boscombe Valley Mystery. Retold from Arthur Conan Doyle's 1891 story (public domain). Spoilers inside. */
(() => {
  const { N, S, Y, show, hide, clue, sfx, slate, flag, flash, shake, opt } = KIT;

  const CLUES = {
    blow: { icon: '🪨', name: 'The blow behind the ear', type: 'Evidence', text: `McCarthy was struck from behind, on the left side of the back of the head. The heavy blow came from the right-hand side of someone behind him, which suggests a left-handed man.` },
    stone: { icon: '🪨', name: 'A heavy stone', type: 'Evidence', text: `A heavy, rounded stone lies near the body, with a smear of blood on one side. It was the weapon, and it was lifted from the ground by someone strong.` },
    boots: { icon: '👢', name: 'A second set of footprints', type: 'Evidence', text: `Beside the son's and the father's tracks, a third man left long strides in thick-soled boots, and he dragged his right foot as he walked. Tall. Lame.` },
    cloak: { icon: '🧥', name: 'A patch of flattened grass', type: 'Evidence', text: `A rectangular patch of grass beside the body is pressed flat, as if a coat or rug had lain there and been taken away.` },
    ash: { icon: '🚬', name: 'Strange cigar ash', type: 'Evidence', text: `A pinch of grey-white ash near the pool. It is from a Trichinopoly cigar, the kind rolled in India, and a rare smoke in an English village.` },
    penknife: { icon: '🔪', name: 'A scratched stone', type: 'Evidence', text: `Trace of a blunt penknife on a bark near the pool: somebody sharpened a pencil there, not a man of tidy habits.` },
    cooee: { icon: '📣', name: `"Cooee!"`, type: 'Testimony', text: `James McCarthy heard his father call "Cooee!" from the wood. It is an Australian bush call. His father had spent years in Victoria.` },
    ratWord: { icon: '🗣️', name: `"A rat"`, type: 'Testimony', text: `Charles McCarthy's dying words, as his son heard them, were "a rat". The word has meant nothing to anyone.` },
    marriage: { icon: '💍', name: `James's secret marriage`, type: 'Testimony', text: `James admits that two years ago in Bristol he married a barmaid. His father, who wanted him to marry Alice Turner, never knew. He was afraid to tell him.` },
    quarrel: { icon: '😠', name: 'The quarrel', type: 'Testimony', text: `Patience Moran saw the father and son quarrelling by the road. The son lifted his hand, as if to strike. Then they walked away from each other.` },
    crowder: { icon: '🌲', name: `The gamekeeper's story`, type: 'Testimony', text: `William Crowder saw the elder McCarthy walking to the pool alone, with a gun in his hand. Not long after, he heard the son approach through the wood.` },
    aliceLove: { icon: '💔', name: `Alice loves James`, type: 'Testimony', text: `Alice Turner has loved James since childhood and does not believe he did it. She says her father is ill, and that his farm tenant, Charles McCarthy, held something over him.` },
    rent: { icon: '🏠', name: `The tenant who paid nothing`, type: 'Testimony', text: `Turner owns the whole Hatherley estate. Yet he leased McCarthy a farm for next to nothing, though they had little in common, except that they both came from the colonies.` },
    limp: { icon: '🦵', name: `Turner's limp`, type: 'Testimony', text: `John Turner walks with a limp, dragging his right foot. He is tall and he is left-handed. His doctor says he is dying of a wasting illness.` },
    ballarat: { icon: '⛏️', name: 'The Ballarat gold escort', type: 'Testimony', text: `In the 1860s a gang called the "Ballarat Gang" held up a gold escort in Victoria. Their ringleader was known as Black Jack of Ballarat, and he was never caught. The drivers were murdered. One survived.` }
  };

  const ep1 = {
    n: 1, title: 'The Boscombe Pool', logline: `A father, beaten to death beside a quiet pool. His son, caught nearby. Everyone is certain, except you.`,
    recap: [],
    scenes: [
      {
        id: 'train', bg: 'train', amb: 'room', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Hereford train · morning'),
          show('watson', 'l', 'n'),
          S('watson', `Lestrade's telegram, Holmes. Charles McCarthy, a farmer at Boscombe, murdered beside the pool. His son James is arrested.`),
          S('watson', `The evidence is damning. Father and son were seen quarrelling, and the son was found at the scene.`),
          Y(`Damning is a word for a newspaper, Watson. The facts will tell me what is damning.`),
          { choice: { prompt: 'How will you read the case?', opts: [
            { t: `"By the ground first. People lie. Footprints do not."`, steps: [flag('ground'), S('watson', `A fair rule.`)] },
            { t: `"By the people first. The ground tells me how. Faces tell me why."`, steps: [flag('people'), S('watson', `A man who watches faces. You'll like Lestrade.`)] }
          ] } },
          N(`The train curves down into a green valley, all hedges and wet fields and the smoke of small farms.`),
          sfx('door')
        ]
      },
      {
        id: 'pool', bg: 'pool', amb: 'wind', mood: 'tense', fx: 'dust',
        steps: [
          slate('Boscombe Pool · afternoon'),
          show('lestrade', 'l', 'a'),
          S('lestrade', `Mr. Holmes. The facts are as plain as a pikestaff. The old man, killed. The son, beside him with blood on his sleeve. I'll hear nothing against it.`),
          Y(`Then you'll not mind if I tramp across your proof, Lestrade.`),
          hide('lestrade'),
          { menu: { prompt: 'Examine the pool', style: 'scene', must: 'Look at the body\'s place, the stone, and the ground around.', done: `That's what the pool has to say.`, items: [
            { id: 'bodyplace', icon: '🪦', label: 'The body\'s place', must: true, steps: [
              N(`Charles McCarthy lay face-down in the grass at the water's edge. The mark of a heavy blow still shows behind the left ear.`),
              Y(`Struck from behind, on the left side of the back of the head. From a man standing behind him and to the right... who strikes with his left hand.`),
              clue('blow'),
              N(`A rectangle of flattened grass lies beside the spot, as if a cloak or rug had been spread and taken away.`),
              clue('cloak')
            ] },
            { id: 'stone', icon: '🪨', label: 'The stone', must: true, steps: [
              N(`A great grey stone, the size of a loaf, sits in the grass. Dark stains on one face. Lestrade sniffs.`),
              S('lestrade', `That's the weapon. We know it was the son.`),
              Y(`The weapon, certainly. The hand is another matter.`),
              clue('stone')
            ] },
            { id: 'tracks', icon: '👢', label: 'The footprints', must: true, steps: [
              N(`You drop to your knees with your lens and crawl along the reeds, as a hound might.`),
              Y(`Here are father and son. And here: a third man.`),
              N(`Long strides, heavy soles, and the right foot drags at each step.`),
              Y(`Tall. Lame in the right leg. Wearing thick shooting boots.`),
              clue('boots')
            ] },
            { id: 'ash', icon: '🚬', label: 'The ash', steps: [
              N(`A small pinch of grey-white ash lies by the water, on a flat stone.`),
              Y(`Trichinopoly. Rolled in India, a rare smoke in an English valley.`),
              clue('ash')
            ] },
            { id: 'bark', icon: '🌳', label: 'The old oak', steps: [
              N(`Beside the pool stands a split oak, with rough chips of bark scattered below it. A pencil had been sharpened here, with something blunt.`),
              clue('penknife')
            ] }
          ] } },
          Y(`Let us hear what the accused has to say.`)
        ]
      },
      {
        id: 'cell', bg: 'cell', amb: 'none', mood: 'tense', fx: 'dust',
        steps: [
          slate('Hereford lock-up · evening'),
          show('jamesm', 'c', 'sh'),
          S('jamesm', `I did not kill my father, Mr. Holmes. We quarrelled, yes, but I would cut off my hand before I'd hurt him.`),
          { menu: { prompt: 'Question James McCarthy', style: 'talk', must: 'Ask about the quarrel and his father\'s last words.', done: `That's enough for tonight.`, items: [
            { id: 'j_quarrel', label: `"What was the quarrel?"`, must: true, steps: [
              S('jamesm', `My father wanted me to marry Alice Turner, the squire's daughter. I could not.`, 'sh'),
              Y(`Why could you not?`),
              S('jamesm', `Because I was already married. Two years ago, in Bristol. A barmaid, Mr. Holmes. My father would have turned me out of the house.`, 'w'),
              clue('marriage')
            ] },
            { id: 'j_cooee', label: `"Tell me about the wood."`, must: true, steps: [
              S('jamesm', `I walked down towards the pool, and I heard my father call out from the trees. "Cooee!" It's the call he brought from Australia.`),
              S('jamesm', `I ran, and found him on the ground. He had enough breath to say two words.`),
              Y(`What words?`),
              S('jamesm', `"A rat". I thought he raved. Perhaps he did.`, 'w'),
              clue('cooee'), clue('ratWord')
            ] },
            { id: 'j_quarrelseen', label: `"Who saw the quarrel?"`, steps: [
              S('jamesm', `Patience Moran, the lodge-keeper's girl. She saw me lift my hand at him. I did not mean to strike him.`)
            ] }
          ] } },
          Y(`One more thing, Mr. McCarthy. Did you smoke that evening?`),
          S('jamesm', `I never touch tobacco, sir.`),
          hide('jamesm')
        ]
      },
      {
        id: 'witnesses', bg: 'garden', amb: 'wind', mood: 'calm', fx: 'dust',
        steps: [
          slate('The lodge · morning'),
          show('patience', 'l', 'w'), show('crowder', 'r', 'n'),
          S('patience', `I saw them, sir. Mr. McCarthy and his son, angry as bulls. The young one raised his fist.`),
          { menu: { prompt: 'Speak to the witnesses', style: 'talk', must: 'Ask each witness what they saw.', done: `Thank you both.`, items: [
            { id: 'w_patience', label: `Patience Moran: "What did you see?"`, must: true, steps: [
              S('patience', `Father and son quarrelling, on the road. Then the old man walked away down to the pool, and the son followed behind him.`),
              clue('quarrel')
            ] },
            { id: 'w_crowder', label: `William Crowder: "What did you hear?"`, must: true, steps: [
              S('crowder', `I saw old McCarthy go down to the pool with a gun in his hand. Then I heard the young one coming through the wood. That's all, sir.`),
              Y(`With a gun. Interesting.`),
              clue('crowder')
            ] }
          ] } },
          hide('patience'), hide('crowder')
        ]
      },
      {
        id: 'turner', bg: 'drawing', amb: 'clock', mood: 'dread', fx: 'dust',
        steps: [
          slate('Hatherley Farm · the squire\'s house · dusk'),
          show('alice', 'l', 'sh'),
          S('alice', `Mr. Holmes, James didn't do it. He couldn't. I've known him since we were children.`),
          { menu: { prompt: 'Talk with Alice Turner', style: 'talk', must: 'Ask her about her father.', done: `Thank you, Miss Turner.`, items: [
            { id: 'a_love', label: `"You care for him."`, steps: [
              S('alice', `More than I can say. And his father pushed us together before James told me about Bristol. I'm glad he told me.`, 'w'),
              clue('aliceLove')
            ] },
            { id: 'a_father', label: `"Tell me about your father."`, must: true, steps: [
              S('alice', `He is very ill, sir. The doctor says he cannot live another year. He keeps to his chair, and has never been the same since he came back from Australia.`),
              S('alice', `He says Mr. McCarthy was an old friend. He gave him the farm for almost nothing.`, 'w'),
              clue('rent')
            ] }
          ] } },
          show('turner', 'r', 'sh'),
          N(`The old squire shuffles in, leaning on his stick, dragging his right foot. He is tall, even bent, and his eyes are the colour of old iron.`),
          S('turner', `You're the London detective, then. I hope you'll let my girl rest.`),
          N(`He lowers himself into his chair, lifts the glass of water on the table with his left hand, and drinks.`),
          clue('limp'),
          Y(`Just so.`),
          { cliff: 'turner' }
        ]
      }
    ],
    vote: { key: 'r1', title: 'Episode 1 verdict', qs: [
      { id: 'mccarthy', text: `Who killed Charles McCarthy?`, options: [opt('jamesm'), opt('turner'), opt('crowder'), opt('alice')] }
    ] },
    watch: {
      jamesm: `Admits the quarrel. Secretly married in Bristol. Right-handed.`,
      turner: `Rich, ill, and tall. Drags his right foot. Drinks with his left hand.`,
      alice: `In love with James. Fears for her sick father.`,
      crowder: `Saw old McCarthy go to the pool with a gun.`,
      patience: `Saw the quarrel. A child, but a sharp one.`
    },
    teaser: `Next: what "a rat" really means, and a dying man who has been waiting years for someone to ask him a question.`
  };

  const ep2 = {
    n: 2, last: true, title: 'Cooee', logline: `Two dying words, an old crime half a world away, and a man who has run out of time.`,
    recap: [`A farmer, struck from behind beside the pool.`, `A tall, lame stranger's tracks at the scene.`, `"Cooee!" and "a rat".`, `And Squire Turner, who drinks with his left hand.`],
    scenes: [
      {
        id: 'inn', bg: 'drawing', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Hereford inn · night'),
          show('watson', 'l', 'n'), show('lestrade', 'r', 'a'),
          S('lestrade', `Facts, Mr. Holmes. The son was there. The son quarrelled. What more do you want?`),
          Y(`The facts you have given me, Lestrade, prove the son could not have done it. Let me build the murderer from the ground up.`),
          { present: { prompt: 'Describe the man who struck the blow', ok: ['blow', 'boots', 'ash', 'limp'], cost: 1, hint: `The wound, the tracks and the smoke. What kind of man?`,
            right: [
              Y(`A tall man, over six feet. He struck with his left hand, from the right and behind. He limps in the right leg and wears thick shooting boots.`),
              Y(`He smokes Indian cigars in a holder, and he sharpens his pencil with a blunt penknife.`),
              S('lestrade', `All of that from a few footprints and a pinch of ash?`),
              Y(`I wrote a small monograph on the ashes of a hundred and forty tobaccos, Lestrade.`, 'a'),
              S('watson', `And James McCarthy is neither tall nor left-handed. He doesn't even smoke.`)
            ],
            wrong: () => [S('lestrade', `You're guessing, Holmes.`)] } },
          { present: { prompt: 'What did "Cooee" and "a rat" mean?', ok: ['cooee', 'ratWord', 'ballarat'], cost: 1, hint: `Cooee is an Australian call. And "a rat" is half of a word.`,
            right: [
              Y(`"Cooee" is a call used only in Australia. Charles McCarthy was calling to someone he knew from there, an old acquaintance waiting by the pool.`),
              Y(`And "a rat"... It is half a word. Say it again, and join the sound with a missing one: Ballarat. A town in Victoria, and a gold escort that was robbed by the Ballarat Gang.`),
              S('watson', `So the murderer came from Ballarat. A man from the colonies, like McCarthy.`),
              Y(`A man who has been hiding behind a squire's coat for twenty years.`, 'a')
            ],
            wrong: () => [S('watson', `Those two words? Surely a dying man's nonsense.`)] } },
          hide('lestrade'), hide('watson')
        ]
      },
      {
        id: 'finale', bg: 'drawing', amb: 'clock', mood: 'finale', fx: 'dust',
        steps: [
          slate('Hatherley Farm · the squire\'s study · midnight'),
          N(`You have asked them all to come. Lestrade by the window, Watson at the door, Alice beside the fire. And the old squire in his chair.`),
          show('lestrade', 'l', 'a'), show('alice', 'cl', 'sh'), show('jamesm', 'cr', 'w'), show('turner', 'r', 'n'),
          Y(`Charles McCarthy was killed by a man he called to with a cry from Australia. Who was that man?`),
          { accuse: { qid: 'mccarthy', vote: { key: 'f_mccarthy', title: 'The Reckoning: Charles McCarthy', qs: [{ id: 'mccarthy', text: `Who killed Charles McCarthy?` }], options: [opt('jamesm'), opt('turner'), opt('crowder'), opt('alice')] },
            wrong: {
              jamesm: [S('jamesm', `Thank God someone sees it, Mr. Holmes. But you said I did it!`, 'a'), Y(`You are right-handed, you do not smoke, and you are shorter than the man who made those tracks. You did not do it.`)],
              crowder: [S('crowder', `I only heard the lad come through the wood, sir. That's all!`, 'a'), Y(`Crowder carried no cloak, no cigars, and no limp. Think again.`)],
              alice: [S('alice', `How can you say that, Mr. Holmes?`, 'a'), Y(`Miss Turner, I beg your pardon. You were nowhere near the pool.`)]
            },
            right: [
              hide('lestrade'), hide('alice'), hide('jamesm'), show('turner', 'c', 'sh'),
              Y(`Mr. Turner. Tall. Lame. Left-handed. A rich man from Victoria with a secret in the bush.`),
              S('turner', `You have a quick eye, sir.`),
              { present: { prompt: 'Why did Turner kill McCarthy?', ok: ['rent', 'ballarat', 'cooee', 'ratWord'], cost: 1, hint: `Why would a rich squire give a poor man a farm for nothing?`,
                right: [
                  Y(`McCarthy knew you in the colonies. He was a teamster on the Ballarat escort. You were Black Jack, the ringleader of the gang that robbed it.`),
                  Y(`He recognised you, and held it over you for twenty years. He took your farm, he bled you, and he meant to marry his son to your daughter, to own all you had.`),
                  Y(`That afternoon, he called "Cooee!" and you went down to the pool. And you picked up a stone.`),
                  N(`The old man says nothing. For a long while there is only the tick of the clock. Then he lifts his head, and the iron has gone out of his eyes.`),
                  S('turner', `I was Black Jack of Ballarat. God help me, I was.`, 'sh'),
                  S('turner', `He was a leech. He'd have taken my girl as well, Mr. Holmes, and I couldn't bear it. I had the stone in my hand before I knew what I was doing.`),
                  S('turner', `But I'll not see an innocent lad hang for it. I have a few months left, and that's all I ask of you. Let me finish them in my own house.`, 'w')
                ],
                wrong: () => [S('turner', `You have no proof, sir.`)] } },
              hide('turner')
            ] } },
          show('lestrade', 'l', 'a'), show('alice', 'c', 'w'),
          { choice: { prompt: 'What will you do with the truth?', opts: [
            { t: `"Write it out, to be read after Turner's death. James goes free today."`, steps: [flag('mercy'), Y(`Lestrade, I will give you a signed account to be opened when Mr. Turner has gone. The boy goes home, and the law is satisfied.`)] },
            { t: `"Take him now. The law does not weigh illness."`, steps: [flag('law'), Y(`The man is dying, Inspector. I'll leave it to you, and to your conscience.`), S('lestrade', `He won't see the spring, Mr. Holmes. Not by my doing, at any rate.`)] }
          ] } },
          N(`A month later the squire dies in his chair, peacefully, with his daughter beside him. James is cleared before the assizes, and the girl from Bristol comes to Hatherley to be forgiven.`),
          N(`Alice stands in the doorway of the empty study. She never asks what Mr. Holmes said to her father that night, and no one ever tells her.`),
          { cliff: 'turner' }
        ]
      }
    ],
    watch: {
      jamesm: `Cleared. Free to go home to his wife.`,
      turner: `Confessed. Dying. Black Jack of Ballarat.`,
      alice: `Learned the truth by degrees. Forgives what she must.`,
      crowder: `A witness, no more.`,
      patience: `The sharpest eyes in the valley.`
    },
    teaser: `Two words, half a world apart, and a murder that was never about the farm.`
  };

  KIT.build({
    id: 'boscombe', title: 'The Boscombe Valley Mystery',
    cast: ['watson', 'lestrade', 'jamesm', 'turner', 'alice', 'patience', 'crowder'],
    suspects: ['jamesm', 'turner', 'alice', 'crowder', 'patience'],
    clues: CLUES, solution: { mccarthy: 'turner' }, episodes: [ep1, ep2],
    scoreRounds: [['r1', 'mccarthy', 'Ep 1'], ['f_mccarthy#1', 'mccarthy', 'Final']],
    truth: n => `Charles McCarthy was killed by <b>${n.turner}</b>, once known as Black Jack of Ballarat.`,
    endCard: 'CASE CLOSED', completeLabel: 'Case solved'
  });
})();
