/* The Crooked Man. Retold from Arthur Conan Doyle's 1893 story (public domain). Spoilers inside. */
(() => {
  const { N, S, Y, show, hide, clue, sfx, slate, flag, flash, shake, opt } = KIT;

  const CLUES = {
    door: { icon: '🔒', name: 'The locked door', type: 'Evidence', text: `The morning-room door was locked from the inside. When the servants forced it, the key was not in the lock, and it was not in the room.` },
    window: { icon: '🪟', name: 'The French window', type: 'Evidence', text: `The French window onto the lawn is bolted again, but the catch is bent, and a light has been trodden into the soft earth outside. Someone left that way, and someone shut it behind them.` },
    fender: { icon: '🔥', name: 'The blood on the fender', type: 'Evidence', text: `The Colonel lay on the hearthrug with a deep wound on the back of his head, and a smear of blood on the corner of the brass fender. The wound fits the corner exactly. There was no weapon, and no second blow.` },
    face: { icon: '😨', name: `The Colonel's face`, type: 'Evidence', text: `Colonel Barclay's face was twisted into a look of dreadful fear and surprise, as if he had seen something terrible, not as if he had been struck.` },
    paws: { icon: '🐾', name: 'Small paw prints', type: 'Evidence', text: `On the curtain, the sill and the carpet: small, rounded prints, five toes, neat as a child's hand. Not a dog's. Not a cat's. Something quick and clever, that climbs.` },
    club: { icon: '🪵', name: 'A carved club', type: 'Evidence', text: `A heavy carved club hangs among the Colonel's Indian curios, but one peg is empty. A club was taken down. It lies on the carpet, clean. It was never used.` },
    ticket: { icon: '🎫', name: 'A street-performer\'s licence', type: 'Evidence', text: `In the gutter near the barracks, a damp licence issued to "H. Wood, entertainer, with trained animal". The name means nothing to the police.` },
    bible: { icon: '📖', name: 'Nancy\'s Bible', type: 'Evidence', text: `Mrs. Barclay's Bible, found open at the Second Book of Samuel: the story of King David, who sent Uriah the Hittite to the front of the battle so that he might be killed, and took his wife.` },
    cry: { icon: '🗣️', name: `"You coward!"`, type: 'Testimony', text: `The coachman heard Mrs. Barclay cry out: "You coward! You have broken my heart! David!" Then the Colonel's voice, then a heavy fall.` },
    guild: { icon: '⛪', name: 'The crooked man', type: 'Testimony', text: `Miss Morrison: walking home from church, she and Mrs. Barclay met a dreadfully crooked old man who carried a box. Mrs. Barclay cried out, went white, and spoke to him alone for a moment.` },
    davidName: { icon: '👑', name: `Who is "David"?`, type: 'Testimony', text: `Nancy called out "David!" in her last words to her husband. His name is James. Only the Bible's David betrayed a loyal soldier and stole his wife.` },
    regiment: { icon: '🎖️', name: 'The Mutiny at Bhurtee', type: 'Testimony', text: `Major Murphy: in the Indian Mutiny the old Royal Munsters were besieged at Bhurtee. Barclay, Murphy, and Sergeant Henry Wood were the men picked to carry a message through the rebel lines. One of them did not come back.` },
    betrayal: { icon: '⚔️', name: 'Barclay sold out Wood', type: 'Testimony', text: `Murphy admits what he knew: Barclay, in love with the sergeant's sweetheart, led Wood into a rebel ambush. Wood was taken, tortured, and left a cripple. Barclay came home a hero and married Nancy Devoy.` },
    nancyLove: { icon: '💔', name: 'Nancy and Wood', type: 'Testimony', text: `Nancy Devoy was Henry Wood's sweetheart. She believed him dead for thirty years. When she married Barclay, she thought she was a widow.` },
    pet: { icon: '🦡', name: `Wood's companion`, type: 'Testimony', text: `Henry Wood keeps a small, quick creature in a box: a mongoose he trained in India, called Teddy, for killing snakes. He earns his bread showing it in the streets.` },
    morrisonSaw: { icon: '👀', name: `Miss Morrison's fear`, type: 'Testimony', text: `Miss Morrison saw Mrs. Barclay speak to the crooked man, and says she was frightened for her friend. She says Mrs. Barclay later quarrelled with her husband in the morning room.` }
  };

  const ep1 = {
    n: 1, title: 'A Locked Room', logline: `A colonel dead behind a locked door, a wife who calls him by the wrong name, and a trail of tiny footprints.`,
    recap: [],
    scenes: [
      {
        id: 'train', bg: 'train', amb: 'room', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Aldershot train · after supper'),
          show('watson', 'l', 'n'),
          S('watson', `Holmes, you should hear this. At Aldershot, Colonel James Barclay of the Royal Munsters has been found dead in his own morning room. The door was locked, and his wife was beside him, unconscious.`),
          S('watson', `The servants heard a quarrel. Mrs. Barclay was heard calling him by another name. "David".`),
          Y(`A husband called James, addressed as David. That is worth a train ticket.`),
          { choice: { prompt: 'What do you say to Watson?', opts: [
            { t: `"A locked door only means someone had a reason not to be disturbed."`, steps: [flag('reason'), S('watson', `Or someone with a key.`)] },
            { t: `"Wives do not generally shout a stranger's name at their husbands."`, steps: [flag('name'), S('watson', `You think David is a person, then.`)] }
          ] } },
          N(`The train slows. Lamps appear in the dark: the long low barracks of Aldershot, and a quiet street of red-brick villas where one house has every window lit.`),
          sfx('door')
        ]
      },
      {
        id: 'room', bg: 'drawing', amb: 'clock', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Barclays\' villa · the morning room · midnight'),
          N(`The Colonel has been carried upstairs. The room is as it was found: the hearthrug disordered, a chair overturned, the curtains half drawn.`),
          { menu: { prompt: 'Examine the morning room', style: 'scene', must: 'Look at the door, the fender and the window before you go.', done: `The room has told me what it can.`, items: [
            { id: 'door', icon: '🔒', label: 'The door', must: true, steps: [
              N(`The lock is broken where the servants forced it, but the key is nowhere in the room. You search the carpet, the hearth, the Colonel's pockets.`),
              Y(`Locked from the inside, with no key. Somebody left, and took it with them.`),
              clue('door')
            ] },
            { id: 'fender', icon: '🔥', label: 'The fender', must: true, steps: [
              N(`A smear of blood lies on the corner of the brass fender, exactly where the wound on the back of the Colonel's head would reach.`),
              Y(`One wound, no weapon. The corner of the fender matches it exactly. He fell, or was pushed.`),
              clue('fender'),
              N(`Beside the hearth lies a heavy carved club, from the Colonel's wall of Indian curios. It is clean.`),
              clue('club')
            ] },
            { id: 'window', icon: '🪟', label: 'The French window', must: true, steps: [
              N(`The French window is closed and bolted, but the catch is bent. Outside, the lawn is soft with dew.`),
              Y(`Footprints. A man's boot, small, with a limp. Turned wrongly.`),
              Y(`Bolted again from the outside, I should think, by someone who knew how.`),
              clue('window')
            ] },
            { id: 'prints', icon: '🐾', label: 'The curtains and the carpet', steps: [
              N(`A line of tiny prints runs up the curtain, along the sill and across the floor. Rounded, with five toes.`),
              Y(`Not a dog, not a cat. A climbing animal, as neat as a child's hand.`),
              clue('paws')
            ] },
            { id: 'face', icon: '😨', label: `The Colonel's face`, steps: [
              show('watson', 'c', 'n'),
              S('watson', `I examined him when they carried him up. I have seen faces like that after an explosion, never after a quarrel.`),
              Y(`Fear, Watson. Not pain.`),
              clue('face'), hide('watson')
            ] }
          ] } },
          Y(`Let us hear what the household heard.`)
        ]
      },
      {
        id: 'servants', bg: 'stable', amb: 'wind', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Barclays\' stables · early morning'),
          show('morrison', 'l', 'w'),
          S('morrison', `Mr. Holmes, I was with her all evening. She was perfectly happy. They were a devoted couple.`),
          { menu: { prompt: 'Question Miss Morrison', style: 'talk', must: 'Ask what happened on the walk home.', done: `Thank you, Miss Morrison.`, items: [
            { id: 'm_walk', label: `"What happened on the walk home?"`, must: true, steps: [
              S('morrison', `We met a dreadful old man in the street, bent double, with a box on his back. Nancy cried out when she saw his face. She said she must speak to him.`),
              Y(`Did you hear them?`),
              S('morrison', `Only that she knew him, sir. She sent me on ahead. I was frightened for her.`, 'w'),
              clue('guild'), clue('morrisonSaw')
            ] },
            { id: 'm_after', label: `"And at home?"`, steps: [
              S('morrison', `The Colonel went into the morning room with his wife. I heard raised voices, and then Nancy cried a name.`),
              S('morrison', `"David". Over and over. And "coward".`, 'sh')
            ] }
          ] } },
          hide('morrison'),
          N(`The coachman, a thick-necked man with a worried face, is mending a harness in the yard.`),
          S('watson', `He heard the whole business.`),
          Y(`Tell me exactly what you heard.`),
          N(`The coachman puts down his needle.`),
          Y(`From the beginning.`),
          N(`"I was in the yard, sir. I heard Mrs. Barclay scream out: 'You coward! You have broken my heart! David!' Then the Colonel's voice, a cry, and a heavy fall."`),
          clue('cry'),
          Y(`And then?`),
          N(`"Nothing, sir. Then she screamed again, and I ran."`)
        ]
      },
      {
        id: 'nancy', bg: 'bedroom', amb: 'clock', mood: 'dread', fx: 'dust',
        steps: [
          slate('Mrs. Barclay\'s room · the next morning'),
          show('nancy', 'c', 'sh'),
          N(`Nancy Barclay lies pale among the pillows, with a doctor beside her. She stares at the ceiling and whispers a single word.`),
          S('nancy', `David... David... Oh, how could you?`, 'sh'),
          Y(`Mrs. Barclay, who is David?`),
          S('nancy', `I cannot. Please. I cannot.`, 'sh'),
          { menu: { prompt: 'Look about the room', style: 'scene', must: 'Look at her Bible.', done: `I have what I need.`, items: [
            { id: 'bible', icon: '📖', label: 'The Bible by the bed', must: true, steps: [
              N(`A worn black Bible lies on the bedside table, open and face-down.`),
              Y(`The Second Book of Samuel. King David and Uriah the Hittite.`),
              Y(`David sent Uriah to the front of the battle so that he would be killed, then took his wife.`),
              clue('bible')
            ] },
            { id: 'letters', icon: '✉️', label: 'The writing desk', steps: [
              N(`A bundle of old letters, tied with a faded ribbon, in a hand that is not the Colonel's.`),
              S('watson', `Love letters. Thirty years old, from a "H." Signed only with a letter.`),
              Y(`She kept them all her married life.`)
            ] }
          ] } },
          hide('nancy')
        ]
      },
      {
        id: 'street', bg: 'garden', amb: 'wind', mood: 'dread', fx: 'dust',
        steps: [
          slate('A back street near the barracks · dusk'),
          show('watson', 'l', 'n'),
          S('watson', `Holmes, the gutter. A damp piece of paper.`),
          N(`You lift it with your tweezers: a street-performer's licence. "H. Wood, entertainer, with trained animal".`),
          clue('ticket'),
          Y(`A man who earns his living with an animal. And an animal that climbs curtains.`),
          N(`A bent figure shuffles out of an alley at the far end of the street, carrying a wooden box on his back. His body is twisted like a root, and as he passes under the lamp you see his eyes: fierce, old, and entirely unafraid.`),
          show('wood', 'r', 'n'),
          S('wood', `You will be looking for me, gentlemen.`),
          { cliff: 'wood' }
        ]
      }
    ],
    vote: { key: 'r1', title: 'Episode 1 verdict', qs: [
      { id: 'barclay', text: `Who killed Colonel Barclay?`, options: [opt('nancy'), opt('murphy'), opt('wood'), opt('morrison'), { id: 'none', label: 'No one. It was not murder.' }] },
      { id: 'david', text: `Who is "David"?`, options: [{ id: 'barclay', label: 'The Colonel himself' }, opt('wood'), opt('murphy'), { id: 'unknown', label: 'Someone we have not met' }] }
    ] },
    watch: {
      nancy: `Faints at the sight of a stranger. Calls her husband "David".`,
      morrison: `Her friend's shadow. Frightened, and holding something back.`,
      murphy: `The Colonel's old comrade. Not yet questioned.`,
      wood: `A bent old man with a box, a licence and a trained animal.`
    },
    teaser: `Next: an old war, a message that never arrived, and a man who has waited thirty years to say one sentence.`
  };

  const ep2 = {
    n: 2, last: true, title: 'David and Uriah', logline: `A soldier's betrayal, thirty years old, and the quietest murder that never was.`,
    recap: [`A colonel dead in a locked room, no weapon.`, `A wife who cried "David" at a husband named James.`, `Tiny paw prints, and a bent door-key thief.`, `A crooked man with a box, standing in the lamplight.`],
    scenes: [
      {
        id: 'murphy', bg: 'dining', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The officers\' mess · the next morning'),
          show('murphy', 'c', 'n'),
          S('murphy', `Mr. Holmes. Barclay and I served together for thirty years. I can't believe it.`),
          { menu: { prompt: 'Question Major Murphy', style: 'talk', must: 'Ask about the Mutiny and about Henry Wood.', done: `That will do, Major.`, items: [
            { id: 'mu_war', label: `"Tell me about the Mutiny."`, must: true, steps: [
              S('murphy', `Bhurtee, 1857. The regiment besieged, water running out. Three of us were chosen to carry a message through the rebel lines: Barclay, myself and Sergeant Henry Wood.`),
              S('murphy', `Barclay took the lead. It was he who led the sergeant through a nullah where the rebels were waiting.`),
              clue('regiment')
            ] },
            { id: 'mu_wood', label: `"What became of Sergeant Wood?"`, must: true, steps: [
              S('murphy', `Taken by the rebels. Tortured. We heard he was dead. Barclay came back a hero and married Wood's sweetheart, Nancy Devoy.`, 'w'),
              S('murphy', `God forgive us all. I think Barclay led him into that ambush on purpose.`, 'sh'),
              clue('betrayal'), clue('nancyLove')
            ] },
            { id: 'mu_pet', label: `"Did Wood keep an animal?"`, steps: [
              S('murphy', `A mongoose, in India. He trained it to kill snakes. He called it Teddy. He could make it do anything.`),
              clue('pet')
            ] }
          ] } },
          hide('murphy')
        ]
      },
      {
        id: 'reasoning', bg: 'drawing', amb: 'clock', mood: 'tense', fx: 'dust',
        steps: [
          slate('The morning room · afternoon'),
          show('watson', 'l', 'n'),
          S('watson', `Holmes, give me the thread of it. I can't see how a man in the street can kill a colonel in a locked room.`),
          { present: { prompt: 'Who is "David", and why did Nancy call him that?', ok: ['bible', 'davidName', 'betrayal', 'regiment'], cost: 1, hint: `Look at the page Nancy was reading. Who sent a loyal soldier to his death?`,
            right: [
              Y(`Nancy was reading about King David, Watson, who sent Uriah the Hittite to the front of the battle so that he would be killed, and took his wife.`),
              Y(`Colonel Barclay's name was James. She called him David because that is exactly what he did to Sergeant Wood.`),
              S('watson', `So Henry Wood is Uriah. The wronged man.`),
              Y(`And the crooked man in the street is Uriah returned, thirty years later.`, 'a')
            ],
            wrong: () => [S('watson', `Surely David is a name, Holmes, a man's name.`)] } },
          { present: { prompt: 'How did a stranger get into a locked room, and out again?', ok: ['paws', 'window', 'door', 'pet'], cost: 1, hint: `The key vanished. The prints were small. A trained animal can go where a man cannot.`,
            right: [
              Y(`Wood did not need to open the door. He opened the French window from outside with the bent catch, and slipped in.`),
              Y(`Teddy the mongoose came in first, along the curtains. Wood followed, when the Colonel came home.`),
              Y(`When he left, the creature took the key in its teeth. A trained animal fetches what it is told to.`),
              S('watson', `That is why there was no key. And the prints on the curtain.`)
            ],
            wrong: () => [S('watson', `How does a mongoose open a lock?`)] } },
          hide('watson')
        ]
      },
      {
        id: 'finale', bg: 'drawing', amb: 'fire', mood: 'finale', fx: 'dust',
        steps: [
          slate('The morning room · evening'),
          N(`Watson, Major Murphy, Miss Morrison and Nancy Barclay, recovered and very pale. And in the doorway, a bent old man with a box on his back.`),
          show('murphy', 'l', 'n'), show('morrison', 'cl', 'w'), show('nancy', 'cr', 'sh'), show('wood', 'r', 'n'),
          Y(`Colonel Barclay died in this room. Three people were afraid of him, one was ashamed, and one wished him dead for thirty years. Who killed him?`),
          { accuse: { qid: 'barclay', vote: { key: 'f_barclay', title: 'The Reckoning: Colonel Barclay', qs: [{ id: 'barclay', text: `Who killed Colonel Barclay?` }], options: [opt('nancy'), opt('murphy'), opt('wood'), opt('morrison'), { id: 'none', label: 'No one. It was not murder.' }] },
            wrong: {
              nancy: [S('nancy', `I loved him once, Mr. Holmes. I did not kill him.`, 'sh'), Y(`There was no blow, Mrs. Barclay, and no weapon in your hand. Think again.`)],
              murphy: [S('murphy', `I was in the mess all evening, Holmes! Ask anyone!`, 'a'), Y(`You were in the mess hall until midnight. Think again.`)],
              wood: [S('wood', `I never raised my hand to him. I only wished to see his face.`, 'a'), Y(`The Colonel's wound matches the corner of the fender, not a club. Think again.`)],
              morrison: [S('morrison', `Me? Mr. Holmes, I was in the street!`, 'a'), Y(`Miss Morrison was outside. Think again.`)]
            },
            right: [
              hide('murphy'), hide('morrison'), hide('nancy'), show('wood', 'c', 'n'),
              Y(`Mr. Wood, will you tell us what happened?`),
              S('wood', `I will, sir.`),
              { present: { prompt: 'How did Colonel Barclay die?', ok: ['fender', 'face', 'club', 'cry'], cost: 1, hint: `A wound with no weapon. A face full of terror.`,
                right: [
                  Y(`He came home, quarrelled with his wife, and she called him David. Then you appeared at the window.`),
                  S('wood', `I came in, sir, only to see him. I was an old, bent man with a box, and he knew me at once. He had left me to die in a ditch, and thought me thirty years dead.`),
                  S('wood', `He said nothing. He went white as a plate. He reached for the club, and then his legs gave way, and he fell, and struck the fender. He was dead before I touched him.`, 'w'),
                  Y(`The shock killed him, Watson. Fear, guilt and surprise. The fall merely finished it.`),
                  S('wood', `I never lifted a hand. I let Teddy take the key, so that I might get out, and I left. I did not want the lady blamed.`),
                  S('nancy', `Henry. Oh, Henry.`, 'sh')
                ],
                wrong: () => [S('wood', `I'll tell it plainly, sir, if you'll let me.`)] } },
              hide('wood')
            ] } },
          show('nancy', 'l', 'sh'), show('wood', 'r', 'n'),
          N(`The old man and the grey-haired woman look at each other for a long time across the room. Neither speaks.`),
          S('wood', `Nancy.`),
          S('nancy', `I thought you were dead, Henry. For thirty years I thought you were dead.`, 'sh'),
          Y(`Watson asks me whether a man can be said to have murdered another merely by being alive.`),
          Y(`I told him no.`),
          N(`The inquest returns a verdict of death by apoplexy. Henry Wood lives out his last years in a small house near the barracks, where he is seen, on warm evenings, sitting in the garden with a mongoose on his knee.`),
          { cliff: 'holmes' }
        ]
      }
    ],
    watch: {
      nancy: `Free of a marriage built on a betrayal she did not know.`,
      morrison: `A good friend, and a frightened one.`,
      murphy: `Carries a thirty-year-old guilt, and says so.`,
      wood: `Wronged, not guilty. Home at last.`
    },
    teaser: `A murder needs a murderer. This one had only a very old injustice.`
  };

  KIT.build({
    id: 'crooked', title: 'The Crooked Man',
    cast: ['watson', 'nancy', 'murphy', 'wood', 'morrison'],
    suspects: ['nancy', 'murphy', 'wood', 'morrison'],
    clues: CLUES, solution: { barclay: 'none', david: 'barclay' }, episodes: [ep1, ep2],
    scoreRounds: [['r1', 'barclay', 'Ep 1 · Killer'], ['r1', 'david', 'Ep 1 · David'], ['f_barclay#1', 'barclay', 'Final']],
    truth: () => `Colonel Barclay was <b>not murdered</b>. He died of shock when Henry Wood, the man he betrayed, appeared before him. "David" was <b>the Colonel himself</b>.`,
    endCard: 'CASE CLOSED', completeLabel: 'Case solved'
  });
})();
