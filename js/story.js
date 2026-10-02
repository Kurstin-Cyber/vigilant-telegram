/* The Blackwood Files, Season One. All story content lives here. */
const STORY = (() => {
  const NAMES = {
    you: 'Inspector Ashby', pennington: 'Pennington', margaret: 'Lady Margaret',
    vivian: 'Vivian Cross', hale: 'Dr. Hale', dobbs: 'Mrs. Dobbs', pike: 'Constable Pike'
  };

  const CLUES = {
    body: { icon: '🪑', name: `Edmund's body`, type: 'Evidence', text: `No wound, no blood, no struggle. Lips tinged blue, one hand clutching the chest. This was poison, not violence.` },
    glasses: { icon: '🥃', name: 'Two brandy glasses', type: 'Evidence', text: `Two used glasses on the desk. One holds greenish dregs that smell faintly bitter. Edmund shared a drink with someone he trusted, and that someone walked away unharmed.` },
    watch: { icon: '⌚', name: 'Smashed pocket watch', type: 'Evidence', text: `Edmund's gold watch, glass cracked, hands frozen at 9:12. The moment he fell.` },
    ledger: { icon: '🔥', name: 'Burnt ledger scrap', type: 'Evidence', text: `A half-burned scrap from the grate: "...Hartley Orphans' Fund... withdrawn, J.H.... £4,200... £3,800..." Someone tried to destroy it and failed.` },
    key: { icon: '🗝️', name: 'Brass key marked S', type: 'Evidence', text: `Hidden behind Bleak House in the library: a small brass key stamped with the letter S.` },
    letter: { icon: '✉️', name: 'Unsent letter to the solicitor', type: 'Evidence', text: `"Mr. Crane. On Monday I will take the thefts from the Hartley Orphans' Fund to the magistrate. The signatures on those withdrawals are forged. I have known the man thirty years and it grieves me. E.B."` },
    vivianLetter: { icon: '💌', name: `Vivian's allowance letter`, type: 'Evidence', text: `Edmund cut Vivian's allowance to nothing last week. The paper is spotted with tears.` },
    thursdays: { icon: '📒', name: 'The surviving ledger page', type: 'Evidence', text: `Withdrawals from the Orphans' Fund, always on the first Thursday of the month, signed "E. Blackwood". Pennington: the doctor visited on first Thursdays, and he and Edmund went over the books together.` },
    ashtray: { icon: '🚬', name: 'Cold ashtray', type: 'Evidence', text: `The conservatory ashtray holds one old stub under a layer of dust. Nobody smoked in this room tonight.` },
    bagEmpty: { icon: '👜', name: `Hale's medical bag`, type: 'Evidence', text: `Dr. Hale's bag, left open in the conservatory. A velvet loop meant for a small vial hangs empty.` },
    vial: { icon: '🧪', name: 'Vial of digitalis', type: 'Evidence', text: `Found in Vivian's coat: a vial labelled "Tincture of Digitalis, J. Hale", nearly empty. Far more is missing than any heart patient would need.` },
    digitalisRx: { icon: '💊', name: 'Edmund took digitalis', type: 'Testimony', text: `Dr. Hale volunteered that Edmund took digitalis for a weak heart, and that a misjudged dose might explain everything.` },
    fundTalk: { icon: '🗣️', name: `Margaret: "a rot in the fund"`, type: 'Testimony', text: `Edmund spent weeks muttering about "a rot in the fund". Dr. Hale handles the charity's books.` },
    vivianAlibi: { icon: '📚', name: `Vivian's alibi`, type: 'Testimony', text: `Vivian says she was alone in the library from half past eight until the gong at half past nine.` },
    haleAlibi: { icon: '🌿', name: `Hale's alibi`, type: 'Testimony', text: `Hale says he spent the evening in the conservatory with a cigar, and that Vivian kept him company until the gong.` },
    haleVivian: { icon: '❓', name: 'Vivian never saw Hale', type: 'Testimony', text: `Vivian says Hale never came near the library. His alibi relied on her.` },
    decanterClean: { icon: '🍾', name: 'The decanter was sealed', type: 'Testimony', text: `Mrs. Dobbs: a freshly sealed decanter and a single glass went to the study at ten to nine. Only one glass was sent.` },
    dobbsGlass: { icon: '🥂', name: 'Hale fetched a glass', type: 'Testimony', text: `Mrs. Dobbs: Dr. Hale came to the kitchen around nine for a clean glass, saying Edmund wanted company for a nightcap.` },
    penSaw: { icon: '👁️', name: 'Pennington saw Hale', type: 'Testimony', text: `Pennington saw Dr. Hale enter the study at five past nine with a glass of his own, and leave around twenty past.` },
    vivianCoat: { icon: '🧥', name: `The vial in Vivian's coat`, type: 'Testimony', text: `Vivian: Hale took her coat at the door that evening. She found the vial in the pocket only after the gong, when she went for her gloves.` },
    margaretTold: { icon: '🤫', name: 'Margaret told Hale', type: 'Testimony', text: `Lady Margaret told Hale two days ago that Edmund meant to "name names" on Monday. When asked who told her, she was vague.` }
  };

  /* ----- step helpers ----- */
  const N = t => ({ nar: t });
  const S = (who, t, e) => ({ say: who, t, e });
  const Y = t => S('you', t);
  const show = (id, pos, e) => ({ show: id, pos, e });
  const hide = id => ({ hide: id });
  const clue = id => ({ clue: id });
  const sfx = n => ({ sfx: n });
  const slate = t => ({ slate: t });
  const flag = f => ({ flag: f });
  const wait = ms => ({ wait: ms });
  const card = (t, sub) => ({ card: t, sub });
  const flash = c => ({ flash: c });
  const shake = () => ({ shake: 1 });

  /* ================= EPISODE 1 ================= */
  const ep1 = {
    n: 1, title: 'Snowbound', logline: 'A dead man, four suspects, and a blizzard that will not let anyone leave.',
    recap: [],
    scenes: [
      {
        id: 'arrival', bg: 'exterior', amb: 'wind', mood: 'calm', fx: 'snow',
        steps: [
          slate('Blackwood Manor · December 1926 · 10:34 PM'),
          N(`A stable boy rode through the blizzard to the village inn, white with snow, and gasped three words: "Mr. Blackwood. Dead."`),
          N(`You followed his lantern for two miles. Now the carriage groans to a stop before the great house, every window blazing, and the road behind you has already disappeared.`),
          sfx('knock'),
          show('pennington', 'c', 'w'),
          S('pennington', `Inspector. Thank God. I am Pennington, the butler.`),
          S('pennington', `Mr. Edmund Blackwood is dead. The household is in the dining room. Nobody has left, and nobody can. The drifts closed the road at nine.`),
          Y(`And the telephone?`),
          S('pennington', `Dead since eight, sir. The wires are down. You are all the law this house has tonight.`, 'w'),
          { choice: { prompt: 'How do you take charge?', opts: [
            { t: `Gently. "You've had a shock. Take a breath, then tell me what you saw."`, steps: [flag('kind'), S('pennington', `Thank you, sir. That is more kindness than I expected tonight.`)] },
            { t: `Briskly. "Nobody touches anything. Take me to the body."`, steps: [flag('brisk'), S('pennington', `Of course, sir. At once.`)] },
            { t: `Pointedly. "You found him. Start there. Leave nothing out."`, steps: [flag('pointed'), S('pennington', `At twenty to ten I knocked to announce dessert. No answer. I went in, sir, and he was sitting there as if he were listening.`, 'w')] }
          ] } },
          S('pennington', `Thirty-one years I have served this house, sir. I shall not forget tonight as long as I live.`),
          N(`He lifts a lantern and leads you inside. Behind you, the storm closes over the door like a lid.`),
          sfx('door')
        ]
      },
      {
        id: 'study', bg: 'study', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Study · 10:41 PM'),
          N(`Edmund Blackwood sits in his leather chair, head tilted, as though the fire had said something he was still considering.`),
          show('pennington', 'l', 'w'),
          S('pennington', `I have touched nothing, sir. Only the door, and the Master's wrist, to be certain.`),
          Y(`Wait outside, Pennington. I'll call for you.`),
          hide('pennington'),
          N(`Alone with the dead, you begin the oldest ritual of your trade: look before you think.`),
          { menu: { prompt: 'Examine the study', style: 'scene', must: 'Find the body, the desk and the fireplace first.', done: `I've seen enough.`, items: [
            { id: 'body', icon: '🪑', label: 'The body', must: true, steps: [
              N(`No wound. No blood. Nothing overturned. His lips have a faint blue tinge, and his right hand is curled against his waistcoat as if he had tried to hold his heart in.`),
              Y(`A struggle would have left a mark. This is poison.`), clue('body')] },
            { id: 'desk', icon: '🥃', label: 'The desk', must: true, steps: [
              N(`Two crystal glasses stand side by side on the blotter. One holds brandy dregs shaded faintly green. The decanter beside them has its seal broken, but is nearly full.`),
              Y(`Two glasses. Edmund drank with someone, and that someone walked away unharmed.`), clue('glasses')] },
            { id: 'floor', icon: '⌚', label: 'The floor', steps: [
              N(`A gold pocket watch lies by the leg of the chair. The glass is cracked, and the hands have stopped at 9:12.`), clue('watch')] },
            { id: 'grate', icon: '🔥', label: 'The fireplace', must: true, steps: [
              N(`Beneath the grey ash in the grate, one scrap of paper has survived. Charred at the edges. Careful handwriting.`),
              Y(`Someone burned this in a hurry, and did the job badly.`), clue('ledger')] },
            { id: 'window', icon: '🪟', label: 'The window', steps: [
              N(`Latched from the inside. The snow on the sill is smooth and unbroken.`),
              Y(`Nobody came or went this way. Whoever did this was already under this roof.`)] },
            { id: 'opener', icon: '🗡️', label: 'The letter opener', steps: [
              N(`Clean steel in a leather holder. Not the weapon.`)] },
            { id: 'drawer', icon: '🗄️', label: 'The locked drawer', once: false, steps: [
              N(`The desk's bottom drawer has a small brass lock. There is no key on Edmund, and none in the room.`),
              Y(`He locked something away. I need to find that key.`), flag('sawDrawer')] }
          ] } },
          N(`Poison. A second glass. A name burned down to its initials. Someone in this house sat across from Edmund Blackwood tonight and watched him die.`),
          sfx('stinger')
        ]
      },
      {
        id: 'gathering', bg: 'dining', amb: 'room', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Dining Room · 11:05 PM'),
          N(`Six places laid. Candles guttering. Three faces turn as you enter, and each wears a different kind of fear.`),
          show('vivian', 'l', 'w'), show('margaret', 'c', 'w'), show('hale', 'r'),
          S('margaret', `Inspector. Is it true? They say Edmund simply... stopped.`, 'w'),
          Y(`Lady Blackwood, I am sorry. Your husband did not simply stop. He was poisoned.`),
          sfx('gasp'),
          S('vivian', `Poisoned?! Here? With all of us sitting in this house?`, 'sh'),
          S('hale', `Steady, Vivian. Please, steady.`),
          S('hale', `Inspector, I am Dr. Julian Hale, the family physician. Pennington fetched me to the study at a quarter to ten and I confess I thought it his heart. Edmund took digitalis for a weak heart. A misjudged dose, perhaps...`),
          clue('digitalisRx'),
          Y(`Perhaps. Or perhaps someone measured it for him.`),
          S('hale', `Dear God. You cannot mean one of us.`, 'w'),
          N(`Nobody answers. Outside, the wind finds a loose shutter and worries it like a dog.`),
          S('vivian', `You can't keep us here! I won't sit in a room with... with whoever...`, 'a'),
          S('margaret', `Vivian. Sit down. The Inspector is right to ask.`),
          Y(`Nobody leaves this house tonight. I will speak with each of you alone.`)
        ]
      },
      {
        id: 'interviews', bg: 'drawing', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Drawing Room · 11:30 PM'),
          N(`You take the drawing room and send for them one at a time. Truth has a different sound in every voice.`),
          { menu: { prompt: 'Whom will you question?', style: 'scene', must: 'Speak to all three before you go.', done: `I have what I need.`, items: [
            { id: 'margaret', icon: '👵', label: 'Lady Margaret', must: true, steps: [
              show('margaret', 'c', 'n'),
              S('margaret', `Ask what you must, Inspector. I have nothing to hide but my grief.`),
              { menu: { prompt: 'Ask Lady Margaret...', style: 'talk', must: 'Ask where she was at nine.', done: `That will do for now.`, items: [
                { id: 'm_where', label: `"Where were you at nine?"`, must: true, steps: [
                  S('margaret', `In this room, with a headache. Alone. I know how that sounds, Inspector.`, 'w'), flag('margaretAlone')] },
                { id: 'm_worry', label: `"Was Edmund troubled lately?"`, steps: [
                  S('margaret', `For weeks he shut himself away, muttering about "a rot in the fund". The Hartley Orphans' Fund, his great pride.`),
                  S('margaret', `Julian keeps the charity's books, so I assumed Edmund was consulting him.`), clue('fundTalk')] },
                { id: 'm_marriage', label: `"How were things between you?"`, steps: [
                  S('margaret', `Civil. Thirty years of civility. He was hard, not cruel.`),
                  S('margaret', `He cut Vivian's allowance last week. I begged him not to.`, 'w')] }
              ] } },
              hide('margaret')] },
            { id: 'vivian', icon: '👩', label: 'Vivian Cross', must: true, steps: [
              show('vivian', 'c', 'a'),
              S('vivian', `I didn't do it. Whatever Uncle did to my allowance, I didn't do it.`, 'a'),
              { menu: { prompt: 'Ask Vivian...', style: 'talk', must: 'Ask where she was at nine.', done: `That will do for now.`, items: [
                { id: 'v_where', label: `"Where were you at nine?"`, must: true, steps: [
                  S('vivian', `In the library, from half past eight until the gong at half past nine. Alone. Reading.`), clue('vivianAlibi')] },
                { id: 'v_money', label: `"Your uncle cut your allowance."`, steps: [
                  S('vivian', `Yes, and I was furious. I cried in the hall like a child. But furious isn't murderous, Inspector.`, 'w')] },
                { id: 'v_uncle', label: `"What was he like?"`, steps: [
                  S('vivian', `He raised me after my parents died. Strict, impossible, and he sat up with me every time I had a nightmare.`, 'w')] }
              ] } },
              hide('vivian')] },
            { id: 'hale', icon: '🧑‍⚕️', label: 'Dr. Hale', must: true, steps: [
              show('hale', 'c', 'n'),
              S('hale', `Dreadful business, Inspector. Dreadful. Edmund was my oldest friend.`),
              { menu: { prompt: 'Ask Dr. Hale...', style: 'talk', must: 'Ask where he was at nine.', done: `That will do for now.`, items: [
                { id: 'h_where', label: `"Where were you at nine?"`, must: true, steps: [
                  S('hale', `In the conservatory, among the orchids, with a cigar. Miss Cross was kind enough to keep me company until the gong at half past nine.`), clue('haleAlibi')] },
                { id: 'h_bag', label: `"Do you carry digitalis?"`, steps: [
                  S('hale', `As any physician does, Inspector. Which is precisely why I told you about it at once.`),
                  Y(`It was convenient of you to mention it.`),
                  S('hale', `It was honest of me to mention it. There is a difference.`, 'w')] },
                { id: 'h_friend', label: `"How well did you know him?"`, steps: [
                  S('hale', `Thirty years his physician and his friend. I held his hand when his father died.`)] }
              ] } },
              hide('hale')] }
          ] } },
          N(`Three alibis. None of them sealed. Somewhere in this house, one of them is a performance.`)
        ]
      },
      {
        id: 'library', bg: 'library', amb: 'clock', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Library · 12:02 AM'),
          N(`Unable to sleep, and unwilling to, you walk the house alone. The library is empty, its fire burned down to a red eye. A grandfather clock counts the dead hours.`),
          sfx('chime'),
          { menu: { prompt: 'Search the library', style: 'scene', must: 'Check the shelves first.', done: 'Take what you found and return to the study.', items: [
            { id: 'shelf', icon: '📖', label: 'The shelves', must: true, steps: [
              N(`Among the Dickens, one spine sits half an inch proud of the rest. Bleak House. Behind it, wrapped in a handkerchief, lies a small brass key stamped with an S.`),
              Y(`S for Study. Edmund hid his key in plain sight.`), clue('key')] },
            { id: 'writing', icon: '✉️', label: 'The writing desk', steps: [
              N(`A letter in Edmund's hand, addressed to Vivian. Her allowance, cut to nothing until she "shows some sense". The paper is spotted with tears.`), clue('vivianLetter')] },
            { id: 'clock', icon: '🕰️', label: 'The grandfather clock', steps: [
              N(`It strikes the quarter hours loud enough to hear through a closed door. Anyone sitting in this room at half past nine would have heard the dinner gong ring in the hall.`)] }
          ] } }
        ]
      },
      {
        id: 'drawer', bg: 'study', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Study · 12:20 AM'),
          N(`The key turns with a click that is louder than it has any right to be.`),
          N(`Inside the drawer lies a single folded sheet, the ink still glossy, never sent.`),
          clue('letter'),
          Y(`Thirty years. "The man I have known thirty years."`),
          N(`In this house, that describes more than one person.`),
          { choice: { prompt: 'Whom do you mean to watch tonight?', opts: [
            { t: `Lady Margaret. Thirty years his wife.`, steps: [flag('watchMargaret'), Y(`The widow with no alibi. She can't stay in her room forever.`)] },
            { t: `Dr. Hale. Thirty years his friend and physician.`, steps: [flag('watchHale'), Y(`The doctor who mentioned the poison before I could ask.`)] },
            { t: `Pennington. Thirty-one years in service.`, steps: [flag('watchPennington'), Y(`The man who found the body, and touched the wrist, and the door.`)] }
          ] } },
          N(`You put out the lamp. The house settles around you like a held breath.`),
          N(`You had meant to keep watch from the corridor. But the sound that stops you does not come from there. It comes from beneath your feet: a heavy door, softly closed.`),
          sfx('door')
        ]
      },
      {
        id: 'cellar', bg: 'cellar', amb: 'furnace', mood: 'dread', fx: 'embers',
        steps: [
          slate('The Cellar · 12:41 AM'),
          N(`The cellar stairs are steep, and your lamp throws your shadow ahead of you like a scout.`),
          sfx('steps'),
          N(`At the bottom, the furnace door hangs open and the whole room is orange. A figure kneels before it, feeding the fire page by page.`),
          sfx('hit'),
          show('pennington', 'c', 'w'),
          Y(`Pennington.`),
          N(`He does not startle. He turns slowly, a handful of ledger pages in one hand, and the firelight carves his face into something older and stranger than the butler who met you at the door.`),
          S('pennington', `Inspector. It is not what you think.`, 'w'),
          Y(`Then tell me what I am thinking.`),
          S('pennington', `Please. Ask me to stop and I shall. But if you read these pages, sir, you will understand why I could not let anyone see them.`, 'w'),
          N(`Behind him, in the furnace, the last page of Edmund Blackwood's account book curls and blackens, and takes its secret with it.`),
          { cliff: 'pennington' }
        ]
      }
    ],
    watch: {
      pennington: `Caught burning ledger pages in the cellar at 12:41 AM.`,
      margaret: `No alibi. Knew Edmund was troubled about "the fund".`,
      vivian: `Allowance cut last week. Says she was alone in the library.`,
      hale: `Volunteered the digitalis. Claims Vivian shared his alibi.`
    },
    teaser: `Next: Pennington's explanation, an empty bag, and a vial that turns up where it should not be.`
  };

  /* ================= EPISODE 2 ================= */
  const ep2 = {
    n: 2, title: 'Ashes', logline: 'The butler talks. The doctor smiles. Someone in the house is lying beautifully.',
    recap: [
      `Edmund Blackwood, poisoned, shared a drink with someone he trusted.`,
      `A burnt scrap: "Hartley Orphans' Fund... J.H."`,
      `A letter: "I have known the man thirty years."`,
      `And in the cellar, Pennington was feeding the furnace.`
    ],
    scenes: [
      {
        id: 'cellar2', bg: 'cellar', amb: 'furnace', mood: 'dread', fx: 'embers',
        steps: [
          slate('The Cellar · 12:43 AM'),
          show('pennington', 'c', 'w'),
          Y(`Put the pages down, Pennington. Slowly.`),
          N(`He lowers them as if they were asleep. The furnace roars.`),
          { choice: { prompt: 'How do you handle him?', opts: [
            { t: `"Every page. Now."`, steps: [flag('pressedPen'), S('pennington', `There is only one left, sir. Please do not shout. I have heard enough shouting tonight.`, 'w')] },
            { t: `"Tell me why, Pennington. From the beginning."`, steps: [flag('softPen'), S('pennington', `You are kind, sir. Kinder than I deserve.`)] }
          ] } },
          S('pennington', `I found the Master dead, and on his desk lay his private account book. Open, as if someone had been reading it in a hurry. I took it before I called anyone.`),
          S('pennington', `I saw the Master's signature on withdrawal after withdrawal from the Orphans' Fund. I thought: he was robbing the children and was ashamed of it. I would not let the world say that of him.`, 'w'),
          Y(`You burned the book to save his name.`),
          S('pennington', `Thirty-one years he gave me a home, sir. It seemed the last service I could do him.`),
          S('pennington', `I burned all but one page. I could not make my hands do it.`),
          N(`He holds out a single, soot-edged sheet. Dates. Sums. A signature.`),
          clue('thursdays'),
          Y(`"E. Blackwood." And yet his own letter says the signatures were forged.`),
          S('pennington', `Forged? I never... I did not think of that, sir. I only saw his name, and feared for the family's honour.`, 'sh'),
          Y(`Every one of these falls on a first Thursday. Who visits Blackwood Manor on a first Thursday?`),
          S('pennington', `Why, the doctor, sir. For the Master's heart. They always sat with the books afterwards.`),
          N(`The furnace ticks as it cools. Neither of you says the name.`),
          Y(`Go to bed, Pennington. And next time, bring me the pages before you light the match.`),
          S('pennington', `Yes, sir. And thank you, sir.`, 'w'),
          hide('pennington')
        ]
      },
      {
        id: 'library2', bg: 'library', amb: 'clock', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Library · 6:15 AM'),
          N(`Dawn comes grey and sullen. The snow has stopped, but the world outside is a white wall.`),
          show('vivian', 'c', 'w'),
          S('vivian', `You haven't slept either, Inspector.`),
          { menu: { prompt: 'Ask Vivian...', style: 'talk', must: 'Ask about Dr. Hale.', done: `I'll let you rest.`, items: [
            { id: 'v2_hale', label: `"Dr. Hale says you kept him company in the conservatory."`, must: true, steps: [
              S('vivian', `The conservatory? With Dr. Hale? I never left this room until the gong.`, 'sh'),
              Y(`You're certain?`),
              S('vivian', `I was reading the same page for an hour. I never saw him. Why would he say that?`, 'w'),
              clue('haleVivian')] },
            { id: 'v2_night', label: `"Did you sleep?"`, steps: [
              S('vivian', `Not a minute. Every time I close my eyes, I hear Uncle laughing at dinner. He was in such a good mood.`, 'w'),
              S('vivian', `He said Monday would be "a day of reckonings". I thought he meant me.`)] }
          ] } },
          N(`A man who lies about his alibi has a reason. You mean to find it.`),
          hide('vivian')
        ]
      },
      {
        id: 'conservatory', bg: 'conservatory', amb: 'room', mood: 'tense', fx: 'snow',
        steps: [
          slate('The Conservatory · 7:02 AM'),
          N(`Glass walls, wet air, rows of orchids. Dr. Hale's alibi lives here, if it lives anywhere.`),
          { menu: { prompt: 'Search the conservatory', style: 'scene', must: `Check the ashtray and the doctor's bag.`, done: 'I have what I came for.', items: [
            { id: 'ashtray', icon: '🚬', label: 'The ashtray', must: true, steps: [
              N(`A glass ashtray on the bench. One stub, old, cold, furred with dust. There is no fresh ash and no smell of cigar anywhere in the room.`),
              Y(`Nobody smoked in here last night.`), clue('ashtray')] },
            { id: 'bag', icon: '👜', label: `Dr. Hale's bag`, must: true, steps: [
              N(`The black medical bag lies open on the bench. Stethoscope. Bandages. And a row of velvet loops for small glass vials. One loop hangs empty.`),
              Y(`Something is missing from the doctor's bag.`), clue('bagEmpty')] },
            { id: 'orchids', icon: '🌺', label: 'The orchids', steps: [
              N(`Edmund's prize blooms. The soil is undisturbed. Whatever this room is hiding, it is not hiding it here.`)] }
          ] } },
          sfx('door'),
          show('hale', 'c', 'n'),
          S('hale', `You are up early, Inspector. I came to see to my orchids. Edmund would have wanted them looked after.`),
          Y(`You told me you spent last night here, Doctor. With a cigar.`),
          S('hale', `I did.`),
          { present: { prompt: `Challenge Dr. Hale's alibi`, ok: ['ashtray', 'haleVivian'], hint: 'Something in this room, or something Vivian said.', cost: 0,
            right: [
              S('hale', `Ah.`, 'w'),
              N(`For a moment, nothing at all moves in his face. Then a small, regretful smile arrives, like a man remembering an appointment.`),
              S('hale', `Miss Cross is a distraught girl, Inspector, and I am an old man who stepped onto the terrace to smoke. Confusion is natural on a night like this.`),
              S('hale', `But since we are discussing lies, ask yourself why a young woman with a grudge, no alibi, and a motive in her uncle's will was so very eager to be alone.`, 'a')
            ],
            wrong: () => [S('hale', `I'm afraid I don't follow, Inspector.`)] } },
          S('hale', `Do search where you must. Miss Cross's room, for instance. I should hate to see a guilty person go unseen simply because she is young.`),
          hide('hale'),
          N(`He leaves as softly as he came. The orchids hold their breath behind him.`)
        ]
      },
      {
        id: 'kitchen', bg: 'kitchen', amb: 'kitchen', mood: 'tense', fx: 'embers',
        steps: [
          slate('The Kitchen · 8:20 AM'),
          N(`Breakfast is a rumour. Mrs. Dobbs bangs a pot out of habit rather than hope.`),
          show('dobbs', 'l', 'w'), show('pennington', 'r', 'n'),
          S('dobbs', `Whatever's happened upstairs, Inspector, it never happened in my kitchen.`),
          { menu: { prompt: 'Question the staff', style: 'talk', must: 'Show them what you found in the study.', done: 'That is all, thank you.', items: [
            { id: 'k_decanter', label: `"Could the brandy have been tampered with?"`, steps: [
              S('dobbs', `Not here. Pennington took a sealed decanter at ten to nine, and one glass. One, mind you.`),
              clue('decanterClean')] },
            { id: 'k_glass', label: `Show Mrs. Dobbs the glasses.`, must: true, steps: [
              { present: { prompt: 'Show Mrs. Dobbs', ok: ['glasses'], hint: 'Something from the desk.', right: [
                S('dobbs', `Two glasses? I sent one. But Dr. Hale popped his head in about nine, asking for a clean glass. "Edmund wants company for a nightcap," he says. I gave him one from the rack.`, 'sh'),
                clue('dobbsGlass')],
                wrong: () => [S('dobbs', `That's not my business, dear.`)], skip: [] } }] },
            { id: 'k_pen', label: `Press Pennington on the study.`, must: true, steps: [
              S('pennington', `I would rather not accuse a guest, sir. It is not my place.`, 'w'),
              { present: { prompt: 'Show Pennington something from the study', ok: ['glasses', 'watch'], hint: `Something from Edmund's desk, or the floor.`, right: [
                S('pennington', `Then I must speak. At five past nine I saw Dr. Hale go into the study carrying a glass of his own. He came out about twenty past. I thought nothing of it. He is a guest, and the Master's friend.`),
                clue('penSaw')],
                wrong: () => [S('pennington', `I do not see how that bears on it, sir.`)] } }] }
          ] } },
          hide('dobbs'), hide('pennington'),
          Y(`Two witnesses. Hale took a clean glass at nine and walked into the study with it.`),
          sfx('door'),
          show('hale', 'c', 'n'),
          S('hale', `You needn't whisper, Inspector. I heard.`),
          S('hale', `Yes. Edmund asked me in for a nightcap at five past nine, and I left at twenty past. He was alive, and a little cross, and perfectly well.`),
          Y(`You told me you were in the conservatory.`),
          S('hale', `I lied. I knew precisely how it would look: a guest, a physician, a bag of digitalis, and a dead host. A man grows careful.`),
          S('hale', `If you want a poisoner, look at the girl. Search her room. If I am wrong, I shall apologise on my knees.`, 'a'),
          N(`His voice is gentle. His logic is almost perfect. You find that more disturbing than any raised voice.`),
          hide('hale')
        ]
      },
      {
        id: 'bedroom', bg: 'bedroom', amb: 'room', mood: 'dread', fx: 'dust',
        steps: [
          slate(`Vivian Cross's Room · 9:05 AM`),
          N(`A narrow bed. A half-packed suitcase. A coat on a hook that still smells of the cold.`),
          { menu: { prompt: 'Search the room', style: 'scene', must: 'Check the coat.', done: 'Hold the vial up to the light.', items: [
            { id: 'case', icon: '🧳', label: 'The suitcase', steps: [
              N(`Two dresses, a hairbrush, a train timetable folded to Monday morning.`),
              Y(`She was planning to leave. Or planning to be somewhere else on Monday.`)] },
            { id: 'coat', icon: '🧥', label: 'The coat', must: true, steps: [
              N(`In the right pocket, behind a glove: a small glass vial, stoppered with wax. The label is handwritten. "Tincture of Digitalis. J. Hale."`),
              sfx('stinger'), clue('vial')] },
            { id: 'dresser', icon: '🪞', label: 'The dresser', steps: [
              N(`Ribbons, a photograph of two smiling strangers, and a faded child's drawing of a house. It is signed "Uncle E."`)] }
          ] } },
          sfx('door'),
          show('vivian', 'l', 'sh'), show('margaret', 'c', 'w'), show('hale', 'r', 'w'),
          S('vivian', `What are you doing in my... `, 'sh'),
          N(`She sees the vial in your hand and stops dead.`),
          S('vivian', `No. No, that isn't mine. I've never seen that in my life!`, 'sh'),
          S('margaret', `Vivian. Oh, child.`, 'w'),
          S('hale', `I am so sorry, Inspector. I wanted so very much to be wrong.`, 'w'),
          S('vivian', `You! You took my coat at the door, you... you smiled at me and took my coat!`, 'a'),
          shake(), sfx('slam'),
          N(`She is out of the room before anyone can move. Feet on the stairs. A door at the bottom, flung wide. A gust of snow-wind through the whole house.`),
          S('margaret', `Vivian! Vivian, come back!`, 'sh'),
          N(`You start for the stairs. But something makes you glance at the window first.`),
          N(`In the black glass, over your own shoulder, Dr. Hale's reflection is smiling. Only for an instant.`),
          { cliff: 'hale' }
        ]
      }
    ],
    watch: {
      pennington: `Cleared of the murder. Burned evidence to protect Edmund's name.`,
      margaret: `Watched Vivian run. Still unaccounted for at nine.`,
      vivian: `Fled into the blizzard with the vial found in her coat.`,
      hale: `Lied about his alibi. Admits entering the study. Pointed you at Vivian.`
    },
    teaser: `Next: the chase through the snow, a coat in a cloakroom, and one last confrontation.`
  };

  /* ================= EPISODE 3 ================= */
  const whoStep = { choice: { prompt: 'Who killed Edmund Blackwood?', opts: [] } };
  const wrong = (id, lines) => ({ t: id.label, steps: [...lines, { cost: 1 }, whoStep] });
  whoStep.choice.opts = [
    wrong({ label: 'Pennington, the butler.' }, [
      S('pennington', `Sir?`, 'sh'),
      Y(`He burned evidence, but to protect Edmund's name. A man who loves his master does not poison him.`),
      N(`Pennington lets out a breath he has been holding for thirty-one years.`)]),
    wrong({ label: 'Lady Margaret, the widow.' }, [
      S('margaret', `Inspector, how dare...`, 'a'),
      Y(`She had no alibi. But she had no access to the digitalis, and she is the one person who wanted Edmund to talk.`),
      N(`Lady Margaret's hand trembles on the arm of her chair. You have the uneasy feeling you've missed something about her.`)]),
    wrong({ label: 'Vivian, the niece.' }, [
      S('vivian', `Please. I didn't...`, 'w'),
      Y(`The vial was in her coat. But a poisoner does not wrap evidence in a glove and hide it in her own pocket. Not unless someone put it there.`),
      N(`Vivian looks at you as if you have thrown her a rope.`)]),
    { t: 'Dr. Hale, the physician.', steps: [] }
  ];

  const ep3 = {
    n: 3, title: 'The Last Glass', logline: 'One storm. One lie. One chance to name a killer before the roads clear.',
    recap: [
      `Pennington burned the Orphans' Fund ledger to save Edmund's name.`,
      `Hale lied about his alibi, and placed himself in the study.`,
      `A vial labelled J. Hale turned up in Vivian's coat.`,
      `Vivian ran into the snow. And Hale smiled.`
    ],
    scenes: [
      {
        id: 'snow', bg: 'garden', amb: 'wind', mood: 'storm', fx: 'snow',
        steps: [
          slate('The Grounds · 9:20 AM'),
          N(`The cold is a physical blow. Her footprints run toward the frozen lake and the boathouse, filling in even as you follow them.`),
          sfx('thunder'),
          N(`You find her crouched against the boathouse wall, knees drawn up, her scarf the only colour in the whole white world.`),
          show('vivian', 'c', 'w'),
          { choice: { prompt: 'How do you approach her?', opts: [
            { t: `Sit beside her in the snow. "I don't think you did this."`, steps: [flag('gentleViv'), S('vivian', `Nobody has said that to me all night.`, 'w')] },
            { t: `Stand firm. "Running makes you look guilty. Talk to me."`, steps: [flag('firmViv'), S('vivian', `I know how it looks! That's why I ran!`, 'a')] }
          ] } },
          S('vivian', `Dr. Hale took my coat when I arrived. He was so charming about it. He said I looked cold.`),
          S('vivian', `After the gong, I went for my gloves and there was something hard in the pocket. A little glass bottle with his name on it.`),
          S('vivian', `I knew exactly what it would look like. I was going to throw it in the lake.`, 'w'),
          Y(`Why didn't you tell anyone?`),
          S('vivian', `Who would believe the girl whose allowance was cut?`, 'w'),
          clue('vivianCoat'),
          Y(`I would. Come back with me, Vivian. We are going to finish this.`),
          S('vivian', `And if you're wrong?`),
          Y(`Then I'll be the first thing the snow covers.`),
          N(`She takes your hand. Above the lake, the sky is the colour of old pewter.`),
          hide('vivian')
        ]
      },
      {
        id: 'margaret2', bg: 'drawing', amb: 'fire', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Drawing Room · 10:45 AM'),
          N(`There is one thread left that does not sit right. You pull it before the others arrive.`),
          show('margaret', 'c', 'w'),
          { menu: { prompt: 'Speak to Lady Margaret', style: 'talk', must: 'Ask how she knew what Edmund intended.', done: `Thank you, Lady Blackwood.`, items: [
            { id: 'mg_told', label: `"Did you tell anyone about the fund?"`, must: true, steps: [
              S('margaret', `Julian. At tea, two days ago. I said Edmund meant to "name names" on Monday. I thought a doctor could calm him.`, 'w'),
              Y(`Who told you that Edmund meant to name names?`),
              S('margaret', `He... Edmund mentioned it. In passing.`, 'w'),
              N(`It is an odd phrase. You file it away. You have the feeling you'll want it later.`),
              clue('margaretTold')] }
          ] } },
          hide('margaret')
        ]
      },
      {
        id: 'finale', bg: 'drawing', amb: 'fire', mood: 'finale', fx: 'dust',
        steps: [
          slate('The Drawing Room · 11:00 AM'),
          { do: () => { G.composure = 3; G.finale = true; } },
          N(`Everyone you have questioned is here, because you asked them to be. Four people, one fire, and the question the whole house has been afraid to ask.`),
          show('vivian', 'l', 'w'), show('pennington', 'cl', 'n'), show('margaret', 'cr', 'w'), show('hale', 'r', 'n'),
          Y(`Edmund Blackwood did not die by accident, and he did not die by his own hand. Someone in this room sat down across from him, poured him a drink, and watched him die.`),
          S('hale', `Inspector, surely this can wait until the roads clear.`),
          Y(`No, Doctor. I think it would rather not.`),
          N(`Your composure is all you have in this room. Three wrong answers, and the killer walks out into the thaw.`),
          whoStep,
          S('hale', `This is preposterous. Absurd. A physician does not murder his oldest friend.`, 'a'),
          Y(`A physician with a hidden debt does. Let me prove it.`),
          { present: { prompt: 'Why did Edmund have to die?', ok: ['letter', 'ledger', 'thursdays'], cost: 1, hint: `What did Edmund mean to expose on Monday?`,
            right: [
              Y(`Edmund discovered that someone had been stealing from the Hartley Orphans' Fund and forging his signature. On Monday, he meant to go to the magistrate.`),
              S('hale', `Forgery? I have a doctor's hand, Inspector, not a forger's.`, 'a'),
              Y(`Every withdrawal fell on a first Thursday. Your day. And someone told you Edmund knew.`),
              N(`Margaret looks at the carpet. Hale's hand tightens on the arm of his chair.`)
            ],
            wrong: () => [S('hale', `Is that all? That proves nothing at all.`)] } },
          { present: { prompt: 'How was Edmund poisoned?', ok: ['glasses', 'vial', 'bagEmpty', 'body'], cost: 1, hint: `Something that held the poison, or the one that mattered most.`,
            right: [
              Y(`Edmund drank from a sealed decanter, safe. But two glasses stood on that desk, and only one had been sent from the kitchen.`),
              Y(`The other was yours, Doctor. Already dosed from your own bag. You switched them when Edmund turned to the decanter.`),
              S('hale', `Fantasy. All of it.`, 'a'),
              Y(`And afterwards you planted the vial in Vivian's coat, a coat you had taken at the door yourself.`),
              S('vivian', `I knew it. I knew it was you.`, 'a')
            ],
            wrong: () => [S('hale', `You are grasping at straws, Inspector.`)] } },
          { present: { prompt: 'He claimed he was in the conservatory. Break his alibi.', ok: ['ashtray', 'haleVivian', 'penSaw', 'dobbsGlass'], cost: 1, hint: `Show where he really was, or how he lied about it.`,
            right: [
              Y(`Your alibi was the conservatory, with Vivian for company. She never saw you. The ashtray was cold. And two people saw you carry a glass into the study.`),
              S('hale', `...`, 'sh'),
              N(`The silence runs on so long you can hear the fire settling. Then Dr. Hale lets out a long, slow breath, and the kindly mask simply slides off.`),
              sfx('hit'), flash('#ffffff')
            ],
            wrong: () => [S('hale', `You can't break what isn't cracked.`)] } },
          S('hale', `He called me in to say goodbye to thirty years of friendship. One last drink, for old times. I had already dosed my own glass.`, 'n'),
          S('hale', `I switched them when he turned to the decanter. Edmund was a trusting man. It was the only thing I ever truly admired about him.`),
          S('hale', `I could not let him ruin me, Inspector. I simply could not.`),
          N(`Nobody speaks. Pennington is crying silently, upright, the way a servant weeps. Vivian has taken Lady Margaret's hand.`),
          S('vivian', `Thank you.`, 'w'),
          Y(`Thank Pennington. He kept the page that mattered.`),
          { do: () => { G.finale = false; } }
        ]
      },
      {
        id: 'coda', bg: 'exterior', amb: 'wind', mood: 'dread', fx: 'snow',
        steps: [
          slate('Blackwood Manor · 1:20 PM'),
          N(`By afternoon the plough has cut a black trench through the drifts, and a police trap crawls up the drive.`),
          show('hale', 'c', 'n'),
          N(`Dr. Julian Hale walks out between two constables, wrists in iron, for all the world like a man leaving church.`),
          S('hale', `You were very clever, Inspector. I shall say so at my trial.`, 's'),
          S('hale', `But I did not learn what Edmund meant to do from Edmund. Nor from his ledger. Someone in that house has been trading secrets for weeks.`),
          Y(`Who?`),
          S('hale', `Ask Lady Margaret who told her what Edmund intended on Monday. Then ask yourself why nobody ever asked her before.`, 'a'),
          show('margaret', 'l', 'sh'),
          N(`Lady Margaret's hand goes to the pearls at her throat. For the first time since you arrived, she looks afraid.`),
          S('margaret', `Inspector, he is lying. He's a murderer, he will say anything...`, 'sh'),
          N(`You remember her words, so careless: "Edmund mentioned it. In passing."`),
          N(`Edmund Blackwood told his wife nothing. He told his solicitor nothing. He told nobody but a drawer.`),
          { cliff: 'margaret' }
        ]
      }
    ],
    watch: {
      pennington: `Cleared. Grieving.`,
      vivian: `Cleared. Framed by Dr. Hale.`,
      hale: `Confessed and arrested. Knew about Edmund's letter before he should have.`,
      margaret: `Told Hale about Monday, but who told her?`
    },
    teaser: `Season Two: someone whispered in Lady Margaret's ear. The Blackwood Files are not closed.`,
    last: true
  };

  return { NAMES, CLUES, episodes: [ep1, ep2, ep3] };
})();
